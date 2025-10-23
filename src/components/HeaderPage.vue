<script setup lang="ts">
import { useTabStore } from "@/store";
import { computed, defineProps, withDefaults } from "vue";
import { useQuasar } from "quasar";
type Props = {
  title?: string;
  isChild?: boolean;
  closePopUp?: boolean;
  showBackButton?: boolean;
};
const $q = useQuasar(); 
const isMobile = computed(() => {
  return $q.screen.xs;
});
const { title, isChild, closePopUp } = withDefaults(defineProps<Props>(), {
  showBackButton: true,
});
const tabStore = useTabStore();

const emit = defineEmits<{
  (e: "back"): void;
}>();
</script>

<template>
  <div
    class="row items-center q-pa-sm"
    :class="{
      'justify-between': !closePopUp,
      'justify-start': closePopUp,
    }"
  >
    <q-btn
      v-if="closePopUp"
      @click="emit('back')"
      class="bg-gray-4 q-mr-sm"
      flat
      padding="xs"
    >
      <q-icon name="o_close"></q-icon>
    </q-btn>
    <div class="row items-center q-gutter-x-xs">
      <template v-if="isChild">
        <q-btn @click="emit('back')" flat icon="o_arrow_back" padding="xs"> </q-btn>
      </template>
      <div class="text-h5 text-grey-7 text-bold">
        <template v-if="title">
          {{ title }}
        </template>
        <template v-else>
          <slot name="title" />
        </template>
      </div>
    </div>
    <q-btn
      v-if="!closePopUp && showBackButton && !isMobile"
      @click="tabStore.close"
      class="bg-gray-4"
      flat
      padding="xs"
    >
      <q-icon name="o_arrow_back_ios"></q-icon>
    </q-btn>
  </div>
</template>
