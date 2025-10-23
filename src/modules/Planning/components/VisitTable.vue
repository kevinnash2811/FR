<script setup lang="ts">
import { accountsApi } from "@/connections/axiosCRM";
import { useDialogStore } from "@/store";
import { usePlanningServices } from "@/modules/Planning/composables";
import { visitRouteColumns } from "@/modules/Planning/helpers";
import { useCreatePlanningStore } from "@/modules/Planning/store";
import { useSelectedRowStore } from "@/modules/Planning/store/useSelectedRowStore";
import type {
  PrimitiveRouteDelivery,
  PrimitiveRouteVisit,
} from "@/modules/Planning/types";
import { useQuery } from "@tanstack/vue-query";
import moment from "moment";
import { useQuasar } from "quasar";
import { computed, defineAsyncComponent, ref, shallowRef } from "vue";
import VisitTableItem from "./VisitTableItem.vue";
import VisitPage from "@planning/pages/VisitPage.vue";
import { useAdvancedFilterStore } from "@/modules/Accounts/store";

const AccountVisitTable = defineAsyncComponent(
  () => import("@planning/components/AccountVisitTable.vue"),
);

const createPlanningStore = useCreatePlanningStore();
const advancedFilterStore = useAdvancedFilterStore();

const dialogStore = useDialogStore();
const selectedRowStore = useSelectedRowStore();
const { duplicatePlanning, deletePlanning } = usePlanningServices();
const $q = useQuasar();
const onAddVisit = (row: PrimitiveRouteDelivery, index: number) => {
  advancedFilterStore.filter.ruleDate = moment(
    row.dateOfInit,
    "dddd, DD/MMMM/YYYY",
  )
    .subtract(4, "h")
    .format("YYYY-MM-DD");
  selectedRowStore.setSelectedRow(row, index);
  dialogStore.openNewDrawer(shallowRef(VisitPage));
};

const pagination = ref({ rowsPerPage: 0 });

const onRemoveRoute = (route: PrimitiveRouteVisit) => {
  $q.dialog({
    title: "Eliminar ruta",
    message: "¿Está seguro de eliminar la ruta?",
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
    createPlanningStore.removeVisitRoute(route);
  });
};

const onUpdateDuration = (value: string, route: PrimitiveRouteVisit) => {
  route.visits.forEach((visit, index) => {
    const hourOfInit = moment(visit.hourOfInit, "HH:mm");
    const duration = moment(value, "HH:mm");
    const hourOfEnd = hourOfInit
      .clone()
      .add(duration.hours(), "hours")
      .add(duration.minutes(), "minutes");
    if (route.visits[index + 1]) {
      route.visits[index + 1].hourOfInit = hourOfEnd.format("HH:mm");
    }

    visit.duration = value;
    visit.hourOfEnd = hourOfEnd.format("HH:mm");
  });
  if (route.visits[route.visits.length - 1]) {
    route.hourOfEnd = route.visits[route.visits.length - 1].hourOfEnd;
  }
};

const onUpdateHourOfInit = (value: string, route: PrimitiveRouteVisit) => {
  route.visits.forEach((visit, index) => {
    const hourOfInit = moment(value, "HH:mm");
    const duration = moment(visit.duration, "HH:mm");
    const hourOfEnd = hourOfInit
      .clone()
      .add(duration.hours() * (index + 1), "hours")
      .add(duration.minutes() * (index + 1), "minutes");

    if (index > 0) {
      visit.hourOfInit = hourOfInit
        .clone()
        .add(duration.hours() * index, "hours")
        .add(duration.minutes() * index, "minutes")
        .format("HH:mm");
    } else {
      visit.hourOfInit = value;
    }
    visit.hourOfEnd = hourOfEnd.format("HH:mm");
  });

  if (route.visits[route.visits.length - 1]) {
    route.hourOfEnd = route.visits[route.visits.length - 1].hourOfEnd;
  }
};
const enabledGetTotalAssignedAccountsQuery = computed(
  () => createPlanningStore.isUpdateMode,
);
const { data: totalAssignedAccounts } = useQuery({
  queryKey: ["assignmentTotalAccounts", createPlanningStore.user.id],
  queryFn: async () => {
    const { data } = await accountsApi.post<number>(
      "/accounts/accounts-total",
      {
        page: 1,
        rowsPerPage: 20,
        filter: {
          assigned_to: [createPlanningStore.user.id],
        },
        sortBy: "nombre",
        order: "asc",
      },
    );
    return data;
  },
  enabled: enabledGetTotalAssignedAccountsQuery,
  initialData: 0,
});

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

