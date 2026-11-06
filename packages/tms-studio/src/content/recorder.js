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

import browser from 'webextension-polyfill'
import {handlers, observers} from './record-handlers'
import {attach, detach} from './prompt-injector'
import LocatorBuilders from './locator-builders'
import {FormCommitWatcher, getFieldContext} from './form-context'

/**
 * @param {Window} window
 */
export default class Recorder {
	constructor(window) {
		this.window = window
		this.eventListeners = {}
		this.mutationObservers = {}
		this.attached = false
		this.recordingState = {}
		this.frameLocation = ''
		this.inputTypes = Recorder.inputTypes
		this.locatorBuilders = new LocatorBuilders(window)
		this.buildGroupLocator = this.buildGroupLocator.bind(this)
		this.formCommitWatcher = new FormCommitWatcher(window, commit => {
			browser.runtime.sendMessage({formCommit: true, ...commit}).catch(() => {
			})
		}, this.buildGroupLocator)
		this.recalculateFrameLocation = this.recalculateFrameLocation.bind(this)
		this.attachRecorderHandler = this.attachRecorderHandler.bind(this)
		this.detachRecorderHandler = this.detachRecorderHandler.bind(this)
		this.setWindowHandle = this.setWindowHandle.bind(this)

		this.window.addEventListener('message', this.setWindowHandle)
		this.window.addEventListener('message', this.setActiveContext)
		browser.runtime.onMessage.addListener(this.recalculateFrameLocation)
		browser.runtime.onMessage.addListener(this.attachRecorderHandler)
		browser.runtime.onMessage.addListener(this.detachRecorderHandler)

		browser.runtime
			.sendMessage({
				attachRecorderRequest: true,
			})
			.then(shouldAttach => {
				if (shouldAttach) {
					this.addRecorderTracingAttribute()
					this.attach()
				}
			})
			.catch(() => {
			})

		// runs in the content script of each frame
		// e.g., once on load
		;(async () => {
			await this.getFrameLocation()
		})()
	}

	addRecorderTracingAttribute() {
		this.window.document.body.setAttribute('data-side-attach-once-loaded', '')
	}

	attachRecorderHandler(message, _sender, sendResponse) {
		if (message.attachRecorder) {
			this.attach()
			sendResponse(true)
		}
	}

	detachRecorderHandler(message, _sender, sendResponse) {
		if (message.detachRecorder) {
			this.detach()
			sendResponse(true)
		}
	}

	/* record */
	record(command, target, value, insertBeforeLastCommand, actualFrameLocation) {
		return browser.runtime
			.sendMessage({
				command: command,
				target: target,
				value: value,
				context: this.getContext(target),
				insertBeforeLastCommand: insertBeforeLastCommand,
				frameLocation: actualFrameLocation !== undefined ? actualFrameLocation : this.frameLocation,
			})
			.catch(() => {
				this.detach()
			})
	}

	/**
	 * Describes the element a recorded line targets, found again from the
	 * line's first locator. Best-effort: lines without an element target, or
	 * whose element is already gone, get no context.
	 *
	 * @param target the recorded target: [[locator, strategy], ...] or a string
	 * @returns {Object|undefined}
	 */
	getContext(target) {
		if (!Array.isArray(target) || !target.length || !Array.isArray(target[0])) {
			return undefined
		}
		try {
			const element = this.locatorBuilders.findElement(target[0][0])
			if (!element || element.nodeType !== 1) return undefined
			const context = getFieldContext(element, this.buildGroupLocator)
			this.formCommitWatcher.track(element, context)
			return context
		} catch (e) {
			return undefined
		}
	}

	/**
	 * @param {Element} container a form or field container
	 * @returns {string} its locator, or '' if none could be built
	 */
	buildGroupLocator(container) {
		const locator = this.locatorBuilders.build(container)
		return locator === 'LOCATOR_DETECTION_FAILED' ? '' : locator
	}

	setWindowHandle(event) {
		if (event.data && event.data.direction === 'from-page-script' && event.data.action === 'set-handle') {
			browser.runtime
				.sendMessage({
					setWindowHandle: true, handle: event.data.args.handle, sessionId: event.data.args.sessionId,
				})
				.then(() => {
					event.source.postMessage({
						id: event.data.id, direction: 'from-content-script',
					}, '*')
				})
		}
	}

	setActiveContext(event) {
		if (event.data && event.data.direction === 'from-page-script' && event.data.action === 'set-frame') {
			browser.runtime
				.sendMessage({
					setActiveContext: true,
					frameLocation: event.data.args.frameLocation,
					sessionId: event.data.args.sessionId,
				})
				.then(() => {
					event.source.postMessage({
						id: event.data.id, direction: 'from-content-script',
					}, '*')
				})
		}
	}

	/**
	 * @param {string} eventKey
	 */
	parseEventKey(eventKey) {
		if (eventKey.match(/^C_/)) {
			return {eventName: eventKey.substring(2), capture: true}
		} else {
			return {eventName: eventKey, capture: false}
		}
	}

