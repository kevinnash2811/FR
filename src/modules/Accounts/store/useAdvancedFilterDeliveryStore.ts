import { defineStore } from "pinia";
import type { AdvancedFilter } from "../types";
import moment from "moment";
import { useCreatePlanningStore } from "@/modules/Planning/store";
import { useUserStore } from "@/store";
import { computed } from "vue";

type State = {
  filter: AdvancedFilter;
};

const defaultValues: State = {
  filter: {
    name: "",
    lastname: "",
    comercial_name: "",
    client_type: "",
    account_type: "",
    aio_code: "",
    nit_ci: "",
    cellphone: "",
    category: "",
    email: "",
    industry: "",
    sub_industry: "",
    country: "",
    state: "",
    city: "",
    street: "",
    document_type: "",
    tax_regime: "",
    website: "",
    created_by: [],
    modified_by: [],
    assigned_to: [],
    zona_venta_c: [],
    start_date: "",
    date: {
      from: moment().format("YYYY/MM/DD"),
      to: moment().format("YYYY/MM/DD"),
    },
    end_date: "",
    operator: "",
    exclude: "",
    statusEntrega: [],
    customerGroup: "",
    includes: "",
    planificacion: "",
    category2: "",
  },
};

export const useAdvancedFilterDeliveryStore = defineStore(
  "advancedDeliveryFilter",
  {
    state: (): State => {
      const userStore = useUserStore();
      const planningStore = useCreatePlanningStore();
      return Object.assign(
        {},
        {
          ...defaultValues,
          filter: {
            ...defaultValues.filter,
            country: userStore.user?.pais ?? "",
            statusEntrega: computed(() =>
              planningStore.isUpdateMode ? ["03", "07"] : ["03"],
            ),
            city: computed({
              get() {
                const createPlanningStore = useCreatePlanningStore();
                return createPlanningStore.regional;
              },
              set(value: string) {
                const createPlanningStore = useCreatePlanningStore();
                createPlanningStore.regional = value;
              },
            }),
          },
        },
      );
    },
  },
);
