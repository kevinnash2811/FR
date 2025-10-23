<script setup lang="ts">
import { useAdvancedFilterStore } from "@/modules/Accounts/store";
import type { Account } from "@/types";
import { getColorByCategory } from "@/utils";
import { useAccounts } from "@accounts/composables";
import { Geolocation } from "@accounts/types";
import type { PrimitiveRouteVisit } from "@/modules/Planning/types";
import moment from "moment";
import { useQuasar } from "quasar";
import { panels } from "@accounts/utils";
import { computed, defineAsyncComponent, ref } from "vue";
import { useCreatePlanningStore } from "../store";
import { useSelectedRowStore } from "../store/useSelectedRowStore";
import { usePagination } from "@/composables";
import { useDialogStore } from "@/store";
import { shallowRef } from "vue";
import FiltersPage from "@/pages/FiltersPage.vue";
const AccountList = defineAsyncComponent(
  () => import("@accounts/components/AccountList.vue"),
);

const Pager = defineAsyncComponent(() => import("@/components/Pager.vue"));
const HeaderPage = defineAsyncComponent(
  () => import("@/components/HeaderPage.vue"),
);

enum SelectedFilter {
  SELECTED = "SELECTED",
  NOT_SELECTED = "NOT_SELECTED",
  NOT_PLANING = "NOT_PLANING",
  ALL = "ALL",
}

const advancedFilterStore = useAdvancedFilterStore();
const createPlanningStore = useCreatePlanningStore();
const dialogStore = useDialogStore();
const easyFilter = ref<string>("");
const withLocation = ref<Geolocation>(Geolocation.ALL);
const bySelected = ref<SelectedFilter>(SelectedFilter.ALL);
const { page, rowsPerPage } = usePagination();
const {
  accounts,
  isLoading,
  totalAccounts,
  isFetchingAccounts,
  failureReason,
  showPager
} = useAccounts({
  page,
  rowsPerPage,
  withLocation,
  filter: advancedFilterStore.filter,
  easyFilter,
});

const $q = useQuasar();
const selectedAll = computed({
  get: () => {
    return accounts.value.length > 0 && accounts.value.every(isSelected.value);
  },
  set(value: boolean) {
    if (value) {
      accounts.value.forEach((account) => {
        onClickedItem(true, account);
      });
    } else {
      accounts.value.forEach((account) => {
        onClickedItem(false, account);
      });
    }
  },
});

const selectedRowStore = useSelectedRowStore();
const isSelected = computed(() => {
  return (account: Account) => {
    return (selectedRowStore.selectedRow as PrimitiveRouteVisit).visits.some(
      (visit) => visit.customer.id === account.id,
    );
  };
});
const onClickedItem = (value: boolean, account: Account) => {
  if (createPlanningStore.readonly) {
    $q.notify({
      type: "negative",
      message: "No se puede modificar la planificación",
      timeout: 100,
    });
    return;
  }
  const row = selectedRowStore.selectedRow as PrimitiveRouteVisit;
  const length = row.visits.length;
  const hourOfInit = moment(row.hourOfInit, "HH:mm");
  const duration = moment(row.duration, "HH:mm");
  hourOfInit.add(duration.hours() * length, "hours");
  hourOfInit.add(duration.minutes() * length, "minutes");

  const hourOfEnd = hourOfInit
    .clone()
    .add(duration.hours(), "hours")
    .add(duration.minutes(), "minutes");

  if (value) {
    createPlanningStore.shadowAccounts.push(account);

    row.visits.push({
      uid: crypto.randomUUID(),
      customer: account,
      hourOfEnd: hourOfEnd.format("HH:mm"),
      hourOfInit: hourOfInit.format("HH:mm"),
      duration: row.duration,
      dateOfInit: row.dateOfInit,
    });
    row.hourOfEnd = hourOfEnd.format("HH:mm");
    $q.notify({
      type: "positive",
      message: "Cliente agregado correctamente",
      timeout: 100,
    });
  } else {
    createPlanningStore.shadowAccounts =
      createPlanningStore.shadowAccounts.filter(
        (shadowAccount) => shadowAccount.id !== account.id,
      );
    const visit = row.visits.find((visit) => visit.customer.id === account.id);
    if (selectedRowStore.selectedRow && visit) {
      createPlanningStore.deletedVisits.push({
        visitId: visit.uid,
        routeId: selectedRowStore.selectedRow.uid,
        accountId: account.id,
      });
    }

    row.visits = row.visits.filter((visit) => visit.customer.id !== account.id);
  }
};

const filteredAccounts = computed(() => {
  if (bySelected.value === SelectedFilter.SELECTED) {
    if (!createPlanningStore.isUpdateMode) {
      return createPlanningStore.shadowAccounts;
    }
  }
  return accounts.value.filter((account) => {
    return bySelected.value === SelectedFilter.SELECTED
      ? isSelected.value(account)
      : bySelected.value === SelectedFilter.NOT_SELECTED
      ? !isSelected.value(account)
      : true;
  });
});
const coincidences = computed(() => {
  return (account: Account) => {
    return createPlanningStore.visitingRoutes.filter((route) =>
      route.visits.some((visit) => visit.customer.id === account.id),
    );
  };
});

