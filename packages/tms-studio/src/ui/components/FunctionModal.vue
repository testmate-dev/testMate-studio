<template>
  <div class="modal" :class="{ show }" aria-hidden="false">
    <div class="modal-backdrop" @click="$emit('cancel')"></div>
    <div
      class="modal-card function-modal"
      role="dialog"
      aria-labelledby="function-modal-title"
      @keydown.esc.prevent="$emit('cancel')"
    >
      <div id="function-modal-title" class="modal-title">
        {{ mode === 'edit' ? 'Edit Function' : 'Create Function' }}
      </div>
      <label class="modal-label" for="function-name">Name</label>
      <input
        id="function-name"
        ref="nameInput"
        v-model="name"
        class="modal-input"
        placeholder="login"
        autocomplete="off"
        @keydown.enter.prevent="save"
      />

      <div class="function-params-header">
        <span class="modal-label">Parameters</span>
        <button class="function-param-add" type="button" @click="addParameter">
          + Add parameter
        </button>
      </div>
      <div v-if="parameters.length === 0" class="function-params-empty">No parameters.</div>
      <div v-else class="function-param function-param-columns" aria-hidden="true">
        <span>Name</span>
        <span>Type</span>
      </div>
      <div v-for="(parameter, index) in parameters" :key="parameter.key" class="function-param">
        <input
          v-model="parameter.name"
          class="modal-input"
          autocomplete="off"
          :aria-label="`Parameter ${index + 1} name`"
          @keydown.enter.prevent="save"
        />
        <select
          v-model="parameter.type"
          class="modal-input"
          :aria-label="`Parameter ${index + 1} type`"
        >
          <option value="">any</option>
          <option v-for="type in typeOptions(parameter)" :key="type" :value="type">
            {{ type }}
          </option>
        </select>
        <button
          class="function-param-remove"
          type="button"
          :title="`Remove parameter ${index + 1}`"
          @click="removeParameter(index)"
          v-html="icons.close"
        ></button>
      </div>

      <ul v-if="errors.length" class="function-errors">
        <li v-for="error in errors" :key="error">{{ error }}</li>
      </ul>

      <div class="modal-actions">
        <button type="button" @click="$emit('cancel')">Cancel</button>
        <button class="primary" type="button" @click="save">
          {{ mode === 'edit' ? 'Save' : 'Create' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { nextTick, ref, watch } from 'vue'
import { PARAMETER_TYPES, validateFunctionDraft } from '../utils/function-utils'

export default {
  emits: ['cancel', 'save'],
  props: {
    show: { type: Boolean, required: true },
    mode: { type: String, default: 'create' },
    initialName: { type: String, default: '' },
    initialParameters: { type: Array, default: () => [] },
    icons: { type: Object, required: true },
  },
  setup(props, { emit }) {
    const nameInput = ref(null)
    const name = ref('')
    const parameters = ref([])
    const errors = ref([])
    let parameterKey = 0

    const toDraftParameter = parameter => ({
      key: parameterKey++,
      name: parameter.name || '',
      type: parameter.type || '',
    })

    // Keeps a type saved before it was in the list selectable when editing
    const typeOptions = parameter =>
      parameter.type && !PARAMETER_TYPES.includes(parameter.type)
        ? [...PARAMETER_TYPES, parameter.type]
        : PARAMETER_TYPES

    const addParameter = () => {
      parameters.value.push(toDraftParameter({}))
    }

    const removeParameter = index => {
      parameters.value.splice(index, 1)
    }

    const save = () => {
      const result = validateFunctionDraft({
        name: name.value,
        parameters: parameters.value,
      })
      errors.value = result.errors
      if (result.errors.length === 0) emit('save', result.value)
    }

    watch(
      () => props.show,
      async nextValue => {
        if (!nextValue) return
        name.value = props.initialName
        parameters.value = props.initialParameters.map(toDraftParameter)
        errors.value = []
        await nextTick()
        if (nameInput.value) {
          nameInput.value.focus()
          nameInput.value.select()
        }
      }
    )

    return {
      nameInput,
      name,
      parameters,
      errors,
      typeOptions,
      addParameter,
      removeParameter,
      save,
    }
  },
}
</script>
