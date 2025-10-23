<script setup lang="ts">
import { useDialogStore, useTabStore } from "@/store";
import { useCreatePlanningStore } from "@/modules/Planning/store";
import { useQuery } from "@tanstack/vue-query";
import {
  computed,
  defineAsyncComponent,
  onMounted,
  onUnmounted,
  ref,
  shallowRef,
} from "vue";
import { useRoute, useRouter } from "vue-router";
import { getPlanningById } from "../services/planningService";
import { usePlanningServices } from "../composables";
import moment from "moment";
import { useQuasar } from "quasar";
import VehiclePage from "./VehiclePage.vue";

const HeaderPage = defineAsyncComponent(
  () => import("@/components/HeaderPage.vue"),
);

const VisitTable = defineAsyncComponent(
  () => import("@planning/components/VisitTable.vue"),
);

const DeliveryTable = defineAsyncComponent(
  () => import("@planning/components/DeliveryTable.vue"),
);

const FormBase = defineAsyncComponent(
  () => import("@planning/components/FormBase.vue"),
);

const HeaderTab = defineAsyncComponent(
  () => import("@planning/components/HeaderTab.vue"),
);

const tabStore = useTabStore();
const dialogStore = useDialogStore();
const router = useRouter();
const route = useRoute();
const createPlanningStore = useCreatePlanningStore();
const formMounted = ref(false);
const formRef = ref<HTMLElement | null>(null);
const formRefHeight = computed(() => formRef.value?.clientHeight ?? 0);
const tabSize = ref(700);

const { createPlanning, updatePlanning, isLoading } = usePlanningServices();
const onFormMounted = () => {
  formMounted.value = true;
  tabSize.value = formRefHeight.value + 55;
};

const onCancel = () => {
  router.back();
};

const onBack = () => {
  router.back();
};

const panels = computed(() => {
  const panelsResponse = [];
  if (createPlanningStore.type === "T02") {
    panelsResponse.push({
      name: "vehicles",
      label: "Vehiculos asignados",
      icon: "o_local_shipping",
    });
  }

  panelsResponse.push({
    name: "activities",
    label: "Tareas Cabecera",
    icon: "o_list",
  });

  return panelsResponse;
});
const tab = ref(panels.value[0].name);

const enabledPlanningQuery = computed(() => route.query.id !== undefined);

const { isLoading: isLoadingPlanning, isFetching: isFetchingPlanning } =
  useQuery({
    queryKey: [route.query.id],
    queryFn: async () => {
      const { data } = await getPlanningById(route.query.id as string);
      await createPlanningStore.setValueFromJSON(data);
      return data;
    },
    enabled: enabledPlanningQuery,
    refetchOnWindowFocus: false,
    gcTime: 0,
  });

const isLoadingPlanningQuery = computed(
  () => isLoadingPlanning.value || isFetchingPlanning.value,
);

const onSave = async () => {
  if (createPlanningStore.id) {
    await updatePlanning();
  } else {
    await createPlanning();
  }
};
const error = ref();
const errorMessage = ref("");

const onReload = () => {
  window.location.reload();
};
const $q = useQuasar(); // Acceso a Quasar
const modalVisible = ref(false); // Controla la visibilidad del modal
const modalVisibleTareas = ref(false); // Controla la visibilidad del modal

// Computed para detectar si es una pantalla pequeña (móvil)
const isMobile = computed(() => {
  // Detecta si es móvil (xs o sm) o si es una tablet (md)
  return $q.screen.xs;
});
const showDialogVehicles = () => {
  dialogStore.openNewDrawer(shallowRef(VehiclePage));
};
if (isMobile.value) {
  tabSize.value = 150;
}

// Abre el modal
const openModal = () => {
  modalVisible.value = true;
};

// Cierra el modal
const closeModal = () => {
  modalVisible.value = false;
  tabSize.value = 135;
};

const openModalTareas = () => {
  modalVisibleTareas.value = true;
};

// Cierra el modal
const closeModalTareas = () => {
  modalVisibleTareas.value = false;
};

// Función que se ejecuta cuando el formulario se monta

const onBeforeLoad = (e: Event) => {
  e.preventDefault();

  e.returnValue = true;
};

onMounted(() => {
  tabStore.openFullScreen();
  window.addEventListener("beforeunload", onBeforeLoad);
});

onUnmounted(() => {
  tabStore.closeFullScreen();
  createPlanningStore.clearFields();

  window.removeEventListener("beforeunload", onBeforeLoad);
});
</script>

