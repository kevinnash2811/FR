<script setup lang="ts">
import moment from "moment";
import { getCssVar, useQuasar } from "quasar";
import type { PlanningResponse, Ruta } from "../types";
import { useRouter } from "vue-router";
import { colorStatePlanning } from "../utils";
import { useQuery } from "@tanstack/vue-query";
import { usePlanningServices } from "../composables";
import { useUserStore } from "@/store";
import { accountsApi } from "@/connections/axiosCRM";
import { ref } from "vue";
import { computed } from "vue";
const router = useRouter();
const $q = useQuasar();
const userStore = useUserStore();
const { item } = defineProps<{
  item: any;
}>();

const openCreatePlanning = (planning: PlanningResponse) => {
  router.push({
    name: "create",
    params: { type: planning.planificacion_tipo },
    query: { id: planning.planificacion_id },
  });
};

const { changePlanningState, sendToQueue } = usePlanningServices();
const onChangePlanningState = (
  planningId: string,
  value: string,
  type: "T01" | "T02",
): void => {
  if (
    (value === "EP02" || value === "EP03" || value === "EP05") &&
    !userStore.isSupervisor &&
    !userStore.isAdmin
  ) {
    $q.notify({
      message: "No tiene permisos para cambiar el estado de la planificación",
      color: "negative",
    });
    return;
  }

  $q.dialog({
    ok: {
      label: "Aceptar",
      color: "primary",
    },
    title: "Cambiar estado",
    message: "¿Está seguro de cambiar el estado de la planificación?",
    cancel: {
      label: "Cancelar",
      color: "negative",
    },
  }).onOk(() => {
    changePlanningState({
      id: planningId,
      estado: value,
    }).then(() => {
      $q.notify({
        message: "Estado actualizado correctamente",
        color: "positive",
      });

      if (value === "EP02" && type === "T02") {
        const notif = $q.notify({
          group: false,
          timeout: 0,
          message: "Enviando a cola de planificación",
          color: "positive",
          spinner: true,
          icon: "hourglass_empty",
        });

        sendToQueue({ id: planningId }).then(() => {
          notif({
            icon: "done",
            spinner: false,
            message: "Enviado a cola de planificación",
            color: "positive",
            timeout: 2000,
          });
        });
      }
    });
  });
};
const enabledGetRoutes = ref<boolean>(false);

const handleExpand = (expanded: boolean) => {
  if (expanded && !enabledGetRoutes.value) {
    enabledGetRoutes.value = true;
  }
};

const {
  data: rutas,
  isFetching,
  isLoading,
} = useQuery({
  queryKey: ["rutas", item.planificacion_id],
  queryFn: async () => {
    const { data } = await accountsApi.get<Ruta[]>(
      `/hanrt_planificador/rutas/${item.planificacion_id}`,
    );
    return data;
  },
  initialData: [],
  enabled: enabledGetRoutes,
  refetchOnWindowFocus: false,
});

