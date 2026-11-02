import { onMounted, onUnmounted } from 'vue'
import { UI_WINDOW_SIZE_KEY, minimumWindowSize } from '../../common/ui-window'

const api = typeof browser !== 'undefined' ? browser : chrome
const RESIZE_SETTLE_MS = 150

/**
 * Keeps the studio page's viewport at least its minimum size in every
 * browser, and saves the resulting window size so the background can open
 * the next window at that size without a visible resize. Runs from the page
 * because only the page knows its viewport, and Firefox has no
 * windows.onBoundsChanged for the background to listen to. Firefox can also
 * reserve a large part of a popup for hidden toolbars, so the window's own
 * size says little about how much page is visible.
 */
export function useMinWindowSize() {
  let settleTimer = null

  const saveSize = async size => {
    try {
      await api.storage.local.set({ [UI_WINDOW_SIZE_KEY]: size })
    } catch (e) {
      // not saving only means the next window may need to resize once
    }
  }

  const enforce = async () => {
    try {
      const win = await api.windows.getCurrent()
      // Maximised, minimised and fullscreen sizes are not the user's chosen size
      if (win.state !== 'normal') return
      const size = minimumWindowSize(
        { width: win.width, height: win.height },
        { width: window.outerWidth, height: window.outerHeight },
        { width: window.innerWidth, height: window.innerHeight }
      )
      if (size) await api.windows.update(win.id, size)
      await saveSize(size || { width: win.width, height: win.height })
    } catch (e) {
      // A tiled window may refuse the update; the page still works
      console.warn('[studio window] could not enforce minimum size', e)
    }
  }

  const onResize = () => {
    clearTimeout(settleTimer)
    settleTimer = setTimeout(enforce, RESIZE_SETTLE_MS)
  }

  onMounted(() => {
    window.addEventListener('resize', onResize)
    enforce()
  })

  onUnmounted(() => {
    clearTimeout(settleTimer)
    window.removeEventListener('resize', onResize)
  })
}
