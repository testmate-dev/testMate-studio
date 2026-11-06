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

import SuggestionEngine from '../../src/background/suggestion-engine'

const field = (locator, value, context = {}) => ({
  command: 'type',
  target: [[locator]],
  value,
  context: { isFillable: true, groupKey: 'id=login', groupKind: 'form', ...context },
})
const submit = { command: 'click', target: [['css=button']], value: '', context: { groupKey: 'id=login', groupKind: 'form' } }
const loginLines = (user, pw) => [
  field('id=user', user, { autocomplete: 'username' }),
  field('id=pw', pw, { fieldType: 'password' }),
  submit,
]
const loginFn = {
  id: 'fn-login',
  name: 'login',
  parameters: [{ name: 'user' }, { name: 'pw' }],
  steps: [
    { command: 'type', target: [['id=user']], value: '$user' },
    { command: 'type', target: [['id=pw']], value: '$pw' },
    { command: 'click', target: [['css=button']], value: '' },
  ],
}

describe('SuggestionEngine', () => {
  it('suggests a function when a form is submitted', () => {
    const engine = new SuggestionEngine()
    const items = [{ command: 'open', target: [['/']], value: '' }, ...loginLines('bob', 'x')]
    expect(engine.afterCommit(items, [], { trigger: 'submit', groupKey: 'id=login' })).toBe(true)
    expect(engine.suggestion).toMatchObject({ kind: 'form', start: 1, end: 3, name: 'login' })
  })

  it('does not suggest weak runs', () => {
    const engine = new SuggestionEngine()
    const items = [field('id=a', '1', { groupKind: 'container' }), field('id=b', '2', { groupKind: 'container' })]
    expect(engine.afterCommit(items, [], { trigger: 'navigation' })).toBe(false)
    expect(engine.suggestion).toBe(null)
  })

  it('does not offer a dismissed form again', () => {
    const engine = new SuggestionEngine()
    const items = loginLines('bob', 'x')
    engine.afterCommit(items, [], { trigger: 'submit' })
    expect(engine.resolve(engine.suggestion.id, 'dismissed')).toBe(true)
    expect(engine.afterCommit(items, [], { trigger: 'submit' })).toBe(false)
  })

  it('offers an existing function for matching lines', () => {
    const engine = new SuggestionEngine()
    const items = loginLines('alice', 'y')
    expect(engine.afterRecord(items, [loginFn])).toBe(true)
    expect(engine.suggestion).toMatchObject({
      kind: 'match',
      functionId: 'fn-login',
      start: 0,
      end: 2,
      arguments: { user: 'alice', pw: 'y' },
    })
  })

  it('drops a suggestion whose lines were changed', () => {
    const engine = new SuggestionEngine()
    const items = loginLines('alice', 'y')
    engine.afterRecord(items, [loginFn])
    const replaced = [{ type: 'function', id: 'c', functionId: 'fn-login', arguments: {} }]
    expect(engine.afterReplace(replaced, [loginFn])).toBe(true)
    expect(engine.suggestion).toBe(null)
  })

  it('suggests wrapping calls that keep appearing together', () => {
    const engine = new SuggestionEngine()
    const other = { id: 'fn-b', name: 'b', parameters: [], steps: [] }
    const calls = [
      { type: 'function', id: '1', functionId: 'fn-login', arguments: {} },
      { type: 'function', id: '2', functionId: 'fn-b', arguments: {} },
    ]
    const items = [...calls, { command: 'click', target: [['id=x']], value: '' }, ...calls]
    expect(engine.afterReplace(items, [loginFn, other])).toBe(true)
    expect(engine.suggestion).toMatchObject({ kind: 'wrap', functionIds: ['fn-login', 'fn-b'], count: 2 })
  })

  it('round-trips through serialize/restore', () => {
    const engine = new SuggestionEngine()
    engine.afterRecord(loginLines('a', 'b'), [loginFn])
    engine.dismissed.add('form:x')
    const copy = new SuggestionEngine()
    copy.restore(JSON.parse(JSON.stringify(engine.serialize())))
    expect(copy.suggestion).toEqual(engine.suggestion)
    expect(copy.dismissed.has('form:x')).toBe(true)
  })
})
