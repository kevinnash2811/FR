<script setup lang="ts">
import { usePagination } from "@/composables";
import { useDialogStore, useMapStore } from "@/store";
import type { Account } from "@/types";
import { getColorByCategory } from "@/utils";
import { useAccounts } from "@accounts/composables";
import {
  useAdvancedFilterStore,
  useSelectedAccountStore,
  useFilterStore,
} from "@accounts/store";
import { Geolocation } from "@accounts/types";
import { panels } from "@accounts/utils";
import { Marker } from "leaflet";
import { useQuasar } from "quasar";
import { computed, defineAsyncComponent, shallowRef } from "vue";
import FilterPage from "@/pages/FiltersPage.vue";
import AccountDetailsPage from "@accounts/pages/AccountDetailsPage.vue";

const HeaderPage = defineAsyncComponent(
  () => import("@/components/HeaderPage.vue"),
);

const Pager = defineAsyncComponent(() => import("@/components/Pager.vue"));

const AccountList = defineAsyncComponent(
  () => import("@accounts/components/AccountList.vue"),
);

const mapStore = useMapStore();
const filterStore = useFilterStore();
const advancedFilterStore = useAdvancedFilterStore();
const dialogStore = useDialogStore();
const selectedAccountStore = useSelectedAccountStore();
const $q = useQuasar();

const { page, rowsPerPage } = usePagination();
const withLocation = computed({
  get: () => {
    return filterStore.tab;
  },
  set(value: Geolocation) {
    page.value = 1;
    filterStore.tab = value;
  },
});

const easyFilter = computed({
  get: () => {
    return filterStore.easyFilter;
  },
  set(value: string) {
    page.value = 1;
    filterStore.easyFilter = value;
  },
});

const {
  accounts,
  isLoading,
  totalAccounts,
  isFetchingAccounts,
  failureReason,
  showPager,
} = useAccounts({
  page,
  rowsPerPage,
  withLocation,
  filter: advancedFilterStore.filter,
  easyFilter,
  onClickMarker({ account, marker }) {
    if (!account.id) {
      $q.notify({
        message: "No se puede mostrar la ubicación de esta cuenta",
        color: "red",
        position: "bottom-right",
        timeout: 500,
      });
    }
    mapStore.map.setView(account.location!, mapStore.map.getMaxZoom());
    selectedAccountStore.setSelectedAccount(account, marker);

    dialogStore.openNewDrawer(shallowRef(AccountDetailsPage));
  },
});

const openFilter = () => {
  dialogStore.openNewDrawer(shallowRef(FilterPage));
};

const focus = (account: Account) => {
  if (
    account.hasLocation &&
    mapStore.cluster &&
    mapStore.cluster.getLayers().length > 0
  ) {
    mapStore.cluster.eachLayer((layer) => {
      if (layer instanceof Marker && layer.options.title === account.id) {
        layer.fireEvent("click");
        selectedAccountStore.setSelectedAccount(account, layer);
      }
    });
  } else {
    selectedAccountStore.setSelectedAccount(account);
  }
};

const onClickedItem = (e: Event, account: Account) => {
  const target = e.target as HTMLElement;

  focus(account);
  if (target.innerHTML.includes("location")) {
    if (!account.hasLocation) {
      $q.notify({
        message: "Esta cuenta no tiene geolocalización",
        color: "red",
        position: "bottom-right",
        timeout: 500,
      });
    }
  } else {
    dialogStore.openNewDrawer(shallowRef(AccountDetailsPage));
  }
  target.scrollIntoView({ behavior: "smooth", block: "center" });
};
</script>
<template>
  <div class="column no-wrap" style="height: 100vh; max-height: 100vh">
    <HeaderPage title="Cuentas" />
    <div class="q-pa-sm">
      <div class="row items-center q-gutter-x-sm no-wrap">
        <q-input
          rounded
          outlined
          dense
          label="Buscar cuenta"
          debounce="2000"
          style="flex-grow: 1"
          v-model="easyFilter"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
          <template #after>
            <q-btn
              round
              flat
              padding="xs"
              @click="openFilter"
              icon="o_filter_list"
            >
              <q-badge
                v-if="advancedFilterStore.existSomeFilterPlanning.length > 0"
                color="orange"
                floating
                rounded
              ></q-badge>
            </q-btn>
          </template>
          <template #append>
            <q-icon name="o_help_outline">
              <q-tooltip>
                Busqueda por: Nombre, Nombre comercial, NIT - CI, Correo
                electronico, Número de contacto
              </q-tooltip>
            </q-icon>
          </template>
        </q-input>
      </div>
    </div>
    <q-tabs
      inline-label
      active-color="black"
      v-model="withLocation"
      dense
      align="justify"
      no-caps
      class="bg-grey-2 text-grey-6 q-mb-xs"
    >
      <q-tab v-for="tab in panels" :key="tab.name" v-bind="tab" />
    </q-tabs>
    <AccountList
      :accounts="accounts"
      :isLoading="isLoading"
      :isFetching="isFetchingAccounts"
      :failureReason="failureReason"
      v-model="withLocation"
    >
      <template #account="{ account }">
        <q-item
          clickable
          v-ripple
          @click="onClickedItem($event, account)"
          :dark="selectedAccountStore.getSelectedAccount?.id === account.id"
          :class="{
            'bg-primary':
              selectedAccountStore.getSelectedAccount?.id === account.id,
          }"
        >
          <q-item-section avatar>
            <q-avatar
              :color="account.color"
              :style="{
                outline:
                  selectedAccountStore.getSelectedAccount?.id === account.id
                    ? '1px solid white'
                    : '2px solid transparent',
              }"
            >
              <q-icon :name="account.icon" color="white" />
            </q-avatar>
          </q-item-section>
          <q-item-section>
            <q-item-label class="ellipsis">
              {{ account.name }}
            </q-item-label>
            <q-item-label caption class="ellipsis">
              {{ account.address }}
              <q-tooltip>
                <div>
                  <strong>{{ account.address }}</strong>
                </div>
              </q-tooltip>
            </q-item-label>
            <q-item-label caption class="ellipsis">
              {{ account.zone }}
              <q-tooltip>
                <div>
                  <strong>{{ account.zone }}</strong>
                </div>
              </q-tooltip>
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-icon
              :name="account.hasLocation ? 'o_location_on' : 'o_location_off'"
              size="1.8rem"
              :color="
                account.hasLocation
                  ? selectedAccountStore.getSelectedAccount?.id === account.id
                    ? 'white'
                    : getColorByCategory('green-14')
                  : 'default'
              "
            >
              <q-tooltip
                v-if="account.hasLocation"
                anchor="top middle"
                self="center middle"
              >
                Mostrar en el mapa
              </q-tooltip>
            </q-icon>
          </q-item-section>
        </q-item>
      </template>
      <template #empty>
        <div>No se encontraron registros</div>
      </template>
    </AccountList>
    <Pager
      v-if="showPager"
      v-model:page="page"
      v-model:rowsPerPage="rowsPerPage"
      label="Cuentas"
      :limit="totalAccounts"
      :length="accounts.length"
    />
  </div>
</template>
