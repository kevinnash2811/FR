<script setup lang="ts">
import { useAdvancedFilterDeliveryStore } from "@/modules/Accounts/store";
import { useDragAndDropTableRow } from "@/modules/Planning/composables/useDragAndDropTableRow";
import { deliveryRouteColumns } from "@/modules/Planning/helpers";
import {
  useCreatePlanningStore,
  useSelectedRowStore,
} from "@/modules/Planning/store";
import type { PrimitiveRouteDelivery } from "@/modules/Planning/types";
import { useDialogStore } from "@/store";
import AccountPage from "@planning/pages/AccountPage.vue";
import moment from "moment";
import { useQuasar } from "quasar";
import { computed, ref, shallowRef } from "vue";
import AccountVisitTable from "../components/AccountVisitTable.vue";
import { usePlanningServices } from "../composables";

const createPlanningStore = useCreatePlanningStore();
const dialogStore = useDialogStore();

const selectedRowStore = useSelectedRowStore();
const deliveryFilterStore = useAdvancedFilterDeliveryStore();
const { duplicatePlanning, deletePlanning } = usePlanningServices();
const $q = useQuasar();
const onAddDelivery = (row: PrimitiveRouteDelivery) => {
  if (createPlanningStore.readonly) {
    const dates = row.deliveries
      .flatMap((delivery) => {
        return delivery.customer.entregas.map((entrega) => {
          return moment(entrega.entrega_fecha);
        });
      })
      .sort((a, b) => a.diff(b, "minutes"));

    if (dates.length) {
      deliveryFilterStore.filter.date = {
        from: dates[0].format("YYYY/MM/DD"),
        to: dates[dates.length - 1].format("YYYY/MM/DD"),
      };
    }
  }
  selectedRowStore.setSelectedRow(row);
  // dialogStore.toggle("dispatchAccounts", true);
  dialogStore.openNewDrawer(shallowRef(AccountPage));
};
const onSwapDeliveries = (
  from: number,
  to: number,
  route: PrimitiveRouteDelivery,
) => {
  createPlanningStore.swapDelivery(from, to, route);
};
const { draggedIndex, onDragEnd, onDragOver, onDragStart, onDrop, overIndex } =
  useDragAndDropTableRow((from, to) => {
    createPlanningStore.setPositionDeliveryRoute(from, to);
  });

const onAddDeliveryRoute = () => {
  if (!createPlanningStore.isValidDateOfInit()) {
    $q.notify({
      type: "negative",
      message: "Debe seleccionar un rango de fecha",
    });
    return;
  }

  if (createPlanningStore.assignedVehicles.length === 0) {
    $q.notify({
      message: "Debe asignar vehículos a la planificación",
      color: "negative",
    });

    return;
  }

  if (
    createPlanningStore.deliveryRoutes[
      createPlanningStore.deliveryRoutes.length - 1
    ] &&
    createPlanningStore.to.isSame(
      moment(
        createPlanningStore.deliveryRoutes[
          createPlanningStore.deliveryRoutes.length - 1
        ].dateOfInit,
        "dddd, DD/MMMM/YYYY",
      ),
    )
  ) {
    $q.dialog({
      title: "Advertencia",
      message:
        "Desearía agregar una nueva ruta para el día siguiente?. Se cambiará la fecha de la planificación.",
      ok: {
        color: "primary",
        label: "Aceptar",
      },
      cancel: {
        color: "negative",
        label: "Cancelar",
      },
    }).onOk(() => {
      createPlanningStore.addDeliveryRoute();

      if (typeof createPlanningStore.date === "string") {
        createPlanningStore.date = {
          from: createPlanningStore.date,
          to: moment(createPlanningStore.date, "dddd, DD/MMMM/YYYY")
            .add(1, "days")
            .format("dddd, DD/MMMM/YYYY"),
        };
      } else {
        createPlanningStore.date.to = moment(
          createPlanningStore.date.to,
          "dddd, DD/MMMM/YYYY",
        )
          .add(1, "days")
          .format("dddd, DD/MMMM/YYYY");
      }
    });
  } else {
    createPlanningStore.addDeliveryRoute();
  }
};

const onUpdateDuration = (value: string, route: PrimitiveRouteDelivery) => {
  route.deliveries.forEach((delivery, index) => {
    const hourOfInit = moment(delivery.hourOfInit, "HH:mm");
    const duration = moment(value, "HH:mm");
    const hourOfEnd = hourOfInit
      .clone()
      .add(duration.hours(), "hours")
      .add(duration.minutes(), "minutes");

    if (route.deliveries[index + 1]) {
      route.deliveries[index + 1].hourOfInit = hourOfEnd.format("HH:mm");
    }

    delivery.duration = value;
    delivery.hourOfEnd = hourOfEnd.format("HH:mm");
  });
  if (route.deliveries[route.deliveries.length - 1]) {
    route.hourOfEnd = route.deliveries[route.deliveries.length - 1].hourOfEnd;
  }
};

