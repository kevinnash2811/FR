<script setup lang="ts">
import FilterWrapper from "@/components/FilterWrapper.vue";
import ListSelect from "@/components/ListSelect.vue";
import UserAvatar from "@/components/UserAvatar.vue";
import { accountsApi } from "@/connections/axiosCRM";
import creationDateOptions from "@/data/HANSACRM4.lang_es_date_range_search_dom_list.json";
import { useUserStore } from "@/store";
import type { ListResponseAPI, UserAccount } from "@/types";
import { getDateMoment } from "@/utils";
import { useQuery } from "@tanstack/vue-query";
import { computed, ref } from "vue";
import moment from "moment";
import { useAdvancedFilterDeliveryStore } from "@accounts/store";
const userStore = useUserStore();
const advancedFilterStore = useAdvancedFilterDeliveryStore();
const userOptions = ref<UserAccount[]>([]);
const selectedDate = ref("");
const from = ref("");
const to = ref("");
const creationDate = computed(() => {
  const date = getDateMoment();
  let response;

  const dateOptions: Record<string, { from: string; to: string }> = {
    this_year: { from: date.gestionPresente.from, to: date.gestionPresente.to },
    this_month: { from: date.esteMes.from, to: date.esteMes.to },
    last_year: { from: date.gestionPasada.from, to: date.gestionPasada.to },
    last_month: { from: date.mesPasado.from, to: date.mesPasado.to },
    last_30_days: { from: date.ultimos30dias.from, to: date.ultimos30dias.to },
    last_7_days: { from: date.unaSemana.from, to: date.unaSemana.to },
    less_than: { from: from.value, to: from.value },
    greater_than: { from: from.value, to: from.value },
    not_equal: { from: from.value, to: from.value },
    "=": { from: from.value, to: from.value },
    between: { from: from.value, to: to.value },
  };

  const selectedOption = dateOptions[selectedDate.value];
  if (selectedOption) {
    // advancedFilterStore.setCreationDate({
    //   from: selectedOption.from,
    //   to: selectedOption.to,
    //   operator:
    //     selectedDate.value === "less_than"
    //       ? "<"
    //       : selectedDate.value === "greater_than"
    //       ? ">"
    //       : selectedDate.value === "="
    //       ? "="
    //       : selectedDate.value === "not_equal"
    //       ? "<>"
    //       : "between",
    // });
    response = `${selectedOption.from} a ${selectedOption.to}`;
  } // TODO: Deacoplar advancedFilterStore de este componente

  return response;
});

const showDatePicker = computed(
  () =>
    selectedDate.value === "less_than" ||
    selectedDate.value === "greater_than" ||
    selectedDate.value === "not_equal" ||
    selectedDate.value === "=" ||
    selectedDate.value === "between",
);
const withRange = computed(() => selectedDate.value === "between");
const { data } = useQuery({
  queryKey: ["userOptions"],
  queryFn: async () => {
    const { data } = await accountsApi.get<UserAccount[]>(`/users`, {
      params: {
        division: userStore.user?.iddivision,
      },
    });
    userOptions.value = data;

    return data;
  },
});

const filterPredicate = (fieldValue: string, item: ListResponseAPI) => {
  if (!fieldValue || !fieldValue.length) {
    return false;
  }

  return item.ID.includes(fieldValue) && item.ID.length > 0;
};

const onClearFields = () => {
  selectedDate.value = "";
  from.value = "";
  to.value = "";
  // advancedFilterStore.$reset();
};

const filterUsers = (val: string, update: (callback: () => void) => void) => {
  if (val === "" && !!data && !!data.value) {
    update(() => {
      userOptions.value = data.value;
    });
    return;
  }

  update(() => {
    userOptions.value =
      data.value?.filter((item) => {
        return item.user_name.toLowerCase().includes(val.toLowerCase());
      }) ?? [];
  });
};

