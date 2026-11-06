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

// TMD-11: recognises a run of recorded lines that fill in and commit one form
// (no DOM; runs in the background on the recorded lines' field context).

import { isFunctionItem } from './function-model'

// Commands that put a value into a field
export const FILL_COMMANDS = [
  'type',
  'editContent',
  'select',
  'addSelection',
  'removeSelection',
  'check',
  'uncheck',
]
const CLICK_COMMANDS = ['click', 'clickAt', 'doubleClick', 'doubleClickAt', 'submit']

// What closed the run, and how strongly that says "form finished"
export const COMMIT_TRIGGER_WEIGHTS = {
  submit: 3,
  removed: 2,
  navigation: 2,
}
const STRONG_GROUP_KINDS = ['form', 'fieldset', 'dialog']
export const FORM_SCORE_THRESHOLD = 5
const MAX_NAME_LENGTH = 40

const contextOf = item => (item && !isFunctionItem(item) && item.context) || {}

const isFillLine = item =>
  !isFunctionItem(item) &&
  FILL_COMMANDS.includes(item.command) &&
  contextOf(item).isFillable !== false

/**
 * @param item a recording item
 * @returns {boolean} whether the line commits a form: a click on something
 * other than a field, or Enter
 */
export function isCommitLine(item) {
  if (!item || isFunctionItem(item)) return false
  if (item.command === 'sendKeys') {
    return typeof item.value === 'string' && item.value.includes('KEY_ENTER')
  }
  return CLICK_COMMANDS.includes(item.command) && contextOf(item).isFillable !== true
}

const autocompleteTokens = context =>
  (context.autocomplete || '')
    .split(/\s+/)
    .filter(token => token && token !== 'on' && token !== 'off')

/**
 * Finds the run of lines that fill in one form: consecutive top-level lines
 * sharing a group (form or container), ending with the group's last line and
 * starting after its previous commit. Lines inside functions never take part.
 *
 * @param items recording items
 * @param options.groupKey the group to look for; by default the group of the
 * last filled field
 * @returns {Object|null} the run's range and the signals found in it
 */
export function detectFormRun(items, { groupKey } = {}) {
  let floor = 0
  for (let i = items.length - 1; i >= 0; i--) {
    if (isFunctionItem(items[i])) {
      floor = i + 1
      break
    }
  }
  let key = groupKey
  if (!key) {
    for (let i = items.length - 1; i >= floor && !key; i--) {
      if (isFillLine(items[i])) key = contextOf(items[i]).groupKey
    }
  }
  if (!key) return null

  let end = -1
  for (let i = items.length - 1; i >= floor; i--) {
    if (contextOf(items[i]).groupKey === key) {
      end = i
      break
    }
  }
  if (end < 0) return null
  let start = end
  while (
    start - 1 >= floor &&
    contextOf(items[start - 1]).groupKey === key &&
    !isCommitLine(items[start - 1])
  ) {
    start--
  }

  const lines = items.slice(start, end + 1)
  const fillLines = lines.filter(isFillLine)
  const groupContext = contextOf(lines.find(line => contextOf(line).groupLabel) || lines[0])
  return {
    start,
    end,
    groupKey: key,
    groupKind: groupContext.groupKind || '',
    groupLabel: groupContext.groupLabel || '',
    fillCount: fillLines.length,
    hasPassword: fillLines.some(line => {
      const context = contextOf(line)
      return (
        context.fieldType === 'password' ||
        autocompleteTokens(context).some(token => token.endsWith('password'))
      )
    }),
    autocompleteCount: fillLines.filter(line => autocompleteTokens(contextOf(line)).length > 0)
      .length,
    endsWithCommit: isCommitLine(items[end]),
  }
}

/**
 * Scores how likely a run is a reusable form flow. Strong signals: a real
 * form/dialog, what closed the run, a password field. Medium signals: field
 * meaning (autocomplete), a commit line, and the number of fields.
 *
 * @param run a run from detectFormRun
 * @param trigger what closed the run: 'submit', 'removed' or 'navigation'
 * @returns {number}
 */
export function scoreFormRun(run, trigger) {
  let score = STRONG_GROUP_KINDS.includes(run.groupKind) ? 2 : 1
  score += COMMIT_TRIGGER_WEIGHTS[trigger] || 0
  if (run.hasPassword) score += 2
  score += Math.min(2, run.autocompleteCount)
  if (run.endsWithCommit) score += 1
  if (run.fillCount >= 3) score += 1
  return score
}

/**
 * @returns {string} identifies a form run so a dismissed suggestion is not
 * offered again for the same form
 */
export function formRunSignature(items, run) {
  const fields = items
    .slice(run.start, run.end + 1)
    .filter(isFillLine)
    .map(line => (Array.isArray(line.target) && Array.isArray(line.target[0]) ? line.target[0][0] : String(line.target)))
    .sort()
  return `form:${run.groupKey}:${fields.join('|')}`
}

const toIdentifier = text => {
  const words = String(text || '')
    .replace(/[^A-Za-z0-9]+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean)
  if (!words.length) return ''
  const name = words
    .map((word, index) =>
      index === 0
        ? word.charAt(0).toLowerCase() + word.slice(1)
        : word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join('')
    .slice(0, MAX_NAME_LENGTH)
  return /^[A-Za-z_]/.test(name) ? name : `_${name}`
}

// Well-known flows, recognised from what the fields mean
const has = (tokens, ...names) => names.some(name => tokens.has(name))

/**
 * Suggests a function name for a form run: a well-known flow (login,
 * sign-up, search, payment, address) from the fields' meaning, otherwise the
 * form's heading or label, otherwise `fillForm`.
 *
 * @param lines the run's lines
 * @param groupLabel the form's label or heading
 * @returns {string}
 */
export function suggestFunctionName(lines, groupLabel) {
  const tokens = new Set()
  lines.filter(isFillLine).forEach(line => {
    const context = contextOf(line)
    autocompleteTokens(context).forEach(token => tokens.add(token))
    if (context.fieldType) tokens.add(`type:${context.fieldType}`)
    ;[context.fieldName, context.label].forEach(text => {
      if (text && /search/i.test(text)) tokens.add('search')
    })
  })
  if (has(tokens, 'new-password')) return 'signUp'
  if (has(tokens, 'current-password', 'type:password')) return 'login'
  if (has(tokens, 'cc-number', 'cc-exp', 'cc-csc', 'cc-name')) return 'enterPayment'
  if (has(tokens, 'type:search', 'search')) return 'search'
  if (has(tokens, 'street-address', 'address-line1', 'postal-code', 'address-level2')) {
    return 'enterAddress'
  }
  return toIdentifier(groupLabel) || 'fillForm'
}
