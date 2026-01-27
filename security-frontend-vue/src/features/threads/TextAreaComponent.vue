<template>
  <div>
    <div class="editor-buttons">
      <button @click="applyStyle('bold')">Bold</button>
      <button @click="applyStyle('italic')">Italic</button>
      <button @click="applyStyle('underline')">Underline</button>
    </div>
    <div contenteditable="true" class="text-editor"></div>
    <button @click="saveThread">Save Thread</button>
  </div>
</template>

<script>
export default {
  methods: {
    applyStyle(style) {
      document.execCommand(style, false, null);
    },
    saveThread() {
      const content = this.$el.querySelector('.text-editor').innerHTML;
      this.$emit('save-thread', content);
    },
  },
};
</script>

<style scoped>
.text-editor {
  border: 1px solid #ccc;
  min-height: 100px;
  margin-bottom: 10px;
}
.editor-buttons button {
  margin-right: 5px;
}
</style>

