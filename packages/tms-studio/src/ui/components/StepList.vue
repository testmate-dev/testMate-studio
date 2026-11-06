<template>
  <div class="steps" :class="{ 'show-checkboxes': hasSelectedSteps }">
    <div v-if="steps.length === 0" class="empty">No recorded steps yet.</div>
    <div
      v-for="(item, index) in steps"
      :key="item._uiId"
      class="step-item"
      :class="{
        'function-block': isFunctionItem(item),
        collapsed: isFunctionItem(item) && item.collapsed,
        selected: selectedStepIds.has(item._uiId),
        suggested: isSuggested(index),
        dragging: draggingStepId === item._uiId,
        'paste-target': isPasteMode,
      }"
    >
      <button
        v-if="isPasteMode"
        class="paste-insert paste-insert-before"
        :title="`Paste before this ${isFunctionItem(item) ? 'function' : 'step'}`"
        @click="$emit('paste-insert', item._uiId, 'before')"
        v-html="icons.plus"
      ></button>
      <button
        v-if="isPasteMode"
        class="paste-insert paste-insert-after"
        :title="`Paste after this ${isFunctionItem(item) ? 'function' : 'step'}`"
        @click="$emit('paste-insert', item._uiId, 'after')"
        v-html="icons.plus"
      ></button>

      <div class="step" :class="{ 'function-header': isFunctionItem(item) }">
        <label class="step-select">
          <input
            class="step-checkbox"
            type="checkbox"
            :checked="selectedStepIds.has(item._uiId)"
            @mousedown="preventShiftTextSelection"
            @click="$emit('toggle-select', item._uiId, $event.shiftKey)"
          />
        </label>

        <template v-if="isFunctionItem(item)">
          <button
            class="function-toggle"
            type="button"
            :title="item.collapsed ? 'Expand function' : 'Collapse function'"
            :aria-expanded="!item.collapsed"
            @click="$emit('toggle-collapse', item._uiId)"
            v-html="item.collapsed ? icons.caretRight : icons.caretDown"
          ></button>
          <div class="step-text function-title">
            <template v-if="renamingId === item._uiId">
              <span>{{ index + 1 }}. </span>
              <input
                ref="renameInput"
                v-model="renameValue"
                class="function-rename-input"
                :class="{ invalid: renameInvalid }"
                aria-label="Function name"
                @keydown.enter.prevent="commitRename"
                @keydown.esc.prevent="cancelRename"
                @blur="onRenameBlur"
              />
            </template>
            <span
              v-else
              class="function-signature"
              title="Double-click to rename"
              @dblclick="startRename(item)"
              >{{ index + 1 }}. {{ callSignature(item) }}</span
            >
            <span class="function-count"
              >{{ lineCount(item) }} line{{ lineCount(item) === 1 ? '' : 's' }}</span
            >
          </div>
          <div class="step-controls">
            <button
              class="step-edit"
              title="Edit function"
              @click="$emit('edit-function', item._uiId)"
              v-html="icons.pen"
            ></button>
            <button
              class="step-delete"
              title="Delete function"
              @click="$emit('delete-step', item._uiId)"
              v-html="icons.trash"
            ></button>
            <button
              class="step-handle"
              title="Drag to reorder"
              @mousedown="$emit('drag-start', $event, item._uiId)"
              v-html="icons.grip"
            ></button>
          </div>
        </template>

        <template v-else>
          <div class="step-text">{{ stepText(item, `${index + 1}`) }}</div>
          <div class="step-controls">
            <button
              class="step-delete"
              title="Delete step"
              @click="$emit('delete-step', item._uiId)"
              v-html="icons.trash"
            ></button>
            <button
              class="step-handle"
              title="Drag to reorder"
              @mousedown="$emit('drag-start', $event, item._uiId)"
              v-html="icons.grip"
            ></button>
          </div>
        </template>
      </div>

      <template v-if="isFunctionItem(item) && !item.collapsed">
        <div
          v-for="row in callRows(item, `${index + 1}`)"
          :key="row.key"
          class="step function-child"
          :class="{ 'function-child-call': row.isCall }"
          :style="{ paddingLeft: `${64 + row.depth * 16}px` }"
        >
          <div class="step-text">{{ row.text }}</div>
        </div>
      </template>

      <div
        v-if="suggestion && suggestion.end === index"
        class="suggestion-tip"
        role="status"
      >
        <div class="suggestion-text">{{ suggestionText }}</div>
        <div v-if="suggestion.kind === 'form' && suggestion.groupLabel" class="suggestion-detail">
          {{ suggestion.groupLabel }}
        </div>
        <div class="suggestion-actions">
          <template v-if="suggestion.kind === 'match'">
            <button class="primary" type="button" @click="$emit('accept-suggestion', 'use')">
              Use {{ functionName(suggestion.functionId) }}
            </button>
            <button type="button" @click="$emit('accept-suggestion', 'create')">Add as new</button>
          </template>
          <button
            v-else
            class="primary"
            type="button"
            @click="$emit('accept-suggestion', 'create')"
          >
            {{ suggestion.kind === 'wrap' ? 'Wrap in function' : 'Create function' }}
          </button>
          <button type="button" @click="$emit('dismiss-suggestion')">Dismiss</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, nextTick, ref } from 'vue'
