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

// Size the background asks for when it opens the studio window for the
// first time; afterwards it reuses the last size the page saved
export const UI_WINDOW_WIDTH = 560
export const UI_WINDOW_HEIGHT = 640

// storage.local key for the last good window size, in windows-API units
export const UI_WINDOW_SIZE_KEY = 'tms:uiWindowSize'
const MIN_SAVED_SIZE = 200
const MAX_SAVED_SIZE = 10000

/**
 * Picks the size to open the studio window at: the saved size if it is
 * plausible, otherwise the default.
 *
 * @param saved the value stored under UI_WINDOW_SIZE_KEY, if any
 * @returns {{width: number, height: number}}
 */
export function windowSizeToOpen(saved) {
  const isPlausible = value =>
    Number.isFinite(value) && value >= MIN_SAVED_SIZE && value <= MAX_SAVED_SIZE
  if (saved && isPlausible(saved.width) && isPlausible(saved.height)) {
    return { width: Math.round(saved.width), height: Math.round(saved.height) }
  }
  return { width: UI_WINDOW_WIDTH, height: UI_WINDOW_HEIGHT }
}

// Minimum visible page size (viewport) in CSS pixels, enforced by the page.
// The viewport is what matters: browsers reserve different, sometimes
// large, amounts of the window for frames and (hidden) toolbars.
export const MIN_UI_VIEWPORT_WIDTH = 540
export const MIN_UI_VIEWPORT_HEIGHT = 600

/**
 * Computes the window size, in windows-API units, needed for the page's
 * viewport to reach the minimum size. The window grows by exactly the
 * missing amount, converted from CSS pixels to windows-API units using the
 * measured ratio (Chrome uses CSS pixels; Firefox can use device pixels).
 *
 * @param apiSize {{width: number, height: number}} size reported by
 * browser.windows for the window
 * @param outerSize {{width: number, height: number}} the window's outer size
 * in CSS pixels (window.outerWidth / outerHeight)
 * @param viewportSize {{width: number, height: number}} the page's viewport
 * in CSS pixels (window.innerWidth / innerHeight)
 * @returns {{width: number, height: number}|null} the size to request, or
 * null when the viewport is already big enough
 */
export function minimumWindowSize(apiSize, outerSize, viewportSize) {
  const sizes = [apiSize, outerSize, viewportSize]
  if (sizes.some(size => !size.width || !size.height)) return null
  const missingWidth = Math.max(0, MIN_UI_VIEWPORT_WIDTH - viewportSize.width)
  const missingHeight = Math.max(0, MIN_UI_VIEWPORT_HEIGHT - viewportSize.height)
  if (!missingWidth && !missingHeight) return null
  const scaleX = apiSize.width / outerSize.width
  const scaleY = apiSize.height / outerSize.height
  return {
    width: Math.ceil(apiSize.width + missingWidth * scaleX),
    height: Math.ceil(apiSize.height + missingHeight * scaleY),
  }
}
