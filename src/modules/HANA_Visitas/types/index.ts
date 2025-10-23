export type Cycle = {
  name: string;
  dateOfInit: string;
  dateOfEnd: string;
  days: number;
  visitPerDay: number;
  hourPerDay: number;
  region: string;
  state: string;
  description: string;
};

export type VisitsOptions = {
  page: number;
  rowsPerPage: number;
  signal?: AbortSignal;
  filter: FilterRutas;
};

export type FilterRutas = {
  codUsuario?: string[];
  fecha: {
    from: string;
    to: string;
  };
  regional?: string;
  areaMercado?: string;
  division?: string;
}

export type VisitsResponse = {
  RutaID: string;
  TipoVisita?: string;
  fecha_inicio_c?: Date;
  fecha_fin_c: Date;
  hora_inicio_c: Date;
  hora_fin_c?: Date;
  duracion_c: Date;
  secuencia_c: number;
  Latitud?: string;
  Longitud: string;
  CodCliente?: string;
  NombreCliente?: string;
  CodUsuario: string;
  NombreUsuario: string;
  codusuario_c: string;
  nombreusuario_c: string;
  kunnr_c: string;
  nombrecliente_c: string;
  RegionalCliente: string;
  AreaMercado: string;
  Division: string;
  regional: string;
  area_mercado: string;
  division: string;
  Total: number;
};

export type FilterUsers = {
  page: number;
  rowsPerPage: number;
  search: string;
  filter: {
    easyFilter: string;
    reports_to_id: string;
    iddivision_c: string;
    idregional_c: string;
    idamercado_c: string;
  };
  sortBy: string;
  order: string;
};

export type UsersResponse = {
  id: string;
  user_name: string;
  first_name?: string;
  last_name: string;
  photo?: string;
  reports_to_id?: string;
  iddivision_c?: string;
  iddivision_c_label?: string;
  idregional_c?: string;
  idregional_c_label?: string;
  idamercado_c?: string;
  idamercado_c_label?: string;
  rol_hbm_c: string;
};
