// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

// The studio's function model, shared by the background and the UI (no DOM).
//
// A recording is a list of items. Each item is either a recorded line
// ({command, target, value, ...}) or a call to a function:
//   { type: 'function', id, functionId, collapsed, arguments: {name: value} }
// Function definitions live in the recording's function library:
//   { id, name, description, parameters: [{name, type?}], steps: [item, ...] }
// A definition's steps may themselves call other functions, whose arguments
// may reference the outer function's parameters as `$name`.

const MAX_DEPTH = 20

/**
 * @param item a recording item
 * @returns {boolean} whether the item is a function call
 */
export function isFunctionItem(item) {
  return !!item && item.type === 'function'
}

/**
 * Creates a unique ID, e.g. `fn-…` for definitions and `call-…` for calls.
 *
 * @param prefix the ID prefix
 * @returns {string}
 */
export function createId(prefix = 'fn') {
  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`
}

/**
 * @param functions function definitions
 * @returns {Map<string, Object>} definitions by ID
 */
export function indexFunctions(functions) {
  return new Map((functions || []).map(fn => [fn.id, fn]))
}

/**
 * @param fn a function definition
 * @returns {string[]} its parameter names
 */
export function parameterNames(fn) {
  return ((fn && fn.parameters) || []).map(p => p.name)
}

/**
 * Splits text into literal text and PHP-style parameter references (`$name`).
 * Only declared names are references, the longest declared name wins
 * (`$user-admin` is `user-admin` if declared, else `user` + `-admin`), and
 * `\$` is a literal dollar sign.
 *
 * @param text the text to parse
 * @param names declared parameter names
 * @returns {Array<{ref: string}|{literal: string, raw: string}>} segments;
 * literal segments carry the unescaped text and the text as written
 */
export function parseParameterReferences(text, names) {
  const source = typeof text === 'string' ? text : ''
  const longestFirst = [...names].sort((a, b) => b.length - a.length)
  const segments = []
  let literal = ''
  let raw = ''
  const flush = () => {
    if (raw) segments.push({ literal, raw })
    literal = ''
    raw = ''
  }
  for (let i = 0; i < source.length; i++) {
    if (source[i] === '\\' && source[i + 1] === '$') {
      literal += '$'
      raw += '\\$'
      i++
      continue
    }
    if (source[i] === '$') {
      const name = longestFirst.find(candidate => source.startsWith(candidate, i + 1))
      if (name) {
        flush()
        segments.push({ ref: name })
        i += name.length
        continue
      }
    }
    literal += source[i]
    raw += source[i]
  }
  flush()
  return segments
}

/**
 * Replaces parameter references (`$name`) in text. `\$` is left as written.
 *
 * @param text the text
 * @param names declared parameter names
 * @param replacer called with each referenced name; returns the replacement,
 * or null/undefined to keep the reference as is
 * @returns {string}
 */
export function replaceParameterReferences(text, names, replacer) {
  if (typeof text !== 'string' || !names.length) return text
  return parseParameterReferences(text, names)
    .map(segment => {
      if (!segment.ref) return segment.raw
      const replacement = replacer(segment.ref)
      return replacement == null ? `$${segment.ref}` : replacement
    })
    .join('')
}

/**
 * Escapes references to the given parameters so literal text such as a
 * typed "$email" is not later read as the `email` parameter.
 *
 * @param text the text
 * @param names declared parameter names
 * @returns {string}
 */
export function escapeParameterReferences(text, names) {
  return replaceParameterReferences(text, names, name => `\\$${name}`)
}

/**
 * Applies a mapping to every value an item holds: a line's value, or each of
 * a call's arguments.
 *
 * @param item a recording item
 * @param mapper function from a value to its new value
 * @returns {Object} a new item
 */
export function mapItemValues(item, mapper) {
  if (isFunctionItem(item)) {
    const args = {}
    Object.keys(item.arguments || {}).forEach(name => {
      args[name] = mapper(item.arguments[name])
    })
    return { ...item, arguments: args }
  }
  return { ...item, value: mapper(item.value) }
}

/**
 * Expands items into the recorded lines they stand for, replacing each
 * call's parameter references with its arguments.
 *
 * @param items recording items
 * @param functionsById definitions by ID
 * @returns {Object[]} recorded lines
 */
export function expandItems(items, functionsById, depth = 0) {
  const lines = []
  ;(items || []).forEach(item => {
    if (!isFunctionItem(item)) {
      lines.push(item)
      return
    }
    const fn = functionsById.get(item.functionId)
    if (!fn || depth >= MAX_DEPTH) return
    const names = parameterNames(fn)
    const args = item.arguments || {}
    expandItems(fn.steps, functionsById, depth + 1).forEach(line => {
      lines.push({
        ...line,
        value: replaceParameterReferences(line.value, names, name =>
          typeof args[name] === 'string' ? args[name] : null
        ),
      })
    })
  })
  return lines
}

/**
 * @param functions function definitions
 * @param roots items whose calls are in use
 * @returns {Object[]} the definitions reachable from the roots, directly or
 * through other definitions, in library order
 */
export function reachableFunctions(functions, roots) {
  const byId = indexFunctions(functions)
  const used = new Set()
  const visit = items =>
    (items || []).forEach(item => {
      if (!isFunctionItem(item) || used.has(item.functionId)) return
      const fn = byId.get(item.functionId)
      if (!fn) return
      used.add(fn.id)
      visit(fn.steps)
    })
  visit(roots)
  return (functions || []).filter(fn => used.has(fn.id))
}

/**
 * @param fn a function definition
 * @param targetId a definition ID
 * @param functionsById definitions by ID
 * @returns {boolean} whether fn calls targetId, directly or indirectly
 */
export function callsFunction(fn, targetId, functionsById, depth = 0) {
  if (!fn || depth >= MAX_DEPTH) return false
  return (fn.steps || []).some(
    item =>
      isFunctionItem(item) &&
      (item.functionId === targetId ||
        callsFunction(functionsById.get(item.functionId), targetId, functionsById, depth + 1))
  )
}

/**
 * Converts function items saved before the library existed (each holding its
 * own copy of its lines and parameter values) into a definition plus a call.
 *
 * @param items recording items
 * @param functions function definitions
 * @returns {{items: Object[], functions: Object[]}}
 */
export function migrateLegacyFunctions(items, functions) {
  const library = (functions || []).slice()
  const migrated = (items || []).map(item => {
    if (!isFunctionItem(item) || item.functionId || !Array.isArray(item.steps)) return item
    const args = {}
    const parameters = (item.parameters || []).map(({ value, ...parameter }) => {
      if (typeof value === 'string') args[parameter.name] = value
      return parameter
    })
    library.push({
      id: item.id,
      name: item.name,
      description: item.description || '',
      parameters,
      steps: item.steps,
    })
    return {
      type: 'function',
      id: createId('call'),
      functionId: item.id,
      collapsed: !!item.collapsed,
      arguments: args,
    }
  })
  return { items: migrated, functions: library }
}

// === Matching ===

const escapeRegExp = text => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * Matches text against a template that may reference parameters.
 *
 * @param template the template, e.g. `label=$city`
 * @param text the text to match, e.g. `label=Paris`
 * @param names declared parameter names
 * @returns {Object|null} the referenced parameters' values, e.g.
 * `{city: 'Paris'}`, or null if the text does not fit the template
 */
export function matchTemplate(template, text, names) {
  const source = typeof text === 'string' ? text : ''
  const segments = parseParameterReferences(template, names)
  const refs = segments.filter(s => s.ref).map(s => s.ref)
  const pattern = segments
    .map(s => (s.ref ? '([\\s\\S]*?)' : escapeRegExp(s.literal)))
    .join('')
  const match = new RegExp(`^${pattern}$`).exec(source)
  if (!match) return null
  const bindings = {}
  for (let i = 0; i < refs.length; i++) {
    const value = match[i + 1]
    if (refs[i] in bindings && bindings[refs[i]] !== value) return null
    bindings[refs[i]] = value
  }
  return bindings
}

const locatorsOf = target => {
  if (Array.isArray(target)) {
    return target
      .map(entry => (Array.isArray(entry) ? entry[0] : entry))
      .filter(locator => typeof locator === 'string' && locator)
  }
  return typeof target === 'string' && target ? [target] : []
}

// Positions and generated IDs change between runs of the same form
const normalizeLocator = locator => locator.replace(/\d+/g, '#')

/**
 * @returns {boolean} whether two recorded targets point at the same element:
 * they share a locator, or one that only differs in its numbers
 */
export function targetsSimilar(a, b) {
  const first = locatorsOf(a)
  const second = locatorsOf(b)
  if (!first.length || !second.length) return first.length === second.length
  if (first.some(locator => second.includes(locator))) return true
  const normalized = new Set(first.map(normalizeLocator))
  return second.some(locator => normalized.has(normalizeLocator(locator)))
}

const mergeBindings = (into, from) => {
  if (!from) return false
  return Object.keys(from).every(name => {
    if (name in into && into[name] !== from[name]) return false
    into[name] = from[name]
    return true
  })
}

/**
 * Matches recording items against a function's steps. Lines match when they
 * use the same command on a similar target and their value fits the step's
 * value; calls match when they call the same function with fitting
 * arguments.
 *
 * @param items recording items
 * @param templates the function's steps (or their expanded lines)
 * @param names the function's parameter names
 * @returns {Object|null} the parameter values the items imply, or null
 */
export function matchSequence(items, templates, names) {
  if (!items.length || items.length !== templates.length) return null
  const bindings = {}
  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    const template = templates[i]
    if (isFunctionItem(item) !== isFunctionItem(template)) return null
    if (isFunctionItem(item)) {
      if (item.functionId !== template.functionId) return null
      const args = item.arguments || {}
      const templateArgs = template.arguments || {}
      const ok = Object.keys(templateArgs).every(name =>
        mergeBindings(bindings, matchTemplate(templateArgs[name], args[name], names))
      )
      if (!ok) return null
    } else {
      if (item.command !== template.command) return null
      if (!targetsSimilar(item.target, template.target)) return null
      if (!mergeBindings(bindings, matchTemplate(template.value, item.value, names))) {
        return null
      }
    }
  }
  return bindings
}

/**
 * Matches items against a function, either step for step or against the
 * lines its nested calls expand to.
 *
 * @returns {Object|null} the call's arguments, or null
 */
export function matchFunction(items, fn, functionsById) {
  const names = parameterNames(fn)
  const direct = matchSequence(items, fn.steps || [], names)
  if (direct) return direct
  if (!(fn.steps || []).some(isFunctionItem)) return null
  return matchSequence(items, expandItems(fn.steps, functionsById), names)
}

const lengthsToTry = (fn, functionsById) => {
  const lengths = new Set([(fn.steps || []).length])
  if ((fn.steps || []).some(isFunctionItem)) {
    lengths.add(expandItems(fn.steps, functionsById).length)
  }
  return Array.from(lengths).filter(length => length >= 2)
}

/**
 * Finds the function the last recorded items are an instance of, preferring
 * the match covering the most items.
 *
 * @param items recording items
 * @param functions function definitions
 * @returns {{functionId: string, start: number, end: number, arguments: Object}|null}
 */
export function findTrailingMatch(items, functions) {
  const byId = indexFunctions(functions)
  let best = null
  ;(functions || []).forEach(fn => {
    lengthsToTry(fn, byId).forEach(length => {
      if (length > items.length || (best && best.end - best.start + 1 >= length)) return
      const start = items.length - length
      const args = matchFunction(items.slice(start), fn, byId)
      if (args) best = { functionId: fn.id, start, end: items.length - 1, arguments: args }
    })
  })
  return best
}

/**
 * Finds a function that the items in [start, end] are an instance of.
 *
 * @returns {{functionId: string, start: number, end: number, arguments: Object}|null}
 */
export function findRangeMatch(items, start, end, functions) {
  const byId = indexFunctions(functions)
  const range = items.slice(start, end + 1)
  for (const fn of functions || []) {
    const args = matchFunction(range, fn, byId)
    if (args) return { functionId: fn.id, start, end, arguments: args }
  }
  return null
}

/**
 * Finds other places where a function's steps appear as top-level items.
 *
 * @param items recording items
 * @param fn the function definition
 * @param functions all function definitions
 * @returns {Array<{start: number, end: number, arguments: Object}>} in order,
 * not overlapping
 */
export function findOccurrences(items, fn, functions) {
  const byId = indexFunctions(functions)
  const found = []
  const lengths = lengthsToTry(fn, byId)
  for (let start = 0; start < items.length; start++) {
    for (const length of lengths) {
      if (start + length > items.length) continue
      const args = matchFunction(items.slice(start, start + length), fn, byId)
      if (args) {
        found.push({ start, end: start + length - 1, arguments: args })
        start += length - 1
        break
      }
    }
  }
  return found
}

/**
 * Finds a sequence of function calls that keeps appearing in the same order
 * and is not already a function of its own, so it can be offered for
 * wrapping into one function.
 *
 * @param items recording items
 * @param functions function definitions
 * @param isDismissed called with a sequence's signature
 * @returns {{functionIds: string[], signature: string, count: number, start: number, end: number}|null}
 * the longest such sequence (then the most frequent); start/end are its last
 * occurrence
 */
export function findRepeatedCalls(items, functions, isDismissed = () => false) {
  const wrapped = new Set(
    (functions || [])
      .filter(fn => fn.steps.length > 0 && fn.steps.every(isFunctionItem))
      .map(fn => fn.steps.map(step => step.functionId).join('>'))
  )
  const starts = new Map()
  let runStart = -1
  for (let i = 0; i <= items.length; i++) {
    if (i < items.length && isFunctionItem(items[i])) {
      if (runStart < 0) runStart = i
      continue
    }
    if (runStart >= 0) {
      for (let length = 2; length <= i - runStart; length++) {
        for (let s = runStart; s + length <= i; s++) {
          const key = items
            .slice(s, s + length)
            .map(item => item.functionId)
            .join('>')
          if (!starts.has(key)) starts.set(key, [])
          starts.get(key).push(s)
        }
      }
    }
    runStart = -1
  }
  let best = null
  starts.forEach((positions, key) => {
    const length = key.split('>').length
    const separate = []
    positions.forEach(position => {
      if (!separate.length || position >= separate[separate.length - 1] + length) {
        separate.push(position)
      }
    })
    const signature = `wrap:${key}`
    if (separate.length < 2 || wrapped.has(key) || isDismissed(signature)) return
    const last = separate[separate.length - 1]
    const better =
      !best ||
      length > best.functionIds.length ||
      (length === best.functionIds.length && separate.length > best.count) ||
      (length === best.functionIds.length && separate.length === best.count && last > best.start)
    if (better) {
      best = {
        functionIds: key.split('>'),
        signature,
        count: separate.length,
        start: last,
        end: last + length - 1,
      }
    }
  })
  return best
}

/**
 * @returns {string} an identity for the items in [start, end], used to tell
 * whether they have changed since a suggestion was made
 */
export function fingerprintRange(items, start, end) {
  return JSON.stringify(
    items.slice(start, end + 1).map(item =>
      isFunctionItem(item)
        ? ['f', item.functionId, item.arguments || {}]
        : [item.command, item.target, item.value]
    )
  )
}
