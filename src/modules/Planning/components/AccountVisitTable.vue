<script setup lang="ts">
import { visitColumns } from "@/modules/Planning/helpers";
import { getColorByCategory } from "@/utils";
import type { PrimitiveVisit } from "@planning/types";
import moment from "moment";
import { useQuasar } from "quasar";
import { computed, ref, shallowRef } from "vue";
import { useDragAndDropTableRow } from "../composables";
import { useCreatePlanningStore } from "../store";
import { useSelectedRowStore } from "../store/useSelectedRowStore";
import VisitPage from "../pages/VisitPage.vue";
import DeliveryPage from "../../Accounts/pages/DeliveryPage.vue";
import { useDialogStore } from "@/store";

const { index } = defineProps<{
  index: number;
}>();
const selectedRowStore = useSelectedRowStore();
const rows = computed(() => {
  if (createPlanningStore.type === "T01") {
    return createPlanningStore.visitingRoutes[index]?.visits;
  } else {
    return createPlanningStore.deliveryRoutes[index]?.deliveries;
  }
});

const createPlanningStore = useCreatePlanningStore();
const dialogDeliveries = ref(false);
const dialogStore = useDialogStore();
const visibleColumns = computed(() => {
  const columns = [
    "customer",
    "hourOfInit",
    "duration",
    "hourOfEnd",
  ];

  if (createPlanningStore.type === "T01") {
    columns.push("activities");
    columns.push("activitiesCabecera");
  }

  return columns;
});

const parentIndex = computed(() => selectedRowStore.selectedIndex);
const { onDragEnd, onDragOver, onDragStart, onDrop, overIndex } =
  useDragAndDropTableRow((from, to) =>
    createPlanningStore.swapVisit(from, to, selectedRowStore.selectedRow!),
  );
const selectedRow = ref<PrimitiveVisit>();

const showDeliveries = (row: PrimitiveVisit) => {
  selectedRow.value = row;
  dialogDeliveries.value = true;
};

const toggleTasks = (rowIndex: number) => {
  showTasks.value[rowIndex] = !showTasks.value[rowIndex];
};

const $q = useQuasar();

const isMobile = computed(() => {
  // Detecta si es móvil (xs o sm) o si es una tablet (md)
  return $q.screen.xs;
});

const removeRow = (rowIndex: number) => {
  rows?.value.splice(rowIndex, 1);
};

const showTasks = ref<{ [key: number]: boolean }>({});

const selectedRowIndex = ref<number | null>(null);
const pressTimer = ref<number | null>(null);

const startDragPress = (index: number) => {
  pressTimer.value = setTimeout(() => {
    selectedRowIndex.value = index;
    $q.notify({
      position: "bottom",
      type: "info",
      message: "Elija la posición al que desea mover el registro seleccionado",
      actions: [{ icon: "close", color: "white" }],
    });
  }, 500);
};

const onRowMouseDown = (index: number) => {
  pressTimer.value = setTimeout(() => {
    selectedRowIndex.value = index;
  }, 500);
};

const onRowMouseUp = () => {
  if (pressTimer.value) {
    clearTimeout(pressTimer.value);
  }
};

const endDragPress = () => {
  if (pressTimer.value !== null) {
    clearTimeout(pressTimer.value);
    pressTimer.value = null;
  }
};

const moveRow = (targetIndex: number) => {
  if (
    selectedRowIndex.value !== null &&
    selectedRowIndex.value !== targetIndex
  ) {
    const selectedRow = rows.value[selectedRowIndex.value];
    rows.value.splice(selectedRowIndex.value, 1);
    rows.value.splice(targetIndex, 0, selectedRow);
    // Recalcular las horas para todos los registros en orden
    recalculateTimes();
    // Restablecer la selección
    selectedRowIndex.value = null;
  }
};