import { formatSignature, isFunctionItem, isValidIdentifier } from '../utils/function-utils'

const MAX_NESTING = 20

export default {
  emits: [
    'toggle-select',
    'delete-step',
    'drag-start',
    'paste-insert',
    'toggle-collapse',
    'edit-function',
    'rename-function',
    'accept-suggestion',
    'dismiss-suggestion',
  ],
  props: {
    steps: { type: Array, required: true },
    selectedStepIds: { type: Object, required: true },
    hasSelectedSteps: { type: Boolean, required: true },
    isPasteMode: { type: Boolean, required: true },
    draggingStepId: { type: String, default: null },
    icons: { type: Object, required: true },
    stepText: { type: Function, required: true },
    // the recording's function library
    functions: { type: Array, default: () => [] },
    // the current "make this a function" suggestion, if any
    suggestion: { type: Object, default: null },
  },
  setup(props, { emit }) {
    const functionsById = computed(() => new Map(props.functions.map(fn => [fn.id, fn])))

    const definitionOf = call => functionsById.value.get(call.functionId)

    const callSignature = call => {
      const fn = definitionOf(call)
      return fn ? formatSignature(fn, call.arguments || {}) : 'Missing function'
    }

    const lineCount = call => {
      const fn = definitionOf(call)
      return fn ? fn.steps.length : 0
    }

    const functionName = functionId => {
      const fn = functionsById.value.get(functionId)
      return fn ? fn.name : 'function'
    }

    // The lines under a call, including the lines of functions it calls,
    // numbered N.x, N.x.y, …
    const callRows = (call, label, depth = 0) => {
      const fn = definitionOf(call)
      if (!fn || depth >= MAX_NESTING) return []
      const rows = []
      fn.steps.forEach((step, index) => {
        const childLabel = `${label}.${index + 1}`
        const key = `${call._uiId || call.id}:${childLabel}`
        if (!isFunctionItem(step)) {
          rows.push({ key, depth, text: props.stepText(step, childLabel) })
          return
        }
        rows.push({ key, depth, isCall: true, text: `${childLabel}. ${callSignature(step)}` })
        rows.push(...callRows({ ...step, _uiId: key }, childLabel, depth + 1))
      })
      return rows
    }

    const isSuggested = index =>
      !!props.suggestion && index >= props.suggestion.start && index <= props.suggestion.end

    const suggestionText = computed(() => {
      const current = props.suggestion
      if (!current) return ''
      const range =
        current.start === current.end
          ? `Line ${current.start + 1}`
          : `Lines ${current.start + 1}–${current.end + 1}`
      if (current.kind === 'match') {
        return `${range} repeat ${functionName(current.functionId)}. Use it here?`
      }
      if (current.kind === 'wrap') {
        const names = current.functionIds.map(functionName).join(' → ')
        return `${names} appear together ${current.count} times. Wrap them in one function?`
      }
      return `${range} look like a form. Turn them into a function?`
    })

    const renamingId = ref(null)
    const renameValue = ref('')
    const renameInvalid = ref(false)
    const renameInput = ref(null)

    const startRename = async item => {
      const fn = definitionOf(item)
      if (!fn) return
      renamingId.value = item._uiId
      renameValue.value = fn.name
      renameInvalid.value = false
      await nextTick()
      // ref inside v-for resolves to an array
      const input = Array.isArray(renameInput.value) ? renameInput.value[0] : renameInput.value
      if (input) {
        input.focus()
        input.select()
      }
    }

    const cancelRename = () => {
      renamingId.value = null
    }

    const commitRename = () => {
      if (!renamingId.value) return
      const name = renameValue.value.trim()
      if (!isValidIdentifier(name)) {
        renameInvalid.value = true
        return
      }
      emit('rename-function', renamingId.value, name)
      renamingId.value = null
    }

    // Blur commits a valid name and discards an invalid one
    const onRenameBlur = () => {
      if (!renamingId.value) return
      if (isValidIdentifier(renameValue.value.trim())) commitRename()
      else cancelRename()
    }

    // Shift-click would otherwise extend the page's text selection
    const preventShiftTextSelection = event => {
      if (event.shiftKey) event.preventDefault()
    }

    return {
      preventShiftTextSelection,
      renamingId,
      renameValue,
      renameInvalid,
      renameInput,
      startRename,
      cancelRename,
      commitRename,
      onRenameBlur,
      isFunctionItem,
      callSignature,
      lineCount,
      functionName,
      callRows,
      isSuggested,
      suggestionText,
    }
  },
}
</script>
