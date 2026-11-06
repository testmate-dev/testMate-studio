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

import {
  createId,
  escapeParameterReferences,
  isFunctionItem,
  mapItemValues,
  parseParameterReferences,
  replaceParameterReferences,
} from '../../common/function-model'

export {
  escapeParameterReferences,
  isFunctionItem,
  replaceParameterReferences,
} from '../../common/function-model'

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
 * Creates a unique ID for a function definition.
 *
 * @returns {string}
 */
export function createFunctionId() {
  return createId('fn')
}

/**
 * Creates a unique ID for a function call.
 *
 * @returns {string}
 */
export function createCallId() {
  return createId('call')
}

const MAX_SIGNATURE_VALUE_LENGTH = 20

const formatSignatureValue = value =>
  value.length > MAX_SIGNATURE_VALUE_LENGTH
    ? `${value.slice(0, MAX_SIGNATURE_VALUE_LENGTH)}…`
    : value

/**
 * Formats a function's signature, omitting types for untyped parameters and
 * showing values where set, e.g. `login(username: string = bob, remember)`.
 *
 * @param fn the function definition
 * @param args the call's arguments (by parameter name); defaults to values
 * stored on the parameters
 * @returns {string}
 */
export function formatSignature(fn, args) {
  const parameters = (fn.parameters || [])
    .map(p => {
      const declaration = p.type ? `${p.name}: ${p.type}` : p.name
      const value = args ? args[p.name] : p.value
      return typeof value === 'string' && value
        ? `${declaration} = ${formatSignatureValue(value)}`
        : declaration
    })
    .join(', ')
  return `${fn.name}(${parameters})`
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
 * typed from its input type, and one for each argument of a nested function
 * call, named and typed like the called function's parameter. Names are
 * unique within the suggestions.
 *
 * @param steps the items that will form the function
 * @param functionsById definitions by ID, for nested calls
 * @returns {Array<{stepIndex: number, name: string, type: string, value: string, prefix: string, argument?: string}>}
 */
export function suggestParameters(steps, functionsById = new Map()) {
  const used = new Set()
  const suggestions = []
  const uniqueName = base => {
    let name = base
    for (let n = 2; used.has(name); n++) name = `${base}${n}`
    used.add(name)
    return name
  }
  steps.forEach((step, stepIndex) => {
    if (isFunctionItem(step)) {
      const fn = functionsById.get(step.functionId)
      const args = step.arguments || {}
      ;((fn && fn.parameters) || []).forEach(parameter => {
        const value = args[parameter.name]
        if (typeof value !== 'string' || !value) return
        suggestions.push({
          stepIndex,
          argument: parameter.name,
          name: uniqueName(parameter.name),
          type: parameter.type || 'string',
          value,
          prefix: '',
        })
      })
      return
    }
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
    suggestions.push({
      stepIndex,
      name: uniqueName(base),
      type: suggestParameterType(context),
      value,
      prefix,
    })
  })
  return suggestions
}

/**
 * Builds a function's steps and parameters from the selected items and the
 * parameters confirmed in the modal. Linked parameters replace their line's
 * value (or a nested call's argument) with `$name` and take the recorded
 * value as their value; other `$` text matching a declared name is escaped
 * so it stays literal.
 *
 * @param steps the selected items
 * @param parameters confirmed parameters, each optionally with
 * `link: {stepIndex, prefix, value, argument?}`
 * @returns {{steps: Object[], parameters: Array<{name: string, type?: string, value?: string}>}}
 */
export function linkParameters(steps, parameters) {
  const names = parameters.map(p => p.name)
  const links = new Map()
  const resultParameters = parameters.map(({ link, ...parameter }) => {
    if (!link) return parameter
    const key = link.argument ? `${link.stepIndex}:${link.argument}` : `${link.stepIndex}`
    links.set(key, `${link.prefix || ''}$${parameter.name}`)
    return { ...parameter, value: link.value }
  })
  const resultSteps = steps.map((step, index) => {
    if (isFunctionItem(step)) {
      const args = {}
      Object.keys(step.arguments || {}).forEach(argument => {
        const key = `${index}:${argument}`
        args[argument] = links.has(key)
          ? links.get(key)
          : escapeParameterReferences(step.arguments[argument], names)
      })
      return { ...step, arguments: args }
    }
    if (links.has(`${index}`)) return { ...step, value: links.get(`${index}`) }
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
  const resultSteps = steps.map(step =>
    mapItemValues(step, value =>
      replaceParameterReferences(value, [...previousNames, ...newNames], replacer)
    )
  )
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

  const value = { name, parameters }
  if (typeof draft.description === 'string') value.description = draft.description.trim()
  return { errors, value }
}

const referencedNames = (steps, names) => {
  const found = new Set()
  steps.forEach(step => {
    const values = isFunctionItem(step) ? Object.values(step.arguments || {}) : [step.value]
    values.forEach(value =>
      parseParameterReferences(value, names).forEach(segment => {
        if (segment.ref) found.add(segment.ref)
      })
    )
  })
  return found
}

const updateCalls = (items, functionId, update) =>
  items.map(item => (isFunctionItem(item) && item.functionId === functionId ? update(item) : item))

/**
 * Applies an edit of a function definition everywhere it is used. Renamed
 * parameters update the definition's `$references` and every call's
 * arguments. A removed parameter that the definition's steps use is replaced
 * by its value, which every call must agree on (and no other function may
 * pass it on), since the definition is shared by all calls.
 *
 * @param state {{items: Object[], functions: Object[], copied: Object[]}}
 * @param functionId the edited definition
 * @param edit {{name: string, description?: string, parameters: Array<{name: string, type?: string, originalName?: string}>}}
 * @returns {{error: string}|{items: Object[], functions: Object[], copied: Object[]}}
 */
export function editFunctionDefinition(state, functionId, edit) {
  const fn = state.functions.find(f => f.id === functionId)
  if (!fn) return { error: 'Function not found.' }
  const renames = new Map()
  edit.parameters.forEach(p => {
    if (p.originalName) renames.set(p.originalName, p.name)
  })
  const removed = fn.parameters.filter(p => !renames.has(p.name)).map(p => p.name)
  const used = referencedNames(fn.steps, fn.parameters.map(p => p.name))

  const callsOf = items =>
    items.filter(item => isFunctionItem(item) && item.functionId === functionId)
  const topLevelCalls = [...callsOf(state.items), ...callsOf(state.copied)]
  const nested = state.functions.filter(other => callsOf(other.steps).length > 0)

  const previous = []
  for (const parameter of fn.parameters) {
    if (!removed.includes(parameter.name) || !used.has(parameter.name)) {
      previous.push(parameter)
      continue
    }
    const passedOn = nested.find(other =>
      callsOf(other.steps).some(call => (call.arguments || {})[parameter.name])
    )
    if (passedOn) {
      return {
        error: `Parameter "${parameter.name}" can't be removed: ${passedOn.name} passes it a value.`,
      }
    }
    const values = Array.from(
      new Set(
        topLevelCalls
          .map(call => (call.arguments || {})[parameter.name])
          .filter(value => typeof value === 'string')
      )
    )
    if (values.length > 1) {
      return {
        error: `Parameter "${parameter.name}" can't be removed: its uses give it different values.`,
      }
    }
    previous.push(values.length ? { ...parameter, value: values[0] } : parameter)
  }

  const edited = applyParameterEdits(fn.steps, previous, edit.parameters)
  const updateCall = call => {
    const args = {}
    Object.keys(call.arguments || {}).forEach(name => {
      if (removed.includes(name)) return
      args[renames.get(name) || name] = call.arguments[name]
    })
    return { ...call, arguments: args }
  }
  const functions = state.functions.map(other => {
    if (other.id === functionId) {
      return {
        ...other,
        name: edit.name,
        description:
          typeof edit.description === 'string' ? edit.description : other.description || '',
        parameters: edited.parameters.map(({ value, ...parameter }) => parameter),
        steps: updateCalls(edited.steps, functionId, updateCall),
      }
    }
    return { ...other, steps: updateCalls(other.steps, functionId, updateCall) }
  })
  return {
    items: updateCalls(state.items, functionId, updateCall),
    functions,
    copied: updateCalls(state.copied, functionId, updateCall),
  }
}
