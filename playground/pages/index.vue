<script setup>
const detailLink = ref('')
const allLink = ref('')
const nestedLink = ref('')
onMounted(() => {
  detailLink.value = `/detail/${generateRandomString()}`
  allLink.value = `/all/${generateRandomString()}/${generateRandomString()}`
  nestedLink.value = `/simple-${generateRandomString()}/child/${generateRandomString()}`
})
function generateRandomString() {
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';

  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }

  return result;
}
</script>

<template>
  <div>
    <NuxtLink :to="detailLink">
      detail
    </NuxtLink>
    <NuxtLink :to="allLink">
      all
    </NuxtLink>
    <NuxtLink :to="nestedLink">
      nested
    </NuxtLink>
  </div>
</template>