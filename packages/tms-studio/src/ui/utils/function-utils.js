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

// No `$`: parameters are referenced PHP-style as `$name` / `{$name}` in line
// values, so a `$` inside a name would be ambiguous
const IDENTIFIER_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/
// Parameters may also use `-`, but not at the end, where `$name-` would be
// ambiguous
const PARAMETER_NAME_PATTERN = /^[A-Za-z_](?:[A-Za-z0-9_-]*[A-Za-z0-9_])?$/

// Selectable parameter types; an untyped parameter is shown as "any"
export const PARAMETER_TYPES = [
  'string',
  'char',
  'int',
  'float',
  'double',
  'boolean',
  'date',
  'datetime',
  'list',
  'json',
]

/**
 * @param item a recorder item
 * @returns {boolean} whether the item is a function group
 */
export function isFunctionItem(item) {
  return !!item && item.type === 'function'
}

/**
 * @param name a function or parameter name
 * @returns {boolean} whether the name is a valid identifier
 */
export function isValidIdentifier(name) {
  return IDENTIFIER_PATTERN.test(name)
}

/**
 * @param name a parameter name
 * @returns {boolean} whether the name is valid: ASCII letters, digits, `_`
 * and `-`, starting with a letter or `_` and not ending with `-`
 */
export function isValidParameterName(name) {
  return PARAMETER_NAME_PATTERN.test(name)
}

/**
 * Creates a unique ID for a function group.
 *
 * @returns {string}
 */
export function createFunctionId() {
  return `fn-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`
}

const MAX_SIGNATURE_VALUE_LENGTH = 20

const formatSignatureValue = value =>
  value.length > MAX_SIGNATURE_VALUE_LENGTH
    ? `${value.slice(0, MAX_SIGNATURE_VALUE_LENGTH)}…`
    : value

/**
 * Formats a function group's signature, omitting types for untyped
 * parameters and showing values where set, e.g.
 * `login(username: string = bob, remember)`.
 *
 * @param fn the function group
 * @returns {string}
 */
export function formatSignature(fn) {
  const parameters = (fn.parameters || [])
    .map(p => {
      const declaration = p.type ? `${p.name}: ${p.type}` : p.name
      return typeof p.value === 'string' && p.value
        ? `${declaration} = ${formatSignatureValue(p.value)}`
        : declaration
    })
    .join(', ')
  return `${fn.name}(${parameters})`
}

/**
 * Replaces PHP-style parameter references (`$name`) in a line value. Only
 * declared names are references, the longest declared name wins
 * (`$user-admin` is `user-admin` if declared, else `user` + `-admin`), and
 * `\$` is a literal dollar sign that is left as written.
 *
 * @param text the line value
 * @param names declared parameter names
 * @param replacer called with each referenced name; returns the replacement,
 * or null/undefined to keep the reference as is
 * @returns {string}
 */
export function replaceParameterReferences(text, names, replacer) {
  if (typeof text !== 'string' || !names.length) return text
  const longestFirst = [...names].sort((a, b) => b.length - a.length)
  let result = ''
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '\\' && text[i + 1] === '$') {
      result += '\\$'
      i++
      continue
    }
    if (text[i] === '$') {
      const name = longestFirst.find(candidate => text.startsWith(candidate, i + 1))
      if (name) {
        const replacement = replacer(name)
        result += replacement == null ? `$${name}` : replacement
        i += name.length
        continue
      }
    }
    result += text[i]
  }
  return result
}

/**
 * Escapes references to the given parameters so literal text such as a
 * typed "$email" is not later read as the `email` parameter.
 *
 * @param text the line value
 * @param names declared parameter names
 * @returns {string}
 */
export function escapeParameterReferences(text, names) {
  return replaceParameterReferences(text, names, name => `\\$${name}`)
}

