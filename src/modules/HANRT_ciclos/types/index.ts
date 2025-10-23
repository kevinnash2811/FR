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

export type CycleReponse = {
  id: string;
  ciclo_name: string;
  ciclo_fecha_inicio_hora_c: string;
  ciclo_fecha_fin_hora_c: string;
  ciclo_cantidad_visitas_dia_c: number;
  ciclo_dias_c?: number;
  ciclo_horas_por_dia_c: number;
  iddivision_c_label: string;
  idamercado_c_label: string;
  region_c_label: string;
  estado_c_label: string;
}

export type FilterUsers = {
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
