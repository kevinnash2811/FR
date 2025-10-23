import { useUserStore } from "@/store";
import type { Account, CategoryAccount, UserAccount, UserCRM } from "@/types";
import { userCrmToUserAccount } from "@/utils";
import {
  Point,
  type Activity,
  type ActivityCabecera,
  type PlanningResponseAPI,
  type PrimitiveRoute,
  type PrimitiveRouteDelivery,
  type PrimitiveRouteVisit,
  type PrimitiveVisit,
  type VehicleAPIResponse,
} from "@/modules/Planning/types";
import leaflet from "leaflet";
import moment from "moment";
import { defineStore } from "pinia";
import { useRoute } from "vue-router";
import { getActivities } from "../services/getActivities";

type State = {
  id?: string;
  name: string;
  type: string;
  user: Partial<UserCRM>;
  description: string;
  salesOrganization: string;
  sector: string;
  regional: string;
  shadowDate?: {
    from: moment.Moment;
    to: moment.Moment;
  };
  date:
    | {
        from: string;
        to: string;
      }
    | string;
  state: string;
  assignedUsers: Array<{ id_relacion?: string } & UserAccount>;
  assignedVehicles: VehicleAPIResponse[];
  activities: Activity[];
  deliveryRoutes: PrimitiveRouteDelivery[];
  visitingRoutes: PrimitiveRouteVisit[];
  isValidDate: boolean;
  deletedVehicles: string[];
  insertedVehicles: string[];
  deletedVisitingRoutes: string[];
  deletedDeliveryRoutes: string[];
  shadowDeliveryRoutesId: string[];
  shadowVisitingRoutesId: string[];
  deletedVisits: {
    visitId: string;
    routeId: string;
    accountId: string;
  }[];
  shadowAccounts: Account[];
  shadowVisits: Record<string, string[]>;
  shadowDeliveries: Record<string, string[]>;
  visitsToInsert: { accountId: string; routeId: string }[];
};

