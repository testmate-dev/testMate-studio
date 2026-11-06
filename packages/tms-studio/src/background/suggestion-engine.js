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
  findRangeMatch,
  findRepeatedCalls,
  findTrailingMatch,
  fingerprintRange,
} from '../common/function-model'
import {
  FORM_SCORE_THRESHOLD,
  detectFormRun,
  formRunSignature,
  scoreFormRun,
  suggestFunctionName,
} from '../common/form-detection'

/**
 * Decides which "turn these lines into a function" suggestion the studio
 * shows. There is at most one at a time:
 * - `form` (TMD-11): a form was filled in and committed
 * - `match` (TMD-12): the latest lines are another use of an existing function
 * - `wrap` (TMD-12): the same functions keep being called in the same order
 *
 * Dismissed suggestions are not offered again in this recording. Everything
 * is scoped to the current recording.
 */
export default class SuggestionEngine {
  constructor() {
    this.reset()
  }

  reset() {
    this.suggestion = null
    this.dismissed = new Set()
  }

  serialize() {
    return { suggestion: this.suggestion, dismissed: Array.from(this.dismissed) }
  }

  restore(state) {
    if (!state) return
    this.suggestion = state.suggestion || null
    this.dismissed = new Set(Array.isArray(state.dismissed) ? state.dismissed : [])
  }

  /**
   * After a line is recorded: offer to replace the latest lines with an
   * existing function they match.
   *
   * @returns {boolean} whether the suggestion changed
   */
  afterRecord(items, functions) {
    const match = findTrailingMatch(items, functions)
    return match ? this.offerMatch(items, match) : false
  }

  /**
   * After a form was submitted, the page navigated, or the filled fields
   * disappeared.
   *
   * @param trigger 'submit', 'removed' or 'navigation'
   * @param groupKey the committed form's group, if known
   * @returns {boolean} whether the suggestion changed
   */
  afterCommit(items, functions, { trigger, groupKey } = {}) {
    const run = detectFormRun(items, { groupKey })
    if (!run) return false
    const match = findRangeMatch(items, run.start, run.end, functions)
    if (match) return this.offerMatch(items, match)
    if (run.fillCount < 2 || scoreFormRun(run, trigger) < FORM_SCORE_THRESHOLD) return false
    return this.offer(items, {
      kind: 'form',
      start: run.start,
      end: run.end,
      name: suggestFunctionName(items.slice(run.start, run.end + 1), run.groupLabel),
      groupLabel: run.groupLabel,
      signature: formRunSignature(items, run),
    })
  }

  /**
   * After the lines were edited in the studio: drop a suggestion whose lines
   * changed, and look for functions that keep being called together.
   *
   * @returns {boolean} whether the suggestion changed
   */
  afterReplace(items, functions) {
    let changed = false
    if (this.suggestion && !this.isCurrent(items)) {
      this.suggestion = null
      changed = true
    }
    if (!this.suggestion) {
      const repeated = findRepeatedCalls(items, functions, signature =>
        this.dismissed.has(signature)
      )
      if (repeated) changed = this.offer(items, { kind: 'wrap', ...repeated }) || changed
    }
    return changed
  }

  /**
   * @param id the suggestion's ID
   * @param outcome 'dismissed' (not offered again) or 'accepted'
   * @returns {boolean} whether the suggestion changed
   */
  resolve(id, outcome) {
    if (!this.suggestion || this.suggestion.id !== id) return false
    if (outcome === 'dismissed') this.dismissed.add(this.suggestion.signature)
    this.suggestion = null
    return true
  }

  isCurrent(items) {
    const { start, end, fingerprint } = this.suggestion
    return end < items.length && fingerprintRange(items, start, end) === fingerprint
  }

  offerMatch(items, match) {
    return this.offer(items, {
      kind: 'match',
      ...match,
      // Declining a match declines that function for the rest of the recording
      signature: `match:${match.functionId}`,
    })
  }

  offer(items, suggestion) {
    if (this.dismissed.has(suggestion.signature)) return false
    const current = this.suggestion
    if (
      current &&
      current.signature === suggestion.signature &&
      current.start === suggestion.start &&
      current.end === suggestion.end
    ) {
      return false
    }
    this.suggestion = {
      ...suggestion,
      id: createId('sg'),
      fingerprint: fingerprintRange(items, suggestion.start, suggestion.end),
    }
    return true
  }
}
