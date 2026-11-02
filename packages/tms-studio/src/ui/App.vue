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
    :can-create-function="!createFunctionBlocker"
    :create-function-title="createFunctionBlocker || 'Create function from selected'"
    :copied-steps-count="copiedSteps.length"
    :is-paste-mode="isPasteMode"
    :icons="icons"
    @delete-selected="deleteSelectedSteps"
    @copy-selected="copySelectedSteps"
    @cut-selected="cutSelectedSteps"
    @create-function="openCreateFunctionModal"
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
    @toggle-collapse="toggleFunctionCollapsed"
    @edit-function="openEditFunctionModal"
    @rename-function="renameFunction"
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

  <FunctionModal
    :show="functionModal.show"
    :mode="functionModal.mode"
    :initial-name="functionModal.name"
    :initial-parameters="functionModal.parameters"
    :icons="icons"
    @cancel="closeFunctionModal"
    @save="saveFunctionModal"
  />
</template>

<script>
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { icon } from '@fortawesome/fontawesome-svg-core'
import { faTrashCan, faCopy } from '@fortawesome/free-regular-svg-icons'
import {
  faCaretDown,
  faCaretRight,
  faGripLines,
  faPaste,
  faPenToSquare,
  faPlus,
  faScissors,
  faXmark,
} from '@fortawesome/free-solid-svg-icons'
import { useRecorderApi } from './composables/useRecorderApi'
import { useMinWindowSize } from './composables/useMinWindowSize'
import {
  applyParameterEdits,
  createFunctionId,
  isFunctionItem,
  linkParameters,
  suggestParameters,
} from './utils/function-utils'
import RecorderHeader from './components/RecorderHeader.vue'
import RecorderControls from './components/RecorderControls.vue'
import BulkActions from './components/BulkActions.vue'
import StepList from './components/StepList.vue'
import StartModal from './components/StartModal.vue'
import FunctionModal from './components/FunctionModal.vue'

