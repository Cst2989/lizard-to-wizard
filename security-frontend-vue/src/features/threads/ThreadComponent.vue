<template>
  <div class="thread">
    <div v-html="sanitisedContent"></div>
    <textarea v-model="reply" placeholder="Write a reply..."></textarea>
    <button @click="addReply">Reply</button>
    <div class="replies">
      <div v-for="reply in replies" :key="reply" v-html="reply"></div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['content'],
  data() {
    return {
      reply: '',
      replies: [],
    };
  },
  computed: {
    sanitisedContent() {
      return this.content;
    },
  },
  methods: {
    addReply() {
      this.replies.push(this.reply);
      this.reply = '';
    },
  },
};
</script>

<style scoped>
.thread {
  border: 1px solid #eee;
  padding: 15px;
  margin-bottom: 15px;
}
.replies div {
  border-top: 1px solid #eee;
  padding-top: 10px;
}
</style>