const onUpdateHourOfInit = (value: string, route: PrimitiveRouteDelivery) => {
  route.deliveries.forEach((delivery, index) => {
    const hourOfInit = moment(value, "HH:mm");
    const duration = moment(delivery.duration, "HH:mm");
    const hourOfEnd = hourOfInit
      .clone()
      .add(duration.hours() * (index + 1), "hours")
      .add(duration.minutes() * (index + 1), "minutes");

    if (index > 0) {
      delivery.hourOfInit = hourOfInit
        .clone()
        .add(duration.hours() * index, "hours")
        .add(duration.minutes() * index, "minutes")
        .format("HH:mm");
    } else {
      delivery.hourOfInit = value;
    }
    delivery.hourOfEnd = hourOfEnd.format("HH:mm");
  });

  if (route.deliveries[route.deliveries.length - 1]) {
    route.hourOfEnd = route.deliveries[route.deliveries.length - 1].hourOfEnd;
  }
};

const onDelete = () => {
  $q.dialog({
    title: "Eliminar planificación",
    message: "¿Está seguro de eliminar la planificación?",
    ok: {
      label: "Aceptar",
      color: "negative",
      push: true,
    },
    cancel: {
      label: "Cancelar",
      color: "grey-8",
      push: true,
    },
  }).onOk(() => {
    deletePlanning();
  });
};
const maximizedToggle = ref(true);
const onDuplicate = () => {
  $q.dialog({
    title: "Duplicar planificación",
    ok: {
      label: "Renombrar",
      color: "primary",
      noCaps: true,
      push: true,
    },
    cancel: {
      label: "Solo duplicar",
      color: "orange-8",
      noCaps: true,
      push: true,
      onclick: () => {
        duplicatePlanning({});
      },
    },
    prompt: {
      model: createPlanningStore.name,
      label: "Nombre de la planificación",
      isValid: (val) => val.length > 2,
      type: "text",
    },
  }).onOk((name) => {
    duplicatePlanning({ name });
  });
};

const isMobile = computed(() => {
  return $q.screen.xs;
});

const openDialogV = (row, index) => {
  selectedRowStore.setSelectedRow(row, index);
  dialogStore.openNewDrawer(shallowRef(AccountVisitTable), { index });
};
</script>

