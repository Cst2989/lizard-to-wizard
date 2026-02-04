<template>
  <div class="thread">
    <div v-html="sanitisedContent"></div>
    <textarea v-model="reply" placeholder="Write a reply..."></textarea>
    <button @click="addReply">Reply</button>
    <div class="replies">
      <div v-for="(replyItem, index) in sanitisedReplies" :key="index" v-html="replyItem"></div>
    </div>
  </div>
</template>

<script>
import DOMPurify from 'dompurify';

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
      return DOMPurify.sanitize(this.content);
    },
    sanitisedReplies() {
      return this.replies.map(r => DOMPurify.sanitize(r));
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