// Commands whose value the user typed or selected, and so may vary per use
const PARAMETERIZABLE_COMMANDS = ['type', 'editContent', 'select', 'addSelection', 'removeSelection']
const SELECTION_COMMANDS = ['select', 'addSelection', 'removeSelection']
const SELECTION_PREFIX = /^(label|value|index|id)=/
const MAX_PARAMETER_NAME_LENGTH = 40
// autocomplete tokens that qualify a field rather than name it
const AUTOCOMPLETE_QUALIFIERS = ['on', 'off', 'shipping', 'billing', 'home', 'work', 'mobile', 'fax', 'pager', 'webauthn']

/**
 * Splits a line value into a fixed prefix and the part a parameter may
 * replace, e.g. `label=Paris` for `select` becomes `label=` + `Paris`.
 *
 * @param command the line's command
 * @param value the line's value
 * @returns {{prefix: string, value: string}}
 */
export function splitParameterizableValue(command, value) {
  const text = typeof value === 'string' ? value : ''
  if (SELECTION_COMMANDS.includes(command)) {
    const match = text.match(SELECTION_PREFIX)
    if (match) return { prefix: match[0], value: text.slice(match[0].length) }
  }
  return { prefix: '', value: text }
}

/**
 * Turns arbitrary text (a field name, label or locator) into a valid
 * parameter name, or '' if nothing usable remains.
 *
 * @param text the source text
 * @returns {string}
 */
