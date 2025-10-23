<script setup lang="ts">
import { useQuery } from "@tanstack/vue-query";
import { getVisits } from "../services";
import moment from "moment";
import { ref } from "vue";
import InfoCard from "@/modules/Accounts/components/InfoCard.vue";
import { useAdvancedFilterVisitsStore } from "../store/useAdvancedFilterVisitsStore";

const { item } = defineProps<{
  item: any;
}>();

const InfoVisitDialog = ref(false);
const selectedItem = ref(null);

const clientInfo = ref([]);

const showInfoDialog = (item: any) => {
  selectedItem.value = item; // Store selected item
  console.log("Opening dialog for item:", item);
  // Here you should populate the data
  clientInfo.value = [
    { label: "Cliente", value: item.NombreCliente },
    { label: "Usuario", value: item.NombreUsuario },
    { label: "Regional", value: item.regional },
    {
      label: "Fecha Inicio",
      value: moment(item.fecha_inicio_c, "YYYY-MM-DD").format(
        "dddd, DD/MM/YYYY",
      ),
    },
    {
      label: "Hora Inicio",
      value: moment(item.hora_inicio_c, "YYYY-MM-DD HH:mm:ss").format("HH:mm"),
    },
    {
      label: "Fecha Fin",
      value: moment(item.fecha_fin_c, "YYYY-MM-DD HH:mm:ss").format(
        "dddd, DD/MM/YYYY",
      ),
    },
    {
      label: "Hora Fin",
      value: moment(item.hora_fin_c, "YYYY-MM-DD HH:mm:ss").format("HH:mm"),
    },
    { label: "Duración", value: `${item.duracionReal || 0} minutos` },
    { label: "Secuencia", value: item.secuencia_c || "No definido" },
    { label: "Latitud", value: item.Latitud || "No definido" },
    { label: "Longitud", value: item.Longitud || "No definido" },

    //{ label: 'ID Ruta', value: item.RutaID || 'No disponible' }
    // Add other client info
  ];
  InfoVisitDialog.value = true;
};
</script>
<template>
  <q-item clickable v-ripple @click="showInfoDialog(item)">
    <q-item-section avatar>
      <q-avatar color="primary" text-color="white" icon="o_event" />
    </q-item-section>
    <q-item-section>
      <q-item-label>{{ item.NombreCliente }} </q-item-label>
      <q-item-label caption>{{ item.NombreUsuario }} </q-item-label>
      <q-item-label overline
        >{{
          moment(item.fecha_inicio_c, "YYYY-MM-DD HH:mm:ss").format(
            "dddd, DD/MM/YYYY - HH:mm",
          )
        }}
      </q-item-label>
    </q-item-section>
  </q-item>

  <q-dialog v-model="InfoVisitDialog" position="right" :maximized="true">
    <div style="min-width: 450px; max-width: 450px" class="bg-white">
      <div class="column no-wrap" style="max-height: 100vh; min-height: 100vh">
        <div
          class="bg-blue-10 text-white row items-center justify-between q-px-md"
        >
          <div class="q-pa-sm row items-center q-gutter-x-md">
            <q-icon
              name="close"
              color="white"
              size="2rem"
              @click="InfoVisitDialog = false"
            ></q-icon>
            <div>
              <div class="text-h6">Detalles de la visita</div>
            </div>
          </div>
        </div>
        <div
          class="q-pa-sm"
          style="
            flex-grow: 1;
            overflow-y: scroll;
            display: flex;
            flex-direction: column;
            flex-wrap: nowrap;
            gap: 10px;
          "
        >
          <q-item-label overline v-if="selectedItem">
            <strong>Inicio:</strong>
            {{
              moment(selectedItem.fecha_inicio_c, "YYYY-MM-DD HH:mm:ss").format(
                "dddd, DD/MM/YYYY - HH:mm",
              )
            }}
          </q-item-label>
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
          </div>
        </div>

        <div class="row justify-center q-gutter-x-md q-pa-sm shadow-14">
          <q-btn outline color="danger" icon="close" v-close-popup
            >Cerrar</q-btn
          >
        </div>
      </div>
    </div>
  </q-dialog>
</template>

<style scoped></style>
