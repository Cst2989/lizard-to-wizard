<template>
  <div>
    <h1>Exclusive Content Access</h1>
    <p v-if="accessCode">Applying access code: <strong v-html="accessCode"></strong></p>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';

const AccessCode = {
  setup() {
    const accessCode = ref('');

    onMounted(() => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      if (code) {
        accessCode.value = code;
      }
    });

    return { accessCode };
  }
};

export default AccessCode
</script>
