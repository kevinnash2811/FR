<script setup lang="ts">
import ListSelect from "@/components/ListSelect.vue";
import { useUserStore } from "@/store";
import type { ListResponseAPI } from "@/types";
import { useAdvancedFilterDeliveryStore } from "@accounts/store";
import { useCreatePlanningStore } from "@/modules/Planning/store";
import { colorStatePlanning } from "@/modules/Planning/utils";
import moment from "moment";
import { useQuasar } from "quasar";
import { computed, onMounted, ref } from "vue";
import { usePlanningServices } from "@/modules/Planning/composables/usePlanningServices";

const createPlanningStore = useCreatePlanningStore();
const sectorFilter = (item: ListResponseAPI) => {
  return item.ID.includes(createPlanningStore.sector);
};

const { changePlanningState, sendToQueue } = usePlanningServices();
const shadowState = ref(createPlanningStore.state);
const date = computed<string>(() => {
  if (typeof createPlanningStore.date === "string") {
    return createPlanningStore.date;
  }

  return createPlanningStore.date &&
    createPlanningStore.date.from &&
    createPlanningStore.date.to
    ? `${createPlanningStore.date.from} al ${createPlanningStore.date.to}`
    : "";
});

const $q = useQuasar();
const advancedFilterDeliveryStore = useAdvancedFilterDeliveryStore();
const userStore = useUserStore();
const onChangeRangeDate = (value: {
  from: { year: number; month: number; day: number };
  to: { year: number; month: number; day: number };
}) => {
  createPlanningStore.fetchActivities();
  if (!createPlanningStore.isValidDateOfInit()) {
    return;
  }
  const dateFrom = moment({
    year: value.from.year,
    month: value.from.month - 1,
    day: value.from.day,
  });
  const dateTo = moment({
    year: value.to.year,
    month: value.to.month - 1,
    day: value.to.day,
  });

  const shadowFrom = createPlanningStore.shadowDate?.from;
  const shadowTo = createPlanningStore.shadowDate?.to;

  if (dateFrom.isSame(shadowFrom) && dateTo.isSame(shadowTo)) {
    return;
  }

  if (createPlanningStore.routesLength === 0) {
    createPlanningStore.setShadowDate(dateFrom, dateTo);
    if (createPlanningStore.type === "T02") {
      advancedFilterDeliveryStore.filter.date = {
        from: dateFrom.format("YYYY/MM/DD"),
        to: dateTo.format("YYYY/MM/DD"),
      };
    }
    return;
  }

  if (
    !createPlanningStore.isValidDateOfInit() ||
    !createPlanningStore.shadowDate
  ) {
    return;
  }

  if (createPlanningStore.type === "T01") {
    if (
      moment(
        createPlanningStore.visitingRoutes[0].dateOfInit,
        "dddd, DD/MMMM/YYYY",
      ).day() !== dateFrom.day() &&
      createPlanningStore.isUpdateMode
    ) {
      $q.notify({
        message:
          "No se puede cambiar la fecha de inicio de la planificación: Día de la semana diferente",
        actions: [
          {
            icon: "close",
            color: "white",
            round: true,
          },
        ],
        color: "negative",
        timeout: 20000,
      });

      if (shadowFrom && shadowTo) {
        createPlanningStore.date = {
          from: shadowFrom.format("dddd, DD/MMMM/YYYY"),
          to: shadowTo.format("dddd, DD/MMMM/YYYY"),
        };
      }
      return;
    } else if (
      moment(
        createPlanningStore.visitingRoutes[0].dateOfInit,
        "dddd, DD/MMMM/YYYY",
      ).day() !== dateFrom.day() &&
      !createPlanningStore.isUpdateMode
    ) {
      $q.dialog({
        message:
          "El cambio de fecha es drasticamente diferente a la fecha anterior, se borraran todas las rutas. ¿Desea continuar?",
        ok: {
          label: "Sí",
          color: "primary",
          push: true,
        },
        cancel: {
          label: "No",
          color: "negative",
          push: true,
        },
      })
        .onOk(() => {
          createPlanningStore.visitingRoutes = [];
          createPlanningStore.setShadowDate(dateFrom, dateTo);
        })
        .onCancel(() => {
          if (!shadowFrom || !shadowTo) return;
          createPlanningStore.date = {
            from: shadowFrom.format("dddd, DD/MMMM/YYYY"),
            to: shadowTo.format("dddd, DD/MMMM/YYYY"),
          };
        });
    } else {
      const diffDays = dateFrom.diff(
        moment(
          createPlanningStore.visitingRoutes[0].dateOfInit,
          "dddd, DD/MMMM/YYYY",
        ),
        "days",
      );
      const totalDays = dateTo.diff(dateFrom, "days");

      if (
        totalDays ===
        createPlanningStore.shadowDate.to.diff(
          createPlanningStore.shadowDate.from,
          "days",
        )
      ) {
        createPlanningStore.visitingRoutes =
          createPlanningStore.visitingRoutes.map((route) => {
            const routeDateOfInit = moment(
              route.dateOfInit,
              "dddd, DD/MMMM/YYYY",
            ).add(diffDays, "days");

            return {
              ...route,
              named: routeDateOfInit.format("[Ruta,] dddd DD"),
              dateOfInit: routeDateOfInit.format("dddd, DD/MMMM/YYYY"),
            };
          });
      } else if (
        totalDays >
          createPlanningStore.shadowDate.to.diff(
            createPlanningStore.shadowDate.from,
            "days",
          ) ||
        totalDays > createPlanningStore.visitingRoutes.length
      ) {
        createPlanningStore.visitingRoutes =
          createPlanningStore.visitingRoutes.map((route) => {
            const routeDateOfInit = moment(
              route.dateOfInit,
              "dddd, DD/MMMM/YYYY",
            ).add(diffDays, "days");

            return {
              ...route,
              named: routeDateOfInit.format("[Ruta,] dddd DD"),
              dateOfInit: routeDateOfInit.format("dddd, DD/MMMM/YYYY"),
            };
          });
        let added = 0;
        while (
          moment(
            createPlanningStore.visitingRoutes[
              createPlanningStore.visitingRoutes.length - 1
            ].dateOfInit,
            "dddd, DD/MMMM/YYYY",
          ).isBefore(dateTo)
        ) {
          createPlanningStore.addVisitingRoute();
          added++;
        }

        $q.notify({
          message: `Se agregaron ${added} rutas como reajuste al rango de la planificación`,
          color: "primary",
          actions: [
            {
              icon: "close",
              color: "white",
              round: true,
            },
          ],
          timeout: 10000,
        });
      } else {
        $q.dialog({
          title: "¿Está seguro de cambiar la fecha?",
          message:
            "Si cambia la fecha, algunas rutas se eliminaran. ¿Desea continuar?",
          ok: {
            label: "Sí",
            color: "primary",
            push: true,
          },
          cancel: {
            label: "No",
            color: "negative",
            push: true,
          },
        })
          .onOk(() => {
            createPlanningStore.visitingRoutes =
              createPlanningStore.visitingRoutes.flatMap((route) => {
                const routeDateOfInit = moment(
                  route.dateOfInit,
                  "dddd, DD/MMMM/YYYY",
                ).add(diffDays, "days");

                if (createPlanningStore.to.isBefore(routeDateOfInit)) {
                  createPlanningStore.deletedVisitingRoutes.push(route.uid);
                  return [];
                }

                return {
                  ...route,
                  named: routeDateOfInit.format("[Ruta,] dddd DD"),
                  dateOfInit: routeDateOfInit.format("dddd, DD/MMMM/YYYY"),
                };
              });
          })
          .onCancel(() => {
            if (!shadowFrom || !shadowTo) return;
            createPlanningStore.date = {
              from: shadowFrom.format("dddd, DD/MMMM/YYYY"),
              to: shadowTo.format("dddd, DD/MMMM/YYYY"),
            };
          });
      }
    }
  } else {
    if (
      moment(
        createPlanningStore.deliveryRoutes[0].dateOfInit,
        "dddd, DD/MMMM/YYYY",
      ).day() !== dateFrom.day()
    ) {
      $q.notify({
        message:
          "No se puede cambiar la fecha de inicio de la planificación: Día de la semana diferente",
        actions: [
          {
            icon: "close",
            color: "white",
            round: true,
          },
        ],
        color: "negative",
        timeout: 20000,
      });

      if (shadowFrom && shadowTo) {
        createPlanningStore.date = {
          from: shadowFrom.format("dddd, DD/MMMM/YYYY"),
          to: shadowTo.format("dddd, DD/MMMM/YYYY"),
        };
      }
      return;
    }

    const diffDays = dateFrom.diff(
      moment(
        createPlanningStore.deliveryRoutes[0].dateOfInit,
        "dddd, DD/MMMM/YYYY",
      ),
      "days",
    );
    const totalDays = dateTo.diff(dateFrom, "days");

    if (
      totalDays ===
      createPlanningStore.shadowDate.to.diff(
        createPlanningStore.shadowDate.from,
        "days",
      )
    ) {
      createPlanningStore.deliveryRoutes =
        createPlanningStore.deliveryRoutes.map((route) => {
          const routeDateOfInit = moment(
            route.dateOfInit,
            "dddd, DD/MMMM/YYYY",
          ).add(diffDays, "days");

          return {
            ...route,
            named: routeDateOfInit.format("[Ruta,] dddd DD"),
            dateOfInit: routeDateOfInit.format("dddd, DD/MMMM/YYYY"),
          };
        });
    } else if (
      totalDays >
        createPlanningStore.shadowDate.to.diff(
          createPlanningStore.shadowDate.from,
          "days",
        ) ||
      totalDays > createPlanningStore.deliveryRoutes.length
    ) {
      createPlanningStore.deliveryRoutes =
        createPlanningStore.deliveryRoutes.map((route) => {
          const routeDateOfInit = moment(
            route.dateOfInit,
            "dddd, DD/MMMM/YYYY",
          ).add(diffDays, "days");

          return {
            ...route,
            named: routeDateOfInit.format("[Ruta,] dddd DD"),
            dateOfInit: routeDateOfInit.format("dddd, DD/MMMM/YYYY"),
          };
        });
      let added = 0;
      while (
        moment(
          createPlanningStore.deliveryRoutes[
            createPlanningStore.deliveryRoutes.length - 1
          ].dateOfInit,
          "dddd, DD/MMMM/YYYY",
        ).isBefore(dateTo)
      ) {
        createPlanningStore.addVisitingRoute();
        added++;
      }

      $q.notify({
        message: `Se agregaron ${added} rutas como reajuste al rango de la planificación`,
        color: "primary",
        actions: [
          {
            icon: "close",
            color: "white",
            round: true,
          },
        ],
        timeout: 10000,
      });
    } else {
      $q.dialog({
        title: "¿Está seguro de cambiar la fecha?",
        message:
          "Si cambia la fecha, algunas rutas se eliminaran. ¿Desea continuar?",
        ok: {
          label: "Sí",
          color: "primary",
          push: true,
        },
        cancel: {
          label: "No",
          color: "negative",
          push: true,
        },
      })
        .onOk(() => {
          createPlanningStore.deliveryRoutes =
            createPlanningStore.deliveryRoutes.flatMap((route) => {
              const routeDateOfInit = moment(
                route.dateOfInit,
                "dddd, DD/MMMM/YYYY",
              ).add(diffDays, "days");

              if (createPlanningStore.to.isBefore(routeDateOfInit)) {
                createPlanningStore.deletedDeliveryRoutes.push(route.uid);
                return [];
              }

              return {
                ...route,
                named: `${routeDateOfInit.format(
                  "dddd, DD [de] MMMM [-]",
                )} ${moment(route.hourOfInit, "HH:mm").format("HH:mm")}${`, ${
                  route.named.split(",")?.[2]
                }`}`,
                dateOfInit: routeDateOfInit.format("dddd, DD/MMMM/YYYY"),
              };
            });
        })
        .onCancel(() => {
          if (!shadowFrom || !shadowTo) return;
          createPlanningStore.date = {
            from: shadowFrom.format("dddd, DD/MMMM/YYYY"),
            to: shadowTo.format("dddd, DD/MMMM/YYYY"),
          };
        });
    }
  }

  createPlanningStore.setShadowDate(dateFrom, dateTo);
};

