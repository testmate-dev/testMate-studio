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

import eio from 'engine.io-client'
import browser from 'webextension-polyfill'
import BackgroundRecorder from './recorder'
import WindowSession from './window-session'
import { select, cancelSelect } from './select'

const STORAGE_KEY = 'tmr:recorderState'

let socket = null
let socketListenersReady = false
const windowSession = new WindowSession()
const recordedSteps = []
let activeSessionId = null
let isRecording = false
let isPaused = false
let uiWindowId = null
const MIN_UI_WINDOW_WIDTH = 560
const MIN_UI_WINDOW_HEIGHT = 640
let isUpdatingUiWindowBounds = false

function getSocket() {
  if (!socket) {
    socket = eio(globalThis.socketUrl || 'ws://localhost:4445')
  }
  if (!socketListenersReady) {
    socketListenersReady = true
    socket.on('open', () => {
      socket.on('message', data => {
        const { type, payload } = JSON.parse(data)
        if (type === 'attach') {
          attach(payload)
        } else if (type === 'detach') {
          detach()
        } else if (type === 'select') {
          selectElement(payload.sessionId, payload.windowName)
            .then(result => {
              return socket.send(
                JSON.stringify({
                  type: 'select',
                  payload: {
                    result,
                  },
                })
              )
            })
            .catch(error => {
              return socket.send(
                JSON.stringify({
                  type: 'select',
                  payload: {
                    error: true,
                    message: error.message,
                  },
                })
              )
            })
        } else if (type === 'cancelSelect') {
          cancelSelect()
        }
      })
    })
  }
  return socket
}

// === State Persistence ===

async function persistState() {
  try {
    await browser.storage.local.set({
      [STORAGE_KEY]: {
        recordedSteps: recordedSteps.slice(),
        activeSessionId,
        isPaused,
        isRecording,
        uiWindowId,
      },
    })
  } catch (e) {
    // best-effort
  }
}

async function clearSavedState() {
  try {
    await browser.storage.local.remove(STORAGE_KEY)
  } catch (e) {
    // best-effort
  }
}

async function restoreState() {
  try {
    const result = await browser.storage.local.get(STORAGE_KEY)
    const saved = result[STORAGE_KEY]
    if (!saved || !Array.isArray(saved.recordedSteps)) return

    recordedSteps.length = 0
    saved.recordedSteps.forEach(step => recordedSteps.push(step))
    activeSessionId = saved.activeSessionId || null
    isPaused = saved.isPaused || false
    isRecording = saved.isRecording || false
    uiWindowId = saved.uiWindowId || null

    await clearSavedState()
    notifyUiUpdate('restore')
  } catch (e) {
    // best-effort
  }
}

// Restore any previously saved state on startup
restoreState()

const notifyUiUpdate = reason => {
  browser.runtime
    .sendMessage({
      tmrRecorderEvent: 'updated',
      reason,
    })
    .catch(() => {})
}

const record = (command, target, value, insertBeforeLastCommand) => {
  if (isPaused) return
  globalThis.hasRecorded = true
  const payload = {
    type: 'record',
    payload: {
      command,
      target,
      value,
      insertBeforeLastCommand,
    },
  }
  recordedSteps.push(payload.payload)
  notifyUiUpdate('record')
  if (getSocket() && getSocket().readyState === 'open') {
    return getSocket().send(JSON.stringify(payload))
  }
}

const recordOpensWindow = windowHandleName => {
  const payload = {
    type: 'recordOpensWindow',
    payload: {
      windowHandleName,
    },
  }
  if (getSocket() && getSocket().readyState === 'open') {
    return getSocket().send(JSON.stringify(payload))
  }
}

const hasRecorded = () => globalThis.hasRecorded

globalThis.recorder = new BackgroundRecorder(
  windowSession,
  record,
  recordOpensWindow,
  hasRecorded
)

const attach = ({ sessionId, hasRecorded: hasRecordedFlag = false }) => {
  globalThis.hasRecorded = hasRecordedFlag
  activeSessionId = sessionId
  isRecording = true
  isPaused = false
  notifyUiUpdate('attach')
  return globalThis.recorder.attach(sessionId)
}

const detach = () => {
  isRecording = false
  isPaused = false
  activeSessionId = null
  notifyUiUpdate('detach')
  return globalThis.recorder.detach()
}

const normalizeUrl = rawUrl => {
  if (!rawUrl || !rawUrl.trim()) return 'about:blank'
  const trimmed = rawUrl.trim()
  if (/^https?:\/\//i.test(trimmed) || /^about:/i.test(trimmed)) {
    return trimmed
  }
  return `https://${trimmed}`
}

