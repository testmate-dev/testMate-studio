<template>
  <RecorderHeader :status-text="statusText" />

  <RecorderControls
    :is-recording="isRecording"
    :is-paused="isPaused"
    @record="openModal"
    @pause-toggle="togglePause"
    @stop="stopRecording"
    @clear="clearSteps"
  />

  <BulkActions
    :show-bulk-bar="showBulkBar"
    :has-selected-steps="hasSelectedSteps"
    :copied-steps-count="copiedSteps.length"
    :is-paste-mode="isPasteMode"
    :icons="icons"
    @delete-selected="deleteSelectedSteps"
    @copy-selected="copySelectedSteps"
    @cut-selected="cutSelectedSteps"
    @paste-click="onPasteClick"
    @hide="hideBulkActions"
  />

  <StepList
    :steps="uiSteps"
    :selected-step-ids="selectedStepIds"
    :has-selected-steps="hasSelectedSteps"
    :is-paste-mode="isPasteMode"
    :dragging-step-id="draggingStepId"
    :icons="icons"
    :step-text="stepText"
    @toggle-select="toggleStepSelection"
    @delete-step="removeStepById"
    @drag-start="startDrag"
    @paste-insert="insertCopiedSteps"
  />

  <div class="hint">Recording opens in a new browser window.</div>

  <StartModal
    :show="showModal"
    :start-url="startUrl"
    :clear-site-data="clearSiteData"
    :confirm-disabled="confirmStartDisabled"
    @cancel="closeModal"
    @confirm="confirmStart"
    @update:start-url="startUrl = $event"
    @update:clear-site-data="clearSiteData = $event"
  />
</template>

<script>
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { icon } from '@fortawesome/fontawesome-svg-core'
import { faTrashCan, faCopy } from '@fortawesome/free-regular-svg-icons'
import { faGripLines, faPaste, faPlus, faScissors, faXmark } from '@fortawesome/free-solid-svg-icons'
import { useRecorderApi } from './composables/useRecorderApi'
import RecorderHeader from './components/RecorderHeader.vue'
import RecorderControls from './components/RecorderControls.vue'
import BulkActions from './components/BulkActions.vue'
import StepList from './components/StepList.vue'
import StartModal from './components/StartModal.vue'