export default {
  components: {
    RecorderHeader,
    RecorderControls,
    BulkActions,
    StepList,
    StartModal,
    FunctionModal,
  },
  setup() {
    const { callBg, onUpdated } = useRecorderApi()
    useMinWindowSize()
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
    const functionModal = reactive({
      show: false,
      mode: 'create',
      functionId: null,
      name: '',
      parameters: [],
    })
    let selectionAnchorId = null
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
      pen: icon(faPenToSquare).html.join(''),
      caretDown: icon(faCaretDown).html.join(''),
      caretRight: icon(faCaretRight).html.join(''),
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

    // Function children are not selectable or movable on their own, so their
    // UI IDs only need to be unique within the function.
    const withChildUiIds = fn => ({
      ...fn,
      steps: fn.steps.map((step, index) => ({ ...step, _uiId: `${fn.id}-${index}` })),
    })

    const assignUiIds = items => {
      const reusableIds = new Map()
      uiSteps.value.forEach(item => {
        if (isFunctionItem(item)) return
        const key = stepKey(item)
        const existing = reusableIds.get(key) || []
        existing.push(item._uiId)
        reusableIds.set(key, existing)
      })
      return items.map(item => {
        if (isFunctionItem(item)) return { ...withChildUiIds(item), _uiId: item.id }
        const key = stepKey(item)
        const existing = reusableIds.get(key) || []
        const uiId = existing.length > 0 ? existing.shift() : `step-${stepIdCounter.value++}`
        reusableIds.set(key, existing)
        return { ...item, _uiId: uiId }
      })
    }

    const stepText = (step, label) => {
      const target = Array.isArray(step.target)
        ? step.target.map(t => t[0]).join(' | ')
        : step.target
      const value = step.value ? ` = ${step.value}` : ''
      return `${label}. ${step.command} ${target || ''}${value}`.trim()
    }

    const serializeStep = step => {
      const serialized = {
        command: step.command,
        target: step.target,
        value: step.value,
        insertBeforeLastCommand: step.insertBeforeLastCommand,
      }
      if (step.context) serialized.context = { ...step.context }
      return serialized
    }

    const serializeItem = item => {
      if (!isFunctionItem(item)) return serializeStep(item)
      return {
        type: 'function',
        id: item.id,
        name: item.name,
        parameters: item.parameters.map(parameter => ({ ...parameter })),
        collapsed: !!item.collapsed,
        steps: item.steps.map(serializeStep),
      }
    }

    // Gives a copied item fresh IDs so pasting it twice yields distinct items
    const instantiateItem = item => {
      if (!isFunctionItem(item)) return { ...item, _uiId: `step-${stepIdCounter.value++}` }
      const id = createFunctionId()
      return { ...withChildUiIds({ ...serializeItem(item), id }), _uiId: id }
    }

    const serializeSteps = () => uiSteps.value.map(serializeItem)

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
      const count = uiSteps.value.length
      if (
        count > 0 &&
        !confirm(`Starting a new recording clears the current ${count} line${count === 1 ? '' : 's'}. Continue?`)
      ) {
        return
      }
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

    /**
     * Toggles a top-level item's selection. With extendRange (Shift-click),
     * every item between the previously clicked item and this one is set to
     * the clicked item's new state.
     */
    const toggleStepSelection = (stepId, extendRange = false) => {
      const targetIndex = indexByStepId(stepId)
      const anchorIndex =
        extendRange && selectionAnchorId ? indexByStepId(selectionAnchorId) : -1
      if (targetIndex >= 0 && anchorIndex >= 0 && anchorIndex !== targetIndex) {
        const select = !selectedStepIds.has(stepId)
        const from = Math.min(anchorIndex, targetIndex)
        const to = Math.max(anchorIndex, targetIndex)
        uiSteps.value.slice(from, to + 1).forEach(item => {
          if (select) selectedStepIds.add(item._uiId)
          else selectedStepIds.delete(item._uiId)
        })
      } else if (selectedStepIds.has(stepId)) {
        selectedStepIds.delete(stepId)
      } else {
        selectedStepIds.add(stepId)
      }
      selectionAnchorId = stepId
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
        .map(serializeItem)
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
      const newSteps = copiedSteps.value.map(instantiateItem)
      uiSteps.value.splice(insertAt, 0, ...newSteps)
      isPasteMode.value = false
      copiedSourceStepIds.clear()
      const ok = await persistSteps()
      if (!ok) uiSteps.value = prev
    }

    const pasteCopiedStepsToEnd = async () => {
      if (copiedSteps.value.length === 0) return
      const prev = uiSteps.value.slice()
      copiedSteps.value.forEach(item => {
        uiSteps.value.push(instantiateItem(item))
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

    const selectedIndices = computed(() =>
      uiSteps.value
        .map((item, index) => (selectedStepIds.has(item._uiId) ? index : -1))
        .filter(index => index >= 0)
    )

    // Reason the f(x) action is unavailable, or null when it can be used
    const createFunctionBlocker = computed(() => {
      const indices = selectedIndices.value
      if (indices.length < 2) return 'Select at least two steps to create a function'
      if (indices.some(index => isFunctionItem(uiSteps.value[index]))) {
        return 'Functions cannot contain other functions'
      }
      if (indices[indices.length - 1] - indices[0] !== indices.length - 1) {
        return 'Select adjacent steps to create a function'
      }
      return null
    })

    const findFunction = functionId =>
      uiSteps.value.find(item => isFunctionItem(item) && item._uiId === functionId)

    const updateFunction = async (functionId, changes) => {
      const prev = uiSteps.value
      uiSteps.value = uiSteps.value.map(item =>
        item._uiId === functionId ? { ...item, ...changes } : item
      )
      const ok = await persistSteps()
      if (!ok) uiSteps.value = prev
    }

    const createFunctionFromSelection = async ({ name, parameters }) => {
      if (createFunctionBlocker.value) return
      const prev = uiSteps.value
      const start = selectedIndices.value[0]
      const count = selectedIndices.value.length
      const id = createFunctionId()
      const linked = linkParameters(
        uiSteps.value.slice(start, start + count).map(serializeStep),
        parameters
      )
      const fn = withChildUiIds({
        type: 'function',
        id,
        name,
        parameters: linked.parameters,
        collapsed: false,
        steps: linked.steps,
      })
      const next = uiSteps.value.slice()
      next.splice(start, count, { ...fn, _uiId: id })
      uiSteps.value = next
      selectedStepIds.clear()
      const ok = await persistSteps()
      if (!ok) uiSteps.value = prev
    }

    const openCreateFunctionModal = () => {
      if (createFunctionBlocker.value) return
      const start = selectedIndices.value[0]
      const selectedSteps = selectedIndices.value.map(index => uiSteps.value[index])
      // The new function takes the first selected row's number, so its lines
      // will be numbered start.1, start.2, …
      const parameters = suggestParameters(selectedSteps).map(suggestion => ({
        name: suggestion.name,
        type: suggestion.type,
        link: {
          stepIndex: suggestion.stepIndex,
          prefix: suggestion.prefix,
          value: suggestion.value,
          lineLabel: `${start + 1}.${suggestion.stepIndex + 1}`,
        },
      }))
      Object.assign(functionModal, {
        show: true,
        mode: 'create',
        functionId: null,
        name: '',
        parameters,
      })
    }

    const openEditFunctionModal = functionId => {
      const fn = findFunction(functionId)
      if (!fn) return
      Object.assign(functionModal, {
        show: true,
        mode: 'edit',
        functionId,
        name: fn.name,
        parameters: fn.parameters.map(parameter => ({
          ...parameter,
          originalName: parameter.name,
        })),
      })
    }

    const closeFunctionModal = () => {
      functionModal.show = false
    }

    const editFunction = async (functionId, { name, parameters }) => {
      const fn = findFunction(functionId)
      if (!fn) return
      const edited = applyParameterEdits(fn.steps.map(serializeStep), fn.parameters, parameters)
      await updateFunction(functionId, {
        name,
        parameters: edited.parameters,
        steps: withChildUiIds({ id: fn.id, steps: edited.steps }).steps,
      })
    }

    const saveFunctionModal = async value => {
      closeFunctionModal()
      if (functionModal.mode === 'create') {
        await createFunctionFromSelection(value)
      } else {
        await editFunction(functionModal.functionId, value)
      }
    }

    const toggleFunctionCollapsed = async functionId => {
      const fn = findFunction(functionId)
      if (!fn) return
      await updateFunction(functionId, { collapsed: !fn.collapsed })
    }

    const renameFunction = async (functionId, name) => {
      if (!findFunction(functionId)) return
      await updateFunction(functionId, { name })
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
      // Top-level items only; a function block moves as one unit
      const rows = Array.from(document.querySelectorAll('.steps > .step-item'))
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
      functionModal,
      createFunctionBlocker,
      openCreateFunctionModal,
      openEditFunctionModal,
      closeFunctionModal,
      saveFunctionModal,
      toggleFunctionCollapsed,
      renameFunction,
    }
  },
}
</script>
