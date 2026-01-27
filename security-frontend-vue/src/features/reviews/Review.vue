<template>
  <div v-html="safeContent"></div>
</template>

<script>
import DOMPurify from 'dompurify';

const ReviewComponent = {
  props: ['reviewContent'],
  computed: {
    safeContent() {
      return DOMPurify.sanitize(this.reviewContent);
    }
  }
};

export default ReviewComponent
</script>