const onBlockRoute = (row: PrimitiveRouteVisit) => {
  if (!row.visits.length) {
    row.enabled = !row.enabled;
    return;
  }

  $q.dialog({
    title: "¿Está seguro de bloquear la ruta?",
    message: "Al bloquear la ruta se eliminarán todas las visitas",
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
    row.enabled = !row.enabled;

    row.visits.forEach((visit) => {
      createPlanningStore.deletedVisits.push({
        accountId: visit.customer.id,
        routeId: row.uid,
        visitId: visit.uid,
      });
    });
    row.visits = [];
  });
};
const isMobile = computed(() => {
  // Detecta si es móvil (xs o sm) o si es una tablet (md)
  return $q.screen.xs;
});

const onUpdateDateOfInit = (index: number) => {
  const row = createPlanningStore.visitingRoutes[index];
  const dateOfInit = moment(row.dateOfInit, "dddd, DD/MMMM/YYYY");

  if (
    dateOfInit.isAfter(createPlanningStore.to) ||
    dateOfInit.isBefore(createPlanningStore.from)
  ) {
    $q.notify({
      type: "negative",
      message:
        "La fecha de inicio de la ruta no puede ser menor a la fecha de inicio de la planificación ni mayor a la fecha de fin de la planificación",
    });
    row.dateOfInit = "";
    return;
  }

  row.named = `Ruta, ${dateOfInit.format("dddd DD")}`;

  const orderedPlannig = [...createPlanningStore.visitingRoutes].sort(
    (a, b) => {
      const dateA = moment(a.dateOfInit, "dddd, DD/MMMM/YYYY");
      const dateB = moment(b.dateOfInit, "dddd, DD/MMMM/YYYY");
      return dateA.isAfter(dateB) ? 1 : -1;
    },
  );

  const indexRow = orderedPlannig.findIndex((route) => route.uid === row.uid);

  if (indexRow !== -1) {
    createPlanningStore.visitingRoutes.splice(index, 1);
    createPlanningStore.visitingRoutes.splice(indexRow, 0, row);
  }
};
</script>

