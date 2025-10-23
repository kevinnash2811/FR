<script setup lang="ts">
const { avatar } = defineProps<{ avatar : string }>();

import defaultAvatar from "@/assets/avatardefault.png";
const tenantDomain = import.meta.env.VITE_TENANT_DOMAIN as string;
</script>

<template>
  <q-avatar>
    <q-img
      loading="lazy"
      spinner-color="white"
      :src="`${tenantDomain}/${avatar}`"
      :error-src="defaultAvatar"
    >
      <template #loading>
        <q-spinner-gears color="white" size="40px" />
      </template>
    </q-img>
  </q-avatar>
</template>