const onNotPlanificatedFilter = () => {
  if (createPlanningStore.id) {
    advancedFilterStore.filter.exclude = createPlanningStore.id;
    advancedFilterStore.filter.planificacion = "";
    advancedFilterStore.filter.includes = "";
  }
  // TODO: ALERTAR EN CASO DE NO HABER PLANIFICACIÓN
  bySelected.value = SelectedFilter.NOT_PLANING;
};
const openVisitDialog = () => {
  dialogStore.openNewDrawer(shallowRef(FiltersPage));
};
const onSelectedFilter = () => {
  bySelected.value = SelectedFilter.SELECTED;
  if (createPlanningStore.id) {
    advancedFilterStore.filter.planificacion = createPlanningStore.id;
    advancedFilterStore.filter.includes = selectedRowStore.selectedRow!.uid;
  }
};

const onSelectAll = () => {
  bySelected.value = SelectedFilter.ALL;
  advancedFilterStore.filter.exclude = "";
  advancedFilterStore.filter.planificacion = "";
  advancedFilterStore.filter.includes = "";
};

const closeDialog = () => {
  dialogStore.closeCurrentDrawer();
};
</script>

<template>
  <div style="height: 100vh; max-height: 100vh" class="column no-wrap">
    <HeaderPage
      title="Cuentas"
      @back="dialogStore.closeCurrentDrawer"
      :showBackButton="false"
      :closePopUp="true"
    />
    <div class="q-pa-xs">
      <q-input
        rounded
        outlined
        dense
        label="Nombre | Dirección"
        debounce="500"
        v-model="easyFilter"
        style="width: 100%"
      >
        <template #after>
          <q-checkbox v-model="selectedAll">
            <q-tooltip>Seleccionar todas las cuentas</q-tooltip>
          </q-checkbox>
          <q-btn icon="segment" flat round dense>
            <q-menu transition-show="scale" transition-hide="scale">
              <q-list style="min-width: 100px">
                <q-item
                  clickable
                  :active="bySelected === SelectedFilter.SELECTED"
                >
                  <q-item-section @click="onSelectedFilter"
                    >Seleccionados</q-item-section
                  >
                </q-item>
                <q-item
                  clickable
                  :active="bySelected === SelectedFilter.NOT_SELECTED"
                >
                  <q-item-section
                    @click="
                      (bySelected = SelectedFilter.NOT_SELECTED),
                        (advancedFilterStore.filter.exclude = '')
                    "
                    >No Seleccionados</q-item-section
                  >
                </q-item>
                <q-item
                  v-if="createPlanningStore.isUpdateMode"
                  clickable
                  :active="bySelected === SelectedFilter.NOT_PLANING"
                >
                  <q-item-section @click="onNotPlanificatedFilter"
                    >No planificados</q-item-section
                  >
                </q-item>
                <q-separator />
                <q-item clickable :active="bySelected === SelectedFilter.ALL">
                  <q-item-section @click="onSelectAll">Todos</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
            <q-badge
              color="red"
              floating
              rounded
              v-if="bySelected !== SelectedFilter.ALL"
            ></q-badge>
            <q-tooltip> Filtro por selección </q-tooltip>
          </q-btn>

          <q-btn icon="filter_list" flat round dense @click="openVisitDialog">
            <q-badge
              v-if="advancedFilterStore.existSomeFilterPlanning.length > 0"
              color="orange"
              class="q-ml-xs"
              floating
              rounded
            >
              {{ advancedFilterStore.existSomeFilterPlanning.length }}
            </q-badge>
          </q-btn>
        </template>
      </q-input>
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
      :accounts="filteredAccounts"
      :isLoading="isLoading"
      :isFetching="isFetchingAccounts"
      :failureReason="failureReason"
      v-model="withLocation"
    >
      <template #account="{ account }">
        <q-item
          clickable
          v-ripple
          @click="onClickedItem(!isSelected(account), account)"
          :dark="isSelected(account)"
          :class="{
            'bg-primary': isSelected(account),
          }"
        >
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
            <q-item-label caption>
              {{ account.zone }}
              <q-badge
                v-if="coincidences(account).length > 0"
                size="xs"
                dense
                color="orange-9 text-white"
                rounded
                >{{ coincidences(account).length }}
              </q-badge>
              <q-tooltip>
                <div>
                  <strong>{{ account.zone }}</strong>
                </div>
              </q-tooltip>
            </q-item-label>
          </q-item-section>
          <q-item-section side>
            <div class="row items-center justify-center">
              <span class="q-mr-xs">Cat 1:</span>
              <q-avatar
                :color="getColorByCategory(account.category)"
                size="sm"
                class="text-white"
              >
                {{ account.category }}
              </q-avatar>
            </div>
            <div class="row items-center justify-center">
              <span class="q-mr-xs">Cat 2:</span>
              <q-avatar
                :color="getColorByCategory(account.secondCategory)"
                size="sm"
                class="text-white q-mt-xs"
              >
                {{ account.secondCategory }}
              </q-avatar>
            </div>
          </q-item-section>
        </q-item>
      </template>
      <template #empty> No se encontraron registros </template>
    </AccountList>

    <Pager
      v-if="showPager"
      v-model:page="page"
      v-model:rows-per-page="rowsPerPage"
      :limit="totalAccounts"
      :length="accounts.length"
    />
    <q-btn
      v-if="accounts.length > 0"
      @click="closeDialog"
      color="secondary"
      size="sm"
      label="Agregar cuentas"
      style="
        position: absolute;
        bottom: 60px;
        left: 70%;
        transform: translateX(-50%);
        text-transform: none;
      "
    >
      <q-badge color="red" floating rounded>{{
        selectedRowStore.selectedRow.visits.length
      }}</q-badge>
    </q-btn>
  </div>
</template>
<style scoped></style>
