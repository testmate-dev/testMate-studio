<template>
  <div class="actions">
    <button class="primary" :disabled="isRecording" @click="$emit('record')">Record</button>
    <button class="pause" :disabled="!isRecording" @click="$emit('pause-toggle')">
      {{ isPaused ? 'Resume' : 'Pause' }}
    </button>
    <button class="stop" :disabled="!isRecording" @click="$emit('stop')">Stop</button>
    <button @click="$emit('clear')">Clear</button>
  </div>
</template>

<script>
export default {
  emits: ['record', 'pause-toggle', 'stop', 'clear'],
  props: {
    isRecording: { type: Boolean, required: true },
    isPaused: { type: Boolean, required: true },
  },
}
</script>