<template>
  <q-table
    v-if="!isMobile"
    :rows="createPlanningStore.deliveryRoutes"
    :columns="deliveryRouteColumns"
    title="Rutas de entrega"
    row-key="uid"
    class="shadow-2 my-sticky-last-column-table"
    :rows-per-page-options="[0]"
    style="height: 100%; max-width: 100%"
    no-data-label="Sin rutas definidas"
  >
    <template #top="props">
      <q-space></q-space>
      <q-btn
        icon="delete"
        v-if="createPlanningStore.isUpdateMode"
        color="negative"
        noCaps
        padding="xs"
        class="q-mr-xs"
        @click="onDelete"
      >
        <q-tooltip>Eliminar esta planificación</q-tooltip>
      </q-btn>
      <q-btn
        icon="content_copy"
        v-if="createPlanningStore.isUpdateMode"
        color="primary"
        noCaps
        padding="xs"
        class="q-mr-xs"
        @click="onDuplicate"
      >
        <q-tooltip>Duplicar esta planificación</q-tooltip>
      </q-btn>
      <q-btn
        v-if="!createPlanningStore.readonly"
        color="primary"
        noCaps
        icon="add"
        dense
        @click="onAddDeliveryRoute"
      >
        <q-tooltip>Agregar ruta</q-tooltip>
      </q-btn>
      <q-btn
        flat
        round
        dense
        :icon="props.inFullscreen ? 'fullscreen_exit' : 'fullscreen'"
        @click="props.toggleFullscreen"
        class="q-ml-md"
      />
    </template>
    <template #header="props">
      <q-tr :props="props" class="bg-blue-grey-1">
        <q-th auto-width />
        <q-th v-for="col in props.cols" :key="col.name" :props="props">
          {{ col.label }}
        </q-th>
        <q-th auto-width />
      </q-tr>
    </template>
    <template #body="props">
      <q-tr
        :props="props"
        :class="{
          'dragged-row': draggedIndex === props.rowIndex,
          'dragged-over': overIndex === props.rowIndex,
          'bg-grey-2 text-grey-5': !props.row.enabled,
        }"
        :no-hover="!props.row.enabled"
        :draggable="props.row.enabled && !createPlanningStore.readonly"
        @drop="onDrop(props.rowIndex, $event)"
        @dragend="onDragEnd"
        @dragover="
          !createPlanningStore.readonly && onDragOver(props.rowIndex, $event)
        "
        @dragstart="
          !createPlanningStore.readonly && onDragStart(props.rowIndex, $event)
        "
      >
        <q-td auto-width>
          <div class="q-gutter-x-sm">
            <q-icon
              v-if="!createPlanningStore.readonly"
              name="drag_indicator"
              role="button"
              size="sm"
              color="grey-6"
              :class="{ 'drag-indicator': props.row.enabled }"
            />
            <q-avatar size="sm" color="primary" class="text-white">
              {{ props.rowIndex + 1 }}
            </q-avatar>
          </div>
        </q-td>
        <q-td key="named" :props="props">
          {{ props.row.named }}
          <q-tooltip :offset="[0, 10]">
            {{ props.row.named }}
          </q-tooltip>
          <q-popup-edit
            v-model="props.row.named"
            auto-save
            v-slot="scope"
            separate-close-popup
            :disable="!props.row.enabled"
          >
            <q-input
              v-model="scope.value"
              hint="Debe de escribir el Nombre"
              dense
            />
          </q-popup-edit>
        </q-td>
        <q-td key="hourOfEnd" :props="props">
          {{ props.row.hourOfEnd }}
          <q-popup-edit
            v-model="props.row.hourOfEnd"
            auto-save
            v-slot="scope"
            :disable="!props.row.enabled"
          >
            <q-input
              filled
              v-model="scope.value"
              mask="time"
              :rules="['time']"
              @keyup.enter="scope.set"
            >
              <template v-slot:append>
                <q-icon name="access_time" class="cursor-pointer">
                  <q-popup-proxy
                    cover
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-time
                      v-model="scope.value"
                      dense
                      autofocus
                      counter
                      format24h
                      @keyup.enter="scope.set"
                    >
                      <div class="row items-center justify-between">
                        <q-btn
                          v-close-popup
                          label="Guardar"
                          color="primary"
                          flat
                        />
                        <q-btn
                          v-close-popup
                          label="Cancelar"
                          color="negative"
                          flat
                        />
                      </div>
                    </q-time>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </q-popup-edit>
        </q-td>
        <q-td key="dateOfInit" :props="props">
          {{ props.row.dateOfInit }}
          <q-tooltip>{{ props.row.dateOfInit }}</q-tooltip>
          <q-popup-edit
            v-model="props.row.dateOfInit"
            auto-save
            v-slot="scope"
            :disable="!props.row.enabled"
          >
            <q-input filled v-model="scope.value">
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy
                    cover
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-date v-model="scope.value" mask="dddd, DD/MMMM/YYYY">
                      <div class="row items-center justify-between">
                        <q-btn
                          v-close-popup
                          label="Guardar"
                          color="primary"
                          flat
                        />
                        <q-btn
                          v-close-popup
                          label="Cancelar"
                          color="negative"
                          flat
                        />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </q-popup-edit>
        </q-td>
        <q-td key="assignVehiclePlate" :props="props">
          {{ props.row.assignVehicle.plate }}
          <q-popup-edit
            v-model="props.row.assignVehicle.plate"
            auto-save
            v-slot="scope"
            :disable="!props.row.enabled"
          >
            <q-select
              v-model="scope.value"
              dense
              autofocus
              counter
              emit-value
              map-options
              option-label="name"
              option-value="name"
              @update:model-value="
                (value) => {
                  const vehicle = createPlanningStore.assignedVehicles.find(
                    (vehicle) => vehicle.name === value,
                  );

                  if (vehicle) {
                    const mainDriver = vehicle.conductores?.find(
                      (driver) => driver.tipo_c === 'P01',
                    );
                    if (mainDriver) {
                      const dateOfInit = moment(
                        props.row.dateOfInit,
                        'dddd, DD/MMMM/YYYY',
                      );
                      props.row.named = `${dateOfInit.format(
                        'dddd, DD [de] MMMM [-]',
                      )} ${props.row.hourOfInit}, ${mainDriver.user_name}`;
                      props.row.assignVehicle = {
                        plate: vehicle.name,
                        id: vehicle.id,
                        capacity: vehicle.capacidad_1_c,
                        driver: mainDriver,
                      };
                    }
                  }
                  scope.set();
                }
              "
              :options="createPlanningStore.assignedVehicles"
            />
          </q-popup-edit>
        </q-td>
        <q-td key="assignVehicleDriver" :props="props">
          {{ props.row.assignVehicle.driver.user_name }}
          <q-tooltip>{{ props.row.assignVehicle.driver.user_name }}</q-tooltip>
          <q-popup-edit
            v-model="props.row.assignVehicle.driver"
            auto-save
            v-slot="scope"
            :disable="!props.row.enabled"
          >
            <q-select
              label="Conductor"
              outlined
              dense
              v-model="props.row.assignVehicle.driver"
              emit-value
              map-options
              option-label="user_name"
              :options="
                createPlanningStore.assignedVehicles.find(
                  (vehicle) => vehicle.name === props.row.assignVehicle.plate,
                )?.conductores
              "
              @update:model-value="
                (value) => {
                  const dateOfInit = moment(
                    props.row.dateOfInit,
                    'dddd, DD/MMMM/YYYY',
                  );

                  props.row.named = `${dateOfInit.format(
                    'dddd, DD [de] MMMM [-]',
                  )} ${props.row.hourOfInit}, ${value.user_name}`;

                  scope.set();
                }
              "
            >
              <template #selected-item="{ opt }">
                <div :bind="opt">
                  <q-item-section>
                    <q-item-label class="ellipsis">{{
                      opt.user_name
                    }}</q-item-label>
                  </q-item-section>
                </div>
              </template>
              <template #append>
                <q-icon name="o_airline_seat_recline_normal" size="1.5rem">
                </q-icon>
              </template>
              <template #no-option>
                <q-item class="text-capitalize">
                  <q-item-section>
                    <q-item-label class="text-grey">
                      No hay conductores disponibles
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </q-popup-edit>
        </q-td>
        <q-td key="assignVehicleCapacity" :props="props">
          {{ props.row.assignVehicle.capacity }}
          <q-popup-edit
            v-model="props.row.assignVehicle.capacity"
            auto-save
            v-slot="scope"
            :disable="!props.row.enabled"
          >
            <q-input
              v-model="scope.value"
              dense
              autofocus
              counter
              @keyup.enter="scope.set"
            />
          </q-popup-edit>
        </q-td>
        <q-td key="hourOfInit" :props="props">
          {{ props.row.hourOfInit }}
          <q-popup-edit
            v-model="props.row.hourOfInit"
            auto-save
            v-slot="scope"
            :disable="!props.row.enabled"
            @update:model-value="
              (value) => {
                onUpdateHourOfInit(value, props.row);
              }
            "
          >
            <q-input
              filled
              v-model="scope.value"
              mask="time"
              :rules="['time']"
              @keyup.enter="scope.set"
            >
              <template v-slot:append>
                <q-icon name="access_time" class="cursor-pointer">
                  <q-popup-proxy
                    cover
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-time
                      v-model="scope.value"
                      dense
                      autofocus
                      counter
                      format24h
                      @keyup.enter="scope.set"
                    >
                      <div class="row items-center justify-between">
                        <q-btn
                          v-close-popup
                          label="Guardar"
                          color="primary"
                          flat
                        />
                        <q-btn
                          v-close-popup
                          label="Cancelar"
                          color="negative"
                          flat
                        />
                      </div>
                    </q-time>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </q-popup-edit>
        </q-td>
        <q-td key="duration" :props="props">
          {{ props.row.duration }}
          <q-popup-edit
            v-model="props.row.duration"
            auto-save
            v-slot="scope"
            separate-close-popup
            :disable="!props.row.enabled"
            @update:model-value="
              (value) => {
                onUpdateDuration(value, props.row);
              }
            "
          >
            <q-input
              filled
              v-model="scope.value"
              mask="time"
              :rules="['time']"
              @keyup.enter="scope.set"
            >
              <template v-slot:append>
                <q-icon name="access_time" class="cursor-pointer">
                  <q-popup-proxy
                    cover
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-time v-model="scope.value" format24h>
                      <div class="row items-center justify-between">
                        <q-btn
                          v-close-popup
                          label="Guardar"
                          color="primary"
                          flat
                        />
                        <q-btn
                          v-close-popup
                          label="Cancelar"
                          color="negative"
                          flat
                        />
                      </div>
                    </q-time>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </q-popup-edit>
        </q-td>
        <q-td auto-width class="q-gutter-x-xs">
          <q-btn
            round
            color="primary"
            icon="o_local_shipping"
            size="sm"
            :disabled="!props.row.enabled"
            @click="onAddDelivery(props.row)"
          >
          </q-btn>
          <q-btn-dropdown
            dropdown-icon="more_vert"
            flat
            dense
            rounded
            v-if="!createPlanningStore.readonly"
          >
            <q-list>
              <q-item
                clickable
                v-close-popup
                @click="onAddDelivery(props.row)"
                v-if="props.row.enabled"
              >
                <q-item-section side>
                  <q-icon name="o_local_shipping" text-color="white" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Agregar entrega</q-item-label>
                </q-item-section>
              </q-item>
              <q-item
                clickable
                v-close-popup
                @click="
                  createPlanningStore.cloneDeliveryRoute(
                    props.row,
                    props.rowIndex,
                  )
                "
              >
                <q-item-section side>
                  <q-icon name="content_copy" text-color="white" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Clonar ruta</q-item-label>
                </q-item-section>
              </q-item>
              <q-item
                clickable
                v-close-popup
                @click="props.row.enabled = !props.row.enabled"
              >
                <q-item-section side>
                  <q-icon
                    :name="props.row.enabled ? 'o_lock' : 'o_lock_open'"
                    text-color="white"
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label v-if="props.row.enabled"
                    >Bloquear ruta</q-item-label
                  >
                  <q-item-label v-else>Desbloquear ruta</q-item-label>
                </q-item-section>
              </q-item>
              <q-separator />
              <q-item
                clickable
                v-close-popup
                @click="createPlanningStore.removeDeliveryRoute(props.row)"
              >
                <q-item-section side>
                  <q-icon name="remove" text-color="white" />
                </q-item-section>
                <q-item-section>
                  <q-item-label> Quitar ruta </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
          <q-btn
            flat
            size="md"
            color="primary"
            dense
            round
            @click="props.expand = !props.expand"
            :icon="props.expand ? 'arrow_drop_up' : 'arrow_drop_down'"
            :disabled="!props.row.enabled"
          >
            <q-badge
              floating
              rounded
              color="negative"
              class="text-white"
              v-if="props.row.deliveries.length > 0"
            >
              {{ props.row.deliveries.length }}
            </q-badge>
          </q-btn>
        </q-td>
      </q-tr>
      <q-tr v-show="props.expand" :props="props">
        <q-td colspan="100%">
          <AccountVisitTable :index="props.rowIndex" />
        </q-td>
      </q-tr>
    </template>
    <template #no-data="{ icon, message }">
      <div class="full-width row flex-center q-gutter-sm text-warning">
        <span>{{ message }} </span>
        <q-icon size="2em" :name="icon" />
      </div>
    </template>
    <template #pagination>
      {{ createPlanningStore.deliveryRoutes.length }} Rutas -
      {{ createPlanningStore.clientsLength }} Entregas
    </template>
  </q-table>

  <div v-if="isMobile" style="height: 100vh">
    <!-- Contenedor para las tarjetas, organizadas en una cuadrícula -->
    <div
      class="q-gutter-xs"
      style="
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 5px;
        overflow-x: hidden;
        overflow-y: auto;
      "
    >
      <!-- Itera sobre las rutas de visita -->
      <div
        v-for="(row, index) in createPlanningStore.deliveryRoutes"
        :key="row.uid"
        class="q-card-wrapper"
        :class="{
          'dragged-over': overIndex === index,
          'bg-grey-2 text-grey-5': !row.enabled,
        }"
        :draggable="row.enabled && !createPlanningStore.readonly"
        @drop="onDrop(index, $event)"
        @dragend="onDragEnd"
        @dragover="!createPlanningStore.readonly && onDragOver(index, $event)"
        @dragstart="!createPlanningStore.readonly && onDragStart(index, $event)"
      >
        <!-- Tarjeta individual -->
        <q-card
          flat
          bordered
          style="
            cursor: pointer;
            border: 2px solid lightgray;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            border-radius: 15px;
            width: 99%;
          "
        >
          <q-card-section>
            <!-- Contenedor de la fila -->
            <div class="q-mb-sm">
              <div class="route-details">
                <div
                  class="route-info"
                  style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                  "
                >
                  <q-avatar
                    size="sm"
                    color="primary"
                    class="text-white"
                    style="margin-right: 16px"
                  >
                    {{ index + 1 }}
                  </q-avatar>

                  <div style="flex-grow: 1">
                    <div class="field">
                      <div class="row items-center no-wrap">
                        <div class="col-12">
                          <q-icon
                            name="calendar_month"
                            color="primary"
                            class="q-mx-xs"
                          />
                          <span style="font-size: 13px">{{
                            row.dateOfInit
                          }}</span>
                          <q-popup-edit
                            v-model="row.dateOfInit"
                            auto-save
                            v-slot="scope"
                            :disable="
                              !row.enabled || createPlanningStore.readonly
                            "
                          >
                            <q-input filled v-model="scope.value">
                              <template v-slot:append>
                                <q-icon name="event" class="cursor-pointer">
                                  <q-popup-proxy
                                    cover
                                    transition-show="scale"
                                    transition-hide="scale"
                                  >
                                    <q-date
                                      v-model="scope.value"
                                      mask="dddd, DD/MMMM/YYYY"
                                    >
                                      <div
                                        class="row items-center justify-between"
                                      >
                                        <q-btn
                                          v-close-popup
                                          label="Guardar"
                                          color="primary"
                                          flat
                                        />
                                        <q-btn
                                          v-close-popup
                                          label="Cancelar"
                                          color="negative"
                                          flat
                                        />
                                      </div>
                                    </q-date>
                                  </q-popup-proxy>
                                </q-icon>
                              </template>
                            </q-input>
                          </q-popup-edit>
                        </div>

                        <div
                          class="col-1"
                          style="display: flex; justify-content: flex-end"
                        >
                          <q-btn-dropdown
                            dropdown-icon="more_vert"
                            flat
                            dense
                            rounded
                            v-if="!createPlanningStore.readonly"
                          >
                            <q-list>
                              <q-item
                                clickable
                                v-close-popup
                                @click="
                                  createPlanningStore.cloneDeliveryRoute(
                                    row,
                                    index,
                                  )
                                "
                              >
                                <q-item-section side>
                                  <q-icon
                                    name="content_copy"
                                    text-color="white"
                                  />
                                </q-item-section>
                                <q-item-section>
                                  <q-item-label>Clonar ruta</q-item-label>
                                </q-item-section>
                              </q-item>

                              <q-item
                                clickable
                                v-close-popup
                                @click="row.enabled = !row.enabled"
                              >
                                <q-item-section side>
                                  <q-icon
                                    :name="
                                      row.enabled ? 'o_lock' : 'o_lock_open'
                                    "
                                    text-color="white"
                                  />
                                </q-item-section>
                                <q-item-section>
                                  <q-item-label v-if="row.enabled"
                                    >Bloquear ruta</q-item-label
                                  >
                                  <q-item-label v-else
                                    >Desbloquear ruta</q-item-label
                                  >
                                </q-item-section>
                              </q-item>
                              <q-separator />
                              <q-item
                                clickable
                                v-close-popup
                                @click="
                                  createPlanningStore.removeDeliveryRoute(row)
                                "
                              >
                                <q-item-section side>
                                  <q-icon name="remove" text-color="white" />
                                </q-item-section>
                                <q-item-section>
                                  <q-item-label> Quitar ruta </q-item-label>
                                </q-item-section>
                              </q-item>
                            </q-list>
                          </q-btn-dropdown>
                        </div>
                      </div>
                    </div>

                    <div class="row">
                      <div class="col-5">
                        <q-icon
                          name="numbers"
                          color="primary"
                          class="q-mx-xs"
                        />
                        <span style="font-size: 14px">{{
                          row.assignVehicle.plate
                        }}</span>
                        <q-popup-edit
                          v-model="row.assignVehicle.plate"
                          auto-save
                          v-slot="scope"
                          :disable="!row.enabled"
                        >
                          <q-select
                            v-model="scope.value"
                            dense
                            autofocus
                            counter
                            emit-value
                            map-options
                            option-label="name"
                            option-value="name"
                            @update:model-value="
                              (value) => {
                                const vehicle =
                                  createPlanningStore.assignedVehicles.find(
                                    (vehicle) => vehicle.name === value,
                                  );

                                if (vehicle) {
                                  const mainDriver = vehicle.conductores?.find(
                                    (driver) => driver.tipo_c === 'P01',
                                  );
                                  if (mainDriver) {
                                    const dateOfInit = moment(
                                      row.dateOfInit,
                                      'dddd, DD/MMMM/YYYY',
                                    );
                                    row.named = `${dateOfInit.format(
                                      'dddd, DD [de] MMMM [-]',
                                    )} ${row.hourOfInit}, ${
                                      mainDriver.user_name
                                    }`;
                                    row.assignVehicle = {
                                      plate: vehicle.name,
                                      id: vehicle.id,
                                      capacity: vehicle.capacidad_1_c,
                                      driver: mainDriver,
                                    };
                                  }
                                }
                                scope.set();
                              }
                            "
                            :options="createPlanningStore.assignedVehicles"
                          />
                        </q-popup-edit>
                      </div>
                      <div class="col-7">
                        <q-icon
                          name="local_shipping"
                          color="primary"
                          class="q-mx-xs"
                        />
                        <span style="font-size: 14px">{{
                          row.assignVehicle.capacity
                        }}</span>
                        <q-popup-edit
                          v-model="row.assignVehicle.capacity"
                          auto-save
                          v-slot="scope"
                          :disable="!row.enabled"
                        >
                          <q-input
                            v-model="scope.value"
                            dense
                            autofocus
                            counter
                            @keyup.enter="scope.set"
                          />
                        </q-popup-edit>
                      </div>
                    </div>
                    <q-icon name="badge" color="primary" class="q-mx-xs" />
                    <span style="font-size: 13px">{{
                      row.assignVehicle.driver.user_name
                    }}</span>
                    <q-popup-edit
                      v-model="row.assignVehicle.driver"
                      auto-save
                      v-slot="scope"
                      :disable="!row.enabled"
                    >
                      <q-select
                        label="Conductor"
                        outlined
                        dense
                        v-model="row.assignVehicle.driver"
                        emit-value
                        map-options
                        option-label="user_name"
                        :options="
                          createPlanningStore.assignedVehicles.find(
                            (vehicle) =>
                              vehicle.name === row.assignVehicle.plate,
                          )?.conductores
                        "
                        @update:model-value="
                          (value) => {
                            const dateOfInit = moment(
                              row.dateOfInit,
                              'dddd, DD/MMMM/YYYY',
                            );

                            row.named = `${dateOfInit.format(
                              'dddd, DD [de] MMMM [-]',
                            )} ${row.hourOfInit}, ${value.user_name}`;

                            scope.set();
                          }
                        "
                      >
                        <template #selected-item="{ opt }">
                          <div :bind="opt">
                            <q-item-section>
                              <q-item-label class="ellipsis">{{
                                opt.user_name
                              }}</q-item-label>
                            </q-item-section>
                          </div>
                        </template>
                        <template #append>
                          <q-icon
                            name="o_airline_seat_recline_normal"
                            size="1.5rem"
                          >
                          </q-icon>
                        </template>
                        <template #no-option>
                          <q-item class="text-capitalize">
                            <q-item-section>
                              <q-item-label class="text-grey">
                                No hay conductores disponibles
                              </q-item-label>
                            </q-item-section>
                          </q-item>
                        </template>
                      </q-select>
                    </q-popup-edit>

                    <div class="row">
                      <div class="col-4">
                        <label style="font-size: 13px">HoraInicio</label>
                        <span>{{ row.hourOfInit }}</span>
                        <q-popup-edit
                          v-model="row.hourOfInit"
                          auto-save
                          v-slot="scope"
                          :disable="
                            !row.enabled || createPlanningStore.readonly
                          "
                          @update:model-value="
                            (value) => onUpdateHourOfInit(value, row)
                          "
                        >
                          <q-input
                            class="q-input-xs text-sm"
                            dense
                            style="width: 70px; margin-top: -11px"
                            filled
                            v-model="scope.value"
                            mask="time"
                            :rules="['time']"
                            @keyup.enter="scope.set"
                          >
                            <template v-slot:append>
                              <q-icon name="access_time" class="cursor-pointer">
                                <q-popup-proxy
                                  cover
                                  transition-show="scale"
                                  transition-hide="scale"
                                >
                                  <q-time v-model="scope.value" format24h>
                                    <div
                                      class="row items-center justify-between"
                                    >
                                      <q-btn
                                        v-close-popup
                                        label="Guardar"
                                        color="primary"
                                        flat
                                      />
                                      <q-btn
                                        v-close-popup
                                        label="Cancelar"
                                        color="negative"
                                        flat
                                      />
                                    </div>
                                  </q-time>
                                </q-popup-proxy>
                              </q-icon>
                            </template>
                          </q-input>
                        </q-popup-edit>
                      </div>
                      <div class="col-4">
                        <label style="font-size: 13px">Duración</label>
                        <span>{{ row.duration }}</span>
                        <q-popup-edit
                          v-model="row.duration"
                          auto-save
                          v-slot="scope"
                          :disable="
                            !row.enabled || createPlanningStore.readonly
                          "
                          @update:model-value="
                            (value) => onUpdateDuration(value, row)
                          "
                        >
                          <q-input
                            class="q-input-xs text-sm"
                            dense
                            style="width: 70px; margin-top: -11px"
                            v-model="scope.value"
                            mask="time"
                            :rules="['time']"
                            @keyup.enter="scope.set"
                          >
                            <template v-slot:append>
                              <q-icon name="access_time" class="cursor-pointer">
                                <q-popup-proxy
                                  cover
                                  transition-show="scale"
                                  transition-hide="scale"
                                >
                                  <q-time v-model="scope.value" format24h>
                                    <div
                                      class="row items-center justify-between"
                                    >
                                      <q-btn
                                        v-close-popup
                                        label="Guardar"
                                        color="primary"
                                        flat
                                      />
                                      <q-btn
                                        v-close-popup
                                        label="Cancelar"
                                        color="negative"
                                        flat
                                      />
                                    </div>
                                  </q-time>
                                </q-popup-proxy>
                              </q-icon>
                            </template>
                          </q-input>
                        </q-popup-edit>
                      </div>

                      <div class="col-4">
                        <label style="font-size: 13px">HoraFin</label>
                        <span>{{ row.hourOfEnd }}</span>
                        <q-popup-edit
                          v-model="row.hourOfEnd"
                          auto-save
                          v-slot="scope"
                          :disable="
                            !row.enabled || createPlanningStore.readonly
                          "
                        >
                          <q-input
                            class="q-input-xs text-sm"
                            dense
                            style="width: 70px; margin-top: -11px"
                            v-model="scope.value"
                            mask="time"
                            :rules="['time']"
                            @keyup.enter="scope.set"
                          >
                            <template v-slot:append>
                              <q-icon name="access_time" class="cursor-pointer">
                                <q-popup-proxy
                                  cover
                                  transition-show="scale"
                                  transition-hide="scale"
                                >
                                  <q-time
                                    v-model="scope.value"
                                    dense
                                    autofocus
                                    counter
                                    format24h
                                    @keyup.enter="scope.set"
                                  >
                                    <div
                                      class="row items-center justify-between"
                                    >
                                      <q-btn
                                        v-close-popup
                                        label="Guardar"
                                        color="primary"
                                        flat
                                      />
                                      <q-btn
                                        v-close-popup
                                        label="Cancelar"
                                        color="negative"
                                        flat
                                      />
                                    </div>
                                  </q-time>
                                </q-popup-proxy>
                              </q-icon>
                            </template>
                          </q-input>
                        </q-popup-edit>
                      </div>
                    </div>
                  </div>
                  <div
                    style="
                      display: flex;
                      justify-content: flex-end;
                      align-items: center;
                    "
                  >
                    <q-btn
                      @click="openDialogV(row, index)"
                      icon="arrow_forward_ios"
                      clickable
                      v-close-popup
                      rounded
                      round
                      color="orange"
                      size="sm"
                      :disabled="!row.enabled"
                    />
                    <q-tooltip>Ver detalles de ruta</q-tooltip>
                    <q-badge
                      v-if="row.deliveries.length > 0"
                      class="text-white"
                      style="
                        position: relative;
                        top: -8px;
                        right: -8px;
                        background-color: transparent;
                      "
                    >
                      <div
                        style="
                          position: absolute;
                          top: -3px;
                          right: -8px;
                          background-color: red;
                          border-radius: 50%;
                          padding: 2px 6px;
                          font-size: 12px;
                          color: white;
                        "
                      >
                        {{ row.deliveries.length }}
                      </div>
                    </q-badge>
                  </div>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div
      class="row justify-center"
      style="margin-right: 10px; padding-top: 15px"
    >
      <q-btn
        v-if="!createPlanningStore.readonly"
        color="primary"
        noCaps
        icon="add"
        rounded
        padding="md"
        @click="onAddDeliveryRoute"
      >
        <q-tooltip>Agregar ruta</q-tooltip>
      </q-btn>
    </div>
  </div>
