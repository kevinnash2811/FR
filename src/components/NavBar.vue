<script setup lang="ts">
import type { NavItem } from "@/types";
import { useTabStore, useMapStore } from "@/store";
import { useQuasar } from "quasar";
import { useUserStore } from "@/store/useUserStore";
import { computed } from "vue";
const mapStore = useMapStore();
const navStore = useTabStore();
const userStore = useUserStore();
const $q = useQuasar();

const items = computed<NavItem[]>(() => {
  const links: NavItem[] = [];

  if (userStore.canViewModuleContactVisit) {
    links.push({
      icon: "o_contacts",
      route: "/contacts",
      label: "Contactos",
      name: "accounts",
    });

    links.push({
      icon: "o_polyline",
      route: "/hanrt_planificador",
      label: "Geocercas",
      name: "myVisits",
    });
  }

  if (userStore.canViewModuleVisit) {
    links.push({
      icon: "o_event",
      route: "/HANA_Visitas",
      label: "Mis visitas planificadas",
      name: "myVisits",
    });

  }

  if (userStore.canViewModuleVisit) {
    links.push(
      {
        icon: "o_account_circle",
        route: "/accounts",
        label: "Cuentas",
        name: "accounts",
      },
      // {
      //   icon: "o_post_add",
      //   route: "/hanrt_gestionTNP",
      //   label: "Gestion de TNP y licencias",
      //   name: "myVisits",
      // },
      // {
      //   icon: "o_timer",
      //   route: "/hanrt_gestionTNP",
      //   label: "Frecuencias",
      //   name: "myVisits",
      // },
      // {
      //   icon: "o_straighten",
      //   route: "/hanrt_reglasEnrutamiento",
      //   label: "Reglas de enrutamiento",
      //   name: "myVisits",
      // },
    );
  }

  if (userStore.canViewModuleCycle) {
    links.push({
      icon: "o_event_repeat",
      route: "/HANRT_ciclos",
      label: "Ciclos",
      name: "cycles",
    });
  }

  if (userStore.canViewModuleDelivery) {
    links.push({
      icon: "o_local_shipping",
      route: "/hane_entregas",
      label: "Entregas",
      name: "dispatchs",
    });
  }

  links.push({
    icon: "o_map",
    route: "/hanrt_planificador",
    label: "Planificaciones",
    name: "planning",
  });

  return links;
});

const openNavBar = () => {
  navStore.open();
  mapStore.map.invalidateSize();
};

const navigateToDetail = () => {
  window.open(
    `${
      import.meta.env.VITE_TENANT_DOMAIN
    }/index.php?module=Users&action=EditView&record=${userStore.user?.id}`,
    "_blank",
  );
};

const toggle = () => {
  $q.fullscreen.toggle(
    document.fullscreenElement?.parentElement ?? document.documentElement,
  );
};
</script>

<template>
  <div
    class="column items-center justify-between q-py-md"
    style="height: 100%; position: relative; border-right: 1px solid gainsboro"
  >
    <div class="column items-center" style="gap: 10px">
      <q-btn
        @click="openNavBar"
        padding="xs"
        v-if="!navStore.isOpen"
        style="
          position: absolute;
          top: 25px;
          right: -25px;
          z-index: 500;
          background-color: white;
          font-size: 0.6rem;
        "
      >
        <q-icon name="o_arrow_forward_ios" size="0.8rem"></q-icon>
      </q-btn>
      <router-link
        v-for="item of items"
        :key="item.label"
        :to="item.route"
        v-slot="{ isActive }"
      >
        <div
          class="q-pa-sm"
          :class="{
            'router-link': !isActive,
          }"
        >
          <q-icon
            :name="item.icon"
            size="1.8rem"
            :style="{
              rotate: item.icon === 'o_straighten' ? '-45deg' : '0deg',
            }"
          />
          <q-tooltip anchor="center right" self="center left" :offset="[5, 10]">
            {{ item.label }}
          </q-tooltip>
        </div>
      </router-link>
    </div>
    <div class="column items-center" style="gap: 10px">
      <q-avatar
        color="primary"
        size="md"
        text-color="white"
        @click="navigateToDetail"
        >{{ userStore.getFirstLetterOfName }}
        <q-tooltip anchor="center right" self="center left" :offset="[0, 10]">
          {{ userStore.fullName }} | {{ userStore.rolHBMLabel }}
        </q-tooltip>
      </q-avatar>
      <q-btn @click="toggle" only-icon flat padding="none">
        <q-icon
          size="1.7rem"
          :name="$q.fullscreen.isActive ? 'fullscreen_exit' : 'fullscreen'"
        ></q-icon>
      </q-btn>
    </div>
  </div>
</template>

<style scoped>
.router-link-active {
  background-color: gainsboro;
  border-right: 2px solid black;
  color: black;
}

.router-link {
  color: black;
}

.router-link:hover {
  background-color: gainsboro;
}
</style>