const clearSiteData = async rawUrl => {
  if (!browser.browsingData || typeof browser.browsingData.remove !== 'function') {
    return { ok: false, error: 'browsingData API is unavailable.' }
  }

  const normalizedUrl = normalizeUrl(rawUrl)
  let hostname
  let origin
  try {
    const parsed = new URL(normalizedUrl)
    origin = parsed.origin
    hostname = parsed.hostname
  } catch (error) {
    return { ok: false, error: `Invalid URL for clearing site data: ${rawUrl}` }
  }

  try {
    const dataToRemove = {
      cookies: true,
      indexedDB: true,
      localStorage: true,
    }

    const hostnameCandidates = new Set()
    const addHostname = value => {
      if (!value || value === 'localhost') return
      hostnameCandidates.add(value)
    }

    addHostname(hostname)
    if (hostname.startsWith('www.')) {
      addHostname(hostname.slice(4))
    } else {
      addHostname(`www.${hostname}`)
    }

    const parts = hostname.split('.').filter(Boolean)
    if (parts.length >= 2) {
      addHostname(parts.slice(-2).join('.'))
    }

    const originCandidates = new Set([origin])
    hostnameCandidates.forEach(host => {
      originCandidates.add(`https://${host}`)
      originCandidates.add(`http://${host}`)
    })

    try {
      await browser.browsingData.remove(
        {
          since: 0,
          hostnames: Array.from(hostnameCandidates),
        },
        dataToRemove
      )
    } catch (hostnamesError) {
      await browser.browsingData.remove(
        {
          since: 0,
          origins: Array.from(originCandidates),
        },
        dataToRemove
      )
    }

    if (typeof browser.browsingData.removeCache === 'function') {
      await browser.browsingData.removeCache({ since: 0 })
    } else {
      await browser.browsingData.remove(
        {
          since: 0,
        },
        {
          cache: true,
        }
      )
    }

    return { ok: true }
  } catch (error) {
    return {
      ok: false,
      error: error && error.message ? error.message : String(error),
    }
  }
}

const waitForTabReady = tabId =>
  new Promise(resolve => {
    let done = false
    const timeout = setTimeout(() => {
      if (done) return
      done = true
      browser.tabs.onUpdated.removeListener(listener)
      resolve()
    }, 5000)
    const listener = (updatedTabId, changeInfo) => {
      if (updatedTabId !== tabId) return
      if (changeInfo.status === 'complete') {
        if (done) return
        done = true
        clearTimeout(timeout)
        browser.tabs.onUpdated.removeListener(listener)
        resolve()
      }
    }
    browser.tabs.onUpdated.addListener(listener)
  })

const startRecording = async (url, sessionIdOverride, options = {}) => {
  const sessionId =
    sessionIdOverride ||
    `tmr-${Date.now().toString(36)}-${Math.random()
      .toString(36)
      .slice(2, 8)}`
  const startUrl = normalizeUrl(url)
  const startHostname = (() => {
    try {
      return new URL(startUrl).hostname
    } catch (e) {
      return null
    }
  })()

  if (options.clearSiteData === true) {
    const preClearResult = await clearSiteData(startUrl)
    if (!preClearResult.ok) {
      return preClearResult
    }
  }

  const createOptions = {
    url: startUrl,
    type: 'normal',
    focused: true,
    state: 'maximized',
  }
  const win = await browser.windows.create(createOptions)
  const tabs = await browser.tabs.query({
    windowId: win.id,
    active: true,
  })
  const tab = tabs[0]
  if (!tab) {
    return { ok: false, error: 'No active tab found in new window.' }
  }

  await waitForTabReady(tab.id)

  if (options.clearSiteData === true) {
    const liveTab = await browser.tabs.get(tab.id)
    const finalUrl = liveTab && liveTab.url ? liveTab.url : startUrl
    let finalHostname = null
    try {
      finalHostname = new URL(finalUrl).hostname
    } catch (e) {
      finalHostname = null
    }

    if (finalHostname && finalHostname !== startHostname) {
      const postClearResult = await clearSiteData(finalUrl)
      if (!postClearResult.ok) {
        return postClearResult
      }

      await browser.tabs.reload(tab.id, {
        bypassCache: true,
      })
      await waitForTabReady(tab.id)
    }
  }

  globalThis.hasRecorded = false
  activeSessionId = sessionId
  isRecording = true
  isPaused = false
  await globalThis.recorder.attachWithTab(sessionId, tab)
  record('open', [[startUrl]], '')
  return { ok: true, sessionId }
}

const pauseRecording = () => {
  if (!isRecording) {
    return { ok: false, error: 'Cannot pause when recording is not active.' }
  }
  isPaused = true
  persistState()
  notifyUiUpdate('pause')
  return { ok: true, isPaused }
}

const resumeRecording = () => {
  if (!isRecording) {
    return { ok: false, error: 'Cannot resume when recording is not active.' }
  }
  isPaused = false
  clearSavedState()
  notifyUiUpdate('resume')
  return { ok: true, isPaused }
}

