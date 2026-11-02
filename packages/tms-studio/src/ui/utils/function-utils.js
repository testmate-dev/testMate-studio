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

/**
 * Formats a function group's signature, omitting types for untyped
 * parameters, e.g. `login(username: string, remember)`.
 *
 * @param fn the function group
 * @returns {string}
 */
export function formatSignature(fn) {
  const parameters = (fn.parameters || [])
    .map(p => (p.type ? `${p.name}: ${p.type}` : p.name))
    .join(', ')
  return `${fn.name}(${parameters})`
}

/**
 * Validates and normalizes a function draft from the function modal.
 *
 * @param draft {{name: string, parameters: Array<{name: string, type: string}>}}
 * @returns {{errors: string[], value: {name: string, parameters: Array<{name: string, type?: string}>}}}
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
    return type ? { name: parameterName, type } : { name: parameterName }
  })

  return { errors, value: { name, parameters } }
}
