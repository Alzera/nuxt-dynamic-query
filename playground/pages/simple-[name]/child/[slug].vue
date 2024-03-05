<script setup>
import { watch } from 'vue';

const route = useRoute()
watch(() => route.params, (v) => {
  console.log(v)
})
</script>

<template>
  <div>
    <h1>Sample {{ $route.params.slug }}</h1>
  </div>
</template>