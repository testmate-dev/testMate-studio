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
  FORM_SCORE_THRESHOLD,
  detectFormRun,
  isCommitLine,
  scoreFormRun,
  suggestFunctionName,
} from '../../src/common/form-detection'

const field = (command, locator, value, context) => ({
  command,
  target: [[locator]],
  value,
  context: { isFillable: true, groupKey: 'id=login', groupKind: 'form', ...context },
})
const submit = { command: 'click', target: [['css=button']], value: '', context: { isFillable: false, groupKey: 'id=login', groupKind: 'form', groupLabel: 'Sign in' } }

describe('form detection', () => {
  const login = [
    { command: 'open', target: [['/']], value: '' },
    field('click', 'id=user', ''),
    field('type', 'id=user', 'bob', { autocomplete: 'username' }),
    field('type', 'id=pw', 'secret', { fieldType: 'password', autocomplete: 'current-password' }),
    submit,
  ]

  it('finds the run of lines filling one form', () => {
    expect(detectFormRun(login)).toMatchObject({
      start: 1,
      end: 4,
      groupKey: 'id=login',
      groupKind: 'form',
      groupLabel: 'Sign in',
      fillCount: 2,
      hasPassword: true,
      autocompleteCount: 2,
      endsWithCommit: true,
    })
  })

  it('starts after the previous commit of the same form', () => {
    const twice = [...login, field('type', 'id=user', 'alice'), field('type', 'id=pw', 'x'), submit]
    expect(detectFormRun(twice)).toMatchObject({ start: 5, end: 7 })
  })

  it('never reaches into lines before a function', () => {
    const items = [field('type', 'id=user', 'a'), { type: 'function', id: 'c', functionId: 'f' }, field('type', 'id=pw', 'b')]
    expect(detectFormRun(items)).toMatchObject({ start: 2, end: 2 })
  })

  it('returns null without a filled form', () => {
    expect(detectFormRun([{ command: 'click', target: [['id=x']], value: '' }])).toBe(null)
  })

  it('scores strong signals above the threshold, weak ones below', () => {
    expect(scoreFormRun(detectFormRun(login), 'submit')).toBeGreaterThanOrEqual(FORM_SCORE_THRESHOLD)
    const weak = { groupKind: 'container', hasPassword: false, autocompleteCount: 0, endsWithCommit: true, fillCount: 2 }
    expect(scoreFormRun(weak, 'navigation')).toBeLessThan(FORM_SCORE_THRESHOLD)
    expect(scoreFormRun({ ...weak, fillCount: 3 }, 'navigation')).toBe(FORM_SCORE_THRESHOLD)
  })

  it('treats clicks on non-fields and Enter as commits', () => {
    expect(isCommitLine(submit)).toBe(true)
    expect(isCommitLine(field('click', 'id=user', ''))).toBe(false)
    expect(isCommitLine({ command: 'sendKeys', value: '${KEY_ENTER}' })).toBe(true)
  })

  it('names well-known flows, else from the form label', () => {
    expect(suggestFunctionName(login, 'Sign in')).toBe('login')
    expect(suggestFunctionName([field('type', 'id=pw', 'x', { autocomplete: 'new-password' })], '')).toBe('signUp')
    expect(suggestFunctionName([field('type', 'id=q', 'x', { fieldType: 'search' })], '')).toBe('search')
    expect(suggestFunctionName([field('type', 'id=n', 'x')], 'Create new project')).toBe('createNewProject')
    expect(suggestFunctionName([field('type', 'id=n', 'x')], '')).toBe('fillForm')
  })
})
