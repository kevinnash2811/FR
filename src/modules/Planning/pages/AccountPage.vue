<script setup lang="ts">
import { usePagination } from "@/composables";
import { useAdvancedFilterDeliveryStore } from "@/modules/Accounts/store";
import type { Account, Delivery } from "@/types";
import { getColorByCategory } from "@/utils";
import FilterDeliveries from "@accounts/components/FilterDeliveries.vue";
import { useDeliveries } from "@accounts/composables";
import { Geolocation } from "@accounts/types";
import { existSomeValue, panels } from "@accounts/utils";
import moment from "moment";
import { useQuasar } from "quasar";
import { computed, defineAsyncComponent, ref, shallowRef } from "vue";
import { useCreatePlanningStore } from "../store";
import { useSelectedRowStore } from "../store/useSelectedRowStore";
import type { PrimitiveRouteDelivery } from "../types";
import { useDialogStore } from "@/store";
const AccountList = defineAsyncComponent(
  () => import("@accounts/components/AccountList.vue"),
);

const Pager = defineAsyncComponent(() => import("@/components/Pager.vue"));
const HeaderPage = defineAsyncComponent(
  () => import("@/components/HeaderPage.vue"),
);
const { page, rowsPerPage } = usePagination();
const withLocation = ref<Geolocation>(Geolocation.ALL);
const dialogStore = useDialogStore();
const easyFilter = ref<string>("");
const advancedFilterDeliveryStore = useAdvancedFilterDeliveryStore();

const {
  isLoading,
  failureReason,
  deliveries,
  isFetchingDeliveries,
  showPager,
  totalDeliveries,
} = useDeliveries({
  page,
  rowsPerPage,
  withLocation,
  easyFilter,
  filter: advancedFilterDeliveryStore.filter,
});

const $q = useQuasar();
const selectedAll = computed({
  get: () => {
    return (
      deliveries.value.length > 0 && deliveries.value.every(isSelected.value)
    );
  },
  set(value: boolean) {
    if (value) {
      filteredDeliveries.value.forEach((delivery) => {
        onClickedItem(true, delivery);
      });
    } else {
      filteredDeliveries.value.forEach((delivery) => {
        onClickedItem(false, delivery);
      });
    }
  },
});
const selectedRowStore = useSelectedRowStore();

const isSelected = computed(() => {
  return (account: Account) => {
    return (
      selectedRowStore.selectedRow as PrimitiveRouteDelivery
    ).deliveries.some((delivery) => {
      return delivery.customer.id === account.id;
    });
  };
});

const onClickedItem = (value: boolean, delivery: Delivery) => {
  if (createPlanningStore.readonly) {
    $q.notify({
      type: "negative",
      message: "No se puede modificar la planificación",
      timeout: 100,
    });
    return;
  }

  if (
    createPlanningStore.deliveryRoutes.some((route) =>
      route.deliveries.some((e) => e.customer.id === delivery.id),
    ) &&
    !isSelected.value(delivery)
  ) {
    $q.notify({
      type: "negative",
      message: "La entrega ya se encuentra en otra ruta",
      timeout: 1000,
    });
    return;
  }

  const row = selectedRowStore.selectedRow as PrimitiveRouteDelivery;
  const length = row.deliveries.length;
  const hourOfInit = moment(row.hourOfInit, "HH:mm");
  const duration = moment(row.duration, "HH:mm");
  hourOfInit.add(duration.hours() * length, "hours");
  hourOfInit.add(duration.minutes() * length, "minutes");

  const hourOfEnd = hourOfInit
    .clone()
    .add(duration.hours(), "hours")
    .add(duration.minutes(), "minutes");

  if (value) {
    createPlanningStore.shadowAccounts.push(delivery);
    row.deliveries.push({
      uid: crypto.randomUUID(),
      customer: delivery,
      hourOfEnd: hourOfEnd.format("HH:mm"),
      hourOfInit: hourOfInit.format("HH:mm"),
      duration: row.duration,
    });
    row.hourOfEnd = hourOfEnd.format("HH:mm");
    if (createPlanningStore.isUpdateMode) {
      createPlanningStore.visitsToInsert.push({
        accountId: delivery.id,
        routeId: selectedRowStore.selectedRow!.uid,
      }); // TODO: optimizar por aqui
    }
    $q.notify({
      type: "positive",
      message: "Cliente agregado correctamente",
      timeout: 100,
    });
  } else {
    createPlanningStore.shadowAccounts =
      createPlanningStore.shadowAccounts.filter(
        (account) => account.id !== delivery.id,
      );
    if (createPlanningStore.isUpdateMode) {
      createPlanningStore.visitsToInsert =
        createPlanningStore.visitsToInsert.filter(
          (visit) => visit.accountId !== delivery.id,
        );
    }
    const visit = row.deliveries.find(
      (visit) => visit.customer.id === delivery.id,
    );
    if (selectedRowStore.selectedRow && visit) {
      createPlanningStore.deletedVisits.push({
        visitId: visit.uid,
        routeId: selectedRowStore.selectedRow.uid,
        accountId: delivery.id,
      });
    }
    row.deliveries = row.deliveries.filter(
      (d) => d.customer.id !== delivery.id,
    );
  }
};
const createPlanningStore = useCreatePlanningStore();
const bySelected = ref<boolean | undefined>();
const filteredDeliveries = computed(() => {
  if (bySelected.value) {
    if (!createPlanningStore.isUpdateMode) {
      return createPlanningStore.shadowAccounts;
    }
  }
  return deliveries.value.filter(
    (delivery) =>
      bySelected.value === void 0 ||
      isSelected.value(delivery) === bySelected.value,
  );
});

