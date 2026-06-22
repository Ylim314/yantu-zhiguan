<template>
  <div class="page-header" style="margin-bottom: 20px;">
    <h2 style="margin: 0 0 4px 0; font-size: 22px; font-weight: 600; color: #333;">{{ title }}</h2>
    <p v-if="subtitle" style="margin: 0; font-size: 14px; color: #999;">{{ subtitle }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
}>()
</script>
