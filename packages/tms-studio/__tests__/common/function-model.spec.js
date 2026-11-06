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
  expandItems,
  findOccurrences,
  findRangeMatch,
  findRepeatedCalls,
  findTrailingMatch,
  indexFunctions,
  matchTemplate,
  migrateLegacyFunctions,
  reachableFunctions,
  targetsSimilar,
} from '../../src/common/function-model'

const line = (command, locator, value = '') => ({ command, target: [[locator]], value })
const call = (functionId, args = {}, id = `call-${functionId}`) => ({
  type: 'function',
  id,
  functionId,
  collapsed: false,
  arguments: args,
})

const login = {
  id: 'fn-login',
  name: 'login',
  description: '',
  parameters: [{ name: 'user' }, { name: 'password' }],
  steps: [
    line('type', 'id=user', '$user'),
    line('type', 'id=pw', '$password'),
    line('click', 'css=button[type=submit]'),
  ],
}
const openProject = {
  id: 'fn-open',
  name: 'openProject',
  description: '',
  parameters: [{ name: 'project' }],
  steps: [line('click', 'id=projects'), line('select', 'id=project', 'label=$project')],
}
const setUp = {
  id: 'fn-setup',
  name: 'setUp',
  description: '',
  parameters: [{ name: 'who' }, { name: 'pw' }, { name: 'project' }],
  steps: [
    call('fn-login', { user: '$who', password: '$pw' }, 'inner-1'),
    call('fn-open', { project: '$project' }, 'inner-2'),
  ],
}