export const useCreatePlanningStore = defineStore("createPlanningStore", {
  state(): State {
    const user = useUserStore();
    const route = useRoute();
    const fullname =
      user.user?.nombres && user.user.apellidos
        ? `${user.user?.nombres ?? ""} ${user.user?.apellidos ?? ""}`
        : user.user?.nombres && !user.user.apellidos
        ? user.user?.nombres
        : user.user?.apellidos;

    const name =
      route.params.type === "T01"
        ? moment().format(`MMMM-YYYY-[${fullname}]`)
        : moment().format(
            `[${user.user?.regional ?? ""}]-MMMM-dddd-HH:mm-[${fullname}]`,
          );
    return {
      user: user.user!,
      type: route.params.type as string,
      name,
      description: "",
      salesOrganization: user.user?.iddivision || "",
      sector: user.user?.idamercado || "",
      regional: `${user.user?.idregional}`,
      date: {
        from: "",
        to: "",
      },
      state: "EP01",
      assignedUsers:
        user.user && route.params.type === "T01"
          ? [userCrmToUserAccount(user.user)]
          : [],
      assignedVehicles: [],
      activities: [],
      deliveryRoutes: [],
      visitingRoutes: [],
      isValidDate: false,
      deletedVehicles: [],
      insertedVehicles: [],
      deletedVisitingRoutes: [],
      deletedDeliveryRoutes: [],
      shadowDeliveryRoutesId: [],
      shadowVisitingRoutesId: [],
      deletedVisits: [],
      shadowVisits: {},
      shadowDeliveries: {},
      visitsToInsert: [],
      shadowAccounts: [],
    };
  },
  actions: {
    clearFields() {
      this.id = undefined;
      this.name = "";
      this.type = "";
      this.user = {};
      this.description = "";
      this.salesOrganization = "";
      this.sector = "";
      this.regional = "";
      this.shadowDate = undefined;
      this.date = {
        from: "",
        to: "",
      };
      this.state = "";
      this.assignedUsers = [];
      this.assignedVehicles = [];
      this.deliveryRoutes = [];
      this.visitingRoutes = [];
      this.isValidDate = false;
      this.deletedVehicles = [];
      this.insertedVehicles = [];
      this.deletedVisitingRoutes = [];
      this.deletedDeliveryRoutes = [];
      this.shadowDeliveryRoutesId = [];
      this.shadowVisitingRoutesId = [];
      this.deletedVisits = [];
      this.shadowAccounts = [];
      this.shadowVisits = {};
      this.shadowDeliveries = {};
      this.visitsToInsert = [];
    },
    async setUserForVisitPlanning(user: UserCRM) {
      this.clearFields();
      const fullname =
        user.nombres && user.apellidos
          ? `${user.nombres ?? ""} ${user.apellidos ?? ""}`
          : user.nombres && !user.apellidos
          ? user.nombres
          : user.apellidos;
      this.type = "T01";
      this.user = user;
      this.name = moment().format(`MMMM-YYYY-[${fullname}]`);
      this.salesOrganization = user.iddivision || "";
      this.sector = user.idamercado || "";
      this.regional = `${user.idregional}`;
      this.state = "EP01";
      this.assignedUsers = [userCrmToUserAccount(user)];

      await this.fetchActivities();
    },
    async setUserForDeliveryPlanning(user: UserCRM) {
      this.clearFields();
      const fullname =
        user.nombres && user.apellidos
          ? `${user.nombres ?? ""} ${user.apellidos ?? ""}`
          : user.nombres && !user.apellidos
          ? user.nombres
          : user.apellidos;
      this.type = "T02";
      this.user = user;
      this.name = moment().format(
        `[${user.regional ?? ""}]-MMMM-dddd-HH:mm-[${fullname}]`,
      );
      this.salesOrganization = user.iddivision || "";
      this.sector = user.idamercado || "";
      this.regional = `${user.idregional}`;
      this.state = "EP01";
      this.date = {
        from: "",
        to: "",
      };

      await this.fetchActivities();
    },
    setShadowDate(from: moment.Moment, to: moment.Moment) {
      this.shadowDate = {
        from,
        to,
      };
    },
    addVehicle(vehicle: VehicleAPIResponse) {
      this.assignedVehicles.push(vehicle);
      this.insertedVehicles.push(vehicle.id);
    },
    removeVehicle(vehicle: VehicleAPIResponse) {
      this.deletedVehicles.push(vehicle.id);
      this.assignedVehicles = this.assignedVehicles.filter(
        (v) => v.id !== vehicle.id,
      );
    },
    addUser(user: UserAccount) {
      this.assignedUsers.push({
        a_mercado: user.a_mercado,
        email: user.email,
        id: user.id,
        avatar: user.avatar,
        cargo: user.cargo,
        division: user.division,
        employee_status: user.employee_status,
        idamercado_c: user.idamercado_c,
        iddivision_c: user.iddivision_c,
        idgrupocliente_c: user.idgrupocliente_c,
        idregional_c: user.idregional_c,
        idvendedor_c: user.idvendedor_c,
        user_name: user.user_name,
      });
    },
    removeUser(user: UserAccount) {
      this.assignedUsers = this.assignedUsers.filter((u) => u.id !== user.id);
    },
    generateDeliveryRoutes() {
      const hourOfInit = moment()
        .startOf("day")
        .add(8, "hours")
        .format("HH:mm");
      const duration = moment()
        .startOf("day")
        .add(30, "minutes")
        .format("HH:mm");
      const routes: PrimitiveRouteDelivery[] = [];
      const { from, to } = this.dateRange;

      while (from.isSameOrBefore(to)) {
        this.assignedVehicles.forEach((vehicle) => {
          const uid = crypto.randomUUID();
          const mainDriver = vehicle.conductores?.find(
            (d) => d.tipo_c === "P01",
          );
          if (!mainDriver) {
            return;
          }

          routes.push({
            uid,
            point: Point.STORE,
            dateOfInit: from.format("dddd, DD/MMMM/YYYY"),
            hourOfInit,
            duration,
            hourOfEnd: "00:00",
            deliveries: [],
            named: `${from.format("dddd, DD [de] MMMM [-]")} ${hourOfInit}, ${
              mainDriver.user_name
            }`,
            assignVehicle: {
              plate: vehicle.name,
              id: vehicle.id,
              capacity: vehicle.capacidad_1_c,
              driver: mainDriver,
            },
            enabled: from.day() !== 0 && from.day() !== 6,
            readonly: false,
          });
        });
        from.add(1, "day");
      }
      this.deliveryRoutes = routes;
    },
    addDeliveryRoute() {
      const hourOfInit = moment().startOf("day").add(8, "hours");
      const lastRoute = this.deliveryRoutes[this.deliveryRoutes.length - 1]
        ? this.deliveryRoutes[this.deliveryRoutes.length - 1].dateOfInit
        : typeof this.date === "string"
        ? this.date
        : this.date.from;

      const dateOfInit = moment(lastRoute, "dddd, DD/MMMM/YYYY");

      if (this.deliveryRoutes[this.deliveryRoutes.length - 1]) {
        dateOfInit.add(1, "day");
      }

      this.assignedVehicles.forEach((vehicle) => {
        const uid = crypto.randomUUID();
        const mainDriver = vehicle.conductores?.find((d) => d.tipo_c === "P01");
        if (!mainDriver) {
          return;
        }

        this.deliveryRoutes.push({
          uid,
          point: Point.STORE,
          dateOfInit: dateOfInit.format("dddd, DD/MMMM/YYYY"),
          hourOfInit: hourOfInit.format("HH:mm"),
          duration: moment().startOf("day").add(30, "minutes").format("HH:mm"),
          hourOfEnd: "00:00",
          deliveries: [],
          named: `${dateOfInit.format(
            "dddd, DD [de] MMMM [-]",
          )} ${hourOfInit.format("HH:mm")}, ${mainDriver.user_name}`,
          assignVehicle: {
            plate: vehicle.name,
            id: vehicle.id,
            capacity: vehicle.capacidad_1_c,
            driver: mainDriver,
          },
          enabled: dateOfInit.day() !== 0 && dateOfInit.day() !== 6,
          readonly: false,
        });
      });
    },
    addVisitingRoute() {
      const uid = crypto.randomUUID();
      const hourOfInit = moment().startOf("day").add(8, "hours");

      const lastRoute = this.visitingRoutes[this.visitingRoutes.length - 1]
        ? this.visitingRoutes[this.visitingRoutes.length - 1].dateOfInit
        : typeof this.date === "string"
        ? this.date
        : this.date.from;

      const dateOfInit = moment(lastRoute, "dddd, DD/MMMM/YYYY");

      if (this.visitingRoutes[this.visitingRoutes.length - 1]) {
        dateOfInit.add(1, "day");
      }

      this.visitingRoutes.push({
        uid,
        dateOfInit: dateOfInit.format("dddd, DD/MMMM/YYYY"),
        hourOfInit: hourOfInit.format("HH:mm"),
        duration: moment().startOf("day").add(30, "minutes").format("HH:mm"),
        hourOfEnd: "00:00",
        visits: [],
        named: dateOfInit.format("Rut[a], dddd DD"),
        enabled: dateOfInit.day() !== 0 && dateOfInit.day() !== 6,
        readonly: false,
      });

      return true;
    },
    isValidDateOfInit() {
      if (typeof this.date === "string") {
        this.isValidDate = false;
        return true;
      }
      const sentence = !!this.date && !!this.date.from && !!this.date.to;
      this.isValidDate = !sentence;
      return sentence;
    },
    cloneVisitRoute(route: PrimitiveRouteVisit, index: number) {
      const uid = crypto.randomUUID();
      const clonedRoute: PrimitiveRouteVisit = {
        ...route,
        uid,
        named: `${route.named} - Copia`,
        enabled: true,
        visits: [...route.visits],
      };

      this.visitingRoutes.splice(index + 1, 0, clonedRoute);
    },
    cloneDeliveryRoute(route: PrimitiveRouteDelivery, index: number) {
      const uid = crypto.randomUUID();
      const clonedRoute: PrimitiveRouteDelivery = {
        ...route,
        uid,
        named: `${route.named} - Copia`,
        enabled: true,
        deliveries: [...route.deliveries],
      };

      this.deliveryRoutes.splice(index + 1, 0, clonedRoute);
    },
    generateVisitingRoutes() {
      const hourOfInit = moment().startOf("day").add(8, "hours");
      const duration = moment.duration(30, "minutes");
      const routes = [];
      const { from, to } = this.dateRange;

      while (from.isSameOrBefore(to)) {
        const uid = crypto.randomUUID();
        routes.push({
          uid,
          dateOfInit: from.format("dddd, DD/MMMM/YYYY"),
          hourOfInit: hourOfInit.format("HH:mm"),
          duration: moment.utc(duration.asMilliseconds()).format("HH:mm"),
          hourOfEnd: "00:00",
          visits: [],
          named: from.format("Rut[a], dddd DD"),
          enabled: from.day() !== 0 && from.day() !== 6,
          readonly: false,
        });
        from.add(1, "day");
      }

      this.visitingRoutes = routes;
    },
    generateRoutes() {
      if (this.type === "T01") {
        this.generateVisitingRoutes();
      }

      if (this.type === "T02") {
        this.generateDeliveryRoutes();
      }
    },
    removeDeliveryRoute(route: PrimitiveRouteDelivery) {
      this.deliveryRoutes = this.deliveryRoutes.filter(
        (r) => r.uid !== route.uid,
      );
      this.deletedDeliveryRoutes.push(route.uid);
    },
    removeVisitRoute(route: PrimitiveRouteVisit) {
      this.visitingRoutes = this.visitingRoutes.filter(
        (r) => r.uid !== route.uid,
      );
      this.deletedVisitingRoutes.push(route.uid);
    },
    moveDeliveryRoute(from: number, to: number) {
      const toItem = this.deliveryRoutes[to];
      const fromItem = this.deliveryRoutes[from];
      const auxItem = { ...fromItem };

      this.deliveryRoutes[from].named = toItem.named;
      toItem.named = auxItem.named;

      this.deliveryRoutes[from].deliveries = toItem.deliveries;
      toItem.deliveries = auxItem.deliveries;

      this.deliveryRoutes[from].assignVehicle = toItem.assignVehicle;
      toItem.assignVehicle = auxItem.assignVehicle;

      this.deliveryRoutes[from].point = toItem.point;
      toItem.point = auxItem.point;

      this.deliveryRoutes[from].uid = toItem.uid;
      toItem.uid = auxItem.uid;
    },
    setPositionDeliveryRoute(from: number, to: number) {
      const item = this.deliveryRoutes.splice(from, 1)[0];
      this.deliveryRoutes.splice(to, 0, item);
    },
    setPositionVisitRoute(from: number, to: number) {
      const item = this.visitingRoutes.splice(from, 1)[0];
      this.visitingRoutes.splice(to, 0, item);
    },
    moveVisitingRoute(from: number, to: number) {
      const toItem = this.visitingRoutes[to];
      const fromItem = this.visitingRoutes[from];
      const auxItem = { ...fromItem };

      this.visitingRoutes[from].named = toItem.named;
      toItem.named = auxItem.named;

      // this.visitingRoutes[from].dateOfInit = toItem.dateOfInit;
      // toItem.dateOfInit = auxItem.dateOfInit;
      this.visitingRoutes[from].hourOfInit = toItem.hourOfInit;
      toItem.hourOfInit = auxItem.hourOfInit;

      this.visitingRoutes[from].duration = toItem.duration;
      toItem.duration = auxItem.duration;

      this.visitingRoutes[from].hourOfEnd = toItem.hourOfEnd;
      toItem.hourOfEnd = auxItem.hourOfEnd;

      this.visitingRoutes[from].visits = toItem.visits;
      toItem.visits = auxItem.visits;

      this.visitingRoutes[from].uid = toItem.uid;
      toItem.uid = auxItem.uid;
    },
    swapVisit(from: number, to: number, route: PrimitiveRouteVisit) {
      const aux = [...route.visits.map((v) => ({ ...v }))];
      const item = route.visits.splice(from, 1)[0];
      route.visits.splice(to, 0, item);

      aux.forEach((_visit, index) => {
        route.visits[index].hourOfInit = aux[index].hourOfInit;
        route.visits[index].duration = aux[index].duration;
        route.visits[index].hourOfEnd = aux[index].hourOfEnd;
      });
    },
    swapDelivery(from: number, to: number, route: PrimitiveRouteDelivery) {
      const aux = [...route.deliveries.map((v) => ({ ...v }))];
      const item = route.deliveries.splice(from, 1)[0];
      route.deliveries.splice(to, 0, item);

      aux.forEach((_delivery, index) => {
        route.deliveries[index].hourOfInit = aux[index].hourOfInit;
        route.deliveries[index].duration = aux[index].duration;
        route.deliveries[index].hourOfEnd = aux[index].hourOfEnd;
      });
    },
    async setValueFromJSON(data: PlanningResponseAPI) {
      this.name = data.result_planificador.name;
      this.id = data.result_planificador.id;
      this.date =
        data.result_planificador.fecha_fin_c !==
        data.result_planificador.fecha_inicio_c
          ? {
              from: moment(
                data.result_planificador.fecha_inicio_c,
                "YYYY-MM-DD HH:mm:ss",
              ).format("dddd, DD/MMMM/YYYY"),
              to: moment(
                data.result_planificador.fecha_fin_c,
                "YYYY-MM-DD HH:mm:ss",
              ).format("dddd, DD/MMMM/YYYY"),
            }
          : moment(
              data.result_planificador.fecha_inicio_c,
              "YYYY-MM-DD HH:mm:ss",
            ).format("dddd, DD/MMMM/YYYY");

      this.shadowDate = {
        from: moment(
          data.result_planificador.fecha_inicio_c,
          "YYYY-MM-DD HH:mm:ss",
        ),
        to: moment(data.result_planificador.fecha_fin_c, "YYYY-MM-DD HH:mm:ss"),
      };
      this.description = data.result_planificador.descripcion;
      this.salesOrganization = data.result_planificador.iddivision_c;
      this.sector = data.result_planificador.idamercado_c;
      this.regional = data.result_planificador.region_c;
      this.type = data.result_planificador.tipo;
      this.state = data.result_planificador.estado_planificacion_c;

      if (data.result_planificador.tipo === "T01") {
        this.user = {
          id: data.result_users[0]?.id ?? "",
          iddivision: data.result_users[0]?.iddivision_c ?? "",
          amercado: data.result_users[0]?.amercado ?? "",
          division: data.result_users[0]?.division ?? "",
          idamercado: data.result_users[0]?.idamercado_c ?? "",
          nombres: data.result_users[0]?.first_name ?? "",
          apellidos: data.result_users[0]?.last_name ?? "",
          idregional: data.result_planificador?.region_c ?? "",
          regional: data.result_planificador?.region_c ?? "",
          rol_hbm_c: data.result_users[0]?.rol_hbm_c ?? "",
          rol_hbm_label: data.result_users[0]?.rol_hbm_label_c ?? "",
        };

        this.assignedUsers = [
          {
            id_relacion: data.result_users[0]?.id_relacion ?? "",
            a_mercado: data.result_users[0]?.amercado ?? "",
            email: "",
            id: data.result_users[0]?.id ?? "",
            avatar: "",
            cargo: "",
            division: data.result_users[0]?.division ?? "",
            employee_status: "",
            idamercado_c: data.result_users[0]?.idamercado_c ?? "",
            iddivision_c: data.result_users[0]?.iddivision_c ?? "",
            idgrupocliente_c: "",
            idregional_c: "",
            idvendedor_c: data.result_users[0]?.idvendedor_c ?? "",
            user_name:
              data.result_users[0]?.first_name.concat(
                " ",
                data.result_users[0]?.last_name,
              ) ?? "",
          },
        ];
        this.visitingRoutes = data.result_groups.map((route) => {
          this.shadowVisitingRoutesId.push(route.group_id);
          this.shadowVisits[route.group_id] = [];
          return {
            uid: route.group_id,
            dateOfInit: moment(route.group_fecha_plan_c, "DD-MM-YYYY").format(
              "dddd, DD/MMMM/YYYY",
            ),
            hourOfInit: route.group_hora_inicio_c,
            duration: route.group_duracion_c,
            hourOfEnd: route.group_hora_fin_c,
            visits: route.rutas_item.map((visit) => {
              this.shadowVisits[route.group_id].push(visit.ruta_id_account);

              return {
                uid: visit.ruta_id,
                customer: {
                  id: visit.ruta_id_account,
                  name: visit.ruta_name_account,
                  location: leaflet.latLng([
                    isNaN(+visit.ruta_latitud) ? 0 : +visit.ruta_latitud,
                    isNaN(+visit.ruta_longitud) ? 0 : +visit.ruta_longitud,
                  ]),
                  address: visit.ruta_address_account,
                  category: visit.ruta_category_account as CategoryAccount,
                  secondCategory:
                    visit.ruta_second_category_account as CategoryAccount,
                  zone: visit.ruta_usuario_zona_ventas_c,
                  customerRegion: visit.regionclienter,
                  idRegla: visit.idRegla,
                  idTarea: visit.idTarea,
                },
                hourOfInit: visit.ruta_hora_inicio_c,
                duration: visit.ruta_duracion_c,
                hourOfEnd: visit.ruta_hora_fin_c,
              };
            }),
            named: route.group_name_c,
            enabled: route.group_bloqueado_c === "00",
            readonly: !this.readonly,
          };
        });
      }

      if (data.result_planificador.tipo === "T02") {
        this.assignedVehicles = data.result_vehiculos.map((vehicle) => {
          const drivers: {
            name: string;
            user_id: string;
            tipo_c: string;
            tipo_c_label: string;
            user_iddivision_c: string;
            user_division_c: string;
            user_idamercado_c: string;
            user_amercado_c: string;
            user_idregional_c: string;
            user_regional_c: string;
            user_name: string;
          }[] = JSON.parse(vehicle.conductores ?? "[]");
          return {
            name: vehicle.name,
            id: vehicle.id,
            amercado: vehicle.amercado_label_c ?? "",
            division: vehicle.division_label_c,
            iddivision_c: vehicle.iddivision_c,
            estado_vehiculo_label: vehicle.estado_vehiculo_label,
            estado_vehiculo_c: vehicle.estado_vehiculo_c,
            regional: vehicle.regional_label_c,
            conductores: drivers.map((driver) => {
              return {
                name: driver.user_name,
                user_id: driver.user_id,
                tipo_c: driver.tipo_c,
                tipo_c_label: driver.tipo_c_label,
                user_iddivision_c: driver.user_division_c,
                user_division_c: driver.user_division_c,
                user_idamercado_c: driver.user_amercado_c,
                user_amercado_c: driver.user_amercado_c,
                user_idregional_c: driver.user_regional_c,
                user_regional_c: driver.user_regional_c,
                user_name: driver.user_name,
              };
            }),
            capacidad_1_c: vehicle.capacidad_1_c ?? "",
          };
        });

        this.assignedUsers = data.result_users.map((user) => {
          return {
            id_relacion: user.id_relacion,
            a_mercado: user.amercado,
            email: "",
            id: user.id,
            avatar: "",
            cargo: "",
            division: user.division,
            employee_status: "",
            idamercado_c: user.idamercado_c,
            iddivision_c: user.iddivision_c,
            idgrupocliente_c: "",
            idregional_c: "",
            idvendedor_c: user.idvendedor_c,
            user_name:
              user.first_name?.concat(" ", user.last_name) ?? user.last_name,
          };
        });

        this.deliveryRoutes = data.result_groups.flatMap((route) => {
          this.shadowDeliveryRoutesId.push(route.group_id);
          const vehicle = this.assignedVehicles.find(
            (v) => v.id === route.group_id_vehiculo,
          );
          const driver = vehicle?.conductores?.find(
            (d) => d.user_id === route.group_user_id,
          );
          if (vehicle && driver) {
            this.shadowDeliveries[route.group_id] = [];
            return {
              uid: route.group_id,
              point: Point.STORE,
              dateOfInit: moment(route.group_fecha_plan_c, "DD-MM-YYYY").format(
                "dddd, DD/MMMM/YYYY",
              ),
              hourOfInit: route.group_hora_inicio_c,
              duration: route.group_duracion_c,
              hourOfEnd: route.group_hora_fin_c,
              deliveries: route.rutas_item.map((delivery) => {
                this.shadowDeliveries[route.group_id].push(
                  delivery.ruta_id_account,
                );

                return {
                  uid: delivery.ruta_id,
                  customer: {
                    id: delivery.ruta_id_account,
                    name: delivery.ruta_name_account,
                    location: leaflet.latLng([
                      +delivery.ruta_latitud,
                      +delivery.ruta_longitud,
                    ]),
                    address: delivery.ruta_address_account,
                    category: delivery.ruta_category_account as CategoryAccount,
                    zone: delivery.ruta_usuario_zona_ventas_c,
                    entregas: delivery.entregas.map((entrega) => ({
                      entrega_id: entrega.entrega_id,
                      entrega_name: entrega.entrega_name,
                      entrega_fecha: entrega.entrega_fecha_entrega_c,
                      entrega_description: "",
                      entrega_division: "",
                      entrega_division_label: "",
                      entrega_amercado: "",
                      entrega_amercado_label: "",
                      entrega_regional: "",
                      entrega_estado: entrega.entrega_estado_c,
                      entrega_estado_label: "",
                      entregas_product: [],
                      facturas_product: [],
                    })),
                  },
                  hourOfInit: delivery.ruta_hora_inicio_c,
                  duration: delivery.ruta_duracion_c,
                  hourOfEnd: delivery.ruta_hora_fin_c,
                  activities: [], // TODO: Consume activities from response of API
                
                };
              }),
              named: route.group_name_c,
              assignVehicle: {
                id: vehicle.id,
                plate: vehicle.name,
                capacity: vehicle.capacidad_1_c,
                driver,
              },
              enabled: route.group_bloqueado_c === "00",
              readonly: !this.readonly,
            };
          }
          return [];
        });
      }

      await this.fetchActivities();
    },
    toSend() {
      const fechaInicioC =
        typeof this.date === "string" ? this.date : this.date.from;
      const fechaFinC =
        typeof this.date === "string" ? this.date : this.date.to;

      return {
        hanrtPlanificadorData: {
          name: this.name,
          userId: this.user.id,
          description: this.description,
          tipo: this.type,
          iddivisionC: this.salesOrganization,
          idamercadoC: this.sector,
          regionC: this.regional,
          estadoPlanificacionC: this.state,
          fechaInicioC: moment(fechaInicioC, "dddd, DD/MMMM/YYYY").format(
            "YYYY-MM-DD HH:mm:ss",
          ),
          fechaFinC: moment(fechaFinC, "dddd, DD/MMMM/YYYY").format(
            "YYYY-MM-DD HH:mm:ss",
          ),
        },
        idVehiculosList: this.assignedVehicles.map((v) => v.id),
        rutasEntregasList: [
          ...this.visitingRoutes.map((route, index) => {
            return {
              ruta: {
                name: route.named,
                description: route.named,
                fechaPlanC: moment(route.dateOfInit, "dddd, DD/MMMM/YYYY")
                  .format("YYYY-MM-DD HH:mm:ss"),
                horaInicioC: moment(route.dateOfInit, "dddd, DD/MMMM/YYYY")
                  .add(+route.hourOfInit.split(":")[0], "h")
                  .add(+route.hourOfInit.split(":")[1], "m")
                  .format("YYYY-MM-DD HH:mm:ss"),
                duracionC: moment(route.dateOfInit, "dddd, DD/MMMM/YYYY")
                  .add(+route.duration.split(":")[0], "h")
                  .add(+route.duration.split(":")[1], "m")
                  .format("YYYY-MM-DD HH:mm:ss"),
                horaFinC: moment(route.dateOfInit, "dddd, DD/MMMM/YYYY")
                  .add(+route.hourOfEnd.split(":")[0], "h")
                  .add(+route.hourOfEnd.split(":")[1], "m")
                  .format("YYYY-MM-DD HH:mm:ss"),
                secuenciaC: index + 1,
                bloqueadoC: route.enabled ? "00" : "01",
                userId: this.user.id,
              },
              entregas: route.visits.map((visit, index) => ({
                name: visit.customer.name,
                description: visit.customer.name,
                tipoVisitaC: "TV02",
                fechaInicioC: moment(route.dateOfInit, "dddd, DD/MMMM/YYYY")
                  .format("YYYY-MM-DD HH:mm:ss"),
                horaInicioC: moment(route.dateOfInit, "dddd, DD/MMMM/YYYY")
                  .add(+visit.hourOfInit.split(":")[0], "h")
                  .add(+visit.hourOfInit.split(":")[1], "m")
                  .format("YYYY-MM-DD HH:mm:ss"),
                duracionC: moment(route.dateOfInit, "dddd, DD/MMMM/YYYY")
                  .add(+visit.duration.split(":")[0], "h")
                  .add(+visit.duration.split(":")[1], "m")
                  .format("YYYY-MM-DD HH:mm:ss"),
                fechaFinC: moment(route.dateOfInit, "dddd, DD/MMMM/YYYY")
                  .format("YYYY-MM-DD HH:mm:ss"),
                horaFinC: moment(route.dateOfInit, "dddd, DD/MMMM/YYYY")
                  .add(+visit.hourOfEnd.split(":")[0], "h")
                  .add(+visit.hourOfEnd.split(":")[1], "m")
                  .format("YYYY-MM-DD HH:mm:ss"),
                secuenciaC: index + 1,
                idAccount: visit.customer.id,
                userId: this.user.id,
                latitud: visit.customer.location?.lat ?? "0",
                longitud: visit.customer.location?.lng ?? "0",
                tareasPlan: this.activities
                  .map((activity) => activity.id)
                  .concat(visit.customer.tasks?.map((a) => a.id) ?? []),
              })),
            };
          }),
          ...this.deliveryRoutes.map((route, index) => {
            return {
              ruta: {
                name: route.named,
                description: route.named,
                fechaPlanC: moment(route.dateOfInit, "dddd, DD/MMMM/YYYY")
                  .format("YYYY-MM-DD HH:mm:ss"),
                capacidadC: route.assignVehicle?.capacity,
                horaInicioC: moment(route.dateOfInit, "dddd, DD/MMMM/YYYY")
                  .add(+route.hourOfInit.split(":")[0], "h")
                  .add(+route.hourOfInit.split(":")[1], "m")
                  .format("YYYY-MM-DD HH:mm:ss"),
                duracionC: moment(route.dateOfInit, "dddd, DD/MMMM/YYYY")
                  .add(+route.duration.split(":")[0], "h")
                  .add(+route.duration.split(":")[1], "m")
                  .format("YYYY-MM-DD HH:mm:ss"),
                horaFinC: moment(route.dateOfInit, "dddd, DD/MMMM/YYYY")
                  .add(+route.hourOfEnd.split(":")[0], "h")
                  .add(+route.hourOfEnd.split(":")[1], "m")
                  .format("YYYY-MM-DD HH:mm:ss"),
                secuenciaC: index + 1,
                bloqueadoC: route.enabled ? "00" : "01",
                userId: route.assignVehicle?.driver.user_id,
                idVehiculo: route.assignVehicle?.id,
              },
              entregas: route.deliveries.map((delivery, index) => ({
                name: delivery.customer.name,
                description: delivery.customer.name,
                tipoVisitaC: "TV01",
                fechaInicioC: moment(route.dateOfInit, "dddd, DD/MMMM/YYYY")
                  .format("YYYY-MM-DD HH:mm:ss"),
                horaInicioC: moment(route.dateOfInit, "dddd, DD/MMMM/YYYY")
                  .add(+delivery.hourOfInit.split(":")[0], "h")
                  .add(+delivery.hourOfInit.split(":")[1], "m")
                  .format("YYYY-MM-DD HH:mm:ss"),
                duracionC: moment(route.dateOfInit, "dddd, DD/MMMM/YYYY")
                  .add(+delivery.duration.split(":")[0], "h")
                  .add(+delivery.duration.split(":")[1], "m")
                  .format("YYYY-MM-DD HH:mm:ss"),
                fechaFinC: moment(
                  route.dateOfInit,
                  "dddd, DD/MMMM/YYYY",
                ).format("YYYY-MM-DD HH:mm:ss"),
                horaFinC: moment(route.dateOfInit, "dddd, DD/MMMM/YYYY")
                  .add(+delivery.hourOfEnd.split(":")[0], "h")
                  .add(+delivery.hourOfEnd.split(":")[1], "m")
                  .format("YYYY-MM-DD HH:mm:ss"),
                secuenciaC: index + 1,
                idAccount: delivery.customer.id,
                userId: route.assignVehicle?.driver.user_id,
                latitud: delivery.customer.location?.lat ?? "0",
                longitud: delivery.customer.location?.lng ?? "0",
                tareasPlan: this.activities.map((activity) => activity.id),
                entregasList: delivery.customer.entregas.map(
                  (e) => e.entrega_id,
                ),
              })),
            };
          }),
        ],
      };
    },
    toUpdate() {
      const usersInserts: {
        name: string;
        user_id: string;
        tipo_c: string;
        tipo_c_label: string;
        user_iddivision_c: string;
        user_division_c: string;
        user_idamercado_c: string;
        user_amercado_c: string;
        user_idregional_c: string;
        user_regional_c: string;
        user_name: string;
      }[] = [];

      const visitsUpdate: Array<{
        type: string;
        itemData: unknown;
      }> = [];

      const uniqueUsers = [
        ...new Set(
          this.deliveryRoutes.map(
            (route) => route.assignVehicle?.driver.user_id,
          ),
        ),
      ];

      const difference = this.assignedUsers.filter(
        (user) => !uniqueUsers.includes(user.id),
      );

      const deletedUsers: Array<{
        type: string;
        itemData: unknown;
      }> =
        this.type === "T02"
          ? difference.map((assignedUser) => {
              return {
                type: "PLANIFICADORRELACIONES",
                itemData: {
                  id_planificador: this.id,
                  id_relacion: assignedUser.id_relacion,
                },
              };
            })
          : [];

      const visitingRoutesUpdate = this.visitingRoutes.map((route, index) => {
        route.visits.forEach((visit, index) => {
          visitsUpdate.push({
            type: "ITEMRUTA",
            itemData: {
              id: visit.uid,
              jjwg_maps_lat_c: `${visit.customer.location?.lat}`,
              jjwg_maps_lng_c: `${visit.customer.location?.lng}`,
              fecha_inicio_c: moment(
                route.dateOfInit,
                "dddd, DD/MMMM/YYYY",
              ).format("YYYY-MM-DD HH:mm:ss"),
              fecha_fin_c: moment(
                route.dateOfInit,
                "dddd, DD/MMMM/YYYY",
              ).format("YYYY-MM-DD HH:mm:ss"),
              hora_inicio_c: moment(route.dateOfInit, "dddd, DD/MMMM/YYYY")
                .add(moment(visit.hourOfInit, "HH:mm").hours(), "h")
                .add(moment(visit.hourOfInit, "HH:mm").minutes(), "m")
                .format("YYYY-MM-DD HH:mm:ss"),
              duracion_c: moment(route.dateOfInit, "dddd, DD/MMMM/YYYY")
                .add(moment(visit.duration, "HH:mm").hours(), "h")
                .add(moment(visit.duration, "HH:mm").minutes(), "m")
                .format("YYYY-MM-DD HH:mm:ss"),
              hora_fin_c: moment(route.dateOfInit, "dddd, DD/MMMM/YYYY")
                .add(moment(visit.hourOfEnd, "HH:mm").hours(), "h")
                .add(moment(visit.hourOfEnd, "HH:mm").minutes(), "m")
                .format("YYYY-MM-DD HH:mm:ss"),
              tipo_visita_c: "TV02",
              secuencia_c: index + 1,
            },
          });
        });

        return {
          type: "ITEMGROUP",
          itemData: {
            id: route.uid,
            name: route.named,
            fecha_plan_c: moment(route.dateOfInit, "dddd, DD/MMMM/YYYY").format(
              "YYYY-MM-DD HH:mm:ss",
            ),
            hora_inicio_c: moment(route.hourOfInit, "HH:mm").format(
              "YYYY-MM-DD HH:mm:ss",
            ),
            duracion_c: moment(route.duration, "HH:mm").format(
              "YYYY-MM-DD HH:mm:ss",
            ),
            hora_fin_c: moment(route.hourOfEnd, "HH:mm").format(
              "YYYY-MM-DD HH:mm:ss",
            ),
            secuencia_c: index + 1,
            bloqueado_c: route.enabled ? "00" : "01",
            assigned_user_id: this.user.id,
          },
        };
      });

      const deliveriesUpdate: Array<{
        type: string;
        itemData: unknown;
      }> = [];

      const vehicleRouteUpdate: Array<{
        type: string;
        itemData: unknown;
      }> = [];

      this.deliveryRoutes.forEach(({ assignVehicle }) => {
        if (!assignVehicle?.driver.user_id) {
          return;
        }

        if (
          usersInserts.some(
            (driver) => driver.user_id === assignVehicle.driver.user_id,
          ) ||
          this.assignedUsers.some(
            (user) => user.id === assignVehicle.driver.user_id,
          )
        ) {
          return;
        }

        usersInserts.push(assignVehicle.driver);
      });

      const deliveryRoutesUpdate = this.deliveryRoutes.map((route, index) => {
        vehicleRouteUpdate.push({
          type: "ITEMGROUPVEHICULOS",
          itemData: {
            idItemgroup: route.uid,
            idVehiculo: route.assignVehicle?.id,
          },
        });

        route.deliveries.forEach((delivery, index) => {
          deliveriesUpdate.push({
            type: "ITEMRUTA",
            itemData: {
              id: delivery.uid,
              jjwg_maps_lat_c: `${delivery.customer.location?.lat}`,
              jjwg_maps_lng_c: `${delivery.customer.location?.lng}`,
              hora_inicio_c: moment(delivery.hourOfInit, "HH:mm").format(
                "YYYY-MM-DD HH:mm:ss",
              ),
              duracion_c: moment(delivery.duration, "HH:mm").format(
                "YYYY-MM-DD HH:mm:ss",
              ),
              hora_fin_c: moment(delivery.hourOfEnd, "HH:mm").format(
                "YYYY-MM-DD HH:mm:ss",
              ),
              tipo_visita_c: "TV01",
              secuencia_c: index + 1,
              assigned_user_id: route.assignVehicle?.driver.user_id,
            },
          });
        });

        return {
          type: "ITEMGROUP",
          itemData: {
            id: route.uid,
            name: route.named,
            fecha_plan_c: moment(route.dateOfInit, "dddd, DD/MMMM/YYYY").format(
              "YYYY-MM-DD HH:mm:ss",
            ),
            capacidad_c: route.assignVehicle?.capacity,
            hora_inicio_c: moment(route.hourOfInit, "HH:mm").format(
              "YYYY-MM-DD HH:mm:ss",
            ),
            duracion_c: moment(route.duration, "HH:mm").format(
              "YYYY-MM-DD HH:mm:ss",
            ),
            hora_fin_c: moment(route.hourOfEnd, "HH:mm").format(
              "YYYY-MM-DD HH:mm:ss",
            ),
            secuencia_c: index + 1,
            id_vehiculo: route.assignVehicle?.id,
            bloqueado_c: route.enabled ? "00" : "01",
            assigned_user_id: route.assignVehicle?.driver.user_id,
          },
        };
      });

      const deletedClients = this.deletedVisits.flatMap(
        ({ accountId, routeId, visitId }) => {
          return [
            {
              type: "ITEMGROUPITEMRUTA",
              itemData: {
                id_itemgroup: routeId,
                id_itemruta: visitId,
              },
            },
            {
              type: "ITEMRUTAACCOUNTS",
              itemData: {
                id_itemruta: visitId,
                id_account: accountId,
              },
            },
            {
              type: "ITEMRUTA",
              itemData: {
                id_itemruta: visitId,
              },
            },
          ];
        },
      );

      return {
        inserts: [
          ...this.vehiclesToInsert,
          ...this.deliveryRoutesToInsert,
          ...this.visitRoutesToInsert,
          ...usersInserts.map((driver) => ({
            type: "PLANIFICADORRELACIONES",
            itemData: {
              name: "Planificacion-Conductor",
              idPlanificador: this.id,
              tipoRelacion: "01",
              userId: driver.user_id,
              principal: driver.tipo_c === "P01" ? "yes" : "no",
              iddivisionC: driver.user_iddivision_c,
              idamercadoC: driver.user_idamercado_c,
              idregionalC: driver.user_idregional_c,
            },
          })),
          ...vehicleRouteUpdate,
          ...this.clientsToInsert,
        ],
        updates: [
          this.planningUpdates,
          ...visitingRoutesUpdate,
          ...deliveryRoutesUpdate,
          ...deliveriesUpdate,
          ...visitsUpdate,
        ],
        delets: [
          ...this.vehiclesToDelete,
          ...deletedUsers,
          ...this.deletedRoutes,
          ...deletedClients,
        ],
      };
    },
    removeVisit(
      visit: PrimitiveVisit,
      route: PrimitiveRoute,
      routeIndex: number,
      visitIndex: number,
    ) {
      this.deletedVisits.push({
        visitId: visit.uid,
        routeId: route.uid,
        accountId: visit.customer.id,
      });

      if (this.type === "T01") {
        const visitRoute = route as PrimitiveRouteVisit;
        visitRoute.visits.splice(visitIndex, 1);
        if (visitIndex <= 0) {
          route.hourOfInit = visitRoute.visits[0].hourOfInit;
          return;
        }
        for (let i = visitIndex; i < visitRoute.visits.length; i++) {
          const nextVisit = visitRoute.visits[i - 1];
          visitRoute.visits[i].hourOfInit = nextVisit.hourOfEnd;
          visitRoute.visits[i].duration = nextVisit.duration;
          visitRoute.visits[i].hourOfEnd = moment(nextVisit.hourOfEnd, "HH:mm")
            .add(nextVisit.duration.split(":")[0], "h")
            .add(nextVisit.duration.split(":")[1], "m")
            .format("HH:mm");
        }
        route.hourOfEnd =
          visitRoute.visits[visitRoute.visits.length - 1].hourOfEnd;
      } else {
        const deliveryRoute = route as PrimitiveRouteDelivery;
        deliveryRoute.deliveries.splice(visitIndex, 1);
        if (visitIndex <= 0) {
          route.hourOfInit = deliveryRoute.deliveries[0].hourOfInit;
          return;
        }
        for (let i = visitIndex; i < deliveryRoute.deliveries.length; i++) {
          const nextDelivery = deliveryRoute.deliveries[i - 1];
          deliveryRoute.deliveries[i].hourOfInit = nextDelivery.hourOfEnd;
          deliveryRoute.deliveries[i].duration = nextDelivery.duration;
          deliveryRoute.deliveries[i].hourOfEnd = moment(
            nextDelivery.hourOfEnd,
            "HH:mm",
          )
            .add(nextDelivery.duration.split(":")[0], "h")
            .add(nextDelivery.duration.split(":")[1], "m")
            .format("HH:mm");
        }

        route.hourOfEnd =
          deliveryRoute.deliveries[
            deliveryRoute.deliveries.length - 1
          ].hourOfEnd;
      }
    },
    countOfActivities(index: number) {
      return this.activities.map((activity) => ({
        label: activity.name,
        count:
          this.type === "T01"
            ? this.visitingRoutes[index].visits.length
            : this.deliveryRoutes[index].deliveries.length,
      }));
    },
    async fetchActivities() {
      if(!this.from.isValid() || !this.to.isValid()) {
        return;
      }

      const { data } = await getActivities(this.type, "H01", this.from.format("YYYY-MM-DD"), this.to.format("YYYY-MM-DD"));

      this.activities = data;
    },
  },
  getters: {
    routesLength: (state) => {
      if (state.type === "T01") {
        return state.visitingRoutes.length;
      }

      if (state.type === "T02") {
        return state.deliveryRoutes.length;
      }
    },
    clientsLength: (state) => {
      if (state.type === "T01") {
        return state.visitingRoutes.reduce((acc, route) => {
          return acc + route.visits.length;
        }, 0);
      }

      if (state.type === "T02") {
        return state.deliveryRoutes.reduce((acc, route) => {
          return acc + route.deliveries.length;
        }, 0);
      }
    },
    totalUniqueClients: (state) => {
      return [...new Set(Object.values(state.shadowVisits).flat())].length;
    },
    countOfEnabledVisitRoutes: (state) => {
      return state.visitingRoutes.filter((route) => route.enabled).length;
    },
    countOfEnabledDeliveryRoutes: (state) => {
      return state.deliveryRoutes.filter((route) => route.enabled).length;
    },
    countOfDisabledVisitRoutes: (state) => {
      return state.visitingRoutes.filter((route) => !route.enabled).length;
    },
    countOfDisabledDeliveryRoutes: (state) => {
      return state.deliveryRoutes.filter((route) => !route.enabled).length;
    },
    from: (state) => {
      if (typeof state.date === "string") {
        return moment(state.date, "dddd, DD/MMMM/YYYY");
      }
      return moment(state.date.from, "dddd, DD/MMMM/YYYY");
    },
    to: (state) => {
      if (typeof state.date === "string") {
        return moment(state.date, "dddd, DD/MMMM/YYYY");
      }
      return moment(state.date.to, "dddd, DD/MMMM/YYYY");
    },
    dateRange: (state) => {
      const from = moment(
        typeof state.date === "string" ? state.date : state.date.from,
        "dddd, DD/MMMM/YYYY",
      );
      const to = moment(
        typeof state.date === "string" ? state.date : state.date.to,
        "dddd, DD/MMMM/YYYY",
      );

      return {
        from,
        to,
      };
    },
    getUserFullName: (state) => {
      if (!state.user.nombres && state.user.apellidos) {
        return state.user.apellidos;
      }

      return `${state.user.nombres} ${state.user.apellidos}`;
    },
    getInitialOfUser: (state): string => {
      return state.user.nombres?.[0] ?? state.user.apellidos?.[0] ?? "-";
    },
    isUpdateMode: (state): boolean => {
      return !!state.id;
    },
    readonly: (state): boolean => {
      return (
        !!state.id &&
        (state.state === "EP02" ||
          state.state === "EP04" ||
          state.state === "EP05")
      );
    },
    planningUpdates: (state) => {
      const fecha_inicio_c = moment(
        typeof state.date === "string" ? state.date : state.date.from,
        "dddd, DD/MMMM/YYYY",
      )
        .add(4, "hours")
        .format("YYYY-MM-DD HH:mm:ss");
      const fecha_fin_c = moment(
        typeof state.date === "string" ? state.date : state.date.to,
        "dddd, DD/MMMM/YYYY",
      )
        .add(4, "hours")
        .format("YYYY-MM-DD HH:mm:ss");

      return {
        type: "PLANIFICADOR",
        itemData: {
          id: state.id,
          name: state.name,
          date_modified: moment().format("YYYY-MM-DD HH:mm:ss"),
          modified_user_id: state.user.id,
          assigned_user_id: state.user.id,
          tipo: state.type,
          iddivision_c: state.salesOrganization,
          idamercado_c: state.sector,
          region_c: state.regional,
          estado_planificacion_c: state.state,
          fecha_inicio_c,
          fecha_fin_c,
          description: state.description,
        },
      };
    },
    vehiclesToInsert: (state) => {
      return state.insertedVehicles.map((vehicle) => {
        return {
          type: "PLANIFICADORVEHICULOS",
          itemData: {
            idPlanificador: state.id,
            idVehiculo: vehicle,
          },
        };
      });
    },
    vehiclesToDelete: (state) => {
      return state.deletedVehicles.map((vehicle) => {
        return {
          type: "PLANIFICADORVEHICULOS",
          itemData: {
            id_planificador: state.id,
            id_vehiculo: vehicle,
          },
        };
      });
    },
    deliveryRoutesToInsert: (state) => {
      return state.deliveryRoutes.flatMap((route, index) => {
        if (
          state.deletedDeliveryRoutes.includes(route.uid) ||
          state.shadowDeliveryRoutesId.includes(route.uid)
        ) {
          return [];
        }

        return {
          type: "ITEMGROUP",
          itemData: {
            idPlanificador: state.id,
            name: route.named,
            description: "",
            fechaPlanC: moment(route.dateOfInit, "dddd, DD/MMMM/YYYY").format(
              "YYYY-MM-DD HH:mm:ss",
            ),
            capacidadC: route.assignVehicle?.capacity,
            horaInicioC: moment(route.dateOfInit, "dddd, DD/MMMM/YYYY")
              .add(+route.hourOfInit.split(":")[0], "h")
              .add(+route.hourOfInit.split(":")[1], "m")
              .format("YYYY-MM-DD HH:mm:ss"),
            duracionC: moment(route.dateOfInit, "dddd, DD/MMMM/YYYY")
              .add(+route.duration.split(":")[0], "h")
              .add(+route.duration.split(":")[1], "m")
              .format("YYYY-MM-DD HH:mm:ss"),
            horaFinC: moment(route.dateOfInit, "dddd, DD/MMMM/YYYY")
              .add(+route.hourOfEnd.split(":")[0], "h")
              .add(+route.hourOfEnd.split(":")[1], "m")
              .format("YYYY-MM-DD HH:mm:ss"),
            secuenciaC: index + 1,
            userId: route.assignVehicle?.driver.user_id,
            idVehiculo: route.assignVehicle?.id,
            bloqueadoC: route.enabled ? "00" : "01",
            itemrutas: route.deliveries.map((delivery, index) => {
              return {
                name: delivery.customer.name,
                description: delivery.customer.name,
                latitud: `${delivery.customer.location?.lat}`,
                longitud: `${delivery.customer.location?.lng}`,
                fechaInicioC: moment(route.dateOfInit, "dddd, DD/MMMM/YYYY")
                  .add(+delivery.hourOfInit.split(":")[0], "h")
                  .add(+delivery.hourOfInit.split(":")[1], "m")
                  .format("YYYY-MM-DD HH:mm:ss"),
                fechaFinC: moment(route.dateOfInit, "dddd, DD/MMMM/YYYY")
                  .add(+delivery.hourOfEnd.split(":")[0], "h")
                  .add(+delivery.hourOfEnd.split(":")[1], "m")
                  .format("YYYY-MM-DD HH:mm:ss"),
                horaInicioC: moment(route.dateOfInit, "dddd, DD/MMMM/YYYY")
                  .add(+delivery.hourOfInit.split(":")[0], "h")
                  .add(+delivery.hourOfInit.split(":")[1], "m")
                  .format("YYYY-MM-DD HH:mm:ss"),
                duracionC: moment(route.dateOfInit, "dddd, DD/MMMM/YYYY")
                  .add(+delivery.duration.split(":")[0], "h")
                  .add(+delivery.duration.split(":")[1], "m")
                  .format("YYYY-MM-DD HH:mm:ss"),
                horaFinC: moment(delivery.hourOfEnd, "dddd, DD/MMMM/YYYY")
                  .add(+delivery.hourOfEnd.split(":")[0], "h")
                  .add(+delivery.hourOfEnd.split(":")[1], "m")
                  .format("YYYY-MM-DD HH:mm:ss"),
                tipoVisitaC: "TV01",
                secuenciaC: index + 1,
                idAccount: delivery.customer.id,
                userId: route.assignVehicle?.driver.user_id,
                entregas: delivery.customer.entregas.map((e) => e.entrega_id),
                tareasplan: state.activities.map((activity) => activity.id),
              };
            }),
          },
        };
      });
    },
    visitRoutesToInsert: (state) => {
      return state.visitingRoutes.flatMap((route, index) => {
        if (
          state.deletedVisitingRoutes.includes(route.uid) ||
          state.shadowVisitingRoutesId.includes(route.uid)
        ) {
          return [];
        }

        return {
          type: "ITEMGROUP",
          itemData: {
            idPlanificador: state.id,
            name: route.named,
            description: "",
            fechaPlanC: moment(route.dateOfInit, "dddd, DD/MMMM/YYYY").format(
              "YYYY-MM-DD HH:mm:ss",
            ),
            horaInicioC: moment(route.dateOfInit, "dddd, DD/MMMM/YYYY")
              .add(+route.hourOfInit.split(":")[0], "h")
              .add(+route.hourOfInit.split(":")[1], "m")
              .format("YYYY-MM-DD HH:mm:ss"),
            duracionC: moment(route.dateOfInit, "dddd, DD/MMMM/YYYY")
              .add(+route.duration.split(":")[0], "h")
              .add(+route.duration.split(":")[1], "m")
              .format("YYYY-MM-DD HH:mm:ss"),
            horaFinC: moment(route.dateOfInit, "dddd, DD/MMMM/YYYY")
              .add(+route.hourOfEnd.split(":")[0], "h")
              .add(+route.hourOfEnd.split(":")[1], "m")
              .format("YYYY-MM-DD HH:mm:ss"),
            secuenciaC: index + 1,
            bloqueadoC: route.enabled ? "00" : "01",
            userId: state.user.id,
            itemrutas: route.visits.map((visit, index) => {
              return {
                name: visit.customer.name,
                description: visit.customer.name,
                latitud: `${visit.customer.location?.lat}`,
                longitud: `${visit.customer.location?.lng}`,
                fechaInicioC: moment(route.dateOfInit, "dddd, DD/MMMM/YYYY")
                  .add(+visit.hourOfInit.split(":")[0], "h")
                  .add(+visit.hourOfInit.split(":")[1], "m")
                  .format("YYYY-MM-DD HH:mm:ss"),
                fechaFinC: moment(route.dateOfInit, "dddd, DD/MMMM/YYYY")
                  .add(+visit.hourOfEnd.split(":")[0], "h")
                  .add(+visit.hourOfEnd.split(":")[1], "m")
                  .format("YYYY-MM-DD HH:mm:ss"),
                horaInicioC: moment(route.dateOfInit, "dddd, DD/MMMM/YYYY")
                  .add(+visit.hourOfInit.split(":")[0], "h")
                  .add(+visit.hourOfInit.split(":")[1], "m")
                  .format("YYYY-MM-DD HH:mm:ss"),
                duracionC: moment(route.dateOfInit, "dddd, DD/MMMM/YYYY")
                  .add(+visit.duration.split(":")[0], "h")
                  .add(+visit.duration.split(":")[1], "m")
                  .format("YYYY-MM-DD HH:mm:ss"),
                horaFinC: moment(visit.hourOfEnd, "dddd, DD/MMMM/YYYY")
                  .add(+visit.hourOfEnd.split(":")[0], "h")
                  .add(+visit.hourOfEnd.split(":")[1], "m")
                  .format("YYYY-MM-DD HH:mm:ss"),
                tipoVisitaC: "TV02",
                secuenciaC: index + 1,
                idAccount: visit.customer.id,
                userId: state.user.id,
              };
            }),
          },
        };
      });
    },
    deletedRoutes: (state) => {
      return [
        ...state.deletedVisitingRoutes.flatMap((id) => {
          return [
            {
              type: "PLANIFICADORITEMGROUP",
              itemData: {
                id_planificador: state.id,
                id_itemgroup: id,
              },
            },
            {
              type: "ITEMGROUP",
              itemData: {
                id_itemgroup: id,
              },
            },
          ];
        }),
        ...state.deletedDeliveryRoutes.flatMap((id) => {
          return [
            {
              type: "PLANIFICADORITEMGROUP",
              itemData: {
                id_planificador: state.id,
                id_itemgroup: id,
              },
            },
            {
              type: "ITEMGROUP",
              itemData: {
                id_itemgroup: id,
              },
            },
          ];
        }),
      ];
    },
    clientsToInsert: (state) => {
      return [
        ...state.visitingRoutes.flatMap((route) => {
          return route.visits.flatMap((visit, index) => {
            if (
              route.uid in state.shadowVisits &&
              !state.shadowVisits[route.uid].includes(visit.customer.id)
            ) {
              return [
                {
                  type: "ITEMRUTA",
                  itemData: {
                    name: visit.customer.name,
                    description: visit.customer.name,
                    tipoVisitaC: "TV02",
                    fechaInicioC: moment(
                      route.dateOfInit,
                      "dddd, DD/MMMM/YYYY",
                    ).format("YYYY-MM-DD HH:mm:ss"),
                    horaInicioC: moment(route.dateOfInit, "dddd, DD/MMMM/YYYY")
                      .add(+visit.hourOfInit.split(":")[0], "h")
                      .add(+visit.hourOfInit.split(":")[1], "m")
                      .format("YYYY-MM-DD HH:mm:ss"),
                    duracionC: moment(route.dateOfInit, "dddd, DD/MMMM/YYYY")
                      .add(+visit.duration.split(":")[0], "h")
                      .add(+visit.duration.split(":")[1], "m")
                      .format("YYYY-MM-DD HH:mm:ss"),
                    fechaFinC: moment(
                      route.dateOfInit,
                      "dddd, DD/MMMM/YYYY",
                    ).format("YYYY-MM-DD HH:mm:ss"),
                    horaFinC: moment(route.dateOfInit, "dddd, DD/MMMM/YYYY")
                      .add(+visit.hourOfEnd.split(":")[0], "h")
                      .add(+visit.hourOfEnd.split(":")[1], "m")
                      .format("YYYY-MM-DD HH:mm:ss"),
                    secuenciaC: index + 1,
                    idAccount: visit.customer.id,
                    idItemgroup: route.uid,
                    userId: state.assignedUsers[0].id,
                    latitud: visit.customer.location?.lat ?? "0",
                    longitud: visit.customer.location?.lng ?? "0",
                  },
                },
              ];
            }
            return [];
          });
        }),
        ...state.deliveryRoutes.flatMap((route) => {
          return route.deliveries.flatMap((delivery, index) => {
            if (
              route.uid in state.shadowDeliveries &&
              !state.shadowDeliveries[route.uid].includes(delivery.customer.id)
            ) {
              return [
                {
                  type: "ITEMRUTA",
                  itemData: {
                    name: delivery.customer.name,
                    description: delivery.customer.name,
                    tipoVisitaC: "TV01",
                    fechaInicioC: moment(
                      route.dateOfInit,
                      "dddd, DD/MMMM/YYYY",
                    ).format("YYYY-MM-DD HH:mm:ss"),
                    horaInicioC: moment(route.dateOfInit, "dddd, DD/MMMM/YYYY")
                      .add(+delivery.hourOfInit.split(":")[0], "h")
                      .add(+delivery.hourOfInit.split(":")[1], "m")
                      .format("YYYY-MM-DD HH:mm:ss"),
                    duracionC: moment(route.dateOfInit, "dddd, DD/MMMM/YYYY")
                      .add(+delivery.duration.split(":")[0], "h")
                      .add(+delivery.duration.split(":")[1], "m")
                      .format("YYYY-MM-DD HH:mm:ss"),
                    fechaFinC: moment(
                      route.dateOfInit,
                      "dddd, DD/MMMM/YYYY",
                    ).format("YYYY-MM-DD HH:mm:ss"),
                    horaFinC: moment(route.dateOfInit, "dddd, DD/MMMM/YYYY")
                      .add(+delivery.hourOfEnd.split(":")[0], "h")
                      .add(+delivery.hourOfEnd.split(":")[1], "m")
                      .format("YYYY-MM-DD HH:mm:ss"),
                    secuenciaC: index + 1,
                    idAccount: delivery.customer.id,
                    idItemgroup: route.uid,
                    userId: route.assignVehicle?.driver.user_id,
                    latitud: delivery.customer.location?.lat ?? "0",
                    longitud: delivery.customer.location?.lng ?? "0",
                  },
                },
              ];
            }
            return [];
          });
        }),
      ];
    },
  },
});