const onSelected = () => {
  if (createPlanningStore.id) {
    advancedFilterDeliveryStore.filter.planificacion = createPlanningStore.id;
    advancedFilterDeliveryStore.filter.includes =
      selectedRowStore.selectedRow!.uid;
  }
  bySelected.value = true;
};

const onNotSelected = () => {
  advancedFilterDeliveryStore.filter.planificacion = "";
  advancedFilterDeliveryStore.filter.includes = "";
  bySelected.value = false;
};

const onAll = () => {
  advancedFilterDeliveryStore.filter.planificacion = "";
  advancedFilterDeliveryStore.filter.includes = "";
  bySelected.value = void 0;
};

const openFilterDelivery = () => {
  dialogStore.openNewDrawer(shallowRef(FilterDeliveries));
};
</script>

<template>
  <div style="height: 100vh" class="column no-wrap">
    <HeaderPage title="Entregas" closePopUp />
    <div class="q-pa-xs">
      <q-input
        outlined
        v-model="easyFilter"
        rounded
        dense
        label="Buscar entrega"
        debounce="2000"
        style="flex-grow: 1"
      >
        <template #after>
          <q-checkbox v-model="selectedAll">
            <q-tooltip>Seleccionar todas las entregas</q-tooltip>
          </q-checkbox>
          <q-btn icon="segment" flat round dense>
            <q-menu transition-show="scale" transition-hide="scale">
              <q-list style="min-width: 100px">
                <q-item clickable :active="bySelected">
                  <q-item-section @click="onSelected"
                    >Seleccionados</q-item-section
                  >
                </q-item>
                <q-item
                  clickable
                  :active="!bySelected && bySelected !== void 0"
                >
                  <q-item-section @click="onNotSelected"
                    >No Seleccionados</q-item-section
                  >
                </q-item>
                <q-separator />
                <q-item clickable :active="bySelected === void 0">
                  <q-item-section @click="onAll">Todos</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
            <q-badge
              color="red"
              floating
              rounded
              v-if="bySelected !== void 0"
            ></q-badge>
            <q-tooltip> Filtro por selección </q-tooltip>
          </q-btn>

          <q-btn
            icon="filter_list"
            flat
            round
            dense
            @click="openFilterDelivery"
          >
            <q-badge
              v-if="existSomeValue(advancedFilterDeliveryStore)"
              color="orange"
              floating
              rounded
            ></q-badge>
          </q-btn>
        </template>
        <template #append>
          <q-icon name="o_help_outline">
            <q-tooltip>
              Busqueda por: Nro de documento, Nombre, Nota de remisión
            </q-tooltip>
          </q-icon>
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
      :accounts="filteredDeliveries"
      :isLoading="isLoading"
      :isFetching="isFetchingDeliveries"
      :failureReason="failureReason"
      v-model="withLocation"
      @clickedItem="onClickedItem"
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
              {{ account.address || "Sin dirección" }}
            </q-item-label>
            <q-item-label caption class="ellipsis">
              {{ account.zone }}
            </q-item-label>
            <q-item-label
              caption
              class="ellipsis"
              v-if="account.dispatchs && account.firstReference"
            >
              Ref1:
              <strong>{{ account.firstReference }}</strong>
              Ref2:
              <strong>{{ account.secondReference }}</strong>
            </q-item-label>
            <q-item-label caption class="ellipsis" v-if="account.dispatchs">
              N.R.:
              <strong>{{ account.note }}</strong>
              N° Facturas:
              <strong>{{ account.quote }}</strong>
            </q-item-label>
          </q-item-section>
          <q-item-section top side>
            <q-badge color="orange-9" v-if="account.dispatchs">
              <div>
                {{ account.dispatchs }}
                <q-icon name="o_local_shipping" />
                <q-tooltip>
                  <div
                    v-for="entrega of account.entregas"
                    :key="entrega.entrega_fecha"
                  >
                    <strong>{{
                      moment(entrega.entrega_fecha).format("dddd, DD/MM/YYYY")
                    }}</strong>
                  </div>
                </q-tooltip>
              </div>
            </q-badge>
          </q-item-section>
          <q-item-section side>
            <q-icon
              :name="account.hasLocation ? 'o_location_on' : 'o_location_off'"
              size="1.8rem"
              :color="
                isSelected(account)
                  ? 'white'
                  : getColorByCategory(account.category)
              "
            >
            </q-icon>
          </q-item-section>
        </q-item>
      </template>
      <template #empty> No se encontraron entregas </template>
    </AccountList>
        <Pager
      v-if="showPager"
      v-model:page="page"
      :limit="totalDeliveries"
      :length="deliveries.length"
      v-model:rows-per-page="rowsPerPage"
    />
  </div>
</template>

<style scoped></style>