const date = computed({
  get: () => {
    if (!advancedFilterStore.filter.date) {
      return "";
    }
    if (
      advancedFilterStore.filter.date.from ===
      advancedFilterStore.filter.date.to
    ) {
      return advancedFilterStore.filter.date.from;
    }

    return {
      from: advancedFilterStore.filter.date.from,
      to: advancedFilterStore.filter.date.to,
    };
  },
  set: (value: { from: string; to: string } | string | null) => {
    if (!value) {
      advancedFilterStore.filter.date = {
        from: "",
        to: "",
      };
    } else if (typeof value === "string") {
      advancedFilterStore.filter.date = {
        from: value,
        to: value,
      };
    } else if (typeof value === "object") {
      advancedFilterStore.filter.date = {
        from: value.from,
        to: value.to,
      };
    }
  },
});

const showDateInput = computed(() => {
  const from = moment(advancedFilterStore.filter.date?.from, "YYYY/MM/DD");
  const to = moment(advancedFilterStore.filter.date?.to, "YYYY/MM/DD");

  return `${from.format("dddd, DD-MM-YYYY")} - ${to.format(
    "dddd, DD-MM-YYYY",
  )}`;
});
</script>
<template>
  <filter-wrapper>
    <ListSelect
      dense
      outlined
      v-model="advancedFilterStore.filter.account_type"
      list="hansa_tipo_cuenta_list"
      label="Tipo de cuenta"
      clearable
    />
    <ListSelect
      dense
      outlined
      v-model="advancedFilterStore.filter.category"
      list="hansa_categoria_ventas_list"
      label="Categoria de ventas"
      clearable
    />
    <ListSelect
      dense
      outlined
      v-model="advancedFilterStore.filter.customerGroup"
      list="hansa_dimgrupocliente_list"
      label="Grupo de cliente"
      clearable
    />
    <q-input
      outlined
      dense
      readonly
      v-model="showDateInput"
      label="Fecha de entrega"
      debounce="1000"
    >
      <template #append>
        <q-icon name="event" class="cursor-pointer">
          <q-popup-proxy cover transition-show="scale" transition-hide="scale">
            <q-date v-model="date" range today-btn>
              <div class="row items-center justify-end">
                <q-btn
                  flat
                  color="primary"
                  label="Cerrar"
                  dense
                  v-close-popup
                />
              </div>
            </q-date>
          </q-popup-proxy>
        </q-icon>
      </template>
    </q-input>
    <q-input
      outlined
      dense
      v-model="advancedFilterStore.filter.comercial_name"
      label="Nombre comercial"
      debounce="1000"
    />
    <q-input
      outlined
      dense
      v-model="advancedFilterStore.filter.aio_code"
      label="Codigo cliente"
      debounce="1000"
    />
    <q-input
      outlined
      dense
      v-model="advancedFilterStore.filter.nit_ci"
      label="NIT / CI"
      debounce="1000"
    />
    <ListSelect
      dense
      outlined
      v-model="advancedFilterStore.filter.client_type"
      list="account_type_dom"
      label="Tipo cliente"
      clearable
    />
    <q-input
      outlined
      dense
      v-model="advancedFilterStore.filter.cellphone"
      label="Telefono celular"
      debounce="1000"
    />
    <q-input
      outlined
      dense
      v-model="advancedFilterStore.filter.email"
      label="Email"
      debounce="1000"
    />
    <q-select
      emit-value
      map-options
      outlined
      dense
      v-model="advancedFilterStore.filter.assigned_to"
      multiple
      use-chips
      label="Asignado a"
      :options="userStore.user?.reports_to_id ?? []"
      use-input
      input-debounce="300"
      option-value="id"
      option-label="user_name"
    >
      <template v-slot:selected-item="scope">
        <q-chip
          removable
          dense
          @remove="scope.removeAtIndex(scope.index)"
          :tabindex="scope.tabindex"
          color="grey-4"
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
      <template v-slot:option="scope">
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
    </q-select>
    <q-select
      emit-value
      map-options
      option-value="id"
      option-label="user_name"
      outlined
      dense
      v-model="advancedFilterStore.filter.created_by"
      multiple
      use-chips
      label="Creado por"
      :options="userOptions"
      @filter="filterUsers"
      use-input
      input-debounce="300"
    >
      <template #selected-item="scope">
        <q-chip
          removable
          dense
          @remove="scope.removeAtIndex(scope.index)"
          :tabindex="scope.tabindex"
          color="grey-4"
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
    <ListSelect
      dense
      outlined
      v-model="advancedFilterStore.filter.zona_venta_c"
      list="hansa_zona_transporte_list"
      label="Zona de distribución | transporte"
      input-debounce="300"
      multiple
      use-chips
    >
      <template v-if="advancedFilterStore.filter.zona_venta_c.length" #append>
        <q-icon
          name="cancel"
          @click.stop.prevent="advancedFilterStore.filter.zona_venta_c = []"
          class="cursor-pointer text-grey-6"
        />
      </template>
    </ListSelect>
    <ListSelect
      dense
      outlined
      v-model="advancedFilterStore.filter.country"
      list="hansa_pais_list"
      label="Pais"
      @update:modelValue="
        advancedFilterStore.filter.city = '';
        advancedFilterStore.filter.state = '';
      "
    />
    <ListSelect
      dense
      outlined
      v-model="advancedFilterStore.filter.city"
      :readonly="!advancedFilterStore.filter.country.length"
      list="hansa_dimregional_list"
      label="Departamento"
      :filterPredicate="
        (item) => filterPredicate(advancedFilterStore.filter.country, item)
      "
      :keepOptions="false"
    />
    <q-input
      outlined
      dense
      v-model="advancedFilterStore.filter.street"
      label="Dirección"
      debounce="1000"
    />
    <q-select
      emit-value
      map-options
      outlined
      dense
      v-model="selectedDate"
      label="Fecha de creación"
      clearable
      :options="creationDateOptions"
      option-label="label"
      option-value="value"
    />
    <q-input
      outlined
      dense
      v-model="creationDate"
      v-show="selectedDate?.length > 0 && !showDatePicker"
      readonly
    />
    <q-input
      clearable
      outlined
      dense
      v-model="from"
      label="Fecha de inicio"
      v-if="showDatePicker"
    >
      <template v-slot:append>
        <q-icon name="event" class="cursor-pointer">
          <q-popup-proxy cover transition-show="scale" transition-hide="scale">
            <q-date v-model="from" mask="DD-MM-YYYY">
              <div class="row items-center justify-end">
                <q-btn v-close-popup label="Close" color="primary" flat />
              </div>
            </q-date>
          </q-popup-proxy>
        </q-icon>
      </template>
    </q-input>
    <q-input
      clearable
      outlined
      dense
      v-model="to"
      label="Fecha de fin"
      v-if="withRange"
    >
      <template #append>
        <q-icon name="event" class="cursor-pointer">
          <q-popup-proxy cover transition-show="scale" transition-hide="scale">
            <q-date v-model="to" mask="DD-MM-YYYY">
              <div class="row items-center justify-end">
                <q-btn v-close-popup label="Close" color="primary" flat />
              </div>
            </q-date>
          </q-popup-proxy>
        </q-icon>
      </template>
    </q-input>
    <ListSelect
      dense
      outlined
      v-model="advancedFilterStore.filter.tax_regime"
      list="hansa_account_reg_tributario_list"
      label="Regimen tributario"
      clearable
    />
    <q-input
      outlined
      dense
      v-model="advancedFilterStore.filter.website"
      label="Sitio web"
      debounce="1000"
    />
  </filter-wrapper>
</template>

<style scoped>
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-thumb {
  background-color: rgb(117, 117, 117);
  border-radius: 2px;
}

::-webkit-scrollbar-track {
  background-color: rgba(0, 0, 0, 0.1);
}

::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.8);
}

::-webkit-scrollbar-thumb:active {
  background-color: rgba(0, 0, 0, 0.6);
}
</style>
|
