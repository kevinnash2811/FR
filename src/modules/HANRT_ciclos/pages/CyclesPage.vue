<script setup lang="ts">
import HeaderPage from "@/components/HeaderPage.vue";
import ListSelect from "@/components/ListSelect.vue";
import { useDialogStore, useUserStore } from "@/store";
import { useQueryClient } from "@tanstack/vue-query";
import moment from "moment";
import { useQuasar } from "quasar";
import { computed, ref, shallowRef } from "vue";
import CycleList from "../components/CycleList.vue";
import { useCycleServices } from "../composables";
import { fileColumns, readFile } from "../helpers";
import type { Cycle } from "../types";
import CycleUsersList from "../components/CycleUsersList.vue";

const $q = useQuasar();
const queryClient = useQueryClient();
const file = ref<File>();
const userStore = useUserStore();
const dialogStore = useDialogStore();
const easyFilter = ref<string>("");
const salesOrganization = computed({
  get: () => userStore.user?.iddivision ?? "",
  set: (value: string) => {
    userStore.user!.iddivision = value;
  },
});
const sector = computed({
  get: () => userStore.user?.idamercado ?? "",
  set: (value: string) => {
    userStore.user!.idamercado = value;
  },
});
const analyzing = ref(false);
const resultsDialog = ref(false);
const results = ref<{
  errors: Array<{ message: string; position: { row: number; col: number } }>;
  rows: Cycle[];
}>({ errors: [], rows: [] });

const { createCycle } = useCycleServices();

const createCycles = async () => {
  if (!results.value.rows) {
    return;
  }

  try {
    const result = await Promise.all(
      results.value.rows.map((cycle) => {
        return createCycle({
          name: cycle.name,
          dateOfInit: cycle.dateOfInit,
          dateOfEnd: cycle.dateOfEnd,
          days: cycle.days,
          visitPerDay: cycle.visitPerDay,
          hourPerDay: cycle.hourPerDay,
          region:
            dictionaryRegion[
              replaceAccentMarks(cycle.region.trim().toLocaleLowerCase())
            ],
          description: cycle.description,
          idamercado: sector.value,
          iddivision: salesOrganization.value,
          userId: userStore.user!.id,
          state:
            dictionaryState[
              replaceAccentMarks(cycle.state.trim().toLocaleLowerCase())
            ],
          users: selectedUsers.value,
        });
      }),
    );

    queryClient.invalidateQueries({
      queryKey: ["cycles"],
    });
    file.value = undefined;
    resultsDialog.value = false;
    $q.notify({
      message: `Se han creado ${result.length} ciclos`,
      color: "positive",
    });
  } catch (error) {
    console.error(error);
  }
};

type CountLabelArg = {
  totalSize: string;
  filesNumber: number;
  maxFiles: number | string;
};
const counterLabelFn = ({
  totalSize,
  filesNumber,
  maxFiles,
}: CountLabelArg) => {
  return `${filesNumber} Archivos de ${maxFiles} | ${totalSize}`;
};

const dictionaryState: Record<string, string> = {
  "en preparacion": "01",
  activo: "02",
  inactivo: "03",
};

const dictionaryRegion: Record<string, string> = {
  todas: "",
  central: "BO01_01",
  "santa cruz": "BO02_02",
  montero: "BO03_03",
  "la paz": "BO04_04",
  "el alto": "BO05_05",
  cochabamba: "BO06_06",
  quillacollo: "BO07_07",
  oruro: "BO08_08",
  sucre: "BO09_09",
  potosi: "BO10_10",
  tarija: "BO11_11",
  trinidad: "BO12_12",
};

const replaceAccentMarks = (chain: string) => {
  const mapaTildes: Record<string, string> = {
    á: "a",
    é: "e",
    í: "i",
    ó: "o",
    ú: "u",
  };

  return chain.replace(/[áéíóúÁÉÍÓÚ]/g, (letter) => mapaTildes[letter]);
};