const onGenerateRoutes = () => {
  if (!createPlanningStore.isValidDateOfInit()) {
    return;
  }

  if (createPlanningStore.routesLength === 0) {
    if (
      createPlanningStore.type === "T02" &&
      createPlanningStore.assignedVehicles.length === 0
    ) {
      $q.notify({
        message: "Debe asignar vehículos a la planificación",
        color: "negative",
      });
      return;
    }
    createPlanningStore.generateRoutes();
    return;
  }
  $q.dialog({
    title: "¿Está seguro de generar las rutas?",
    message: "Si genera las rutas, las rutas actuales se perderán.",
    ok: {
      label: "Sí",
      color: "primary",
      push: true,
    },
    cancel: {
      label: "No",
      color: "negative",
      push: true,
    },
  }).onOk(() => {
    if (createPlanningStore.isUpdateMode) {
      createPlanningStore.deliveryRoutes.forEach((route) => {
        if (createPlanningStore.deletedDeliveryRoutes.includes(route.uid))
          return;

        createPlanningStore.deletedDeliveryRoutes.push(route.uid);
      });

      createPlanningStore.visitingRoutes.forEach((route) => {
        if (createPlanningStore.deletedVisitingRoutes.includes(route.uid))
          return;

        createPlanningStore.deletedVisitingRoutes.push(route.uid);
      });
    }
    createPlanningStore.generateVisitingRoutes();
  });
};

