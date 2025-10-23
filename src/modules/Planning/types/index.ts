import type { CategoryAccount, Delivery as AccountDelivery } from "@/types";
import type { LatLng } from "leaflet";
export type PrimitiveVehicle = {
  plate: string;
  driver: {
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
  };
  capacity: string;
};

export type Vehicle = {
  id: string;
} & PrimitiveVehicle;

export type AssignedVehicle = {
  id: string;
  vehicle: Vehicle;
  driver: DriverResponse;
};

export type VehicleAPIResponse = {
  id: string;
  name: string;
  regional: string;
  amercado: string;
  division: string;
  capacidad_1_c: string;
  estado_vehiculo_c: string;
  estado_vehiculo_label: string;
  conductores?: {
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
  }[];
};

export enum Point {
  STORE = "store",
  CUSTOMER = "customer",
}

export enum PlanningState {
  PREPARING = "En Preparación",
  APROVED = "Aprobado",
  REJECTED = "Rechazado",
  PENDING = "Pendiente",
}

export enum PlanningStateID {
  PREPARING = "EP01",
  APROVED = "EP02",
  REJECTED = "EP03",
  PENDING = "EP04",
}

export type DriverResponse = {
  id_conductor: string;
  alias_conductor: string;
  iddivision_c: string | null;
  idamercado_c: string | null;
  division: string | null;
  amercado: string | null;
  avatar: string;
  regional: string | null;
  id_user: string;
  name_conductor: string;
  assigned_to: string[];
};

export type PrimitiveVisit = {
  uid: string;
  hourOfInit: string;
  hourOfEnd: string;
  duration: string;
  dateOfInit: string;
  customer: {
    id: string;
    name: string;
    address: string;
    location?: LatLng;
    category?: CategoryAccount;
    tasks?: Activity[];
  };
};

export type PrimitiveDelivery = {
  uid: string;
  hourOfInit: string;
  hourOfEnd: string;
  duration: string;
  customer: Pick<
    AccountDelivery,
    "id" | "name" | "location" | "address" | "category" | "entregas" | "zone"
  >;
  activities?: Activity[];
};

export type Delivery = {
  id: string;
} & PrimitiveDelivery;

export type PrimitiveRoute = {
  dateOfInit: string;
  hourOfInit: string;
  hourOfEnd: string;
  duration: string;
  named: string;
  enabled: boolean;
  readonly: boolean;
  customer: {
    id: string;
    name: string;
    address: string;
    location?: LatLng;
    category?: CategoryAccount;
  };
  uid: string;
};

/* Delivery */
export type PrimitiveRouteDelivery = {
  assignVehicle?: Vehicle;
  deliveries: PrimitiveDelivery[];
} & PrimitiveRoute;

export type RouteDelivery = {
  id: string;
} & PrimitiveRouteDelivery;

/* Visit */
export type PrimitiveRouteVisit = {
  visits: PrimitiveVisit[];
} & PrimitiveRoute;

export type RouteVisit = {
  id: string;
} & PrimitiveRouteVisit;

export type PrimitiveActivity = {
  name: string;
  description: string;
  iddivision_c: string;
  division: string;
  idamercado_c: string;
  amercado: string;
  region_c: string;
  region: string;
  tipo_tarea_c: string;
  tipotarea: string;
  estado_c: string;
  estadotarea: string;
  obligatorio_c?: string;
  tarea_para_c: string;
  tarea_para: string;
  fecha_inicio_regla: string;
  fecha_fin_regla: string;
};

export type Activity = {
  id: string;
} & PrimitiveActivity;

export type ActivityCabecera = {
  id: string;
} & PrimitiveActivity;

export type PlanningResponseAPI = {
  result_planificador: ResultPlanificador;
  result_users: ResultUser[];
  result_vehiculos: ResultVehiculo[];
  result_groups: ResultGroup[];
};

export type ResultVehiculo = {
  id: string;
  name: string;
  amercado_c: string;
  amercado_label_c: string;
  iddivision_c: string;
  division_label_c: string;
  regional_c: string;
  regional_label_c: string;
  capacidad_1_c: string;
  tipo_auto_c: string;
  estado_vehiculo_c: string;
  estado_vehiculo_label: string;
  conductores: string;
};

