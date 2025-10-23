<script setup lang="ts">
import { router } from "@/router";
import DetailsAction from "@accounts/components/DetailsAction.vue";
import InfoCard from "@accounts/components/InfoCard.vue";
import { useAccountDetail } from "@accounts/composables";
import { useSelectedAccountStore } from "@accounts/store";
import { iconColor } from "@accounts/utils";
import { computed, ref, defineModel } from "vue";

const currentRoute = router.currentRoute.value;
const routeName = currentRoute.name;
const selectedAccountStore = useSelectedAccountStore();
const selectedDelivery = ref();
const model = defineModel();
const productDialog = computed({
  get: () => {
    return selectedDelivery.value !== void 0;
  },
  set: (value) => {
    if (!value) {
      selectedDelivery.value = undefined;
    }
  },
});

const { clientInfo, contactInfo, data, salesArea, isLoading, deliveries } =
  useAccountDetail(
    selectedAccountStore.getSelectedAccount!.id
  );
</script>

<template>
  <div
    class="row justify-center items-center"
    v-if="isLoading"
    style="height: 100%"
  >
    <q-spinner-dots color="primary" size="3em" class="q-mx-auto" />
  </div>
  <div class="column no-wrap" style="height: 100%" v-else>
    <div class="row q-pa-xs q-gutter-x-sm">
      <q-btn icon="close" flat round dense @click="model = false" />
      <div class="text-h6 text-center">Detalle de cuenta</div>
    </div>
    <div style="width: 100%; flex-grow: 1; overflow-y: scroll">
      <InfoCard title="Información del cliente">
        <div
          v-for="row in clientInfo"
          :key="row.label"
          class="row q-px-sm q-py-xs"
        >
          <div class="col text-bold">
            {{ row.label }}
          </div>
          <div class="col text-grey-7">
            {{ row.value }}
          </div>
        </div>
      </InfoCard>
      <InfoCard title="Telefonos, correos y direcciones">
        <div
          v-for="row in contactInfo"
          :key="row.label"
          class="row q-px-sm q-py-xs items-center no-wrap"
        >
          <div class="col-6 text-bold">
            {{ row.label }}
          </div>
          <q-input
            autogrow
            standout="bg-blue-10 text-white"
            v-model="row.value"
            v-if="row.modifiable"
            dense
          >
            <template v-slot:append>
              <q-icon
                name="o_location_on"
                :color="
                  iconColor[
                    selectedAccountStore.selectedAccount?.category || 'default'
                  ]
                "
              ></q-icon>
            </template>
          </q-input>
          <div class="col-6 text-grey-7" v-else>
            {{ row.value }}
          </div>
        </div>
      </InfoCard>
      <InfoCard
        title="Entregas"
        :empty="!deliveries?.length"
        emptyText="No hay entregas en esta cuenta"
      >
        <div v-for="(delivery, index) of deliveries" :key="index">
          <q-expansion-item
            expand-separator
            icon="o_local_shipping"
            :label="delivery.name"
            :caption="delivery.estado"
          >
            <div>
              <div
                class="row q-mb-sm q-pa-sm q-mx-xs"
                style="border: 1px solid gray; border-radius: 3px"
              >
                <div class="col text-bold">
                  <div>Nombre</div>
                  <div>Organización de ventas</div>
                  <div>Sector</div>
                  <div>Estado</div>
                </div>
                <div class="col text-grey-7">
                  <div>{{ delivery.name }}</div>
                  <div>{{ delivery.division }}</div>
                  <div>{{ delivery.amercado }}</div>
                  <div>{{ delivery.estado }}</div>
                </div>
              </div>
              <q-btn
                icon="visibility"
                label="Ver productos"
                color="primary"
                no-caps
                class="full-width"
                @click="() => (selectedDelivery = delivery)"
              />
            </div>
          </q-expansion-item>
        </div>
      </InfoCard>
      <InfoCard
        title="Área de ventas"
        :empty="!salesArea?.length"
        emptyText="No datos acerca del area de ventas en esta cuenta"
      >
        <div
          v-for="(row, index) in salesArea"
          :key="index"
          class="row q-mb-sm q-pa-sm q-mx-xs"
          style="border: 1px solid gray; border-radius: 3px"
        >
          <div class="col text-bold">
            <div>Organización de ventas</div>
            <div>Sector</div>
            <div>Regional</div>
            <div>Canal de ventas</div>
          </div>
          <div class="col text-grey-7">
            <div>
              {{ row.division }}
            </div>
            <div>
              {{ row.amercado }}
            </div>
            <div>
              {{ row.regional }}
            </div>
            <div>
              {{ row.canal_ventas }}
            </div>
          </div>
        </div>
      </InfoCard>
      <InfoCard
        :title="
          routeName == 'hane_entregas'
            ? 'Preferencia de Entregas'
            : 'Preferencia de Visitas'
        "
        :empty="!data?.preferencia_visita.length"
        emptyText="No hay preferencias de visita en esta cuenta"
      >
        <div
          v-for="(preference, index) of data?.preferencia_visita"
          :key="index"
        >
          <div
            class="row q-mb-sm q-pa-sm q-mx-xs"
            style="border: 1px solid gray; border-radius: 3px"
          >
            <div class="col text-bold">
              <div>Frecuencia</div>
              <div>Día(s)</div>
              <div>En Horario de visita de:</div>
            </div>
            <div class="col text-grey-7">
              <div>
                {{ preference.Frequency ? preference.Frequency : "Sin dato" }}
              </div>
              <div>{{ preference.Days ? preference.Days : "Sin dato" }}</div>
              <div>{{ preference.StartTime }} - {{ preference.EndTime }}</div>
            </div>
          </div>
        </div>
      </InfoCard>
    </div>
    <div class="row justify-around shadow-3" v-if="!!data">
      <DetailsAction :detail="data" />
    </div>
    <q-dialog v-model="productDialog">
      <q-table
        :rows="JSON.parse(selectedDelivery.entregas_product)"
        :columns="[
          {
            name: 'Producto',
            required: true,
            label: 'Producto',
            align: 'left',
            field: 'name',
          },
        ]"
        row-key="id"
      >
        <template #pagination></template>
      </q-table>
    </q-dialog>
  </div>
</template>

<style scoped></style>