const onChangePlanningState = (planningId: string, value: string): void => {
  if (
    (value === "EP02" || value === "EP03" || value === "EP05") &&
    !userStore.isSupervisor &&
    !userStore.isAdmin
  ) {
    $q.notify({
      message: "No tiene permisos para cambiar el estado de la planificación",
      color: "negative",
    });
    createPlanningStore.state = shadowState.value;
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
  })
    .onOk(() => {
      changePlanningState({
        id: planningId,
        estado: value,
      }).then(() => {
        $q.notify({
          message: "Estado actualizado correctamente",
          color: "positive",
        });

        if (value === "EP02" && createPlanningStore.type === "T02") {
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
    })
    .onCancel(() => {
      createPlanningStore.state = shadowState.value;
    });
};

const regionalFilter = (item: ListResponseAPI) => {
  return item.ID.length > 0;
};

onMounted(() => {
  emit("hook:mounted");
});

const emit = defineEmits<{
  (e: "hook:mounted"): void;
}>();
</script>

<template>
  <div class="q-gutter-xs">
    <div class="row" style="gap: 5px">
      <q-input
        dense
        v-model="createPlanningStore.name"
        label="Nombre"
        outlined
        class="col"
        :readonly="createPlanningStore.readonly"
      ></q-input>
      <ListSelect
        class="col"
        outlined
        v-model="createPlanningStore.type"
        readonly
        label="Tipo"
        list="hansa_tipoplanificacion_list"
        dense
      />
    </div>
    <div class="row" style="gap: 5px">
      <ListSelect
        class="col"
        outlined
        v-model="createPlanningStore.salesOrganization"
        label="Organización de ventas"
        list="hansa_divisiones_list"
        dense
        :readonly="createPlanningStore.readonly"
      />
      <ListSelect
        class="col"
        outlined
        v-model="createPlanningStore.sector"
        label="Sector"
        list="hansa_amercado_list"
        dense
        :readonly="createPlanningStore.readonly"
      />
    </div>
    <div class="row" style="gap: 5px">
      <ListSelect
        class="col"
        outlined
        v-model="createPlanningStore.regional"
        label="Regional"
        list="hansa_dimregional_list"
        dense
        :readonly="createPlanningStore.readonly"
        :filterPredicate="regionalFilter"
      />
      <ListSelect
        class="col"
        outlined
        v-model="createPlanningStore.state"
        label="Estado"
        list="estado_planificacion_c_list"
        dense
        :class="{
          'bg-blue-1': createPlanningStore.state === 'EP01',
          'bg-green-1': createPlanningStore.state === 'EP02',
          'bg-red-1':
            createPlanningStore.state === 'EP03' ||
            createPlanningStore.state === 'EP05',
          'bg-orange-1': createPlanningStore.state === 'EP04',
        }"
        :color="colorStatePlanning[createPlanningStore.state]"
        @update:model-value="
          (value) => {
            if (createPlanningStore.isUpdateMode) {
              onChangePlanningState(createPlanningStore.id!, value);
            }
          }
        "
        :filterPredicate="
          (item) => {
            return (
              (item.ID !== 'EP02' &&
                item.ID !== 'EP03' &&
                item.ID !== 'EP05') ||
              userStore.isSupervisor ||
              userStore.isAdmin ||
              createPlanningStore.state === item.ID
            );
          }
        "
      />
    </div>
    <div class="row">
      <q-input
        class="col"
        dense
        :model-value="date"
        label="Fecha"
        outlined
        error-message="Seleccione un rango de fecha"
        :error="createPlanningStore.isValidDate || null"
        :readonly="createPlanningStore.readonly"
      >
        <template v-slot:append v-if="!createPlanningStore.readonly">
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy
              cover
              transition-show="scale"
              transition-hide="scale"
            >
              <q-date
                v-model="createPlanningStore.date"
                range
                mask="dddd, DD/MMMM/YYYY"
                @range-end="onChangeRangeDate"
              >
                <div class="row items-center justify-between">
                  <q-btn v-close-popup label="Guardar" color="primary" flat />
                  <q-btn v-close-popup label="Cancelar" color="negative" flat />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-icon>
        </template>
        <template v-slot:after>
          <q-btn
            color="primary"
            flat
            round
            noCaps
            icon="sync"
            dense
            v-if="!createPlanningStore.readonly"
            @click="onGenerateRoutes"
          >
            <q-tooltip>Generar rutas masivamente</q-tooltip>
          </q-btn>
        </template>
      </q-input>
    </div>
    <q-input
      dense
      v-model="createPlanningStore.description"
      label="Descripción"
      outlined
      type="textarea"
      rows="3"
      input-style="resize: none;"
      style="flex: 1"
      :readonly="createPlanningStore.readonly"
    ></q-input>
  </div>
</template>

<style scoped></style>