export function toParameterName(text) {
  if (!text) return ''
  let name = String(text)
    .trim()
    .replace(/[^A-Za-z0-9_-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
  if (!name) return ''
  if (/^[0-9]/.test(name)) name = `_${name}`
  return name.slice(0, MAX_PARAMETER_NAME_LENGTH).replace(/-+$/, '')
}

const autocompleteName = autocomplete => {
  if (!autocomplete) return ''
  const token = autocomplete
    .split(/\s+/)
    .filter(t => t && !t.startsWith('section-') && !AUTOCOMPLETE_QUALIFIERS.includes(t))
    .pop()
  if (token === 'current-password' || token === 'new-password') return 'password'
  return toParameterName(token)
}

const locatorName = target => {
  if (!Array.isArray(target)) return ''
  const locator = target
    .map(entry => (Array.isArray(entry) ? entry[0] : entry))
    .find(l => typeof l === 'string' && /^(id|name)=/.test(l))
  return locator ? toParameterName(locator.replace(/^(id|name)=/, '')) : ''
}

/**
 * Suggests a parameter type from the recorded field context.
 *
 * @param context the line's field context
 * @returns {string}
 */
export function suggestParameterType(context = {}) {
  switch (context.fieldType) {
    case 'date':
      return 'date'
    case 'datetime-local':
      return 'datetime'
    case 'checkbox':
      return 'boolean'
    case 'number': {
      const step = context.step || ''
      return step === 'any' || step.includes('.') ? 'float' : 'int'
    }
    default:
      return 'string'
  }
}

/**
 * Suggests one parameter for each line with a typed or selected value,
 * named from the field (autocomplete, name/id, label, then locator) and
 * typed from its input type. Names are unique within the suggestions.
 *
 * @param steps the lines that will form the function
 * @returns {Array<{stepIndex: number, name: string, type: string, value: string, prefix: string}>}
 */
export function suggestParameters(steps) {
  const used = new Set()
  const suggestions = []
  steps.forEach((step, stepIndex) => {
    if (!PARAMETERIZABLE_COMMANDS.includes(step.command)) return
    const { prefix, value } = splitParameterizableValue(step.command, step.value)
    if (!value) return
    const context = step.context || {}
    const base =
      [
        autocompleteName(context.autocomplete),
        toParameterName(context.fieldName),
        toParameterName((context.label || '').toLowerCase()),
        locatorName(step.target),
      ].find(Boolean) || 'value'
    let name = base
    for (let n = 2; used.has(name); n++) name = `${base}${n}`
    used.add(name)
    suggestions.push({ stepIndex, name, type: suggestParameterType(context), value, prefix })
  })
  return suggestions
}

/**
 * Builds a function's lines and parameters from the selected lines and the
 * parameters confirmed in the modal. Linked parameters replace their line's
 * value with `$name` and take the recorded value as their value; other `$`
 * text matching a declared name is escaped so it stays literal.
 *
 * @param steps the selected lines
 * @param parameters confirmed parameters, each optionally with
 * `link: {stepIndex, prefix, value}`
 * @returns {{steps: Object[], parameters: Array<{name: string, type?: string, value?: string}>}}
 */
export function linkParameters(steps, parameters) {
  const names = parameters.map(p => p.name)
  const linkedSteps = new Map()
  const resultParameters = parameters.map(({ link, ...parameter }) => {
    if (!link) return parameter
    linkedSteps.set(link.stepIndex, `${link.prefix}$${parameter.name}`)
    return { ...parameter, value: link.value }
  })
  const resultSteps = steps.map((step, index) => {
    if (linkedSteps.has(index)) return { ...step, value: linkedSteps.get(index) }
    return { ...step, value: escapeParameterReferences(step.value, names) }
  })
  return { steps: resultSteps, parameters: resultParameters }
}

/**
 * Applies edits to an existing function's parameters to its lines: renamed
 * parameters update their `$references`, and removed parameters with a value
 * are replaced by that value as literal text.
 *
 * @param steps the function's lines
 * @param previous the parameters before editing
 * @param next the edited parameters, each with `originalName` when it
 * existed before
 * @returns {{steps: Object[], parameters: Array<{name: string, type?: string, value?: string}>}}
 */
export function applyParameterEdits(steps, previous, next) {
  const renames = new Map()
  next.forEach(p => {
    if (p.originalName) renames.set(p.originalName, p.name)
  })
  const removed = previous.filter(p => !renames.has(p.name))
  const nextNames = next.map(p => p.name)
  const previousNames = previous.map(p => p.name)
  // Literal text matching a name that is only now declared must stay literal
  const newNames = nextNames.filter(name => !previousNames.includes(name))
  const replacer = name => {
    if (!previousNames.includes(name)) return `\\$${name}`
    if (renames.has(name)) return `$${renames.get(name)}`
    const gone = removed.find(p => p.name === name)
    if (gone && typeof gone.value === 'string') {
      return escapeParameterReferences(gone.value, nextNames)
    }
    return null
  }
  const resultSteps = steps.map(step => ({
    ...step,
    value: replaceParameterReferences(step.value, [...previousNames, ...newNames], replacer),
  }))
  const resultParameters = next.map(({ originalName, ...parameter }) => {
    const before = previous.find(p => p.name === originalName)
    return before && typeof before.value === 'string'
      ? { ...parameter, value: before.value }
      : parameter
  })
  return { steps: resultSteps, parameters: resultParameters }
}

/**
 * Validates and normalizes a function draft from the function modal.
 *
 * @param draft {{name: string, parameters: Array<{name: string, type: string, link?: Object, originalName?: string}>}}
 * @returns {{errors: string[], value: {name: string, parameters: Array<{name: string, type?: string, link?: Object, originalName?: string}>}}}
 */
export function validateFunctionDraft(draft) {
  const errors = []
  const name = draft.name.trim()
  if (!name) {
    errors.push('Function name is required.')
  } else if (!isValidIdentifier(name)) {
    errors.push(
      'Function name must start with a letter or _ and contain only letters, digits or _.'
    )
  }

  const seen = new Set()
  const parameters = draft.parameters.map((parameter, index) => {
    const parameterName = parameter.name.trim()
    const type = parameter.type.trim()
    const label = `Parameter ${index + 1}`
    if (!parameterName) {
      errors.push(`${label} needs a name.`)
    } else if (!isValidParameterName(parameterName)) {
      errors.push(
        `${label} name "${parameterName}" must start with a letter or _, use only letters, digits, _ or -, and not end with -.`
      )
    } else if (seen.has(parameterName)) {
      errors.push(`Parameter "${parameterName}" is defined more than once.`)
    }
    seen.add(parameterName)
    const result = type ? { name: parameterName, type } : { name: parameterName }
    // Carry the modal's bookkeeping through to linkParameters/applyParameterEdits
    if (parameter.link) result.link = parameter.link
    if (parameter.originalName) result.originalName = parameter.originalName
    return result
  })

  return { errors, value: { name, parameters } }
}