	attach() {
		if (!this.attached) {
			for (let eventKey in Recorder.eventHandlers) {
				const eventInfo = this.parseEventKey(eventKey)
				const eventName = eventInfo.eventName
				const capture = eventInfo.capture

				const handlers = Recorder.eventHandlers[eventKey]
				this.eventListeners[eventKey] = []
				for (let i = 0; i < handlers.length; i++) {
					// Keep the bound listener so detach() can remove the same reference
					const listener = handlers[i].bind(this)
					this.window.document.addEventListener(eventName, listener, capture)
					this.eventListeners[eventKey].push(listener)
				}
			}
			for (let observerName in Recorder.mutationObservers) {
				const {callback, config} = Recorder.mutationObservers[observerName]
				const observer = new MutationObserver(callback.bind(this))
				observer.observe(this.window.document.body, config)
				this.mutationObservers[observerName] = observer
			}
			this.attached = true
			this.recordingState = {
				typeTarget: undefined,
				typeLock: 0,
				focusTarget: null,
				focusValue: null,
				tempValue: null,
				preventType: false,
				preventClickTwice: false,
				preventClick: false,
				enterTarget: null,
				enterValue: null,
				tabCheck: null,
			}
			attachInputListeners(this.recordingState, this.window)
			attach(this.record.bind(this))
			this.formCommitWatcher.attach()
		}
	}

	detach() {
		for (let eventKey in this.eventListeners) {
			const eventInfo = this.parseEventKey(eventKey)
			const eventName = eventInfo.eventName
			const capture = eventInfo.capture
			for (let i = 0; i < this.eventListeners[eventKey].length; i++) {
				this.window.document.removeEventListener(eventName, this.eventListeners[eventKey][i], capture)
			}
		}
		for (let observerName in this.mutationObservers) {
			this.mutationObservers[observerName].disconnect()
		}
		this.mutationObservers = {}
		this.eventListeners = {}
		this.attached = false
		detachInputListeners(this.recordingState, this.window)
		this.formCommitWatcher.detach()
		detach()
	}

	// set frame id
	getFrameLocation() {
		let currentWindow = this.window
		let currentParentWindow

		while (currentWindow !== this.window.top) {
			currentParentWindow = currentWindow.parent
			if (!currentParentWindow.frames.length) {
				break
			}

			for (let idx = 0; idx < currentParentWindow.frames.length; idx++) {
				const frame = currentParentWindow.frames[idx]

				if (frame === currentWindow) {
					this.frameLocation = ':' + this.frameLocation
					currentWindow = currentParentWindow
					break
				}
			}
		}
		this.frameLocation = 'root' + this.frameLocation
		return browser.runtime
			.sendMessage({frameLocation: this.frameLocation})
			.catch(() => {
			})
	}

	recalculateFrameLocation(message, _sender, sendResponse) {
		if (message.recalculateFrameLocation) {
			;(async () => {
				this.frameLocation = ''
				await this.getFrameLocation()
				sendResponse(true)
			})()
			return true
		}
	}
}

/** @type {{ [key: string]: EventListener[] }} */
Recorder.eventHandlers = {}
/** @type {{ [observerName: string]: MutationObserver }} */
Recorder.mutationObservers = {}
/**
 * @param {string} handlerName
 * @param {string} eventName
 * @param {EventListener} handler
 * @param {boolean} options
 */
Recorder.addEventHandler = function (handlerName, eventName, handler, options) {
	handler.handlerName = handlerName
	if (!options) options = false
	let key = options ? 'C_' + eventName : eventName
	if (!this.eventHandlers[key]) {
		this.eventHandlers[key] = []
	}
	this.eventHandlers[key].push(handler)
}

/**
 * @param {string} observerName
 * @param {MutationCallback} callback invoked with the Recorder instance as `this`
 * @param {MutationObserverInit} config
 */
Recorder.addMutationObserver = function (observerName, callback, config) {
	// Observers are created per instance in attach() so the callback can be
	// bound to the recorder; a static MutationObserver would bind `this` to
	// the observer and break `this.record`.
	this.mutationObservers[observerName] = {callback, config}
}

Recorder.inputTypes = ['text', 'password', 'file', 'datetime', 'datetime-local', 'date', 'month', 'time', 'week', 'number', 'range', 'email', 'url', 'search', 'tel', 'color',]

handlers.forEach(handler => {
	Recorder.addEventHandler(...handler)
})

observers.forEach(observer => {
	Recorder.addMutationObserver(...observer)
})

function updateInputElementsOfRelevantType(action, win) {
	let inp = win.document.getElementsByTagName('input')
	for (let i = 0; i < inp.length; i++) {
		if (Recorder.inputTypes.indexOf(inp[i].type) >= 0) {
			action(inp[i])
		}
	}
}

function focusEvent(recordingState, event) {
	recordingState.focusTarget = event.target
	recordingState.focusValue = recordingState.focusTarget.value
	recordingState.tempValue = recordingState.focusValue
	recordingState.preventType = false
}

function blurEvent(recordingState) {
	recordingState.focusTarget = null
	recordingState.focusValue = null
	recordingState.tempValue = null
}

function attachInputListeners(recordingState, win) {
	updateInputElementsOfRelevantType(input => {
		input.addEventListener('focus', focusEvent.bind(null, recordingState))
		input.addEventListener('blur', blurEvent.bind(null, recordingState))
	}, win)
}

function detachInputListeners(recordingState, win) {
	updateInputElementsOfRelevantType(input => {
		input.removeEventListener('focus', focusEvent.bind(null, recordingState))
		input.removeEventListener('blur', blurEvent.bind(null, recordingState))
	}, win)
}
