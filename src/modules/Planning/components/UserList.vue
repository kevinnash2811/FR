<script setup lang="ts">
import { useUserStore } from "@/store";
import type { UserAccount } from "@/types";
import { computed } from "vue";
import { useCreatePlanningStore } from "@/modules/Planning/store";
import { useQuery } from "@tanstack/vue-query";
import { getUsers } from "@/modules/Planning/services";

const { data } = useQuery({
  queryKey: ["users"],
  queryFn: () =>
    getUsers({
      amercado: userStore.user?.idamercado ?? "",
      division: userStore.user?.iddivision ?? "",
    }),
  initialData: [],
});

const userStore = useUserStore();
const createPlanningStore = useCreatePlanningStore();
const model = defineModel<string>();

const users = computed(() => {
  if (!model.value) return data.value;
  const regex = new RegExp(
    model.value
      .toLowerCase()
      .split(" ")
      .filter((word) => word)
      .map((word) => `(?=.*${word})`)
      .join(""),
    "i",
  );

  return data.value.filter((item) => {
    return regex.test(item.user_name);
  });
});

const onSelectUser = (user: UserAccount) => {
  if (createPlanningStore.assignedUsers.some((u) => u.id === user.id)) {
    createPlanningStore.removeUser(user);
  } else {
    createPlanningStore.addUser(user);
  }
};

const active = computed(
  () => (user: UserAccount) =>
    createPlanningStore.assignedUsers.some((u) => u.id === user.id),
);
</script>

<template>
  <q-virtual-scroll
    :items="users"
    v-slot="{ item }"
    class="q-py-md q-px-sm"
    style="height: 100%"
  >
    <q-item
      :v-bind="$props"
      :active="active(item)"
      clickable
      v-ripple
      @click="onSelectUser(item)"
      active-class="bg-primary text-white"
      :dark="active(item)"
    >
      <q-item-section avatar>
        <user-avatar v-bind="item"></user-avatar>
      </q-item-section>
      <q-item-section>
        <q-item-label class="ellipsis"
          >{{ item.user_name }}
          <q-tooltip
            v-if="item.user_name.length > 20"
            anchor="bottom middle"
            self="top middle"
            :offset="[10, 10]"
          >
            {{ item.user_name }}
          </q-tooltip>
        </q-item-label>
        <q-item-label caption>{{ item.email }}</q-item-label>
      </q-item-section>
      <q-item-section side>
        <slot name="side" />
      </q-item-section>
    </q-item>
  </q-virtual-scroll>
</template>

<style scoped></style>