<template>
  <div
    v-if="isLoadingPlanningQuery"
    class="row items-center justify-center"
    style="height: 100vh; width: 100%"
  >
    <q-spinner-gears size="100px" color="primary" />
  </div>
  <div
    v-else-if="error"
    style="width: 100%; height: 100vh"
    class="column items-center justify-center"
  >
    <q-item class="shadow-2" style="border-radius: 3px">
      <q-item-section avatar>
        <q-icon name="error" color="negative" size="2rem" />
      </q-item-section>
      <q-item-section>
        <q-item-label class="text-negative">Error</q-item-label>
        <q-item-label caption>{{ errorMessage }} | {{ error }}</q-item-label>
      </q-item-section>
      <q-item-section side @click="onReload">
        <q-icon name="refresh">
          <q-tooltip>Recargar</q-tooltip>
        </q-icon>
      </q-item-section>
    </q-item>
  </div>
  <q-splitter
    v-model="tabSize"
    style="height: 100%; width: 100%"
    horizontal
    unit="px"
    v-else
  >
    <template #before>
      <HeaderPage
        title="Crear planificaciones"
        isChild
        @back="onBack"
        :showBackButton="false"
      />
      <div class="row q-px-sm" style="gap: 5px">
        <!-- <div ref="formRef" class="shadow-2" style="border-radius: 3px; flex: 1">
          <div class="q-pa-xs">
            <FormBase @hook:mounted="onFormMounted" />
          </div>
        </div> -->

        <div
          v-if="isMobile"
          class="row q-gutter-x-sm q-pa-md q-mx-auto q-flex q-items-center q-justify-center"
          style="padding-left: 0px"
          scoped
        >
          <q-btn
            @click="openModal"
            label="Planificacion"
            color="primary"
            icon="note_add"
            class="full-width-btn q-pa-md"
            style="padding-left: 12px"
          />
          <q-btn
            @click="openModalTareas"
            label="Tareas"
            color="secondary"
            icon="o_work"
            class="full-width-btn q-pa-md"
          />
        </div>
        <q-dialog v-model="modalVisible" persistent>
          <q-card>
            <q-card-section>
              <FormBase @hook:mounted="onFormMounted" />
            </q-card-section>

            <q-card-actions>
              <q-btn label="OK" color="primary" @click="closeModal" />
            </q-card-actions>
          </q-card>
        </q-dialog>
        <div
          v-if="!isMobile"
          ref="formRef"
          class="shadow-2"
          style="border-radius: 3px; flex: 1"
        >
          <div class="q-pa-xs">
            <FormBase @hook:mounted="onFormMounted" />
          </div>
        </div>

        <q-dialog v-model="modalVisibleTareas" persistent>
          <q-card>
            <q-card-section>
              <div class="column no-wrap" style="height: 100%">
                <q-tabs
                  align="justify"
                  inline-label
                  active-color="primary"
                  v-model="tab"
                  dense
                  no-caps
                  class="text-grey-5 shadow-1"
                >
                  <q-tab
                    v-for="tab in panels"
                    :key="tab.name"
                    v-bind="tab"
                    :icon="tab.icon"
                  />
                </q-tabs>
                <q-tab-panels
                  v-model="tab"
                  animated
                  style="overflow: hidden; flex-grow: 1"
                >
                  <q-tab-panel
                    name="vehicles"
                    class="q-pa-none column no-wrap"
                    v-if="panels.length === 2"
                  >
                    <div class="q-pa-xs">
                      <HeaderTab
                        title="Vehiculos asignados"
                        :showAddButton="!createPlanningStore.readonly"
                        @add="showDialogVehicles"
                      />
                    </div>
                    <q-virtual-scroll
                      :items="createPlanningStore.assignedVehicles"
                      v-slot="{ item }"
                    >
                      <q-item style="width: 100%">
                        <q-item-section avatar>
                          <q-avatar color="primary">
                            <q-icon
                              name="directions_car"
                              color="white"
                            ></q-icon>
                          </q-avatar>
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>
                            {{ item.name }}
                          </q-item-label>
                          <q-item-label caption>
                            <template v-if="item.conductores?.length > 0">
                              <q-badge
                                rounded
                                color="orange"
                                :label="item.conductores?.length"
                              ></q-badge>
                              Conductores asignados
                            </template>
                            <template v-else
                              >Sin conductores asignados</template
                            >
                          </q-item-label>
                        </q-item-section>
                        <q-item-section top side>
                          <q-chip
                            size="sm"
                            :color="
                              item.estado_vehiculo_c === 'E01'
                                ? 'blue-6'
                                : 'red-6'
                            "
                            text-color="white"
                            class="q-mx-none"
                            square
                            >{{ item.estado_vehiculo_label }}</q-chip
                          >
                          <q-item-label caption>
                            <template v-if="item.capacidad_1_c">
                              Capacidad: {{ item.capacidad_1_c }}
                            </template>
                            <template v-else> Sin capacidad </template>
                          </q-item-label>
                        </q-item-section>
                        <q-item-section
                          side
                          v-if="!createPlanningStore.readonly"
                        >
                          <q-btn
                            @click="createPlanningStore.removeVehicle(item)"
                            color="negative"
                            round
                            flat
                            icon="close"
                            no-caps
                            size="sm"
                          ></q-btn>
                        </q-item-section>
                      </q-item>
                    </q-virtual-scroll>
                  </q-tab-panel>
                  <q-tab-panel
                    name="activities"
                    class="q-pa-none column no-wrap"
                  >
                    <template
                      v-if="
                        createPlanningStore.activities &&
                        createPlanningStore.activities.length > 0
                      "
                    >
                      <template
                        v-if="createPlanningStore.activities.length > 0"
                      >
                        <q-virtual-scroll
                          :items="createPlanningStore.activities"
                          v-slot="{ item }"
                        >
                          <q-item :key="item.id">
                            <q-item-section avatar>
                              <q-avatar color="primary">
                                <q-icon name="o_work" color="white"></q-icon>
                              </q-avatar>
                            </q-item-section>

                            <q-item-section>
                              <q-item-label>{{ item.name }}</q-item-label>

                              <q-item-label caption>
                                Válido desde
                                {{
                                  moment(item.fecha_inicio_regla).format(
                                    "dddd, DD/MM/YYYY",
                                  )
                                }}
                                hasta
                                {{
                                  moment(item.fecha_fin_regla).format(
                                    "dddd, DD/MM/YYYY",
                                  )
                                }}
                              </q-item-label>
                            </q-item-section>

                            <q-item-section top side>
                              <q-item-label caption>{{
                                item.division
                              }}</q-item-label>
                              <q-item-label caption>{{
                                item.amercado
                              }}</q-item-label>
                              <q-badge
                                v-if="item.obligatorio_c === 'yes'"
                                color="orange-5"
                                size="sm"
                                rounded
                                outline
                              >
                                Es Obligatorio
                              </q-badge>
                              <q-badge
                                v-else
                                color="grey"
                                size="sm"
                                rounded
                                outline
                              >
                                No es Obligatorio
                              </q-badge>
                            </q-item-section>
                          </q-item>
                        </q-virtual-scroll>
                      </template>
                    </template>
                    <template v-else>
                      <q-item>
                        <q-item-section class="q-pa-md text-center">
                          <q-avatar size="60px" class="q-mb-md" color="grey-4">
                            <q-icon
                              name="announcement"
                              size="40px"
                              color="grey-8"
                            />
                          </q-avatar>
                          <q-item-label caption class="text-h1 text-bold">
                            Sin tareas
                          </q-item-label>
                          <q-item-label class="text-body2 text-grey-6">
                            No hay tareas disponibles en este momento.
                          </q-item-label>
                        </q-item-section>
                      </q-item>
                    </template>
                  </q-tab-panel>
                </q-tab-panels>
              </div>
            </q-card-section>

            <q-card-actions>
              <q-btn
                label="Cerrar"
                color="secondary"
                @click="closeModalTareas"
              />
            </q-card-actions>
          </q-card>
        </q-dialog>

        <div
          v-if="formMounted && !isMobile"
          class="shadow-2"
          style="border-radius: 3px; flex: 1"
          :style="{
            height: formRefHeight + 'px',
          }"
        >
          <div class="column no-wrap" style="height: 100%">
            <q-tabs
              align="justify"
              inline-label
              active-color="primary"
              v-model="tab"
              dense
              no-caps
              class="text-grey-5 shadow-1"
            >
              <q-tab
                v-for="tab in panels"
                :key="tab.name"
                v-bind="tab"
                :icon="tab.icon"
              />
            </q-tabs>
            <q-tab-panels
              v-model="tab"
              animated
              style="overflow: hidden; flex-grow: 1"
            >
              <q-tab-panel
                name="vehicles"
                class="q-pa-none column no-wrap"
                v-if="panels.length === 2"
              >
                <div class="q-pa-xs">
                  <HeaderTab
                    title="Vehiculos asignados"
                    :showAddButton="!createPlanningStore.readonly"
                    @add="showDialogVehicles()"
                  />
                </div>
                <q-virtual-scroll
                  :items="createPlanningStore.assignedVehicles"
                  v-slot="{ item }"
                >
                  <q-item style="width: 100%">
                    <q-item-section avatar>
                      <q-avatar color="primary">
                        <q-icon name="directions_car" color="white"></q-icon>
                      </q-avatar>
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>
                        {{ item.name }}
                      </q-item-label>
                      <q-item-label caption>
                        <template v-if="item.conductores?.length > 0">
                          <q-badge
                            rounded
                            color="orange"
                            :label="item.conductores?.length"
                          ></q-badge>
                          Conductores asignados
                        </template>
                        <template v-else>Sin conductores asignados</template>
                      </q-item-label>
                    </q-item-section>
                    <q-item-section top side>
                      <q-chip
                        size="sm"
                        :color="
                          item.estado_vehiculo_c === 'E01' ? 'blue-6' : 'red-6'
                        "
                        text-color="white"
                        class="q-mx-none"
                        square
                        >{{ item.estado_vehiculo_label }}</q-chip
                      >
                      <q-item-label caption>
                        <template v-if="item.capacidad_1_c">
                          Capacidad: {{ item.capacidad_1_c }}
                        </template>
                        <template v-else> Sin capacidad </template>
                      </q-item-label>
                    </q-item-section>
                    <q-item-section side v-if="!createPlanningStore.readonly">
                      <q-btn
                        @click="createPlanningStore.removeVehicle(item)"
                        color="negative"
                        round
                        flat
                        icon="close"
                        no-caps
                        size="sm"
                      ></q-btn>
                    </q-item-section>
                  </q-item>
                </q-virtual-scroll>
              </q-tab-panel>
              <q-tab-panel name="activities" class="q-pa-none column no-wrap">
                <template
                  v-if="
                    createPlanningStore.activities &&
                    createPlanningStore.activities.length > 0
                  "
                >
                  <template v-if="createPlanningStore.activities.length > 0">
                    <q-virtual-scroll
                      :items="createPlanningStore.activities"
                      v-slot="{ item }"
                    >
                      <q-item :key="item.id">
                        <q-item-section avatar>
                          <q-avatar color="primary">
                            <q-icon name="o_work" color="white"></q-icon>
                          </q-avatar>
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>{{ item.name }}</q-item-label>

                          <q-item-label caption>
                            Válido desde
                            {{
                              moment(item.fecha_inicio_regla).format(
                                "dddd, DD/MM/YYYY",
                              )
                            }}
                            hasta
                            {{
                              moment(item.fecha_fin_regla).format(
                                "dddd, DD/MM/YYYY",
                              )
                            }}
                          </q-item-label>
                        </q-item-section>

                        <q-item-section top side>
                          <q-item-label caption>{{
                            item.division
                          }}</q-item-label>
                          <q-item-label caption>{{
                            item.amercado
                          }}</q-item-label>
                          <q-badge
                            v-if="item.obligatorio_c === 'yes'"
                            color="orange-5"
                            size="sm"
                            rounded
                            outline
                          >
                            Es Obligatorio
                          </q-badge>
                          <q-badge
                            v-else
                            color="grey"
                            size="sm"
                            rounded
                            outline
                          >
                            No es Obligatorio
                          </q-badge>
                        </q-item-section>
                      </q-item>
                    </q-virtual-scroll>
                  </template>
                </template>
                <template v-else>
                  <q-item>
                    <q-item-section class="q-pa-md text-center">
                      <q-avatar size="60px" class="q-mb-md" color="grey-4">
                        <q-icon
                          name="announcement"
                          size="40px"
                          color="grey-8"
                        />
                      </q-avatar>
                      <q-item-label caption class="text-h1 text-bold">
                        Sin tareas
                      </q-item-label>
                      <q-item-label class="text-body2 text-grey-6">
                        No hay tareas disponibles en este momento.
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </q-tab-panel>
            </q-tab-panels>
          </div>
        </div>
      </div>
    </template>
    <template #separator>
      <q-avatar
        color="primary"
        text-color="white"
        size="20px"
        icon="drag_handle"
        @dblclick="tabSize = 10"
      />
    </template>
    <template #after>
      <DeliveryTable v-if="createPlanningStore.type === 'T02'" />
      <VisitTable v-if="createPlanningStore.type === 'T01'" />
    </template>
    <div class="row justify-center bg-grey-3 q-py-xs">
      <div class="q-gutter-x-sm">
        <q-btn
          :loading="isLoading"
          class="col-2"
          color="blue-9"
          flat
          icon="save"
          :label="createPlanningStore.readonly ? 'Actualizar' : 'Guardar'"
          noCaps
          stack
          @click="onSave"
        >
          <template v-slot:loading>
            <q-spinner />
          </template>
        </q-btn>
        <q-btn
          @click="onCancel"
          class="col-2"
          color="red-9"
          flat
          icon="close"
          label="Cancelar"
          noCaps
          stack
        ></q-btn>
      </div>
    </div>
  </q-splitter>
  <q-inner-loading :showing="isLoading">
    <q-spinner-gears size="50px" color="primary" />
  </q-inner-loading>
</template>
