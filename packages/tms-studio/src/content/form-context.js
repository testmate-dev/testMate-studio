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

// Describes the field a recorded line acted on, so the studio can suggest
// function parameters and (TMD-11) group lines that belong to one form.
// Never includes the field's value: context may be kept for learning.

const MAX_TEXT_LENGTH = 80
const MAX_CONTAINER_DEPTH = 8
const GROUP_SELECTOR = 'form, fieldset, dialog, [role="form"], [role="search"], [role="dialog"]'
const BUTTON_SELECTOR = 'button, input[type="submit"], input[type="button"], input[type="image"], [role="button"]'

const cleanText = text => {
  if (!text) return ''
  const cleaned = text.replace(/\s+/g, ' ').trim()
  return cleaned.length > MAX_TEXT_LENGTH ? cleaned.slice(0, MAX_TEXT_LENGTH) : cleaned
}

const textOfIds = (doc, ids) =>
  cleanText(
    ids
      .split(/\s+/)
      .map(id => {
        const el = doc.getElementById(id)
        return el ? el.textContent : ''
      })
      .join(' ')
  )

/**
 * @param element a form field
 * @returns {string} the field's accessible label, or ''
 */
export function getFieldLabel(element) {
  const doc = element.ownerDocument
  const labelledBy = element.getAttribute('aria-labelledby')
  if (labelledBy) {
    const text = textOfIds(doc, labelledBy)
    if (text) return text
  }
  const ariaLabel = cleanText(element.getAttribute('aria-label'))
  if (ariaLabel) return ariaLabel
  if (element.labels && element.labels.length > 0) {
    const text = cleanText(element.labels[0].textContent)
    if (text) return text
  }
  return cleanText(element.getAttribute('placeholder') || element.getAttribute('title'))
}

/**
 * @param element the element a line acted on
 * @returns {string} input type for inputs, otherwise the lowercase tag name
 */
export function getFieldType(element) {
  const tagName = element.tagName.toLowerCase()
  if (tagName === 'input') return (element.getAttribute('type') || 'text').toLowerCase()
  if (element.isContentEditable) return 'contenteditable'
  return tagName
}

const isFillable = element => {
  const fieldType = getFieldType(element)
  if (['select', 'textarea', 'contenteditable'].includes(fieldType)) return true
  if (element.tagName.toLowerCase() !== 'input') return false
  return !['button', 'submit', 'reset', 'image', 'hidden'].includes(fieldType)
}

/**
 * Finds the element that groups a field with the rest of its form: a real
 * <form> (including a `form="id"` owner), fieldset, dialog or form-like role,
 * or otherwise the nearest ancestor that also contains a button.
 *
 * @param element a form field
 * @returns {Element|null}
 */
export function getGroupContainer(element) {
  if (element.form) return element.form
  const group = element.closest(GROUP_SELECTOR)
  if (group) return group
  let current = element.parentElement
  for (let depth = 0; current && depth < MAX_CONTAINER_DEPTH; depth++) {
    if (current.tagName.toLowerCase() === 'body') return null
    if (current.querySelector(BUTTON_SELECTOR)) return current
    current = current.parentElement
  }
  return null
}

/**
 * @param container an element from getGroupContainer
 * @returns {string} 'form', 'fieldset', 'dialog' or 'container' (any other
 * element that holds fields and a button)
 */
export function getGroupKind(container) {
  const tagName = container.tagName.toLowerCase()
  const role = (container.getAttribute('role') || '').toLowerCase()
  if (tagName === 'form' || role === 'form' || role === 'search') return 'form'
  if (tagName === 'fieldset') return 'fieldset'
  if (tagName === 'dialog' || role === 'dialog') return 'dialog'
  return 'container'
}

const getGroupLabel = container => {
  const ariaLabel = cleanText(container.getAttribute('aria-label'))
  if (ariaLabel) return ariaLabel
  const labelledBy = container.getAttribute('aria-labelledby')
  if (labelledBy) {
    const text = textOfIds(container.ownerDocument, labelledBy)
    if (text) return text
  }
  const heading = container.querySelector('legend, h1, h2, h3, h4')
  return heading ? cleanText(heading.textContent) : ''
}