</template>

<style>
.dragged-row {
  background-color: #f5f5f5;
}

.drag-indicator:hover {
  cursor: grab;
}

.dragged-over {
  background-color: #f5f5f5;

  transition: background-color 500ms;

  box-shadow: 0 0 0 2px #2196f3;
}

.my-sticky-last-column-table {
  /* specifying max-width so the example can
    highlight the sticky column on any browser window */
  max-width: 600px;
}

.my-sticky-last-column-table thead tr:last-child th:last-child {
  /* bg color is important for th; just specify one */
  background-color: #eceff1;
}

.my-sticky-last-column-table td:last-child {
  background-color: white;
}

.my-sticky-last-column-table th:last-child,
.my-sticky-last-column-table td:last-child {
  position: sticky;
  right: 0;
  z-index: 1;
}

.dragged-over {
  background-color: #f5f5f5;

  transition: background-color 500ms;

  box-shadow: 0 0 0 2px #2196f3;
}

.q-card-wrapper {
  display: flex;
  flex-direction: column;
  cursor: pointer;
}

.route-details {
  margin: 2px;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.route-info label {
  font-weight: bold;
  display: block;
  margin-bottom: 2px;
}

.q-btn {
  margin-top: 2px;
}

.cursor-pointer {
  cursor: pointer;
}

.custom-input {
  font-size: 15px;
}
</style>