const recalculateTimes = () => {
  let currentHour = moment("08:00", "HH:mm");
  for (const row of rows.value) {
    row.hourOfInit = currentHour.format("HH:mm");

    const duration = moment(row.duration, "HH:mm");
    row.hourOfEnd = currentHour
      .clone()
      .add(duration.hours(), "hours")
      .add(duration.minutes(), "minutes")
      .format("HH:mm");

    currentHour = moment(row.hourOfEnd, "HH:mm");
  }
};

const onAddVisit = () => {
  dialogStore.openNewDrawer(shallowRef(VisitPage));
};

const onAddDelivery = () => {
  dialogStore.openNewDrawer(shallowRef(DeliveryPage));
};

const closeDialog = () => {
  dialogStore.closeCurrentDrawer();
};
</script>

<template>
  <q-table
    v-if="!isMobile"
    style="border: 1px solid gray"
    class="shadow-20"
    row-key="uid"
    :rows="rows"
    :columns="visitColumns"
    flat
    bordered
    :rows-per-page-options="[0]"
    :visible-columns="visibleColumns"
    no-data-label="Sin clientes"
  >
    <template #top>
      <q-space />
      <!-- <q-chip v-for="item of createPlanningStore.countOfActivities(parentIndex)" :key="item.label" dense outline
        color="primary">
        <q-avatar color="primary" text-color="white">
          {{ item.count }}
        </q-avatar>
        {{ item.label }}
      </q-chip> -->
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
        :draggable="!createPlanningStore.readonly"
        @drop="onDrop(props.rowIndex, $event)"
        @dragend="onDragEnd"
        @dragover="
          !createPlanningStore.readonly && onDragOver(props.rowIndex, $event)
        "
        @dragstart="
          !createPlanningStore.readonly && onDragStart(props.rowIndex, $event)
        "
        :class="{
          'dragged-over': overIndex === props.rowIndex,
        }"
      >
        <q-td auto-width>
          <q-icon
            v-if="!createPlanningStore.readonly"
            class="drag-indicator"
            name="drag_indicator"
            size="sm"
            color="grey-6"
          >
          </q-icon>
          <q-avatar color="primary" size="sm" class="text-white">
            {{ props.rowIndex + 1 }}
          </q-avatar>
        </q-td>
        <q-td key="customer" :props="props">
          <q-item class="q-pa-xs q-px-none ellipsis">
            <q-item-section>
              <q-item-label>{{ props.row.customer.name }}</q-item-label>
              <q-item-label caption>
                <q-icon 
                  name="place"
                />
                {{ props.row.customer.address ?? "Sin dirección" }}
              </q-item-label>
              <q-item-label caption>
                <q-icon
                  name="store"
                />
                {{ props.row.customer.zone }}
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <div class="column q-gutter-y-xs">
                <q-avatar
                v-if="props.row.customer.category"
                :color="getColorByCategory(props.row.customer.category)"
                size="sm"
                class="text-white shadow-3"
              >
                {{ props.row.customer.category }}
              </q-avatar>
              <div v-else>Sin categoria</div>
              <q-avatar
                v-if="props.row.customer.secondCategory"
                :color="getColorByCategory(props.row.customer.secondCategory)"
                size="sm"
                class="text-white shadow-3"
              >
                {{ props.row.customer.secondCategory }}
              </q-avatar>
              <div v-else>Sin categoria</div>
              </div>
            </q-item-section>
          </q-item>
        </q-td>
        <q-td key="activities" :props="props">
          <div class="column q-gutter-y-xs items-start">
            <div
              class="row"
              v-for="activity in props.row.customer.tasks"
              :key="activity.id"
            >
              <div class="d-flex justify-start items-center">
                <q-badge color="primary" size="sm" rounded outline>
                  {{ activity.name }}
                </q-badge>
                <q-icon
                  v-if="activity.obligatorio_c === 'yes'"
                  name="warning"
                  color="orange-4"
                  size="1.3rem"
                  class="q-ml-xs"
                >
                  <q-tooltip
                    anchor="center right"
                    self="center left"
                    :offset="[0, 10]"
                  >
                    Esta tarea SI es obligatoria
                  </q-tooltip>
                </q-icon>
                <q-tooltip
                  v-else
                  anchor="center right"
                  self="center left"
                  :offset="[0, 10]"
                >
                  Esta tarea NO es obligatoria
                </q-tooltip>
              </div>
            </div>
          </div>
        </q-td>
        <q-td key="activitiesCabecera" :props="props">
          <div class="column q-gutter-y-xs items-start">
            <template v-if="createPlanningStore.activities.length">
              <div
                class="row"
                v-for="item in createPlanningStore.activities"
                :key="item.id"
              >
                <div class="d-flex justify-start items-center">
                  <q-badge color="primary" size="sm" rounded outline>
                    {{ item.name }}
                  </q-badge>
                  <q-icon
                    v-if="item.obligatorio_c === 'yes'"
                    name="warning"
                    color="orange-4"
                    size="1.3rem"
                    class="q-ml-xs"
                  >
                    <q-tooltip
                      anchor="center right"
                      self="center left"
                      :offset="[0, 10]"
                    >
                      Esta tarea SI es obligatoria
                    </q-tooltip>
                  </q-icon>
                  <q-tooltip
                    v-else
                    anchor="center right"
                    self="center left"
                    :offset="[0, 10]"
                  >
                    Esta tarea NO es obligatoria
                  </q-tooltip>
                </div>
              </div>
            </template>
            <template v-if="!createPlanningStore.activities.length">
              <div class="row">
                <q-badge color="grey" size="sm" rounded outline>
                  Sin tareas de cabecera
                </q-badge>
              </div>
            </template>
          </div>
        </q-td>
        <q-td key="hourOfInit" :props="props">
          {{ props.row.hourOfInit }}
          <q-popup-edit
            v-model="props.row.hourOfInit"
            auto-save
            v-slot="scope"
            :disable="createPlanningStore.readonly"
            @update:model-value="
              (value) => {
                const hourOfInit = moment(value, 'HH:mm');
                const duration = moment(props.row.duration, 'HH:mm');
                const hourOfEnd = hourOfInit
                  .add(duration.hours(), 'hours')
                  .add(duration.minutes(), 'minutes');

                props.row.hourOfEnd = hourOfEnd.format('HH:mm');

                if (createPlanningStore.type === 'T02') {
                  const row = createPlanningStore.deliveryRoutes[parentIndex];
                  for (let i = props.rowIndex; i < row.deliveries.length; i++) {
                    if (row.deliveries[i - 1]) {
                      const hourOfEnd = moment(
                        row.deliveries[i - 1].hourOfEnd,
                        'HH:mm',
                      );
                      const duration = moment(
                        row.deliveries[i].duration,
                        'HH:mm',
                      );
                      row.deliveries[i].hourOfInit = hourOfEnd.format('HH:mm');
                      row.deliveries[i].hourOfEnd = moment(
                        row.deliveries[i].hourOfInit,
                        'HH:mm',
                      )
                        .add(duration.hours(), 'hours')
                        .add(duration.minutes(), 'minutes')
                        .format('HH:mm');
                    }
                  }
                } else {
                  const row = createPlanningStore.visitingRoutes[parentIndex];
                  for (let i = props.rowIndex; i < row.visits.length; i++) {
                    if (row.visits[i - 1]) {
                      const hourOfEnd = moment(
                        row.visits[i - 1].hourOfEnd,
                        'HH:mm',
                      );
                      const duration = moment(row.visits[i].duration, 'HH:mm');
                      row.visits[i].hourOfInit = hourOfEnd.format('HH:mm');
                      row.visits[i].hourOfEnd = moment(
                        row.visits[i].hourOfInit,
                        'HH:mm',
                      )
                        .add(duration.hours(), 'hours')
                        .add(duration.minutes(), 'minutes')
                        .format('HH:mm');
                    }
                  }
                }
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
            :disable="createPlanningStore.readonly"
            separate-close-popup
            @update:model-value="
              (value) => {
                const duration = moment(value, 'HH:mm');
                const hourOfInit = moment(props.row.hourOfInit, 'HH:mm');
                const hourOfEnd = hourOfInit
                  .add(duration.hours(), 'hours')
                  .add(duration.minutes(), 'minutes');

                if (createPlanningStore.type === 'T01') {
                  const row = createPlanningStore.visitingRoutes[parentIndex];
                  createPlanningStore.visitingRoutes[parentIndex].visits[
                    props.rowIndex
                  ].hourOfEnd = hourOfEnd.format('HH:mm');
                  for (let i = props.rowIndex; i < row.visits.length; i++) {
                    if (row.visits[i - 1]) {
                      const hourOfEnd = moment(
                        row.visits[i - 1].hourOfEnd,
                        'HH:mm',
                      );
                      const duration = moment(row.visits[i].duration, 'HH:mm');
                      row.visits[i].hourOfInit = hourOfEnd.format('HH:mm');
                      row.visits[i].hourOfEnd = moment(
                        row.visits[i].hourOfInit,
                        'HH:mm',
                      )
                        .add(duration.hours(), 'hours')
                        .add(duration.minutes(), 'minutes')
                        .format('HH:mm');
                    }
                  }
                } else {
                  const row = createPlanningStore.deliveryRoutes[parentIndex];
                  row.deliveries[props.rowIndex].hourOfEnd =
                    hourOfEnd.format('HH:mm');
                  for (let i = props.rowIndex; i < row.deliveries.length; i++) {
                    if (row.deliveries[i - 1]) {
                      const hourOfEnd = moment(
                        row.deliveries[i - 1].hourOfEnd,
                        'HH:mm',
                      );
                      const duration = moment(
                        row.deliveries[i].duration,
                        'HH:mm',
                      );
                      row.deliveries[i].hourOfInit = hourOfEnd.format('HH:mm');
                      row.deliveries[i].hourOfEnd = moment(
                        row.deliveries[i].hourOfInit,
                        'HH:mm',
                      )
                        .add(duration.hours(), 'hours')
                        .add(duration.minutes(), 'minutes')
                        .format('HH:mm');
                    }
                  }
                }
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
        <q-td key="hourOfEnd" :props="props">
          {{ props.row.hourOfEnd }}
        </q-td>
        <q-td auto-width>
          <q-btn
            v-if="props.row.customer.entregas"
            flat
            icon="visibility"
            rounded
            dense
            @click="showDeliveries(props.row)"
          >
            <q-tooltip> Ver entregas </q-tooltip>
          </q-btn>
          <q-btn-dropdown
            dropdown-icon="more_vert"
            flat
            dense
            rounded
            v-if="!createPlanningStore.readonly"
          >
            <q-list>
              <q-separator />
              <q-item
                clickable
                v-close-popup
                @click="
                  () => {
                    if (
                      createPlanningStore[
                        createPlanningStore.type === 'T01'
                          ? 'visitingRoutes'
                          : 'deliveryRoutes'
                      ][parentIndex]
                    ) {
                      createPlanningStore.removeVisit(
                        props.row,
                        createPlanningStore[
                          createPlanningStore.type === 'T01'
                            ? 'visitingRoutes'
                            : 'deliveryRoutes'
                        ][parentIndex],
                        parentIndex,
                        props.rowIndex,
                      );
                    }
                  }
                "
              >
                <q-item-section side>
                  <q-icon name="remove" text-color="white" />
                </q-item-section>
                <q-item-section>
                  <q-item-label> Quitar visita </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
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
      <div class="text-caption">{{ rows?.length }} Clientes</div>
    </template>
  </q-table>
  <q-dialog v-model="dialogDeliveries">
    <q-card v-if="selectedRow">
      <q-card-section>
        <div class="text-h6">{{ selectedRow.customer.name }}</div>
      </q-card-section>
      <q-card-section
        class="q-pt-none"
        v-for="entrega of selectedRow.customer.entregas"
        :key="entrega.entrega_name"
      >
        <q-expansion-item>
          <template #header>
            <q-item-section avatar>
              <q-avatar
                icon="local_shipping"
                color="primary"
                text-color="white"
              />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ entrega.entrega_name }}</q-item-label>
              <q-item-label caption>{{
                moment(entrega.entrega_fecha).format("dddd, DD/MM/YYYY")
              }}</q-item-label>
            </q-item-section>
            <q-item-section top side>
              <q-item-label caption>{{
                entrega.entrega_division_label
              }}</q-item-label>
              <q-item-label caption>{{
                entrega.entrega_amercado_label
              }}</q-item-label>
            </q-item-section>
          </template>
          <q-list separator>
            <q-item
              v-for="(product, index) of entrega.entregas_product"
              :key="index"
            >
              <q-item-section avatar>
                <q-avatar icon="vaccines" text-color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ product.product_name }}</q-item-label>
                <q-item-label caption
                  >Cantidad: {{ product.product_cantidad }}</q-item-label
                >
                <q-item-label caption>{{
                  product.product_part_number
                }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-expansion-item>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cerrar" color="negative" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
  <div
    v-if="isMobile"
    class="q-pa-md q-gutter-md"
    style="height: 100vh; max-height: 100vh"
  >
    <div class="row items-center justify-between">
      <q-btn flat icon="close" @click="closeDialog" />
    </div>
    <div
      v-if="rows?.length === 0"
      class="q-mb-md text-center text-h6 text-grey-5"
    >
      <div
        v-if="createPlanningStore.type === 'T01'"
        class="q-mb-md text-center text-h6 text-grey-5"
      >
        <q-icon name="warning" size="30px" color="warning" class="q-mb-xs" />
        <div class="text-h6 text-bold q-mb-sm">
          ¡Ups! No hay Clientes disponibles
        </div>
        <div class="text-subtitle2">
          Por favor, agregue clientes para continuar
        </div>
      </div>
      <div
        v-if="createPlanningStore.type === 'T02'"
        class="q-mb-md text-center text-h6 text-grey-5"
      >
        <q-icon name="warning" size="30px" color="warning" class="q-mb-xs" />
        <div class="text-h6 text-bold q-mb-sm">
          ¡Ups! No hay Entregas disponibles
        </div>
        <div class="text-subtitle2">
          Por favor, agregue Entregas para continuar
        </div>
      </div>
    </div>
    <div>
      <q-btn
        round
        color="primary"
        icon="o_person_add"
        size="lg"
        style="position: absolute; z-index: 9999; bottom: 60px; left: 80%"
        v-if="createPlanningStore.type === 'T01'"
        @click="onAddVisit"
      >
        <q-tooltip> Agregar cuenta </q-tooltip>
      </q-btn>
      <q-btn
        round
        color="primary"
        icon="local_shipping"
        size="lg"
        style="position: absolute; z-index: 9999; bottom: 60px; left: 80%"
        v-if="createPlanningStore.type === 'T02'"
        @click="onAddDelivery"
      >
        <q-tooltip> Agregar entrega </q-tooltip>
      </q-btn>
      <div
        v-for="(row, rowIndex) in rows"
        :key="row.uid"
        class="q-card-wrapper"
        :class="{
          'dragged-over': overIndex === rowIndex,
          'bg-grey-2 text-grey-5': !row.enabled,
        }"
        @click="moveRow(rowIndex)"
      >
        <q-card
          flat
          bordered
          class="rounded-xs"
          :class="{
            'selected-border': selectedRowIndex === rowIndex,
            'default-border': selectedRowIndex !== rowIndex,
          }"
          @mousedown="onRowMouseDown(rowIndex)"
          @mouseup="onRowMouseUp"
          @mouseleave="onRowMouseUp"
          style="margin-top: 10px"
        >
          <q-card-section>
            <div>
              <div class="q-mb-xs row items-center justify-between">
                <q-btn
                  v-if="
                    !createPlanningStore.readonly && selectedRowIndex === null
                  "
                  flat
                  icon="drag_indicator"
                  size="md"
                  color="grey-6"
                  @mousedown="startDragPress(rowIndex)"
                  @mouseup="endDragPress"
                  @mouseleave="endDragPress"
                  role="button"
                  class="rounded"
                >
                </q-btn>
                <q-avatar size="sm" color="primary" class="text-white">
                  {{ rowIndex + 1 }}
                </q-avatar>
                <div
                  class="text-h7 font-weight-bold text-primary text-center q-mb-xs"
                  style="
                    flex: 1;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                  "
                >
                  {{ row.customer.name }}
                </div>
                <div class="q-ml-auto">
                  <q-btn
                    v-if="row.customer.entregas"
                    flat
                    icon="visibility"
                    rounded
                    dense
                    @click="showDeliveries(row)"
                  >
                    <q-tooltip> Ver entregas </q-tooltip>
                  </q-btn>
                </div>
                <div class="q-mb-xs">
                  <q-btn
                    color="negative"
                    icon="delete"
                    @click="removeRow(rowIndex)"
                    :disable="createPlanningStore.readonly"
                    size="sm"
                    round
                  />
                </div>
              </div>
              <div
                class="q-mb-xs text-h7 route-details custom-input route-info"
                style="padding-bottom: 0px"
              >
                <div class="row">
                  <div class="col-9">
                    <div class="field">
                      <template v-if="row.customer.address">
                        <span class="q-mr-sm">{{ row.customer.address }}</span>
                      </template>
                      <template v-else> Sin dirección </template>
                    </div>
                    <div
                      class="field"
                      v-if="createPlanningStore.type === 'T01'"
                    >
                      <div class="row">
                        <label class="text-dark">Tareas Regla</label>&nbsp;
                        &nbsp;
                        <q-icon
                          name="visibility"
                          @click="toggleTasks(rowIndex)"
                          style="
                            cursor: pointer;
                            font-size: 24px;
                            transition: all 0.3s ease;
                          "
                          class="hover-effect"
                          :class="{ 'active-icon': showTasks[rowIndex] }"
                        />
                        <div v-if="showTasks[rowIndex]">
                          <div
                            v-for="activity in createPlanningStore.activities"
                            :key="activity.id"
                            class="d-flex justify-start items-center"
                          >
                            <div
                              v-if="
                                activity.tarea_para_c === 'H02' &&
                                row.customer.id === activity.idCliente &&
                                activity.estado_c === 'E01'
                              "
                            >
                              <q-badge color="primary" size="sm" rounded>
                                {{ activity.name }}
                              </q-badge>
                            </div>
                          </div>
                        </div>
                        <div
                          v-if="
                            showTasks[rowIndex] &&
                            createPlanningStore.activities.filter(
                              (activity) =>
                                activity.tarea_para_c === 'H02' &&
                                row.customer.id === activity.idCliente &&
                                activity.estado_c === 'E01',
                            ).length === 0
                          "
                        >
                          <q-badge color="grey" size="sm" rounded>
                            Sin tareas
                          </q-badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="col-3">
                    <div class="row items-center justify-end">
                      <span class="q-mr-sm">Cat 1:</span>
                      <q-avatar
                        :color="getColorByCategory(row.customer.category)"
                        size="sm"
                        class="text-white"
                      >
                        {{ row.customer.category }}
                      </q-avatar>
                    </div>
                    <div class="row items-center justify-end">
                      <span class="q-mr-sm">Cat 2:</span>
                      <q-avatar
                        :color="getColorByCategory(row.customer.secondCategory)"
                        size="sm"
                        class="text-white q-mt-xs"
                      >
                        {{ row.customer.secondCategory }}
                      </q-avatar>
                    </div>
                  </div>
                </div>
                <div class="row">
                  <div class="col-5">
                    <q-input
                      v-model="row.hourOfInit"
                      auto-save
                      mask="time"
                      :disable="createPlanningStore.readonly"
                      :rules="['time']"
                      class="q-input-xs text-sm"
                      dense
                      style="width: 70px; margin-top: -11px"
                      hint="Hora Inicio"
                    >
                      <template v-slot:prepend>
                        <q-icon
                          name="access_time"
                          class="cursor-pointer"
                          size="xs"
                        >
                          <q-popup-proxy
                            cover="false"
                            transition-show="scale"
                            transition-hide="scale"
                          >
                            <q-time v-model="row.hourOfInit" format24h>
                              <div class="row items-center justify-between">
                                <q-btn
                                  v-close-popup="1"
                                  label="Guardar"
                                  color="primary"
                                  flat
                                />
                                <q-btn
                                  v-close-popup="1"
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
                    <q-popup-edit
                      v-model="row.hourOfInit"
                      auto-save
                      v-slot="scope"
                      :disable="createPlanningStore.readonly"
                      @update:model-value="
                        (value) => {
                          const hourOfInit = moment(value, 'HH:mm');
                          const duration = moment(row.duration, 'HH:mm');
                          const hourOfEnd = hourOfInit
                            .add(duration.hours(), 'hours')
                            .add(duration.minutes(), 'minutes');

                          row.hourOfEnd = hourOfEnd.format('HH:mm');

                          if (createPlanningStore.type === 'T02') {
                            const row =
                              createPlanningStore.deliveryRoutes[parentIndex];
                            for (
                              let i = rowIndex;
                              i < row.deliveries.length;
                              i++
                            ) {
                              if (row.deliveries[i - 1]) {
                                const hourOfEnd = moment(
                                  row.deliveries[i - 1].hourOfEnd,
                                  'HH:mm',
                                );
                                const duration = moment(
                                  row.deliveries[i].duration,
                                  'HH:mm',
                                );
                                row.deliveries[i].hourOfInit =
                                  hourOfEnd.format('HH:mm');
                                row.deliveries[i].hourOfEnd = moment(
                                  row.deliveries[i].hourOfInit,
                                  'HH:mm',
                                )
                                  .add(duration.hours(), 'hours')
                                  .add(duration.minutes(), 'minutes')
                                  .format('HH:mm');
                              }
                            }
                          } else {
                            const row =
                              createPlanningStore.visitingRoutes[parentIndex];
                            for (let i = rowIndex; i < row.visits.length; i++) {
                              if (row.visits[i - 1]) {
                                const hourOfEnd = moment(
                                  row.visits[i - 1].hourOfEnd,
                                  'HH:mm',
                                );
                                const duration = moment(
                                  row.visits[i].duration,
                                  'HH:mm',
                                );
                                row.visits[i].hourOfInit =
                                  hourOfEnd.format('HH:mm');
                                row.visits[i].hourOfEnd = moment(
                                  row.visits[i].hourOfInit,
                                  'HH:mm',
                                )
                                  .add(duration.hours(), 'hours')
                                  .add(duration.minutes(), 'minutes')
                                  .format('HH:mm');
                              }
                            }
                          }
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
                  </div>
                  <div class="col-4">
                    <q-input
                      class="q-input-xs text-sm"
                      dense
                      style="width: 70px; margin-top: -11px"
                      v-model="row.duration"
                      mask="time"
                      :rules="['time']"
                      auto-save
                      :disable="createPlanningStore.readonly"
                      separate-close-popup
                      hint="Duración"
                      @update:model-value="
                        (value) => {
                          const duration = moment(value, 'HH:mm');
                          const hourOfInit = moment(row.hourOfInit, 'HH:mm');
                          const hourOfEnd = hourOfInit
                            .add(duration.hours(), 'hours')
                            .add(duration.minutes(), 'minutes');

                          if (createPlanningStore.type === 'T01') {
                            const row =
                              createPlanningStore.visitingRoutes[parentIndex];
                            createPlanningStore.visitingRoutes[
                              parentIndex
                            ].visits[rowIndex].hourOfEnd =
                              hourOfEnd.format('HH:mm');
                            for (let i = rowIndex; i < row.visits.length; i++) {
                              if (row.visits[i - 1]) {
                                const hourOfEnd = moment(
                                  row.visits[i - 1].hourOfEnd,
                                  'HH:mm',
                                );
                                const duration = moment(
                                  row.visits[i].duration,
                                  'HH:mm',
                                );
                                row.visits[i].hourOfInit =
                                  hourOfEnd.format('HH:mm');
                                row.visits[i].hourOfEnd = moment(
                                  row.visits[i].hourOfInit,
                                  'HH:mm',
                                )
                                  .add(duration.hours(), 'hours')
                                  .add(duration.minutes(), 'minutes')
                                  .format('HH:mm');
                              }
                            }
                          } else {
                            const row =
                              createPlanningStore.deliveryRoutes[parentIndex];
                            row.deliveries[rowIndex].hourOfEnd =
                              hourOfEnd.format('HH:mm');
                            for (
                              let i = rowIndex;
                              i < row.deliveries.length;
                              i++
                            ) {
                              if (row.deliveries[i - 1]) {
                                const hourOfEnd = moment(
                                  row.deliveries[i - 1].hourOfEnd,
                                  'HH:mm',
                                );
                                const duration = moment(
                                  row.deliveries[i].duration,
                                  'HH:mm',
                                );
                                row.deliveries[i].hourOfInit =
                                  hourOfEnd.format('HH:mm');
                                row.deliveries[i].hourOfEnd = moment(
                                  row.deliveries[i].hourOfInit,
                                  'HH:mm',
                                )
                                  .add(duration.hours(), 'hours')
                                  .add(duration.minutes(), 'minutes')
                                  .format('HH:mm');
                              }
                            }
                          }
                        }
                      "
                    >
                      <template v-slot:prepend>
                        <q-icon
                          name="access_time"
                          class="cursor-pointer"
                          size="xs"
                        >
                          <q-popup-proxy
                            cover
                            transition-show="scale"
                            transition-hide="scale"
                          >
                            <q-time v-model="row.duration" format24h>
                              <div class="row items-center justify-between">
                                <q-btn
                                  v-close-popup="1"
                                  label="Guardar"
                                  color="primary"
                                  flat
                                />
                                <q-btn
                                  v-close-popup="1"
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
                  </div>
                  <div class="col-3">
                    <q-input
                      v-model="row.hourOfEnd"
                      auto-save
                      mask="time"
                      :disable="true"
                      :rules="['time']"
                      class="q-input-xs text-sm"
                      dense
                      style="width: 45px; margin-left: 15px; margin-top: -11px"
                      hint="Hora Fin"
                    />
                  </div>
                </div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-input {
  font-size: 13px;
}

.hover-effect:hover {
  color: #007bff;
  transform: scale(1.2);
}

.active-icon {
  color: #26a69a;
  transform: rotate(180deg);
}

.q-icon:active {
  animation: bounce 0.2s ease-out;
}

.selected-border {
  border: 2px solid #1976d2;
  border-radius: 15px;
}

.default-border {
  border: 2px solid grey !important;
  border-radius: 15px;
}
@keyframes bounce {
  0% {
    transform: scale(1);
  }

  30% {
    transform: scale(1.2);
  }

  50% {
    transform: scale(1);
  }

  70% {
    transform: scale(1.1);
  }

  100% {
    transform: scale(1);
  }
}
</style>
