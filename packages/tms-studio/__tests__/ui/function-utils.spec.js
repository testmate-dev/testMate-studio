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
  createFunctionId,
  formatSignature,
  isFunctionItem,
  isValidIdentifier,
  isValidParameterName,
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
})
