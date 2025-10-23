<script setup lang="ts">
import DateRangeHandler from "@/components/DateRangeHandler.vue";
import FilterWrapper from "@/components/FilterWrapper.vue";
import ListSelect from "@/components/ListSelect.vue";
import UserAvatar from "@/components/UserAvatar.vue";
import { useUserStore } from "@/store";
import { useAdvancedFilterPlanningStore } from "../store/useAdvancedFilterPlanningStore";
import { colorStatePlanning } from "../utils";

const userStore = useUserStore();
const filterAdvancedPlanning = useAdvancedFilterPlanningStore();
</script>

<template>
  <filter-wrapper>
    <list-select
      clearable
      outlined
      v-model="filterAdvancedPlanning.filter.estado"
      label="Estado"
      list="estado_planificacion_c_list"
      dense
      :class="{
        'bg-blue-1': filterAdvancedPlanning.filter.estado === 'EP01',
        'bg-green-1': filterAdvancedPlanning.filter.estado === 'EP02',
        'bg-red-1': filterAdvancedPlanning.filter.estado === 'EP03',
        'bg-orange-1': filterAdvancedPlanning.filter.estado === 'EP04',
      }"
      :color="colorStatePlanning[filterAdvancedPlanning.filter.estado]"
    />
    <q-select
      v-if="userStore.user"
      emit-value
      map-options
      outlined
      dense
      v-model="filterAdvancedPlanning.filter.creado_por"
      multiple
      use-chips
      label="Creado por"
      :options="userStore.user.reports_to_id ?? []"
      use-input
      input-debounce="300"
      option-value="id"
      option-label="user_name"
      :readonly="!userStore.isSupervisor"
    >
      <template #selected-item="scope">
        <q-chip
          :removable="scope.opt.id !== userStore.user.id"
          dense
          @remove="scope.removeAtIndex(scope.index)"
          :tabindex="scope.tabindex"
          size="md"
          style="max-width: 140px"
        >
          <UserAvatar :avatar="scope.opt.avatar" />
          <div class="ellipsis">
            {{ scope.opt.user_name }}
            <q-tooltip class="bg-primary">
              <div>{{ scope.opt.user_name }}</div>
            </q-tooltip>
          </div>
        </q-chip>
      </template>
      <template #option="scope">
        <q-item v-bind="scope.itemProps">
          <q-item-section avatar>
            <UserAvatar :avatar="scope.opt.avatar" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ scope.opt.user_name }}</q-item-label>
            <q-item-label caption>{{ scope.opt.a_mercado }}</q-item-label>
          </q-item-section>
        </q-item>
      </template>
      <template #no-option>
        <q-item>
          <q-item-section>
            <q-item-label>No hay resultados</q-item-label>
          </q-item-section>
        </q-item>
      </template>
    </q-select>
    <list-select
      v-model="filterAdvancedPlanning.filter.tipo"
      list="hansa_tipoplanificacion_list"
      outlined
      label="Tipo"
      dense
      clearable
      size="sm"
    />
    <date-range-handler
      v-model="filterAdvancedPlanning.filter.date"
      unionString="al"
      outlined
      dense
      mask="DD/MMMM/YYYY"
      label="Fecha de creación"
    />
    <list-select
      list="hansa_divisiones_list"
      v-model="filterAdvancedPlanning.filter.division"
      outlined
      dense
      clearable
      label="Organización de ventas"
    />
    <list-select
      list="hansa_amercado_list"
      v-model="filterAdvancedPlanning.filter.sector"
      outlined
      dense
      clearable
      label="Sector"
    />
    <list-select
      list="hansa_dimregional_list"
      v-model="filterAdvancedPlanning.filter.regional"
      outlined
      dense
      label="Regional"
      clearable
    />
  </filter-wrapper>
</template>
