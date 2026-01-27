<template>
  <div>
    <TextareaComponent @save-thread="addThread" />
    <ThreadComponent
      v-for="thread in threads"
      :key="thread"
      :content="thread"
    />
  </div>
</template>

<script>
import ThreadComponent from './ThreadComponent.vue';
import TextareaComponent from './TextAreaComponent.vue';

export default {
  components: {
    ThreadComponent,
    TextareaComponent,
  },
  data() {
    return {
      threads: JSON.parse(localStorage.getItem('threads') || '[]'),
    };
  },
  methods: {
    addThread(content) {
      this.threads.push(content);
      localStorage.setItem('threads', JSON.stringify(this.threads));
    },
  },
};
</script>

