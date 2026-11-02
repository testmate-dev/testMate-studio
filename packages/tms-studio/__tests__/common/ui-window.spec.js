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

import { minimumWindowSize, windowSizeToOpen } from '../../src/common/ui-window'

describe('windowSizeToOpen', () => {
  it('reuses a plausible saved size', () => {
    expect(windowSizeToOpen({ width: 744.4, height: 841 })).toEqual({ width: 744, height: 841 })
  })

  it('falls back to the default for missing or implausible sizes', () => {
    const fallback = { width: 560, height: 640 }
    expect(windowSizeToOpen(undefined)).toEqual(fallback)
    expect(windowSizeToOpen({ width: 50, height: 841 })).toEqual(fallback)
    expect(windowSizeToOpen({ width: '744', height: 841 })).toEqual(fallback)
    expect(windowSizeToOpen({ width: 744, height: Infinity })).toEqual(fallback)
  })
})

describe('minimumWindowSize', () => {
  it('returns null when the viewport is already big enough', () => {
    expect(
      minimumWindowSize(
        { width: 560, height: 640 },
        { width: 560, height: 640 },
        { width: 544, height: 610 }
      )
    ).toBe(null)
  })

  it('grows the window by the missing viewport (Firefox reserving hidden toolbar space)', () => {
    // Measured in Firefox Developer Edition 150: 560x640 window, 356x399 page
    expect(
      minimumWindowSize(
        { width: 560, height: 640 },
        { width: 560, height: 640 },
        { width: 356, height: 399 }
      )
    ).toEqual({ width: 744, height: 841 })
  })

  it('converts the missing amount when API units are device pixels', () => {
    expect(
      minimumWindowSize(
        { width: 600, height: 900 },
        { width: 400, height: 600 },
        { width: 380, height: 560 }
      )
    ).toEqual({ width: 840, height: 960 })
  })

  it('only grows the dimension that is too small', () => {
    expect(
      minimumWindowSize(
        { width: 900, height: 500 },
        { width: 900, height: 500 },
        { width: 884, height: 460 }
      )
    ).toEqual({ width: 900, height: 640 })
  })

  it('ignores missing sizes', () => {
    expect(
      minimumWindowSize({ width: 0, height: 0 }, { width: 400, height: 500 }, { width: 380, height: 460 })
    ).toBe(null)
  })
})
