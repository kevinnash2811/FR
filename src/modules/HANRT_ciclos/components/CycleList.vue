<script setup lang="ts">
import { useQuery } from "@tanstack/vue-query";
import { getCycles } from "../services";
import moment from "moment";
import LoadingList from "@/components/LoadingList.vue";
import { getCssVar } from "quasar";

const { data, isLoading } = useQuery({
  queryKey: ["cycles"],
  queryFn: () => {
    return getCycles();
  },
});
</script>

<template>
  <loading-list
    :isLoading="isLoading"
    :isEmpty="!data?.length"
    emptyMessage="No hay ciclos"
  >
    <q-virtual-scroll style="height: 100%" :items="data" v-slot="{ item }">
      <q-item
      class="q-mb-xs q-ml-sm"
        :key="item.id"
        :style="{
          borderLeft:
            item.ciclo_estado_c === '01'
              ? `5px solid ${getCssVar('primary')}`
              : item.ciclo_estado_c === '02'
              ? `5px solid ${getCssVar('positive')}`
              : item.ciclo_estado_c === '03'
              ? `5px solid ${getCssVar('negative')}`
              : `5px solid blue`,
        }"
      >
        <q-item-section avatar>
          <q-avatar color="primary" text-color="white" icon="o_date_range">
            <q-tooltip
              anchor="center right"
              self="center left"
              :offset="[10, 10]"
            >
              {{
                moment(item.ciclo_fecha_inicio_hora_c).format(
                  "dddd [de] MMMM [del] YYYY",
                )
              }}
              al
              {{
                moment(item.ciclo_fecha_fin_hora_c).format(
                  "dddd [de] MMMM [del] YYYY",
                )
              }}
            </q-tooltip>
          </q-avatar>
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ item.ciclo_name }} </q-item-label>
          <q-item-label caption>{{ item.region_c_label }} </q-item-label>
          <q-item-label>
            <div class="row" style="gap: 5px">
              <q-chip
                v-if="item.ciclo_dias_c"
                rounded
                class="q-ma-none ellipsis"
                size="sm"
              >
                <q-avatar color="orange" text-color="white">
                  {{ item.ciclo_dias_c }}
                </q-avatar>
                Dias
              </q-chip>
              <q-chip
                v-if="item.ciclo_horas_por_dia_c"
                rounded
                class="q-ma-none ellipsis"
                size="sm"
              >
                <q-avatar color="primary" text-color="white">
                  {{ item.ciclo_horas_por_dia_c }}
                </q-avatar>
                Horas por día
              </q-chip>
              <q-chip
                v-if="item.ciclo_cantidad_visitas_dia_c"
                rounded
                class="q-ma-none ellipsis"
                size="sm"
              >
                <q-avatar color="green" text-color="white">
                  {{ item.ciclo_cantidad_visitas_dia_c }}
                </q-avatar>
                Visitas por día
              </q-chip>
            </div>
          </q-item-label>
        </q-item-section>
        <q-item-section side top>
          <q-item-label caption>{{item.iddivision_c_label}}</q-item-label>
          <q-item-label caption>{{item.idamercado_c_label}}</q-item-label>
        </q-item-section>
      </q-item>
    </q-virtual-scroll>
  </loading-list>
</template>

<style scoped></style>