const isLoadingRoutes = computed(() => {
  return isFetching.value || isLoading.value;
});
</script>
<template>
  <q-expansion-item
    header-class="q-pa-none"
    class="q-ml-xs q-mb-xs q-mr-xs"
    hide-expand-icon
    @update:model-value="handleExpand"
  >
    <template #header="{ expanded }">
      <q-item
        class="ellipsis shadow-2"
        style="width: 100%"
        :style="{
          borderRadius: expanded ? '0 5px 0 0' : '0 5px 5px 0',
          borderLeft:
            item.planificacion_tipo === 'T01'
              ? `5px solid ${getCssVar('primary')}`
              : '5px solid orange',
        }"
        @click="(e) => {
                const element = e.target as HTMLElement;
                if(element.classList.contains('q-chip__content')) {
                  return;
                }
                 openCreatePlanning(item)
              }"
      >
        <q-item-section>
          <q-item-label overline>{{
            moment(
              item.planificacion_date_entered,
              "YYYY-MM-DD HH:mm:ss",
            ).format("dddd, DD/MM/YYYY - HH:mm")
          }}</q-item-label>
          <q-item-label class="ellipsis">
            <router-link
              :to="{
                name: 'create',
                params: { type: item.planificacion_tipo },
                query: { id: item.planificacion_id },
              }"
              class="text-primary"
              style="text-decoration: none"
            >
            </router-link>
            {{ item.planificacion_name }}
            <q-tooltip>
              {{ item.planificacion_description || item.planificacion_name }}
            </q-tooltip>
          </q-item-label>
          <q-item-label class="ellipsis" caption>
            {{ item.planificacion_user }}
            <q-tooltip>
              {{ item.planificacion_user }}
            </q-tooltip>
          </q-item-label>
          <q-item-label>
            <q-chip rounded color="grey-3" class="q-ma-none ellipsis" size="sm">
              <q-avatar
                :color="
                  item.planificacion_tipo === 'T01' ? 'primary' : 'orange'
                "
                text-color="white"
              >
                {{ item.total_rutas }}
              </q-avatar>
              Rutas
            </q-chip>
            <q-chip
              v-if="item.planificacion_estado"
              class="q-ma-none ellipsis q-ml-xs"
              size="sm"
              color="grey-3"
            >
              <q-avatar
                :color="colorStatePlanning[item.planificacion_estado]"
                :icon="
                  item.planificacion_estado === 'EP01'
                    ? 'hourglass_empty'
                    : item.planificacion_estado === 'EP02'
                    ? 'done'
                    : item.planificacion_estado === 'EP03'
                    ? 'cancel'
                    : item.planificacion_estado === 'EP04'
                    ? 'hourglass_empty'
                    : item.planificacion_estado === 'EP05'
                    ? 'block'
                    : 'hourglass_empty'
                "
                text-color="white"
              >
              </q-avatar>
              {{ item.planificacion_estado_label }}
            </q-chip>
            <div v-else>Sin estado</div>
          </q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-btn
            icon="visibility"
            flat
            round
            size="sm"
            color="blue"
            :to="{
              name: 'create',
              params: { type: item.planificacion_tipo },
              query: { id: item.planificacion_id },
            }"
          />
          <q-btn
            icon="published_with_changes"
            flat
            round
            size="sm"
            color="green"
          >
            <q-menu>
              <q-list style="min-width: 100px">
                <q-item
                  clickable
                  @click="
                    onChangePlanningState(
                      item.planificacion_id,
                      'EP02',
                      item.planificacion_tipo,
                    )
                  "
                  v-if="item.planificacion_estado !== 'EP02'"
                  v-close-popup
                >
                  <q-item-section>Aprobado</q-item-section>
                </q-item>
                <q-item
                  clickable
                  @click="
                    onChangePlanningState(
                      item.planificacion_id,
                      'EP01',
                      item.planificacion_tipo,
                    )
                  "
                  v-if="item.planificacion_estado !== 'EP01'"
                  v-close-popup
                >
                  <q-item-section>En Preparación</q-item-section>
                </q-item>
                <q-item
                  clickable
                  @click="
                    onChangePlanningState(
                      item.planificacion_id,
                      'EP04',
                      item.planificacion_tipo,
                    )
                  "
                  v-if="item.planificacion_estado !== 'EP04'"
                  v-close-popup
                >
                  <q-item-section>Pendiente de aprobación</q-item-section>
                </q-item>
                <q-separator />
                <q-item
                  clickable
                  @click="
                    onChangePlanningState(
                      item.planificacion_id,
                      'EP03',
                      item.planificacion_tipo,
                    )
                  "
                  v-if="item.planificacion_estado !== 'EP03'"
                  v-close-popup
                >
                  <q-item-section>Rechazado</q-item-section>
                </q-item>
                <q-item
                  clickable
                  @click="
                    onChangePlanningState(
                      item.planificacion_id,
                      'EP05',
                      item.planificacion_tipo,
                    )
                  "
                  v-if="item.planificacion_estado !== 'EP05'"
                  v-close-popup
                >
                  <q-item-section>Bloqueado</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
          <q-btn
            :icon="expanded ? 'expand_less' : 'expand_more'"
            flat
            round
            padding="none"
            color="black"
            class="q-ma-xs"
          >
          </q-btn>
        </q-item-section>
      </q-item>
    </template>
    <q-linear-progress indeterminate v-if="isLoadingRoutes" />
    <div
      v-else
      class="q-pa-xs bg-grey-5 shadow-1"
      style="border-radius: 0 0 5px 0"
    >
      <q-list class="">
        <q-item
          v-for="(route, index) of rutas"
          :key="route.id"
          :class="{
            'q-mb-xs': index !== rutas.length - 1,
          }"
          class=" bg-white rounded-borders"
          :style="{
            borderLeft:
              item.planificacion_tipo === 'T01'
                ? `5px solid ${getCssVar('primary')}`
                : '5px solid orange',
          }"
        >
          <q-item-section avatar>
            <q-avatar
              :color="item.planificacion_tipo === 'T01' ? 'primary' : 'orange'"
              text-color="white"
              >{{ route.secuencia_c }}</q-avatar
            >
          </q-item-section>
          <q-item-section>
            <q-item-label class="ellipsis">
              {{ route.name }}
              <q-tooltip>{{ route.name }}</q-tooltip>
            </q-item-label>
            <q-item-label
              caption
              class="ellipsis"
              v-if="route.usuario_asignado"
            >
              <template v-if="route.usuario_asignado.first_name">
                {{
                  route.usuario_asignado.first_name.concat(
                    " ",
                    route.usuario_asignado?.last_name,
                  )
                }}
                |
              </template>
              <template v-else>
                {{ route.usuario_asignado.last_name }} |
              </template>
              {{ route.usuario_asignado.user_name }}
              <q-tooltip>
                <template v-if="route.usuario_asignado.first_name">
                  {{
                    route.usuario_asignado.first_name.concat(
                      " ",
                      route.usuario_asignado?.last_name,
                    )
                  }}
                  |
                </template>
                <template v-else>
                  {{ route.usuario_asignado.last_name }} |
                </template>
              </q-tooltip>
            </q-item-label>
          </q-item-section>
          <q-item-section top side>
            <q-item-label caption
              >{{
                moment(route.fecha_plan_c, "YYYY-MM-DD HH:mm:ss").format(
                  "dddd, DD/MM/YYYY",
                )
              }}
            </q-item-label>
            <template v-if="route?.total_clientes">
              <q-item-label caption>
                <q-badge
                  rounded
                  :color="
                    item.planificacion_tipo === 'T01' ? 'primary' : 'orange'
                  "
                >
                  {{ route.total_clientes }}
                </q-badge>
                <template v-if="item.planificacion_tipo === 'T01'"
                  >Visitas</template
                >
                <template v-else>Entregas</template>
              </q-item-label>
            </template>
          </q-item-section>
        </q-item>
      </q-list>
    </div>
  </q-expansion-item>
</template>

<style scoped></style>
