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
  applyParameterEdits,
  editFunctionDefinition,
  createFunctionId,
  escapeParameterReferences,
  formatSignature,
  isFunctionItem,
  isValidIdentifier,
  isValidParameterName,
  linkParameters,
  replaceParameterReferences,
  splitParameterizableValue,
  suggestParameterType,
  suggestParameters,
  toParameterName,
  validateFunctionDraft,
} from '../../src/ui/utils/function-utils'

describe('function utils', () => {
  describe('isFunctionItem', () => {
    it('detects function groups', () => {
      expect(isFunctionItem({ type: 'function' })).toBe(true)
      expect(isFunctionItem({ command: 'click' })).toBe(false)
      expect(isFunctionItem(null)).toBe(false)
    })
  })

  describe('isValidIdentifier', () => {
    it('accepts identifiers', () => {
      expect(isValidIdentifier('login')).toBe(true)
      expect(isValidIdentifier('_private1')).toBe(true)
    })
    it('rejects $ since parameters are referenced as $name', () => {
      expect(isValidIdentifier('$user')).toBe(false)
      expect(isValidIdentifier('a$b')).toBe(false)
    })
    it('rejects non-identifiers', () => {
      expect(isValidIdentifier('')).toBe(false)
      expect(isValidIdentifier('1login')).toBe(false)
      expect(isValidIdentifier('log in')).toBe(false)
    })
  })

  describe('isValidParameterName', () => {
    it('accepts letters, digits, _ and -', () => {
      expect(isValidParameterName('username')).toBe(true)
      expect(isValidParameterName('first-name')).toBe(true)
      expect(isValidParameterName('_line_2')).toBe(true)
    })
    it('rejects symbols, a leading digit or -, and a trailing -', () => {
      ;['$user', 'price£', 'cost€', '50%', '½_of_name', '2nd', '-x', 'user-', 'first name', 'user()', '{user}', 'user[0]'].forEach(
        name => expect(isValidParameterName(name)).toBe(false)
      )
    })
  })

  describe('createFunctionId', () => {
    it('creates unique prefixed IDs', () => {
      const first = createFunctionId()
      expect(first).toMatch(/^fn-/)
      expect(createFunctionId()).not.toBe(first)
    })
  })

  describe('formatSignature', () => {
    it('omits types for untyped parameters', () => {
      expect(
        formatSignature({
          name: 'login',
          parameters: [{ name: 'username', type: 'string' }, { name: 'remember' }],
        })
      ).toBe('login(username: string, remember)')
    })
    it('formats functions without parameters', () => {
      expect(formatSignature({ name: 'logout', parameters: [] })).toBe('logout()')
    })
  })

  describe('validateFunctionDraft', () => {
    it('trims values and drops empty types', () => {
      expect(
        validateFunctionDraft({
          name: ' login ',
          parameters: [
            { name: ' username ', type: ' string ' },
            { name: 'remember', type: '  ' },
          ],
        })
      ).toEqual({
        errors: [],
        value: {
          name: 'login',
          parameters: [{ name: 'username', type: 'string' }, { name: 'remember' }],
        },
      })
    })
    it('requires a valid function name', () => {
      expect(validateFunctionDraft({ name: '', parameters: [] }).errors).toEqual([
        'Function name is required.',
      ])
      expect(validateFunctionDraft({ name: '1x', parameters: [] }).errors).toHaveLength(1)
    })
    it('rejects empty, invalid, and duplicate parameter names', () => {
      const { errors } = validateFunctionDraft({
        name: 'login',
        parameters: [
          { name: '', type: '' },
          { name: 'a b', type: '' },
          { name: 'user', type: '' },
          { name: 'user', type: 'string' },
        ],
      })
      expect(errors).toEqual([
        'Parameter 1 needs a name.',
        'Parameter 2 name "a b" must start with a letter or _, use only letters, digits, _ or -, and not end with -.',
        'Parameter "user" is defined more than once.',
      ])
    })
  })

  describe('formatSignature values', () => {
    it('shows values and truncates long ones', () => {
      expect(
        formatSignature({
          name: 'search',
          parameters: [
            { name: 'destination', type: 'string', value: 'Paris' },
            { name: 'notes', value: 'a very long value that keeps going' },
          ],
        })
      ).toBe('search(destination: string = Paris, notes = a very long value th…)')
    })
  })

  describe('replaceParameterReferences', () => {
    const upper = name => name.toUpperCase()
    it('matches the longest declared name', () => {
      expect(replaceParameterReferences('$user-admin', ['user'], upper)).toBe('USER-admin')
      expect(replaceParameterReferences('$user-admin', ['user', 'user-admin'], upper)).toBe(
        'USER-ADMIN'
      )
      expect(replaceParameterReferences('$username', ['user'], upper)).toBe('USERname')
    })
    it('leaves undeclared names, escapes and non-strings alone', () => {
      expect(replaceParameterReferences('$5 and $other', ['user'], upper)).toBe('$5 and $other')
      expect(replaceParameterReferences('\\$user', ['user'], upper)).toBe('\\$user')
      expect(replaceParameterReferences(undefined, ['user'], upper)).toBe(undefined)
    })
    it('keeps a reference when the replacer returns null', () => {
      expect(replaceParameterReferences('$user', ['user'], () => null)).toBe('$user')
    })
  })

  describe('escapeParameterReferences', () => {
    it('escapes only declared names', () => {
      expect(escapeParameterReferences('$email costs $5', ['email'])).toBe('\\$email costs $5')
    })
  })

  describe('splitParameterizableValue', () => {
    it('keeps selection prefixes fixed', () => {
      expect(splitParameterizableValue('select', 'label=Paris')).toEqual({
        prefix: 'label=',
        value: 'Paris',
      })
      expect(splitParameterizableValue('type', 'label=Paris')).toEqual({
        prefix: '',
        value: 'label=Paris',
      })
    })
  })

  describe('toParameterName', () => {
    it('turns text into a valid parameter name', () => {
      expect(toParameterName('first name')).toBe('first-name')
      expect(toParameterName('destinationInput-search')).toBe('destinationInput-search')
      expect(toParameterName('  E-mail address: ')).toBe('E-mail-address')
      expect(toParameterName('2nd line')).toBe('_2nd-line')
      expect(toParameterName('£€%')).toBe('')
    })
  })

  describe('suggestParameterType', () => {
    it('maps input types to parameter types', () => {
      expect(suggestParameterType({ fieldType: 'date' })).toBe('date')
      expect(suggestParameterType({ fieldType: 'datetime-local' })).toBe('datetime')
      expect(suggestParameterType({ fieldType: 'checkbox' })).toBe('boolean')
      expect(suggestParameterType({ fieldType: 'number' })).toBe('int')
      expect(suggestParameterType({ fieldType: 'number', step: '0.01' })).toBe('float')
      expect(suggestParameterType({ fieldType: 'number', step: 'any' })).toBe('float')
      expect(suggestParameterType({ fieldType: 'email' })).toBe('string')
      expect(suggestParameterType()).toBe('string')
    })
  })

  describe('suggestParameters', () => {
    it('suggests named, typed, unique parameters for lines with values', () => {
      const steps = [
        { command: 'open', target: [['https://example.com']], value: '' },
        {
          command: 'type',
          target: [['id=user']],
          value: 'bob',
          context: { autocomplete: 'section-a username webauthn', fieldName: 'login' },
        },
        {
          command: 'type',
          target: [['id=pw']],
          value: 'secret',
          context: { autocomplete: 'current-password' },
        },
        { command: 'type', target: [['id=empty']], value: '' },
        { command: 'type', target: [['name=age']], value: '42', context: { fieldType: 'number' } },
        { command: 'select', target: [['css=.x']], value: 'label=Paris', context: { label: 'City' } },
        { command: 'type', target: [['css=.y']], value: 'again', context: { label: 'city' } },
        { command: 'type', target: [['css=.z']], value: 'z' },
        { command: 'sendKeys', target: [['id=user']], value: '${KEY_ENTER}' },
      ]
      expect(suggestParameters(steps)).toEqual([
        { stepIndex: 1, name: 'username', type: 'string', value: 'bob', prefix: '' },
        { stepIndex: 2, name: 'password', type: 'string', value: 'secret', prefix: '' },
        { stepIndex: 4, name: 'age', type: 'int', value: '42', prefix: '' },
        { stepIndex: 5, name: 'city', type: 'string', value: 'Paris', prefix: 'label=' },
        { stepIndex: 6, name: 'city2', type: 'string', value: 'again', prefix: '' },
        { stepIndex: 7, name: 'value', type: 'string', value: 'z', prefix: '' },
      ])
    })
  })

  describe('linkParameters', () => {
    it('links lines to parameters and escapes literal references', () => {
      const steps = [
        { command: 'type', target: 'a', value: 'bob' },
        { command: 'select', target: 'b', value: 'label=Paris' },
        { command: 'type', target: 'c', value: 'mail $user please' },
      ]
      const parameters = [
        { name: 'user', type: 'string', link: { stepIndex: 0, prefix: '', value: 'bob' } },
        { name: 'city', link: { stepIndex: 1, prefix: 'label=', value: 'Paris' } },
        { name: 'extra' },
      ]
      expect(linkParameters(steps, parameters)).toEqual({
        steps: [
          { command: 'type', target: 'a', value: '$user' },
          { command: 'select', target: 'b', value: 'label=$city' },
          { command: 'type', target: 'c', value: 'mail \\$user please' },
        ],
        parameters: [
          { name: 'user', type: 'string', value: 'bob' },
          { name: 'city', value: 'Paris' },
          { name: 'extra' },
        ],
      })
    })
  })

  describe('applyParameterEdits', () => {
    const steps = [
      { command: 'type', target: 'a', value: '$user' },
      { command: 'type', target: 'b', value: '$pw' },
      { command: 'type', target: 'c', value: 'literal $mail' },
    ]
    const previous = [
      { name: 'user', type: 'string', value: 'bob' },
      { name: 'pw', value: '$ecret' },
    ]
    it('renames references, inlines removed values and keeps values', () => {
      const next = [
        { name: 'username', type: 'string', originalName: 'user' },
        { name: 'mail' },
      ]
      expect(applyParameterEdits(steps, previous, next)).toEqual({
        steps: [
          { command: 'type', target: 'a', value: '$username' },
          { command: 'type', target: 'b', value: '$ecret' },
          { command: 'type', target: 'c', value: 'literal \\$mail' },
        ],
        parameters: [{ name: 'username', type: 'string', value: 'bob' }, { name: 'mail' }],
      })
    })
  })

  describe('validateFunctionDraft bookkeeping', () => {
    it('carries link and originalName through', () => {
      const link = { stepIndex: 0, prefix: '', value: 'bob' }
      expect(
        validateFunctionDraft({
          name: 'login',
          parameters: [
            { name: 'user', type: '', link },
            { name: 'pw', type: '', originalName: 'password' },
          ],
        }).value.parameters
      ).toEqual([{ name: 'user', link }, { name: 'pw', originalName: 'password' }])
    })
  })

  describe('nested calls', () => {
    const login = { id: 'fn-login', name: 'login', parameters: [{ name: 'user', type: 'string' }], steps: [] }
    const byId = new Map([[login.id, login]])
    const loginCall = { type: 'function', id: 'c1', functionId: 'fn-login', arguments: { user: 'bob' } }

    it('suggests a parameter for each argument of a nested call', () => {
      expect(suggestParameters([loginCall, { command: 'click', target: 'x', value: '' }], byId)).toEqual([
        { stepIndex: 0, argument: 'user', name: 'user', type: 'string', value: 'bob', prefix: '' },
      ])
    })

    it('links nested call arguments to the new parameters', () => {
      const linked = linkParameters(
        [loginCall],
        [{ name: 'who', link: { stepIndex: 0, argument: 'user', prefix: '', value: 'bob' } }]
      )
      expect(linked.steps[0].arguments).toEqual({ user: '$who' })
      expect(linked.parameters).toEqual([{ name: 'who', value: 'bob' }])
    })
  })

  describe('editFunctionDefinition', () => {
    const fn = {
      id: 'fn-a',
      name: 'search',
      description: '',
      parameters: [{ name: 'q' }, { name: 'page' }],
      steps: [
        { command: 'type', target: 'a', value: '$q' },
        { command: 'type', target: 'b', value: '$page' },
      ],
    }
    const use = (id, args) => ({ type: 'function', id, functionId: 'fn-a', arguments: args })

    it('renames parameters in the definition and every call', () => {
      const result = editFunctionDefinition(
        { items: [use('1', { q: 'x', page: '1' }), use('2', { q: 'y', page: '1' })], functions: [fn], copied: [] },
        'fn-a',
        { name: 'find', description: 'Finds', parameters: [{ name: 'query', originalName: 'q' }, { name: 'page', originalName: 'page' }] }
      )
      expect(result.functions[0]).toMatchObject({ name: 'find', description: 'Finds' })
      expect(result.functions[0].steps[0].value).toBe('$query')
      expect(result.items.map(item => item.arguments)).toEqual([
        { query: 'x', page: '1' },
        { query: 'y', page: '1' },
      ])
    })

    it('inlines a removed parameter all uses agree on', () => {
      const result = editFunctionDefinition(
        { items: [use('1', { q: 'x', page: '1' }), use('2', { q: 'y', page: '1' })], functions: [fn], copied: [] },
        'fn-a',
        { name: 'search', parameters: [{ name: 'q', originalName: 'q' }] }
      )
      expect(result.functions[0].steps[1].value).toBe('1')
      expect(result.items[0].arguments).toEqual({ q: 'x' })
    })

    it('refuses to remove a parameter uses disagree on', () => {
      const result = editFunctionDefinition(
        { items: [use('1', { q: 'x', page: '1' }), use('2', { q: 'y', page: '1' })], functions: [fn], copied: [] },
        'fn-a',
        { name: 'search', parameters: [{ name: 'page', originalName: 'page' }] }
      )
      expect(result.error).toMatch(/different values/)
    })
  })
})