const status = () => ({
  ok: true,
  isRecording,
  isPaused,
  sessionId: activeSessionId,
  count: recordedSteps.length,
})

const steps = () => ({
  ok: true,
  steps: recordedSteps.slice(),
})

const clear = () => {
  recordedSteps.length = 0
  clearSavedState()
  notifyUiUpdate('clear')
  return { ok: true }
}

const replaceSteps = nextSteps => {
  if (!Array.isArray(nextSteps)) {
    return { ok: false, error: 'Steps payload must be an array.' }
  }
  recordedSteps.length = 0
  nextSteps.forEach(step => {
    if (!step || typeof step.command !== 'string') return
    recordedSteps.push({
      command: step.command,
      target: step.target,
      value: step.value,
      insertBeforeLastCommand: step.insertBeforeLastCommand,
    })
  })
  persistState()
  notifyUiUpdate('replaceSteps')
  return {
    ok: true,
    steps: recordedSteps.slice(),
  }
}

const openUiWindow = async () => {
  if (uiWindowId) {
    try {
      await browser.windows.update(uiWindowId, { focused: true })
      return
    } catch (e) {
      uiWindowId = null
    }
  }
  const win = await browser.windows.create({
    url: browser.runtime.getURL('ui.html'),
    type: 'popup',
    width: MIN_UI_WINDOW_WIDTH,
    height: MIN_UI_WINDOW_HEIGHT,
  })
  uiWindowId = win.id
}

if (
  browser.windows.onBoundsChanged &&
  typeof browser.windows.onBoundsChanged.addListener === 'function'
) {
  browser.windows.onBoundsChanged.addListener(async win => {
    if (!uiWindowId || win.id !== uiWindowId || isUpdatingUiWindowBounds) {
      return
    }

    const nextWidth = Math.max(
      win.width || MIN_UI_WINDOW_WIDTH,
      MIN_UI_WINDOW_WIDTH
    )
    const nextHeight = Math.max(
      win.height || MIN_UI_WINDOW_HEIGHT,
      MIN_UI_WINDOW_HEIGHT
    )

    if (nextWidth === win.width && nextHeight === win.height) {
      return
    }

    isUpdatingUiWindowBounds = true
    try {
      await browser.windows.update(uiWindowId, {
        width: nextWidth,
        height: nextHeight,
      })
    } finally {
      isUpdatingUiWindowBounds = false
    }
  })
}

if (browser.windows.onRemoved && typeof browser.windows.onRemoved.addListener === 'function') {
  browser.windows.onRemoved.addListener(windowId => {
    if (windowId === uiWindowId) {
      uiWindowId = null
    }
  })
}

browser.action.onClicked.addListener(() => {
  openUiWindow()
})

const selectElement = async (sessionId, windowName) => {
  let tab
  Object.keys(windowSession.openedTabIds[sessionId]).forEach(tabId => {
    if (windowSession.openedTabIds[sessionId][tabId] === windowName) {
      tab = tabId
    }
  })
  if (!tab) {
    throw new Error(`'${windowName}' does not exists in session '${sessionId}'`)
  }

  return await select(parseInt(tab))
}

browser.runtime.onMessage.addListener(message => {
  if (!message || !message.tmrRecorder) return
  if (message.tmrRecorder === 'start') {
    return startRecording(message.url, message.sessionId, {
      clearSiteData: message.clearSiteData === true,
    }).catch(err => ({
      ok: false,
      error: err && err.message ? err.message : String(err),
    }))
  }
  if (message.tmrRecorder === 'stop') {
    return detach().then(() => ({ ok: true })).catch(err => ({
      ok: false,
      error: err && err.message ? err.message : String(err),
    }))
  }
  if (message.tmrRecorder === 'pause') {
    return Promise.resolve(pauseRecording())
  }
  if (message.tmrRecorder === 'resume') {
    return Promise.resolve(resumeRecording())
  }
  if (message.tmrRecorder === 'status') {
    return Promise.resolve(status())
  }
  if (message.tmrRecorder === 'steps') {
    return Promise.resolve(steps())
  }
  if (message.tmrRecorder === 'clear') {
    return Promise.resolve(clear())
  }
  if (message.tmrRecorder === 'replaceSteps') {
    return Promise.resolve(replaceSteps(message.steps))
  }
  if (message.tmrRecorder === 'clearSiteData') {
    return clearSiteData(message.url)
  }
})

globalThis.tmrApi = {
  start: startRecording,
  stop: () => detach().then(() => ({ ok: true })),
  pause: pauseRecording,
  resume: resumeRecording,
  status,
  steps,
  clear,
  clearSiteData,
  replaceSteps,
}