describe('function model', () => {
  describe('matchTemplate', () => {
    it('binds referenced parameters', () => {
      expect(matchTemplate('label=$city', 'label=Paris', ['city'])).toEqual({ city: 'Paris' })
      expect(matchTemplate('$a-$b', 'x-y-z', ['a', 'b'])).toEqual({ a: 'x', b: 'y-z' })
    })
    it('requires literal text to be equal', () => {
      expect(matchTemplate('fixed', 'fixed', [])).toEqual({})
      expect(matchTemplate('fixed', 'other', [])).toBe(null)
      expect(matchTemplate('cost \\$5', 'cost $5', [])).toEqual({})
    })
    it('requires a repeated parameter to have one value', () => {
      expect(matchTemplate('$a/$a', 'x/x', ['a'])).toEqual({ a: 'x' })
      expect(matchTemplate('$a/$a', 'x/y', ['a'])).toBe(null)
    })
  })

  describe('targetsSimilar', () => {
    it('matches shared or number-only-different locators', () => {
      expect(targetsSimilar([['id=a'], ['css=.x']], [['css=.x']])).toBe(true)
      expect(targetsSimilar([['xpath=//li[3]/a']], [['xpath=//li[7]/a']])).toBe(true)
      expect(targetsSimilar([['id=a']], [['id=b']])).toBe(false)
    })
  })

  describe('expandItems', () => {
    it('expands nested calls with their arguments', () => {
      const byId = indexFunctions([login, openProject, setUp])
      expect(expandItems([call('fn-setup', { who: 'bob', pw: 's', project: 'Apollo' })], byId)).toEqual([
        line('type', 'id=user', 'bob'),
        line('type', 'id=pw', 's'),
        line('click', 'css=button[type=submit]'),
        line('click', 'id=projects'),
        line('select', 'id=project', 'label=Apollo'),
      ])
    })
  })

  describe('findTrailingMatch', () => {
    it('recognises the latest lines as an existing function', () => {
      const items = [
        line('open', '/'),
        line('type', 'id=user', 'alice'),
        line('type', 'id=pw', 'hunter2'),
        line('click', 'css=button[type=submit]'),
      ]
      expect(findTrailingMatch(items, [login])).toEqual({
        functionId: 'fn-login',
        start: 1,
        end: 3,
        arguments: { user: 'alice', password: 'hunter2' },
      })
    })
    it('ignores lines that differ', () => {
      const items = [line('type', 'id=user', 'alice'), line('type', 'id=other', 'x'), line('click', 'css=button[type=submit]')]
      expect(findTrailingMatch(items, [login])).toBe(null)
    })
    it('matches recorded lines against a nested function', () => {
      const items = [
        line('type', 'id=user', 'bob'),
        line('type', 'id=pw', 's'),
        line('click', 'css=button[type=submit]'),
        line('click', 'id=projects'),
        line('select', 'id=project', 'label=Apollo'),
      ]
      expect(findTrailingMatch(items, [login, openProject, setUp])).toEqual({
        functionId: 'fn-setup',
        start: 0,
        end: 4,
        arguments: { who: 'bob', pw: 's', project: 'Apollo' },
      })
    })
    it('matches calls against a function that wraps them', () => {
      const items = [call('fn-login', { user: 'bob', password: 's' }, 'a'), call('fn-open', { project: 'X' }, 'b')]
      expect(findTrailingMatch(items, [login, openProject, setUp]).arguments).toEqual({
        who: 'bob',
        pw: 's',
        project: 'X',
      })
    })
  })

  describe('findRangeMatch', () => {
    it('matches a given range', () => {
      const items = [line('type', 'id=user', 'a'), line('type', 'id=pw', 'b'), line('click', 'css=button[type=submit]'), line('click', 'id=x')]
      expect(findRangeMatch(items, 0, 2, [login]).arguments).toEqual({ user: 'a', password: 'b' })
      expect(findRangeMatch(items, 1, 3, [login])).toBe(null)
    })
  })

  describe('findRepeatedCalls', () => {
    const items = [
      call('fn-login', {}, 'a'),
      call('fn-open', {}, 'b'),
      line('click', 'id=x'),
      call('fn-login', {}, 'c'),
      call('fn-open', {}, 'd'),
    ]
    it('finds calls that keep appearing in the same order', () => {
      expect(findRepeatedCalls(items, [login, openProject])).toEqual({
        functionIds: ['fn-login', 'fn-open'],
        signature: 'wrap:fn-login>fn-open',
        count: 2,
        start: 3,
        end: 4,
      })
    })
    it('skips sequences already wrapped or dismissed', () => {
      expect(findRepeatedCalls(items, [login, openProject, setUp])).toBe(null)
      expect(findRepeatedCalls(items, [login, openProject], s => s === 'wrap:fn-login>fn-open')).toBe(null)
    })
    it('needs two separate occurrences', () => {
      expect(findRepeatedCalls(items.slice(0, 2), [login, openProject])).toBe(null)
    })
  })

  describe('findOccurrences', () => {
    it('finds every place a function appears', () => {
      const items = [
        call('fn-login', { user: 'a', password: '1' }, 'a'),
        call('fn-open', { project: 'P' }, 'b'),
        call('fn-login', { user: 'b', password: '2' }, 'c'),
        call('fn-open', { project: 'Q' }, 'd'),
      ]
      expect(findOccurrences(items, setUp, [login, openProject, setUp])).toEqual([
        { start: 0, end: 1, arguments: { who: 'a', pw: '1', project: 'P' } },
        { start: 2, end: 3, arguments: { who: 'b', pw: '2', project: 'Q' } },
      ])
    })
  })

  describe('reachableFunctions', () => {
    it('keeps definitions called directly or through other functions', () => {
      const unused = { ...login, id: 'fn-unused' }
      expect(
        reachableFunctions([login, openProject, setUp, unused], [call('fn-setup')]).map(fn => fn.id)
      ).toEqual(['fn-login', 'fn-open', 'fn-setup'])
    })
  })

  describe('migrateLegacyFunctions', () => {
    it('turns a function holding its own lines into a definition and a call', () => {
      const legacy = {
        type: 'function',
        id: 'fn-old',
        name: 'login',
        parameters: [{ name: 'user', type: 'string', value: 'bob' }],
        collapsed: true,
        steps: [line('type', 'id=user', '$user')],
      }
      const { items, functions } = migrateLegacyFunctions([line('open', '/'), legacy], [])
      expect(functions).toEqual([
        {
          id: 'fn-old',
          name: 'login',
          description: '',
          parameters: [{ name: 'user', type: 'string' }],
          steps: [line('type', 'id=user', '$user')],
        },
      ])
      expect(items[1]).toMatchObject({
        type: 'function',
        functionId: 'fn-old',
        collapsed: true,
        arguments: { user: 'bob' },
      })
    })
  })
})