export default {
  components: {
    RecorderHeader,
    RecorderControls,
    BulkActions,
    StepList,
    StartModal,
  },
  setup() {
    const { callBg, onUpdated } = useRecorderApi()
    const showModal = ref(false)
    const startUrl = ref('')
    const clearSiteData = ref(true)
    const confirmStartDisabled = ref(false)
    const status = reactive({ isRecording: false, isPaused: false })
    const uiSteps = ref([])
    const selectedStepIds = reactive(new Set())
    const copiedSteps = ref([])
    const copiedSourceStepIds = reactive(new Set())
    const isPasteMode = ref(false)
    const isBulkActionsHidden = ref(false)
    const stepIdCounter = ref(1)
    const draggingStepId = ref(null)
    const dragStartOrder = ref('')
    const isDragging = ref(false)
    let pendingClientY = null
    let moveRafId = null
    let removeUpdateListener = null

    const icons = {
      trash: icon(faTrashCan).html.join(''),
      copy: icon(faCopy).html.join(''),
      paste: icon(faPaste).html.join(''),
      plus: icon(faPlus).html.join(''),
      scissors: icon(faScissors).html.join(''),
      grip: icon(faGripLines).html.join(''),
      close: icon(faXmark).html.join(''),
    }

    const statusText = computed(() => {
      if (!status.isRecording) return 'Idle'
      return status.isPaused ? 'Paused' : 'Recording'
    })
    const hasSelectedSteps = computed(() => selectedStepIds.size > 0)
    const showBulkBar = computed(
      () =>
        (hasSelectedSteps.value || copiedSteps.value.length > 0) &&
        !isBulkActionsHidden.value
    )

    const hideBulkActions = () => {
      isBulkActionsHidden.value = true
      isPasteMode.value = false
    }

    const stepKey = step =>
      JSON.stringify([
        step.command,
        step.target,
        step.value,
        step.insertBeforeLastCommand,
      ])

    const assignUiIds = steps => {
      const reusableIds = new Map()
      uiSteps.value.forEach(step => {
        const key = stepKey(step)
        const existing = reusableIds.get(key) || []
        existing.push(step._uiId)
        reusableIds.set(key, existing)
      })
      return steps.map(step => {
        const key = stepKey(step)
        const existing = reusableIds.get(key) || []
        const uiId = existing.length > 0 ? existing.shift() : `step-${stepIdCounter.value++}`
        reusableIds.set(key, existing)
        return { ...step, _uiId: uiId }
      })
    }

    const stepText = (step, index) => {
      const target = Array.isArray(step.target)
        ? step.target.map(t => t[0]).join(' | ')
        : step.target
      const value = step.value ? ` = ${step.value}` : ''
      return `${index + 1}. ${step.command} ${target || ''}${value}`.trim()
    }

    const serializeSteps = () =>
      uiSteps.value.map(step => ({
        command: step.command,
        target: step.target,
        value: step.value,
        insertBeforeLastCommand: step.insertBeforeLastCommand,
      }))

    const indexByStepId = stepId => uiSteps.value.findIndex(step => step._uiId === stepId)
    const syncSelectionWithSteps = () => {
      const ids = new Set(uiSteps.value.map(s => s._uiId))
      Array.from(selectedStepIds).forEach(id => {
        if (!ids.has(id)) selectedStepIds.delete(id)
      })
    }

    const refresh = async () => {
      const statusRes = await callBg('status')
      const stepsRes = await callBg('steps')
      if (!statusRes || statusRes.ok === false) return
      status.isRecording = !!statusRes.isRecording
      status.isPaused = !!statusRes.isPaused
      if (stepsRes && stepsRes.ok !== false && !isDragging.value) {
        uiSteps.value = assignUiIds(stepsRes.steps)
        syncSelectionWithSteps()
      }
    }

    const persistSteps = async () => {
      const result = await callBg('replaceSteps', serializeSteps())
      if (!result || result.ok === false) {
        alert((result && result.error) || 'Failed to save steps.')
        return false
      }
      await refresh()
      return true
    }

    const openModal = () => {
      showModal.value = true
    }
    const closeModal = () => {
      showModal.value = false
    }

    const confirmStart = async () => {
      const url = startUrl.value.trim()
      confirmStartDisabled.value = true
      const result = await callBg('start', url, undefined, clearSiteData.value)
      confirmStartDisabled.value = false
      if (!result || result.ok !== true) {
        alert((result && result.error) || 'Failed to start recording.')
        return
      }
      closeModal()
      await refresh()
    }

    const togglePause = async () => {
      if (!status.isRecording) return
      await callBg(status.isPaused ? 'resume' : 'pause')
      await refresh()
    }
    const stopRecording = async () => {
      await callBg('stop')
      await refresh()
    }
    const clearSteps = async () => {
      await callBg('clear')
      selectedStepIds.clear()
      copiedSteps.value = []
      copiedSourceStepIds.clear()
      isPasteMode.value = false
      isBulkActionsHidden.value = true
      await refresh()
    }

    const removeStepById = async stepId => {
      const index = indexByStepId(stepId)
      if (index < 0 || isDragging.value) return
      const prev = uiSteps.value.slice()
      uiSteps.value.splice(index, 1)
      selectedStepIds.delete(stepId)
      const ok = await persistSteps()
      if (!ok) uiSteps.value = prev
    }

    const toggleStepSelection = stepId => {
      if (selectedStepIds.has(stepId)) selectedStepIds.delete(stepId)
      else selectedStepIds.add(stepId)
      if (selectedStepIds.size > 0) {
        isBulkActionsHidden.value = false
      }
    }

    const deleteSelectedSteps = async () => {
      if (!hasSelectedSteps.value) return
      const selected = new Set(selectedStepIds)
      const prev = uiSteps.value.slice()
      uiSteps.value = uiSteps.value.filter(step => !selected.has(step._uiId))
      selectedStepIds.clear()
      const ok = await persistSteps()
      if (!ok) uiSteps.value = prev
    }

    const copySelectedSteps = () => {
      copiedSourceStepIds.clear()
      copiedSteps.value = uiSteps.value
        .filter(step => {
          const selected = selectedStepIds.has(step._uiId)
          if (selected) copiedSourceStepIds.add(step._uiId)
          return selected
        })
        .map(step => ({
          command: step.command,
          target: step.target,
          value: step.value,
          insertBeforeLastCommand: step.insertBeforeLastCommand,
        }))
      selectedStepIds.clear()
      isPasteMode.value = false
      isBulkActionsHidden.value = false
    }

    const cutSelectedSteps = async () => {
      if (!hasSelectedSteps.value) return
      copySelectedSteps()
      const selected = new Set(copiedSourceStepIds)
      const prev = uiSteps.value.slice()
      uiSteps.value = uiSteps.value.filter(step => !selected.has(step._uiId))
      const ok = await persistSteps()
      if (!ok) {
        uiSteps.value = prev
        copiedSteps.value = []
        copiedSourceStepIds.clear()
      }
    }

    const insertCopiedSteps = async (targetStepId, position) => {
      const targetIndex = indexByStepId(targetStepId)
      if (targetIndex < 0 || copiedSteps.value.length === 0) return
      const prev = uiSteps.value.slice()
      const insertAt = position === 'before' ? targetIndex : targetIndex + 1
      const newSteps = copiedSteps.value.map(step => ({ ...step, _uiId: `step-${stepIdCounter.value++}` }))
      uiSteps.value.splice(insertAt, 0, ...newSteps)
      isPasteMode.value = false
      copiedSourceStepIds.clear()
      const ok = await persistSteps()
      if (!ok) uiSteps.value = prev
    }

    const pasteCopiedStepsToEnd = async () => {
      if (copiedSteps.value.length === 0) return
      const prev = uiSteps.value.slice()
      copiedSteps.value.forEach(step => {
        uiSteps.value.push({ ...step, _uiId: `step-${stepIdCounter.value++}` })
      })
      isPasteMode.value = false
      copiedSourceStepIds.clear()
      const ok = await persistSteps()
      if (!ok) uiSteps.value = prev
    }

    const onPasteClick = async () => {
      if (!isPasteMode.value) {
        isPasteMode.value = true
        isBulkActionsHidden.value = false
        return
      }
      await pasteCopiedStepsToEnd()
    }

    const moveStep = (fromIndex, toIndex) => {
      if (
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= uiSteps.value.length ||
        toIndex >= uiSteps.value.length ||
        fromIndex === toIndex
      ) {
        return false
      }
      const [moved] = uiSteps.value.splice(fromIndex, 1)
      uiSteps.value.splice(toIndex, 0, moved)
      return true
    }

    const getDropIndex = clientY => {
      const rows = Array.from(document.querySelectorAll('.step'))
      for (let i = 0; i < rows.length; i += 1) {
        const rect = rows[i].getBoundingClientRect()
        if (clientY < rect.top + rect.height / 2) return i
      }
      return Math.max(rows.length - 1, 0)
    }

    const processDragMove = clientY => {
      if (!isDragging.value || !draggingStepId.value) return
      const from = indexByStepId(draggingStepId.value)
      const to = getDropIndex(clientY)
      moveStep(from, to)
    }

    const onDragMove = event => {
      pendingClientY = event.clientY
      if (moveRafId) return
      moveRafId = requestAnimationFrame(() => {
        moveRafId = null
        processDragMove(pendingClientY)
      })
    }

    const finishDrag = async () => {
      if (!isDragging.value) return
      const changed = uiSteps.value.map(s => s._uiId).join('|') !== dragStartOrder.value
      isDragging.value = false
      draggingStepId.value = null
      document.body.classList.remove('dragging')
      document.removeEventListener('mousemove', onDragMove)
      document.removeEventListener('mouseup', finishDrag)
      if (changed) await persistSteps()
    }

    const startDrag = (event, stepId) => {
      if (event.button !== 0 || isPasteMode.value) return
      event.preventDefault()
      isDragging.value = true
      draggingStepId.value = stepId
      dragStartOrder.value = uiSteps.value.map(step => step._uiId).join('|')
      document.body.classList.add('dragging')
      document.addEventListener('mousemove', onDragMove)
      document.addEventListener('mouseup', finishDrag)
    }

    onMounted(async () => {
      removeUpdateListener = onUpdated(() => refresh())
      window.addEventListener('blur', finishDrag)
      await refresh()
    })

    onUnmounted(() => {
      if (removeUpdateListener) removeUpdateListener()
      window.removeEventListener('blur', finishDrag)
      document.removeEventListener('mousemove', onDragMove)
      document.removeEventListener('mouseup', finishDrag)
    })

    return {
      icons,
      uiSteps,
      selectedStepIds,
      copiedSourceStepIds,
      copiedSteps,
      isPasteMode,
      statusText,
      isRecording: computed(() => status.isRecording),
      isPaused: computed(() => status.isPaused),
      hasSelectedSteps,
      showBulkBar,
      showModal,
      startUrl,
      clearSiteData,
      confirmStartDisabled,
      openModal,
      hideBulkActions,
      closeModal,
      confirmStart,
      togglePause,
      stopRecording,
      clearSteps,
      stepText,
      removeStepById,
      toggleStepSelection,
      deleteSelectedSteps,
      copySelectedSteps,
      cutSelectedSteps,
      onPasteClick,
      insertCopiedSteps,
      startDrag,
      draggingStepId,
    }
  },
}
</script>
