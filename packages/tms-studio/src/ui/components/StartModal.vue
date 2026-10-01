<template>
  <div class="modal" :class="{ show }" aria-hidden="false">
    <div class="modal-backdrop"></div>
    <div class="modal-card">
      <div class="modal-title">Start Recording</div>
      <label class="modal-label" for="start-url">Start URL</label>
      <input
        id="start-url"
        ref="startInput"
        :value="startUrl"
        class="modal-input"
        placeholder="https://example.com"
        @input="$emit('update:start-url', $event.target.value)"
        @keydown.enter.prevent="$emit('confirm')"
      />
      <label class="modal-check" for="clear-site-data">
        <input
          id="clear-site-data"
          type="checkbox"
          :checked="clearSiteData"
          @change="$emit('update:clear-site-data', $event.target.checked)"
        />
        Clear site data before recording
      </label>
      <div class="modal-actions">
        <button @click="$emit('cancel')">Cancel</button>
        <button class="primary" :disabled="confirmDisabled" @click="$emit('confirm')">Start</button>
      </div>
    </div>
  </div>
</template>

<script>
import { nextTick, ref, watch } from 'vue'

export default {
  emits: ['cancel', 'confirm', 'update:start-url', 'update:clear-site-data'],
  props: {
    show: { type: Boolean, required: true },
    startUrl: { type: String, required: true },
    clearSiteData: { type: Boolean, required: true },
    confirmDisabled: { type: Boolean, required: true },
  },
  setup(props) {
    const startInput = ref(null)

    watch(
      () => props.show,
      async nextValue => {
        if (!nextValue) return
        await nextTick()
        if (startInput.value) {
          startInput.value.focus()
        }
      }
    )

    return { startInput }
  },
}
</script>