<template>
  <q-table
    v-if="!isMobile"
    :rows="createPlanningStore.visitingRoutes"
    :columns="visitRouteColumns"
    flat
    bordered
    row-key="uid"
    class="shadow-2"
    v-model:pagination="pagination"
    :rows-per-page-options="[0]"
    no-data-label="Sin rutas definidas"
    style="height: 100%; max-height: 100%"
  >
    <template #top="props">
      <q-item-section avatar>
        <q-avatar color="primary" text-color="white">
          {{ createPlanningStore.getInitialOfUser }}
        </q-avatar>
      </q-item-section>
      <q-item-section>
        <q-item-label v-if="createPlanningStore.user">{{
          createPlanningStore.getUserFullName
        }}</q-item-label>
        <q-item-label caption>{{
          createPlanningStore.user.rol_hbm_label
        }}</q-item-label>
      </q-item-section>
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
        padding="xs"
        @click="
          () => {
            const lastVisit =
              createPlanningStore.visitingRoutes[
                createPlanningStore.visitingRoutes.length - 1
              ];
            if (
              lastVisit &&
              moment(lastVisit.dateOfInit, 'dddd, DD/MMMM/YYYY')
                .add(1, 'day')
                .isAfter(createPlanningStore.to)
            ) {
              $q.notify({
                type: 'negative',
                message:
                  'La fecha de inicio de la ruta no puede ser mayor a la fecha de fin de la planificación',
              });
              return;
            }

            if (createPlanningStore.isValidDateOfInit()) {
              createPlanningStore.addVisitingRoute();
            }
          }
        "
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
      <q-tr :props="props" :no-hover="!props.row.enabled">
        <q-td>
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
          <q-popup-edit
            v-model="props.row.named"
            auto-save
            v-slot="scope"
            separate-close-popup
            :disable="!props.row.enabled || createPlanningStore.readonly"
          >
            <q-input
              v-model="scope.value"
              hint="Debe de escribir el Nombre"
              dense
              @keyup.enter="scope.set"
            />
          </q-popup-edit>
        </q-td>
        <q-td key="hourOfEnd" :props="props">
          {{ props.row.hourOfEnd }}
          <q-popup-edit
            v-model="props.row.hourOfEnd"
            auto-save
            v-slot="scope"
            :disable="!props.row.enabled || createPlanningStore.readonly"
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
                          @click="scope.set"
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
          <q-popup-edit
            v-model="props.row.dateOfInit"
            auto-save
            v-slot="scope"
            :disable="!props.row.enabled || createPlanningStore.readonly"
            @update:model-value="onUpdateDateOfInit(props.rowIndex)"
          >
            <q-input filled v-model="scope.value" @keyup.enter="scope.set">
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
                          @click="scope.set"
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
        <q-td key="hourOfInit" :props="props">
          {{ props.row.hourOfInit }}
          <q-popup-edit
            v-model="props.row.hourOfInit"
            auto-save
            v-slot="scope"
            :disable="!props.row.enabled || createPlanningStore.readonly"
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
                          @click="scope.set"
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
            :disable="!props.row.enabled || createPlanningStore.readonly"
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
                          @click="scope.set"
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
            icon="o_person_add"
            size="sm"
            :disabled="!props.row.enabled"
            @click="onAddVisit(props.row, props.rowIndex)"
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
                @click="onAddVisit(props.row, props.rowIndex)"
                v-if="props.row.enabled"
              >
                <q-item-section side>
                  <q-icon name="o_person_add" text-color="white" />
                </q-item-section>
                <q-item-section>
                  <q-item-label> Agregar visita </q-item-label>
                </q-item-section>
              </q-item>
              <q-item
                clickable
                v-close-popup
                @click="
                  createPlanningStore.cloneVisitRoute(props.row, props.rowIndex)
                "
              >
                <q-item-section side>
                  <q-icon name="content_copy" text-color="white" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Clonar ruta</q-item-label>
                </q-item-section>
              </q-item>
              <!-- <q-item
                clickable
                v-close-popup
                @click="
                  createPlanningStore.cloneVisitRoute(props.row, props.rowIndex)
                "
              >
                <q-item-section side>
                  <q-icon name="share" text-color="white" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Reasignar ruta</q-item-label>
                </q-item-section>
              </q-item> -->
              <q-item clickable v-close-popup @click="onBlockRoute(props.row)">
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
              <q-item clickable v-close-popup @click="onRemoveRoute(props.row)">
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
            rounded
            size="md"
            color="dark"
            dense
            @click="props.expand = !props.expand"
            :icon="props.expand ? 'arrow_drop_up' : 'arrow_drop_down'"
            :disabled="!props.row.enabled"
          >
            <q-badge
              floating
              rounded
              color="negative"
              class="text-white"
              v-if="props.row.visits.length > 0"
            >
              {{ props.row.visits.length }}
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
    <template v-slot:no-data="{ icon, message }">
      <div class="full-width row flex-center q-gutter-sm text-warning">
        <span>{{ message }} </span>
        <q-icon size="2em" :name="icon" />
      </div>
    </template>
    <template #pagination>
      <div class="text-caption">
        {{ createPlanningStore.countOfEnabledVisitRoutes }} Rutas -
        {{ createPlanningStore.clientsLength }} Visitas |
        {{ createPlanningStore.totalUniqueClients }} de
        {{ totalAssignedAccounts }} Clientes
      </div>
    </template>
  </q-table>

  <div v-if="isMobile" class="q-gutter-md q-pa-none" style="height: 40vh">
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
        v-for="(row, index) in createPlanningStore.visitingRoutes"
        :key="row.uid"
        class="q-card-wrapper"
      >
        <!-- Tarjeta individual -->
        <VisitTableItem :row="row" :index="index"></VisitTableItem>
      </div>
    </div>
    <div class="row justify-center" style="margin-right: 10px">
      <q-btn
        v-if="!createPlanningStore.readonly"
        color="primary"
        noCaps
        icon="add"
        rounded
        padding="md"
        @click="
          () => {
            const lastVisit =
              createPlanningStore.visitingRoutes[
                createPlanningStore.visitingRoutes.length - 1
              ];
            if (
              lastVisit &&
              moment(lastVisit.dateOfInit, 'dddd, DD/MMMM/YYYY')
                .add(1, 'day')
                .isAfter(createPlanningStore.to)
            ) {
              $q.notify({
                type: 'negative',
                message:
                  'La fecha de inicio de la ruta no puede ser mayor a la fecha de fin de la planificación',
              });
              return;
            }

            if (createPlanningStore.isValidDateOfInit()) {
              createPlanningStore.addVisitingRoute();
            }
            if (!createPlanningStore.isValidDateOfInit()) {
              $q.notify({
                type: 'negative',
                message: 'Debe seleccionar un rango de fecha',
              });
              return;
            }
          }
        "
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

.q-card-wrapper {
  display: flex;
  flex-direction: column;
  cursor: pointer;
}

.route-details {
  margin: 2px;
  padding: 3px;
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
.q-dialog__inner-leave-active {
  transform: translateX(-100%); /* Efecto de salida */
}
</style>
