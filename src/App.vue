<script setup lang="ts">
import { useQuery } from "@tanstack/vue-query";
import { useQuasar } from "quasar";
import { computed, onMounted } from "vue";
import { accountsApi } from "./connections/axiosCRM";
import { useTabStore, useUserStore } from "./store";
import type { User } from "./types";
import { loadUserSession } from "./services";
import regionalMap from "./data/regional-map.json";

const userStore = useUserStore();
const tabStore = useTabStore();
const $q = useQuasar();

const onExpire = () => {
  $q.notify({
    message: "La sesión ha expirado",
    color: "red",
    position: "bottom-right",
    timeout: 500,
  });
};

const { isLoading: isLoadingSession } = useQuery({
  queryKey: ["loadSession"],
  queryFn: async () => {
    return await loadUserSession(onExpire);
  },
  refetchOnWindowFocus: false,
  initialData: false,
});

const enabled = computed(() => !isLoadingSession.value);

const { isLoading } = useQuery({
  queryKey: ["getUser"],
  queryFn: async () => {
    const url = new URL(location.href);
    const id = url.searchParams.get("userId") ?? userStore.user?.id;

    const { data: userResponse } = await accountsApi.get<User>("/users/" + id);

    userStore.setUser(
      userResponse,
      (regionalMap as Record<string, { lat: number; lng: number }>)[
        userResponse.userCRM.idregional
      ],
    );
    return userResponse;
  },
  enabled,
  refetchOnWindowFocus: false,
});

onMounted(() => {
  if($q.platform.is.mobile || $q.screen.lt.sm) {
    tabStore.openFullScreen();
  } else {
    tabStore.closeFullScreen();
  }
})
</script>

<template>
  <div
    v-if="isLoading || isLoadingSession"
    style="width: 100vw; height: 100vh"
    class="row justify-center items-center"
  >
    <q-spinner-gears size="100px" color="primary" />
  </div>
  <router-view v-else />
</template>

<style>
.my-marker-cluster {
  background-clip: padding-box;
  clip-path: polygon(0 25%, 50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%);
}

.my-marker-cluster div {
  width: 30px;
  height: 30px;
  margin-left: 5px;
  margin-top: 5px;

  text-align: center;
  clip-path: polygon(0 25%, 50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%);
  font: 12px "Helvetica Neue", Arial, Helvetica, sans-serif;
}

.my-marker-cluster span {
  line-height: 30px;
}

.my-marker-cluster-small {
  background-color: rgba(226, 179, 140, 0.6);
}

.my-marker-cluster-small div {
  background-color: rgba(204, 116, 57, 0.6);
}

.my-marker-cluster-medium {
  background-color: rgba(218, 241, 87, 0.6);
}

.my-marker-cluster-medium div {
  background-color: rgba(141, 240, 12, 0.6);
}

.my-marker-cluster-large {
  background-color: rgba(253, 159, 115, 0.6);
}

.my-marker-cluster-large div {
  background-color: rgba(241, 23, 23, 0.6);
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-thumb {
  background-color: rgba(13, 71, 161);
  border-radius: 2px;
}

::-webkit-scrollbar-track {
  background-color: rgba(13, 71, 161, 0.1);
}

::-webkit-scrollbar-thumb:hover {
  background-color: rgba(13, 71, 161, 0.8);
}

::-webkit-scrollbar-thumb:active {
  background-color: rgba(13, 71, 161, 0.6);
}
</style>
