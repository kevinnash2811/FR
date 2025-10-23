import type { Ref } from "vue";

export enum Module {
  VISIT = "T01",
  DISPATCH = "T02",
}

export enum Geolocation {
  ALL = "all",
  WITH_LOCATION = "withLocalization",
  WITHOUT_LOCATION = "withinLocalization",
}

export type Panel = {
  label: string;
  name: string;
};

export type AdvancedFilter = {
  name: string;
  lastname: string;
  comercial_name: string;
  client_type: string;
  account_type: string;
  aio_code: string;
  nit_ci: string;
  cellphone: string;
  category: string;
  category2: string;
  email: string;
  industry: string;
  sub_industry: string;
  country: string;
  state: string;
  city: string | Ref<string>;
  street: string;
  document_type: string;
  tax_regime: string;
  website: string;
  created_by: string[];
  modified_by: string[];
  assigned_to: string[];
  zona_venta_c: string[];
  date?: {
    from: string;
    to: string;
  };
  statusEntrega: string[] | Ref<string[]>;
  start_date: string;
  end_date: string;
  operator: string;
  exclude: string;
  customerGroup: string;
  planificacion: string;
  includes: string;
  ruleDate?: string;
};

export type PaginateOptions = {
  page: number;
  rowsPerPage: number;
  withLocation: Geolocation;
  signal: AbortSignal;
  easyFilter: string;
  filter?: AdvancedFilter;
};

export type AreaVenta = {
  division: string;
  amercado: string;
  regional: string;
  canal_ventas: string;
};

export type VisitPreference = {
  Days: string | null;
  StartTime: string | null;
  EndTime: string | null;
  Frequency: string | null;
};
export type Delivery = {
  name: string;
  division: string;
  amercado: string;
  estado: string;
};

export type ClientDetailResponse = {
  info_account: InfoAccount;
  area_ventas: AreaVenta[];
  preferencia_visita: VisitPreference[];
  entregas?: Delivery[];
};

export type InfoAccount = {
  id: string;
  nombre: string;
  nit_ci_c: string;
  industry: string;
  industry_name: string;
  subindustry_c: string;
  subindustry: string;
  ciudad: string;
  departamento: string;
  pais: string;
  phone_office: string;
  phone_alternate: any;
  email_address: any;
  billing_address_street: string;
  jjwg_maps_lat_c: number;
  jjwg_maps_lng_c: number;
};
