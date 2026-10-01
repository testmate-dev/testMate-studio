<template>
  <header>
    <h1>Testmate Recorder</h1>
    <div class="status">{{ statusText }}</div>
  </header>
</template>

<script>
export default {
  props: {
    statusText: {
      type: String,
      required: true,
    },
  },
}
</script>
