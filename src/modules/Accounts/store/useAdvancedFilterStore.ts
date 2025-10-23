import { defineStore } from "pinia";
import type { AdvancedFilter } from "@accounts/types";
import { useUserStore } from "@/store";
import type { UserAccount } from "@/types";
import { computed } from "vue";
import { useCreatePlanningStore } from "@/modules/Planning/store";

type State = {
  reports_to_id: UserAccount[];
  filter: AdvancedFilter;
  onFieldUpdate?: () => void;
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
    end_date: "",
    operator: "",
    exclude: "",
    statusEntrega: [],
    customerGroup: "",
    planificacion: "",
    includes: "",
    category2: "",
    ruleDate: "",
  },
  reports_to_id: [],
};

export const useAdvancedFilterStore = defineStore("advancedFilter", {
  state: (): State => {
    const userStore = useUserStore();
    const createPlanningStore = useCreatePlanningStore();
    if (userStore.user === void 0 || userStore.user.id === void 0) {
      return Object.assign({}, defaultValues);
    }

    const me = userStore.user.reports_to_id.find(
      (report) => report.id === userStore.user!.id,
    );

    if (me === void 0) {
      return Object.assign({}, defaultValues);
    }
    const assigned_to = userStore.isSupervisor
      ? userStore.user.reports_id
      : [userStore.user.id];

    const reports_to_id = userStore.isSupervisor
      ? userStore.user.reports_to_id
      : [me];

    return Object.assign(
      {},
      {
        ...defaultValues,
        filter: {
          ...defaultValues.filter,
          assigned_to,
          country: userStore.user?.pais || "",
          city: computed({
            get: () => createPlanningStore.regional,
            set: (value) => {
              createPlanningStore.regional = value;
            },
          }),
        },
        reports_to_id,
      },
    );
  },
  actions: {
    setCreationDate({ from = "", to = "", operator = "" }) {
      this.filter.start_date = from;
      this.filter.end_date = to;
      this.filter.operator = operator;
    },
    $reset() {
      Object.assign(this, {
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
          creation_date: {
            from: "",
            to: "",
            operator: "",
            option: "",
          },
          exclude: "",
          customerGroup: "",
        },
      });
    },
    setOnFieldUpdate(callback: () => void) {
      this.onFieldUpdate = callback;
    },
  },
  getters: {
    existSomeFilterPlanning(): any[] {
      return Object.values(this.filter).filter((value) => {
        if (Array.isArray(value)) {
          return value.length > 0;
        }

        if (typeof value === "object" && value !== null) {
          return Object.values(value).some((v) => {
            return v !== "" && (typeof v !== "boolean" || v === true);
          });
        }

        if (typeof value === "boolean") {
          return value === true || value === false;
        }

        return typeof value === "string" ? value !== "" : value !== false;
      });
    },
  },
});
