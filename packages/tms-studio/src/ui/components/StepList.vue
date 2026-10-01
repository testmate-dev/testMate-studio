<template>
  <div class="steps" :class="{ 'show-checkboxes': hasSelectedSteps }">
    <div v-if="steps.length === 0" class="empty">No recorded steps yet.</div>
    <div
      v-for="(step, index) in steps"
      :key="step._uiId"
      class="step"
      :class="{
        selected: selectedStepIds.has(step._uiId),
        dragging: draggingStepId === step._uiId,
        'paste-target': isPasteMode,
      }"
    >
      <button
        v-if="isPasteMode"
        class="paste-insert paste-insert-before"
        title="Paste before this step"
        @click="$emit('paste-insert', step._uiId, 'before')"
        v-html="icons.plus"
      ></button>
      <button
        v-if="isPasteMode"
        class="paste-insert paste-insert-after"
        title="Paste after this step"
        @click="$emit('paste-insert', step._uiId, 'after')"
        v-html="icons.plus"
      ></button>

      <label class="step-select">
        <input
          class="step-checkbox"
          type="checkbox"
          :checked="selectedStepIds.has(step._uiId)"
          @change="$emit('toggle-select', step._uiId)"
        />
      </label>
      <div class="step-text">{{ stepText(step, index) }}</div>
      <div class="step-controls">
        <button class="step-delete" title="Delete step" @click="$emit('delete-step', step._uiId)" v-html="icons.trash"></button>
        <button
          class="step-handle"
          title="Drag to reorder"
          @mousedown="$emit('drag-start', $event, step._uiId)"
          v-html="icons.grip"
        ></button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  emits: ['toggle-select', 'delete-step', 'drag-start', 'paste-insert'],
  props: {
    steps: { type: Array, required: true },
    selectedStepIds: { type: Object, required: true },
    hasSelectedSteps: { type: Boolean, required: true },
    isPasteMode: { type: Boolean, required: true },
    draggingStepId: { type: String, default: null },
    icons: { type: Object, required: true },
    stepText: { type: Function, required: true },
  },
}
</script>
