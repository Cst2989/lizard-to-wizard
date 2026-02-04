<template>
  <div v-html="reviewContent"></div>
</template>

<script>
const ReviewComponent = {
  props: ['reviewContent'],
};

export default ReviewComponent
</script>
