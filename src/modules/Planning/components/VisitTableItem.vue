<script setup lang="ts">
import { defineProps, shallowRef } from "vue";
import { useCreatePlanningStore, useSelectedRowStore } from "../store";
import { useDialogStore } from "@/store";
import { useQuasar } from "quasar";
import moment from "moment";
import { ref } from "vue";
import type { PrimitiveRouteVisit } from "../types";
import { defineAsyncComponent } from "vue";
import AccountVisitTable from "../components/AccountVisitTable.vue";
const createPlanningStore = useCreatePlanningStore();

const { row, index } = defineProps<{
  row: PrimitiveRouteVisit;
  index: number;
}>();
const selectedRowStore = useSelectedRowStore();
const $q = useQuasar();
const dialogStore = useDialogStore();

const VisitPage = defineAsyncComponent(
  () => import("@planning/pages/VisitPage.vue"),
);

const onBlockRoute = () => {
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

const onRemoveRoute = () => {
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
    createPlanningStore.removeVisitRoute(row);
  });
};

const onUpdateDateOfInit = () => {
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

const onUpdateHourOfInit = (value: string) => {
  row.visits.forEach((visit, index) => {
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

  if (row.visits[row.visits.length - 1]) {
    row.hourOfEnd = row.visits[row.visits.length - 1].hourOfEnd;
  }
};

const onUpdateDuration = (value: string) => {
  row.visits.forEach((visit, index) => {
    const hourOfInit = moment(visit.hourOfInit, "HH:mm");
    const duration = moment(value, "HH:mm");
    const hourOfEnd = hourOfInit
      .clone()
      .add(duration.hours(), "hours")
      .add(duration.minutes(), "minutes");
    if (row.visits[index + 1]) {
      row.visits[index + 1].hourOfInit = hourOfEnd.format("HH:mm");
    }

    visit.duration = value;
    visit.hourOfEnd = hourOfEnd.format("HH:mm");
  });
  if (row.visits[row.visits.length - 1]) {
    row.hourOfEnd = row.visits[row.visits.length - 1].hourOfEnd;
  }
};
const fixedAccountList = ref(false);
const handleSwipe2 = () => {
  fixedAccountList.value = false;
};

const maximizedToggle = ref(true);

const openDialogV = (row, index) => {
  selectedRowStore.setSelectedRow(row, index);
  dialogStore.openNewDrawer(shallowRef(AccountVisitTable), { index });
};
</script>
<template>
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
                  <div class="col-11">
                    <span style="font-size: 14px">{{ row.dateOfInit }}</span>
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
                            createPlanningStore.cloneVisitRoute(row, index)
                          "
                        >
                          <q-item-section side>
                            <q-icon name="content_copy" text-color="white" />
                          </q-item-section>
                          <q-item-section>
                            <q-item-label>Clonar ruta</q-item-label>
                          </q-item-section>
                        </q-item>

                        <q-item clickable v-close-popup @click="onBlockRoute">
                          <q-item-section side>
                            <q-icon
                              :name="row.enabled ? 'o_lock' : 'o_lock_open'"
                              text-color="white"
                            />
                          </q-item-section>
                          <q-item-section>
                            <q-item-label v-if="row.enabled"
                              >Bloquear ruta</q-item-label
                            >
                            <q-item-label v-else>Desbloquear ruta</q-item-label>
                          </q-item-section>
                        </q-item>
                        <q-separator />
                        <q-item clickable v-close-popup @click="onRemoveRoute">
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
                <q-popup-edit
                  v-model="row.dateOfInit"
                  auto-save
                  v-slot="scope"
                  :disable="!row.enabled || createPlanningStore.readonly"
                  @update:model-value="onUpdateDateOfInit(rowIndex)"
                >
                  <q-input
                    filled
                    v-model="scope.value"
                    @keyup.enter="save(scope)"
                  >
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
              </div>

              <!-- Fila de HoraInicio, Duración, HoraFin -->
              <div class="row">
                <div class="col-5">
                  <label style="font-size: 13px">Hora Inicio</label>
                  <span>{{ row.hourOfInit }}</span>
                  <q-popup-edit
                    v-model="row.hourOfInit"
                    auto-save
                    v-slot="scope"
                    :disable="!row.enabled || createPlanningStore.readonly"
                    @update:model-value="(value) => onUpdateHourOfInit(value)"
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
                </div>
                <div class="col-7">
                  <label style="font-size: 13px">Duración por Visita</label>
                  <span>{{ row.duration }}</span>
                  <q-popup-edit
                    v-model="row.duration"
                    auto-save
                    v-slot="scope"
                    :disable="!row.enabled || createPlanningStore.readonly"
                    @update:model-value="(value) => onUpdateDuration(value)"
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
                </div>
              </div>
            </div>

            <div style="position: relative">
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
                v-if="row.visits.length > 0"
                class="text-white"
                style="
                  position: absolute;
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
                  {{ row.visits.length }}
                </div>
              </q-badge>
            </div>
            <q-dialog
              v-model="fixedAccountList"
              persistent
              :maximized="maximizedToggle"
              transition-show="slide-left"
              transition-hide="slide-right"
            >
              <div
                v-touch-swipe.mouse.right="handleSwipe2"
                style="background-color: white"
              >
                <VisitPage />
              </div>
            </q-dialog>
          </div>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>