export type ResultUser = {
  id: string;
  id_relacion: string;
  first_name: string;
  last_name: string;
  title: string;
  iddivision_c: string;
  division: string;
  idamercado_c: string;
  amercado: string;
  idempleado_c: string;
  idvendedor_c: string;
  rol_hbm_c: string;
  rol_hbm_label_c: string;
};
export type ResultGroup = {
  group_id: string;
  group_name_c: string;
  group_secuencia_c: string;
  group_fecha_plan_c: string;
  group_user_id: string;
  group_usuario: string;
  group_id_vehiculo: string | null;
  group_placa: string | null;
  group_capacidad_c: string | null;
  group_bloqueado_c: string;
  group_hora_inicio_c: string;
  group_duracion_c: string;
  group_hora_fin_c: string;
  rutas_item: RutasItem[];
};

export type ResultEntrega = {
  entrega_id: string;
  entrega_name: string;
  entrega_estado_c: string;
  entrega_fecha_entrega_c: string;
};

export type RutasItem = {
  regionclienter: string;
  customerRegion: string;
  idRegla: string;
  idTarea: string;
  ruta_id: string;
  ruta_secuencia: number;
  ruta_name: string;
  ruta_tipo_visita: string;
  ruta_tipo_visita_label: string;
  ruta_fecha_inicio_c: string;
  ruta_hora_inicio_c: string;
  ruta_duracion_c: string;
  ruta_fecha_fin_c: string;
  ruta_hora_fin_c: string;
  ruta_id_account: string;
  ruta_name_account: string;
  ruta_address_account: string;
  ruta_category_account: string;
  ruta_second_category_account: string;
  ruta_usuario_zona_ventas_c: string;
  ruta_latitud: string;
  ruta_longitud: string;
  ruta_assigned_user_id: string;
  ruta_usuario_asignado: string;
  entregas: ResultEntrega[];
  reglas_enrutamiento: any[];
};

export type ResultPlanificador = {
  id: string;
  name: string;
  iddivision_c: string;
  division: string;
  idamercado_c: string;
  amercado: string;
  region_c: string;
  regional: string;
  tipo: string;
  tipo_label: string;
  estado_planificacion_c: string;
  fecha_inicio_c: string;
  fecha_fin_c: string;
  estado: string;
  descripcion: string;
};

export type PlanningResponse = {
  planificacion_id: string;
  planificacion_name: string;
  planificacion_description: string;
  planificacion_date_entered: string;
  planificacion_iddivision_c: string;
  planificacion_division: string;
  planificacion_idamercado_c: string;
  planificacion_amercado: string;
  planificacion_region_c: string;
  planificacion_region: string;
  planificacion_tipo: string;
  planificacion_tipo_label: string;
  planificacion_estado: string;
  planificacion_estado_label: string;
  planificacion_id_user: string;
  rutas?: RouteResponse[];
};

export type RouteResponse = {
  id: string;
  name: string;
  date_entered: string;
  date_modified: string;
  created_by: string;
  description: string;
  deleted: boolean;
  assigned_user_id: string;
  fecha_plan_c: string;
  hora_inicio_c: string;
  duracion_c: string;
  hora_fin_c: string;
  secuencia_c: string;
  clientes: string;
  usuario_asignado: UsuarioAsignado;
};

export type Cliente = {
  id: string;
  name: string;
  date_entered: string;
  date_modified: string;
  created_by: string;
  description: string;
  deleted: boolean;
  assigned_user_id: string;
  tipo_visita_c: string;
  fecha_inicio_c: string;
  hora_inicio_c: string;
  duracion_c: string;
  fecha_fin_c: string;
  hora_fin_c: string;
  secuencia_c: number;
  jjwg_maps_lat_c: string;
  jjwg_maps_lng_c: string;
};

export type UsuarioAsignado = {
  id: string;
  user_name: string;
  user_hash: string;
  system_generated_password: boolean;
  pwd_last_changed: string;
  sugar_login: boolean;
  last_name: string;
  is_admin: boolean;
  external_auth_only: boolean;
  receive_notifications: boolean;
  date_entered: string;
  date_modified: string;
  modified_user_id: string;
  created_by: string;
  department: string;
  status: string;
  address_country: string;
  deleted: boolean;
  portal_only: boolean;
  show_on_employees: boolean;
  employee_status: string;
  reports_to_id: string;
  is_group: boolean;
  factor_auth: boolean;
};

export interface UsuariosRutas {
  id: string;
  user_name: string;
  last_name: string;
  first_name: string;
}

export interface Ruta {
  id: string;
  name: string;
  secuencia_c: string;
  fecha_plan_c: string;
  total_clientes: number;
  usuario_asignado: UsuariosRutas;
}
