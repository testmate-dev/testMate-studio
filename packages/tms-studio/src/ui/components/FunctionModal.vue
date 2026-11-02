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
        <div v-if="parameter.link" class="function-param-hint">
          From line {{ parameter.link.lineLabel }}: {{ parameter.link.value }}
        </div>
        <div v-else-if="parameter.value" class="function-param-hint">
          Value: {{ parameter.value }}
        </div>
      </div>
      <div v-if="hasLinkedParameters" class="function-params-note">
        Linked lines will use <code>$name</code> in place of the recorded value. Remove a
        parameter to keep that line's value fixed.
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
import { computed, nextTick, ref, watch } from 'vue'
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

    // link: suggested from a line (create); originalName/value: existing
    // parameter (edit), so renames and removals can update the lines
    const toDraftParameter = parameter => ({
      key: parameterKey++,
      name: parameter.name || '',
      type: parameter.type || '',
      link: parameter.link || null,
      originalName: parameter.originalName || '',
      value: parameter.value || '',
    })

    const hasLinkedParameters = computed(() => parameters.value.some(p => p.link))

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
      hasLinkedParameters,
      addParameter,
      removeParameter,
      save,
    }
  },
}
</script>
