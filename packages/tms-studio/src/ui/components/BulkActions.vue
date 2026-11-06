<template>
  <div class="bulk-actions" :class="{ 'is-visible': showBulkBar }" :aria-hidden="!showBulkBar">
    <button
      class="bulk-icon-btn bulk-delete"
      type="button"
      :disabled="!hasSelectedSteps"
      :hidden="!hasSelectedSteps"
      title="Delete selected"
      @click="$emit('delete-selected')"
      v-html="icons.trash"
    ></button>
    <button
      class="bulk-icon-btn bulk-copy"
      type="button"
      :disabled="!hasSelectedSteps"
      :hidden="!hasSelectedSteps"
      title="Copy selected"
      @click="$emit('copy-selected')"
      v-html="icons.copy"
    ></button>
    <button
      class="bulk-icon-btn bulk-cut"
      type="button"
      :disabled="!hasSelectedSteps"
      :hidden="!hasSelectedSteps"
      title="Cut selected"
      @click="$emit('cut-selected')"
      v-html="icons.scissors"
    ></button>
    <!-- Tooltip lives on the wrapper so it shows while the button is disabled -->
    <span class="bulk-function-wrap" :hidden="!hasSelectedSteps" :title="createFunctionTitle">
      <button
        class="bulk-icon-btn bulk-function"
        type="button"
        :disabled="!canCreateFunction"
        aria-label="Create function from selected"
        @click="$emit('create-function')"
      >
        <span class="fx-label">f(x)</span>
      </button>
    </span>
    <button
      class="bulk-icon-btn bulk-paste"
      :class="{ active: isPasteMode }"
      type="button"
      :disabled="copiedStepsCount === 0"
      :hidden="copiedStepsCount === 0"
      :title="isPasteMode ? 'Cancel paste mode' : 'Paste copied'"
      @click="$emit('paste-click')"
      v-html="icons.paste"
    ></button>
    <button
      class="bulk-icon-btn bulk-close"
      type="button"
      title="Hide bulk actions"
      @click="$emit('hide')"
      v-html="icons.close"
    ></button>
  </div>
</template>

<script>
export default {
  emits: ['delete-selected', 'copy-selected', 'cut-selected', 'create-function', 'paste-click', 'hide'],
  props: {
    showBulkBar: { type: Boolean, required: true },
    hasSelectedSteps: { type: Boolean, required: true },
    canCreateFunction: { type: Boolean, required: true },
    createFunctionTitle: { type: String, required: true },
    copiedStepsCount: { type: Number, required: true },
    isPasteMode: { type: Boolean, required: true },
    icons: { type: Object, required: true },
  },
}
</script>