/**
 * Builds the context recorded alongside a line.
 *
 * @param element the element the line acted on
 * @param buildLocator function returning a locator string for an element
 * @returns {Object} context with only the fields that have values
 */
export function getFieldContext(element, buildLocator) {
  const context = {
    fieldName: element.getAttribute('name') || element.id || '',
    fieldType: getFieldType(element),
    autocomplete: (element.getAttribute('autocomplete') || '').trim().toLowerCase(),
    label: getFieldLabel(element),
    isFillable: isFillable(element),
  }
  if (context.fieldType === 'number') {
    context.step = element.getAttribute('step') || ''
  }
  const container = getGroupContainer(element)
  if (container) {
    try {
      context.groupKey = buildLocator(container)
    } catch (e) {
      // groupKey is optional
    }
    context.groupLabel = getGroupLabel(container)
    context.groupKind = getGroupKind(container)
  }
  Object.keys(context).forEach(key => {
    if (context[key] === '' || context[key] === undefined) delete context[key]
  })
  return context
}

// Delay before checking whether tracked fields are gone, so a page that is
// mid-update is not mistaken for a closed form
const REMOVAL_CHECK_DELAY_MS = 250
const MAX_TRACKED_FIELDS = 50

const isGone = element => !element.isConnected || element.getClientRects().length === 0

/**
 * Reports when a form the user filled in is committed (TMD-11): it is
 * submitted, or all the fields recorded in it disappear (e.g. a dialog
 * closes or a single-page app swaps the view). URL changes are seen by the
 * background itself.
 */
export class FormCommitWatcher {
  /**
   * @param window the page's window
   * @param report called with ({trigger, groupKey})
   * @param buildLocator function returning a locator string for an element
   */
  constructor(window, report, buildLocator) {
    this.window = window
    this.report = report
    this.buildLocator = buildLocator
    this.fields = new Map() // groupKey -> Set<Element>
    this.timer = null
    this.observer = null
    this.onSubmit = this.onSubmit.bind(this)
    this.onMutation = this.onMutation.bind(this)
  }

  attach() {
    this.window.document.addEventListener('submit', this.onSubmit, true)
    this.observer = new MutationObserver(this.onMutation)
    this.observer.observe(this.window.document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class', 'hidden', 'open'],
    })
  }

  detach() {
    this.window.document.removeEventListener('submit', this.onSubmit, true)
    if (this.observer) this.observer.disconnect()
    this.observer = null
    clearTimeout(this.timer)
    this.timer = null
    this.fields.clear()
  }

  /**
   * Remembers a field a line was recorded on.
   *
   * @param element the field
   * @param context its field context
   */
  track(element, context) {
    if (!context || !context.isFillable || !context.groupKey) return
    let size = 0
    this.fields.forEach(set => (size += set.size))
    if (size >= MAX_TRACKED_FIELDS) return
    if (!this.fields.has(context.groupKey)) this.fields.set(context.groupKey, new Set())
    this.fields.get(context.groupKey).add(element)
  }

  onSubmit(event) {
    const form = event.target
    let groupKey
    try {
      groupKey = this.buildLocator(form) || undefined
    } catch (e) {
      // the background falls back to the last filled form
    }
    if (groupKey) this.fields.delete(groupKey)
    this.report({ trigger: 'submit', groupKey })
  }

  // Throttled rather than debounced, so constantly animating pages still
  // get checked
  onMutation() {
    if (this.fields.size === 0 || this.timer) return
    this.timer = setTimeout(() => {
      this.timer = null
      this.checkRemoved()
    }, REMOVAL_CHECK_DELAY_MS)
  }

  checkRemoved() {
    this.fields.forEach((elements, groupKey) => {
      if (Array.from(elements).every(isGone)) {
        this.fields.delete(groupKey)
        this.report({ trigger: 'removed', groupKey })
      }
    })
  }
}
