<template>
  <div class="row no-wrap" style="height: 100vh; overflow: hidden">
    <nav-bar />
    <slot />
  </div>
</template>

<script setup lang="ts">
import NavBar from "@/components/NavBar.vue";
</script>

<style scoped></style>