const downloadExcelFormat = () => {
  const link = document.createElement("a");
  link.href = "/assets/ciclos.xlsx";
  link.download = "formato ciclos - carga masiva.xlsx";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const analizeFile = async () => {
  if (!file.value) {
    return;
  }
  analyzing.value = true;

  try {
    const data = await readFile(file.value);
    results.value = data.reduce((acc, row, index) => {
      const cicle = Object.values(row);
      const dateOfInit = moment(cicle[2]);
      const dateOfEnd = moment(cicle[3]);
      const hourPerDay = Number(cicle[7]);

      if (!acc["errors"]) {
        acc["errors"] = [];
      }

      if (!acc["rows"]) {
        acc["rows"] = [];
      }

      if (!dateOfInit.isValid()) {
        acc["errors"].push({
          message: `El ciclo ${cicle[0]} tiene una fecha de inicio invalida`,
          position: { row: index, col: 1 },
        });
      }

      if (!dateOfEnd.isValid()) {
        acc["errors"].push({
          message: `El ciclo ${cicle[0]} tiene una fecha de fin invalida`,
          position: { row: index, col: 2 },
        });
      }

      if (dateOfEnd.isBefore(dateOfInit)) {
        acc["errors"].push({
          message: `El ciclo ${cicle[0]} tiene una fecha de inicio mayor a la fecha de fin`,
          position: { row: index, col: 1 },
        });
      }

      if (
        !dictionaryState[
          replaceAccentMarks(cicle[4].trim().toLocaleLowerCase())
        ]
      ) {
        acc["errors"].push({
          message: `El estado del ciclo ${cicle[0]} no es valido`,
          position: { row: index, col: 7 },
        });
      }
      if (hourPerDay > 24 || hourPerDay <= 0) {
        acc["errors"].push({
          message: `El ciclo ${cicle[0]} tiene un valor inválido en horas por día. Debe ser entre 1 y 24 horas`,
          position: { row: index, col: 5 },
        });
      }

      if (
        !dictionaryRegion[
          replaceAccentMarks(cicle[8].trim().toLocaleLowerCase())
        ]
      ) {
        acc["errors"].push({
          message: `La region del ciclo ${cicle[0]} no es valida`,
          position: { row: index, col: 6 },
        });
      }

      acc["rows"].push({
        name: cicle[0],
        description: cicle[1],
        dateOfInit: dateOfInit.add(4, "h").format("YYYY-MM-DD"),
        dateOfEnd: dateOfEnd.add(4, "h").format("YYYY-MM-DD"),
        state: cicle[4],
        days: Number(cicle[5]),
        visitPerDay: Number(cicle[6]),
        hourPerDay: Number(cicle[7]),
        region: cicle[8],
      });

      return acc;
    }, {} as { errors: Array<{ message: string; position: { row: number; col: number } }>; rows: Cycle[] });

    resultsDialog.value = true;
  } catch (error) {
    console.error(error);
  } finally {
    analyzing.value = false;
  }
};

const openUserList = () => {
  dialogStore.openNewDrawer(shallowRef(CycleUsersList));
};
</script>

<template>
  <div style="height: 100vh; max-height: 100vh" class="column no-wrap">
    <HeaderPage title="Ciclos" />
    <div class="q-pa-sm">
      <q-input
        rounded
        outlined
        dense
        label="Buscar ciclo"
        debounce="2000"
        style="flex-grow: 1"
        v-model="easyFilter"
      >
        <template #prepend>
          <q-icon name="search" />
        </template>
        <template #after>
          <q-btn
            color="blue-10"
            icon="o_cloud_upload"
            dense
            @click="resultsDialog = true"
          >
            <q-tooltip>Cargar ciclos</q-tooltip>
          </q-btn>
        </template>
        <template #append>
          <q-icon name="o_help_outline">
            <q-tooltip> Busqueda por: Nombre, Descripción </q-tooltip>
          </q-icon>
        </template>
      </q-input>
    </div>
    <div style="flex-grow: 1; overflow: hidden">
      <cycle-list></cycle-list>
    </div>
  </div>
  <q-dialog v-model="resultsDialog" full-width 
  
  >
    <q-card flat>
      <q-card-section>
        <div class="text-h6">Carga masiva de ciclos</div>
      </q-card-section>
      <q-card-section class="q-pt-none">
        <q-table
          flat
          color="primary"
          :rows-per-page-options="[0]"
          :columns="fileColumns"
          :rows="results.rows"
          :loading="analyzing"
          style="max-height: 500px"
        >
          <template #body="props">
            <q-tr :props="props">
              <q-td
                v-for="(col, index) in props.cols"
                :key="col.name"
                :props="props"
                :class="{
                  'bg-negative text-white': results.errors.some(
                    (error) =>
                      error.position.row === props.rowIndex &&
                      error.position.col === index,
                  ),
                }"
              >
                <template v-if="['dateOfInit', 'dateOfEnd'].includes(col.name)">
                  {{ moment(props.row[col.name]).format("dddd, DD-MM-YYYY") }}
                </template>
                <template v-else>
                  {{ props.row[col.name] }}
                </template>
              </q-td>
            </q-tr>
          </template>
          <template #top-left>
            <div class="row q-gutter-sm" style="gap: 5px; flex-wrap: wrap">
              <div>
                <ListSelect
                  outlined
                  v-model="salesOrganization"
                  label="Organización de ventas"
                  list="hansa_divisiones_list"
                  dense
                />
              </div>
              <div>
                <ListSelect
                  outlined
                  v-model="sector"
                  label="Sector"
                  list="hansa_amercado_list"
                  dense
                />
              </div>
              <div>
                <q-btn
                  color="primary"
                  icon="o_person_add"
                  @click="openUserList"
                  class="full-width"
                >
                  <q-tooltip>Asignar ciclos a un usuario</q-tooltip>
                </q-btn>
              </div>
            </div>
          </template>
          <template #top-right>
            <div class="q-mt-md">
              <q-file
                v-model="file"
                dense
                counter
                accept=".xlsx, .xls, .csv"
                max-files="1"
                outlined
                label="Carga masiva"
                :counter-label="counterLabelFn"
              >
                <template #file="props">
                  <q-chip
                    v-if="props.file"
                    removable
                    @remove="file = undefined"
                    dense
                  >
                    {{ props.file.name }}
                  </q-chip>
                </template>
                <template #before>
                  <q-icon
                    name="o_file_download"
                    @click="downloadExcelFormat"
                    color="primary"
                  >
                    <q-tooltip :offset="[10, 10]" self="center left">
                      Descargar el formato de carga masiva
                    </q-tooltip>
                  </q-icon>
                </template>
                <template #after v-if="file">
                  <q-btn
                    color="primary"
                    dense
                    icon="cloud_upload"
                    round
                    @click="analizeFile"
                    :loading="analyzing"
                  />
                </template>
              </q-file>
            </div>
          </template>

          <template #bottom>
            <div class="column q-gutter-y-sm" style="width: 100%">
              <div class="text-negative text-bold q-mb-sm">
                Errores encontrados: {{ results.errors.length }}
              </div>
            </div>
          </template>
          <template #pagination>
            <div>Ciclos a cargar: {{ results.rows.length }}</div>
          </template>
          <template #no-data>
            <div class="q-mx-auto row q-gutter-x-sm items-center">
              <q-icon name="error" color="negative" size="sm"> </q-icon>
              <div class="caption">No se han cargado ciclos</div>
            </div>
          </template>
        </q-table>
      </q-card-section>
      <q-separator></q-separator>
      <q-card-actions align="right">
        <q-btn flat label="Cancelar" color="red" v-close-popup />
        <q-btn
          flat
          label="Guardar"
          color="primary"
          v-close-popup
          @click="createCycles"
          :disable="results.errors.length > 0"
        >
          <q-tooltip v-if="results.errors.length > 0">
            Errores en el Archivo
          </q-tooltip>
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<style scoped></style>
