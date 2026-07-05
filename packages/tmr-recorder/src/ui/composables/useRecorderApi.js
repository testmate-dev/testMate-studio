const api = typeof browser !== 'undefined' ? browser : chrome

export function useRecorderApi() {
  const callBg = async (method, ...args) => {
    try {
      const message = { tmrRecorder: method }
      if (method === 'start') {
        message.url = args[0]
        message.sessionId = args[1]
        message.clearSiteData = !!args[2]
      }
      if (method === 'replaceSteps') {
        message.steps = args[0]
      }

      const response = await api.runtime.sendMessage(message)
      if (response && response.ok !== false) {
        return response
      }

      return {
        ok: false,
        error:
          (response && response.error) ||
          'Background unavailable. Reload extension and try again.',
      }
    } catch (err) {
      return {
        ok: false,
        error: err && err.message ? err.message : String(err),
      }
    }
  }

  const onUpdated = callback => {
    const listener = message => {
      if (!message || message.tmrRecorderEvent !== 'updated') return
      callback()
    }
    api.runtime.onMessage.addListener(listener)
    return () => api.runtime.onMessage.removeListener(listener)
  }

  return {
    callBg,
    onUpdated,
  }
}
