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
              >{{ index + 1 }}. {{ formatSignature(item) }}</span
            >
            <span class="function-count"
              >{{ item.steps.length }} line{{ item.steps.length === 1 ? '' : 's' }}</span
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
        <div v-for="(child, childIndex) in item.steps" :key="child._uiId" class="step function-child">
          <div class="step-text">{{ stepText(child, `${index + 1}.${childIndex + 1}`) }}</div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { nextTick, ref } from 'vue'
import { formatSignature, isFunctionItem, isValidIdentifier } from '../utils/function-utils'

export default {
  emits: [
    'toggle-select',
    'delete-step',
    'drag-start',
    'paste-insert',
    'toggle-collapse',
    'edit-function',
    'rename-function',
  ],
  props: {
    steps: { type: Array, required: true },
    selectedStepIds: { type: Object, required: true },
    hasSelectedSteps: { type: Boolean, required: true },
    isPasteMode: { type: Boolean, required: true },
    draggingStepId: { type: String, default: null },
    icons: { type: Object, required: true },
    stepText: { type: Function, required: true },
  },
  setup(_props, { emit }) {
    const renamingId = ref(null)
    const renameValue = ref('')
    const renameInvalid = ref(false)
    const renameInput = ref(null)

    const startRename = async item => {
      renamingId.value = item._uiId
      renameValue.value = item.name
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
      formatSignature,
    }
  },
}
</script>
