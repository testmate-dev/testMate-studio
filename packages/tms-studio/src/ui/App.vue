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
    :functions="functions"
    :suggestion="suggestion"
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
    @accept-suggestion="acceptSuggestion"
    @dismiss-suggestion="dismissSuggestion"
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
    :initial-description="functionModal.description"
    :initial-parameters="functionModal.parameters"
    :note="functionModal.note"
    :validate="functionModal.validate"
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
  createCallId,
  createFunctionId,
  editFunctionDefinition,
  isFunctionItem,
  linkParameters,
  suggestParameters,
} from './utils/function-utils'
import { findOccurrences, reachableFunctions } from '../common/function-model'
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
    // The recording's function library; items call these definitions
    const functions = ref([])
    const suggestion = ref(null)
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
      // edit: the call being edited
      functionId: null,
      name: '',
      description: '',
      parameters: [],
      note: '',
      validate: null,
      // create: the suggestion that opened the modal, if any
      source: null,
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

    const functionsById = computed(() => new Map(functions.value.map(fn => [fn.id, fn])))

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
        if (isFunctionItem(item)) return { ...item, _uiId: item.id }
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
        functionId: item.functionId,
        collapsed: !!item.collapsed,
        arguments: { ...(item.arguments || {}) },
      }
    }

    const serializeFunction = fn => ({
      id: fn.id,
      name: fn.name,
      description: fn.description || '',
      parameters: fn.parameters.map(parameter => ({ ...parameter })),
      steps: fn.steps.map(serializeItem),
    })

    // Gives a copied item fresh IDs so pasting it twice yields distinct items
    const instantiateItem = item => {
      if (!isFunctionItem(item)) return { ...item, _uiId: `step-${stepIdCounter.value++}` }
      const id = createCallId()
      return { ...serializeItem(item), id, _uiId: id }
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
        functions.value = stepsRes.functions || []
        suggestion.value = stepsRes.suggestion || null
        syncSelectionWithSteps()
      }
    }

    // Saves the lines and the library; definitions nothing calls any more
    // (including from copied lines waiting to be pasted) are dropped
    const persistSteps = async () => {
      const library = reachableFunctions(functions.value, [
        ...uiSteps.value,
        ...copiedSteps.value,
      ]).map(serializeFunction)
      const result = await callBg('replaceSteps', serializeSteps(), library)
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

    // The paste button toggles paste mode; pasting happens through the
    // insert markers on each line (its tooltip reads "Cancel paste mode").
    const onPasteClick = () => {
      isPasteMode.value = !isPasteMode.value
      if (isPasteMode.value) isBulkActionsHidden.value = false
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
      if (indices[indices.length - 1] - indices[0] !== indices.length - 1) {
        return 'Select adjacent steps to create a function'
      }
      return null
    })

    const findCall = callId =>
      uiSteps.value.find(item => isFunctionItem(item) && item._uiId === callId)

    const updateCall = async (callId, changes) => {
      const prev = uiSteps.value
      uiSteps.value = uiSteps.value.map(item =>
        item._uiId === callId ? { ...item, ...changes } : item
      )
      const ok = await persistSteps()
      if (!ok) uiSteps.value = prev
    }

    // Replaces items [start, end] with calls; ranges must not overlap
    const replaceRangesWithCalls = (items, ranges, functionId) => {
      const next = items.slice()
      ranges
        .slice()
        .sort((a, b) => b.start - a.start)
        .forEach(({ start, end, arguments: args }) => {
          const id = createCallId()
          next.splice(start, end - start + 1, {
            type: 'function',
            id,
            functionId,
            collapsed: false,
            arguments: { ...args },
            _uiId: id,
          })
        })
      return next
    }

    const createFunctionFromSelection = async ({ name, description, parameters }) => {
      if (createFunctionBlocker.value) return
      const prevSteps = uiSteps.value
      const prevFunctions = functions.value
      const start = selectedIndices.value[0]
      const count = selectedIndices.value.length
      const linked = linkParameters(
        uiSteps.value.slice(start, start + count).map(serializeItem),
        parameters
      )
      const args = {}
      linked.parameters.forEach(parameter => {
        if (typeof parameter.value === 'string') args[parameter.name] = parameter.value
      })
      const fn = {
        id: createFunctionId(),
        name,
        description: description || '',
        parameters: linked.parameters.map(({ value, ...parameter }) => parameter),
        steps: linked.steps,
      }
      const nextFunctions = [...functions.value, fn]
      let next = replaceRangesWithCalls(
        uiSteps.value,
        [{ start, end: start + count - 1, arguments: args }],
        fn.id
      )
      // Wrapping repeated calls wraps every place they appear
      if (functionModal.source && functionModal.source.kind === 'wrap') {
        next = replaceRangesWithCalls(next, findOccurrences(next, fn, nextFunctions), fn.id)
      }
      functions.value = nextFunctions
      uiSteps.value = next
      selectedStepIds.clear()
      const ok = await persistSteps()
      if (!ok) {
        uiSteps.value = prevSteps
        functions.value = prevFunctions
      }
    }

    const openCreateFunctionModal = (options = {}) => {
      if (createFunctionBlocker.value) return
      const start = selectedIndices.value[0]
      const selectedSteps = selectedIndices.value.map(index => uiSteps.value[index])
      // The new function takes the first selected row's number, so its lines
      // will be numbered start.1, start.2, …
      const parameters = suggestParameters(selectedSteps, functionsById.value).map(
        suggestion => ({
          name: suggestion.name,
          type: suggestion.type,
          link: {
            stepIndex: suggestion.stepIndex,
            prefix: suggestion.prefix,
            value: suggestion.value,
            argument: suggestion.argument,
            lineLabel: `${start + 1}.${suggestion.stepIndex + 1}${
              suggestion.argument ? ` (${suggestion.argument})` : ''
            }`,
          },
        })
      )
      Object.assign(functionModal, {
        show: true,
        mode: 'create',
        functionId: null,
        name: options.name || '',
        description: '',
        parameters,
        note: options.note || '',
        validate: null,
        source: options.source || null,
      })
    }

    const countUses = functionId =>
      [...uiSteps.value, ...functions.value.flatMap(fn => fn.steps)].filter(
        item => isFunctionItem(item) && item.functionId === functionId
      ).length

    const definitionState = () => ({
      items: uiSteps.value,
      functions: functions.value,
      copied: copiedSteps.value,
    })

    const openEditFunctionModal = callId => {
      const call = findCall(callId)
      const fn = call && functionsById.value.get(call.functionId)
      if (!fn) return
      const uses = countUses(fn.id)
      const args = call.arguments || {}
      Object.assign(functionModal, {
        show: true,
        mode: 'edit',
        functionId: callId,
        name: fn.name,
        description: fn.description || '',
        parameters: fn.parameters.map(parameter => ({
          ...parameter,
          value: args[parameter.name] || '',
          originalName: parameter.name,
        })),
        note:
          uses > 1 ? `${fn.name} is used ${uses} times; changes apply to every use.` : '',
        validate: value => {
          const result = editFunctionDefinition(definitionState(), fn.id, value)
          return result.error ? [result.error] : []
        },
        source: null,
      })
    }

    const closeFunctionModal = () => {
      functionModal.show = false
    }

    const editFunction = async (callId, value) => {
      const call = findCall(callId)
      if (!call) return
      const result = editFunctionDefinition(definitionState(), call.functionId, value)
      if (result.error) {
        alert(result.error)
        return
      }
      const prev = { ...definitionState() }
      uiSteps.value = result.items
      functions.value = result.functions
      copiedSteps.value = result.copied
      const ok = await persistSteps()
      if (!ok) {
        uiSteps.value = prev.items
        functions.value = prev.functions
        copiedSteps.value = prev.copied
      }
    }

    const saveFunctionModal = async value => {
      closeFunctionModal()
      if (functionModal.mode === 'create') {
        await createFunctionFromSelection(value)
      } else {
        await editFunction(functionModal.functionId, value)
      }
    }

    const toggleFunctionCollapsed = async callId => {
      const call = findCall(callId)
      if (!call) return
      await updateCall(callId, { collapsed: !call.collapsed })
    }

    const renameFunction = async (callId, name) => {
      const call = findCall(callId)
      if (!call || !functionsById.value.has(call.functionId)) return
      const prev = functions.value
      functions.value = functions.value.map(fn =>
        fn.id === call.functionId ? { ...fn, name } : fn
      )
      const ok = await persistSteps()
      if (!ok) functions.value = prev
    }

    // === Suggestions (TMD-11 / TMD-12) ===

    const selectRange = (start, end) => {
      selectedStepIds.clear()
      uiSteps.value.slice(start, end + 1).forEach(item => selectedStepIds.add(item._uiId))
      selectionAnchorId = null
      isBulkActionsHidden.value = false
    }

    const wrapName = functionIds => {
      const names = functionIds.map(id => (functionsById.value.get(id) || {}).name || '')
      if (names.some(name => !name) || names.length > 3) return ''
      return names
        .map((name, index) =>
          index === 0 ? name : `And${name.charAt(0).toUpperCase()}${name.slice(1)}`
        )
        .join('')
    }

    /**
     * @param action 'create' (form / wrap, or a match added as a new
     * function) or 'use' (replace a match with the existing function)
     */
    const acceptSuggestion = async action => {
      const current = suggestion.value
      if (!current) return
      if (current.end >= uiSteps.value.length) return
      if (current.kind === 'match' && action === 'use') {
        const prev = uiSteps.value
        uiSteps.value = replaceRangesWithCalls(uiSteps.value, [current], current.functionId)
        selectedStepIds.clear()
        const ok = await persistSteps()
        if (!ok) uiSteps.value = prev
        return
      }
      selectRange(current.start, current.end)
      if (current.kind === 'wrap') {
        openCreateFunctionModal({
          name: wrapName(current.functionIds),
          note: `These calls appear ${current.count} times; every place will use the new function.`,
          source: current,
        })
      } else {
        openCreateFunctionModal({ name: current.name || '', source: current })
      }
    }

    const dismissSuggestion = async () => {
      if (!suggestion.value) return
      const { id } = suggestion.value
      suggestion.value = null
      await callBg('resolveSuggestion', id, 'dismissed')
      await refresh()
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
      functions,
      suggestion,
      acceptSuggestion,
      dismissSuggestion,
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
