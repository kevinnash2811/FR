import type { LatLng } from "leaflet";
import type { Activity } from "./modules/Planning/types";

export type NavItem = {
  icon: string;
  route: string;
  label: string;
  name: string;
  children?: NavItem[];
};

type CategoryAccount = "A" | "B" | "C" | "D";

type JsonProducts = {
  product_name: string;
  product_nota_description: string;
  product_part_number: string;
  product_item_description: string;
  product_secuencia: number;
  product_cantidad: number;
  product_precio: string;
  product_descuento: string;
  product_condescuento: string;
  product_total: string;
};

type FacturasProduct = {
  factura_name_aio: string;
  factura_number: number;
  factura_direccion: string;
  factura_status: string;
  factura_estatus_label: string;
  json_products: JsonProducts[];
};

type ActivityResponse = {
  customerRegion: string;
  hanrt_reglasenrutamiento_accountshanrt_reglasenrutamiento_ida: string;
  id: string;
  tarea_amercado_c: string;
  tarea_amercado_label: string;
  tarea_descripcion: string;
  tarea_division: string;
  tarea_division_label: string;
  tarea_estado: string;
  tarea_estado_label: string;
  tarea_id: string;
  tarea_name: string;
  tarea_para_c: string;
  fecha_inicio_regla: string;
  fecha_fin_regla: string;
  tarea_para_c_label: string;
  tarea_region_c: string;
  tarea_region_c_label: string;
  tarea_tipo_tarea_c: string;
  tarea_tipo_tarea_c_label: string;
  tarea_obligatorio_c: string;
  idregional_c: string;
};

export type Account = {
  id: string;
  icon: string;
  color: string;
  name: string;
  address: string;
  location?: LatLng;
  category?: CategoryAccount;
  hasLocation: boolean;
  zone: string;
  zoneId: string;
  createdAt: string;
  tasks: Activity[];
};

export type Delivery = {
  id: string;
  icon: string;
  color: string;
  name: string;
  address: string;
  location?: LatLng;
  category?: CategoryAccount;
  dispatchs: number;
  hasLocation: boolean;
  zone: string;
  zoneId: string;
  createdAt: string;
  quote: string;
  entregas: Entrega[];
};

export type AccountMarkerResponse = {
  id: string;
  name: string;
  comercial_name: string;
  address: string;
  lat: number | null;
  lng: number | null;
  location?: string;
  zona_ventas_c: string;
  category?: CategoryAccount;
};

export type AccountResponse = {
  customerRegion: string;
  id: string;
  nombre?: string;
  comercial_name?: string;
  icon: string;
  color: string;
  address?: string;
  latitud: number;
  longitud: number;
  location?: string;
  fecha_creacion: string;
  categoria_ventas_c?: CategoryAccount;
  categoria_ventas02_c: CategoryAccount;
  industry_name: string;
  idzona_ventas_c?: string;
  zona_ventas_c?: string;
  nit: string;
  codigo: string;
  tipo: string;
  ciudad: string;
  departamento: string;
  modified_user_id: string;
  assigned_user_id: string;
  industry_name: string;
  subindustry: string;
  tareas_json: string;
  tareas?: ActivityResponse[];
};

export type DeliveryResponse = {
  id: string;
  nombre?: string;
  icon: string;
  color: string;
  address?: string;
  latitud: number;
  longitud: number;
  location?: string;
  fecha_creacion: string;
  categoria_ventas_c?: CategoryAccount;
  cantEntregas?: number;
  idzona_ventas_c?: string;
  zona_ventas_c?: string;
  json_entregas: string;
  referencia_c?: string;
  referencia2_c?: string;
};

export type Entrega = {
  entrega_id: string;
  entrega_name: string;
  entrega_fecha: string;
  entrega_description: string;
  entrega_division: string;
  entrega_division_label: string;
  entrega_amercado: string;
  entrega_amercado_label: string;
  entrega_regional: string;
  entrega_estado: string;
  entrega_estado_label: string;
  referencia_c: string;
  referencia2_c: string;
  nro_factura_c: string;
  entregas_product: EntregasProduct[];
  facturas_product?: FacturasProduct[];
};

export type EntregasProduct = {
  product_name: string;
  product_nota_description: string;
  product_part_number: string;
  product_item_description: string;
  product_secuencia: number;
  product_cantidad: number;
  product_precio: string;
  product_descuento: string;
  product_condescuento: string;
  product_total: string;
};

export type TokenResponse = {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  token_type: string;
};

export interface User {
  userCRM: UserCRM;
  token: string;
}

export interface UserCRM {
  id: string;
  nombres: string;
  apellidos: string;
  iddivision: string;
  division: string;
  idamercado: string;
  amercado: string;
  idregional: string;
  regional: string;
  rol: null;
  estado: string;
  activo: string;
  codigo_empleado: string;
  codigo_vendedor: string;
  email: string;
  id_reponsable: null;
  nombres_responsable: null;
  apellidos_responsable: null;
  pais: string;
  idgrupocliente: string;
  idlocation: string;
  rol_hbm_c: string;
  rol_hbm_label: string;
  namelocation: null;
  is_admin: boolean;
  idempresa: string;
  almacen_id: null;
  almacen_name: null;
  reports_id: string[];
  reports_to_id: UserAccount[];
  zona_ventas_c: ListResponseAPI[];
}

export interface UserAccount {
  id: string;
  user_name: string;
  division: string;
  a_mercado: string;
  avatar: string;
  employee_status: string;
  cargo: string;
  iddivision_c: string;
  idamercado_c: string;
  idgrupocliente_c: string;
  idregional_c: string;
  idvendedor_c: string;
  email: string;
}

type ListResponseAPI = {
  ListType: string;
  ListId: IListID;
  ID: string;
  Value: string;
};
type IListID =
  | "account_type_dom"
  | "dayofweek_c_list"
  | "delivery_time_list"
  | "delivery_time_list_repuestos"
  | "document_category_dom"
  | "document_template_type_dom"
  | "estado_envio_firebase_c_list"
  | "estado_planificacion_c_list"
  | "hane_estado_list"
  | "hansa_account_reg_tributario_list"
  | "hansa_accounts_tipo_documento_list"
  | "hansa_activo_preferencia_visita_c_list"
  | "hansa_acuentade_list"
  | "hansa_amercado_list"
  | "hansa_amercado_sector_list"
  | "hansa_amercado_sector_nombre"
  | "hansa_area_afecta_list"
  | "hansa_areaafectada_categoria_list"
  | "hansa_categoria_ventas_list"
  | "hansa_colores_list"
  | "hansa_dimalmacen_list"
  | "hansa_dimbanco_list"
  | "hansa_dimcanal_list"
  | "hansa_dimcanaldistribucion_list"
  | "hansa_dimcentro_list"
  | "hansa_dimcentro_regional_list"
  | "hansa_dimgrupocliente_list"
  | "hansa_dimorigenes_list"
  | "hansa_dimregion_abv_list"
  | "hansa_dimregion_list"
  | "hansa_dimregional_list"
  | "hansa_dimrubro_list"
  | "hansa_dimsubrubro_list"
  | "hansa_dimtiempofab_st04_list"
  | "hansa_dimzona_ventas_list"
  | "hansa_division_orgventas_list"
  | "hansa_divisiones_list"
  | "hansa_efectividad_medio_list"
  | "hansa_estado_oportunidad_list"
  | "hansa_estado_propuesto_list"
  | "hansa_estado_regla_enrutamiento_list"
  | "hansa_estado_tarea_list"
  | "hansa_estado_vehiculo_list_c"
  | "hansa_evento_no_actividad_list"
  | "hansa_grupocliente_tipo_pedido_list"
  | "hansa_head_tarea_list"
  | "hansa_oficina_zonaventas_list"
  | "hansa_ofiventas_list"
  | "hansa_oportunidad_motivo_list"
  | "hansa_origen_reclamo_list"
  | "hansa_pais_list"
  | "hansa_prioridad_quejahansa_list"
  | "hansa_procedencia_list"
  | "hansa_productos_familia_list"
  | "hansa_productos_grupo_list"
  | "hansa_regimen_tributario_list"
  | "hansa_regional_almacen_list"
  | "hansa_status_activities_list"
  | "hansa_subarea_afecta_list"
  | "hansa_tipo_bonificacion_list"
  | "hansa_tipo_condicion_pedido_list"
  | "hansa_tipo_conductor_list"
  | "hansa_tipo_cuenta_list"
  | "hansa_tipo_doc_identificacion_cod_list"
  | "hansa_tipo_doc_identificacion_list"
  | "hansa_tipo_finaciamiento_list"
  | "hansa_tipo_frequency_list"
  | "hansa_tipo_importe_pedido_cod_list"
  | "hansa_tipo_notas_cobranza"
  | "hansa_tipo_pago_hbm_list"
  | "hansa_tipo_reclamo_list"
  | "hansa_tipo_regla_enrutamiento_list"
  | "hansa_tipo_tareas_list"
  | "hansa_tipo_tareas_list_hbm"
  | "hansa_tipo_tareas_list_time"
  | "hansa_tipoPago_recibo_hbm"
  | "hansa_tipoplanificacion_list"
  | "hansa_unidad_medida_list"
  | "hansa_zona_transporte_list"
  | "hanst_averias_categoria_list"
  | "hanst_depositos_fuel_list"
  | "hanst_motivos_visitas_list"
  | "hanst_ofertas_tipo_list"
  | "hanst_seguros_list"
  | "hanst_tipos_citas_taller_list"
  | "hanst_trabajo_realizar_list"
  | "invoice_status_dom"
  | "modulos_hbm_list"
  | "opportunity_type_dom"
  | "project_metric_units_dom_list"
  | "project_status_dom"
  | "project_user_role_dom"
  | "quote_stage_dom"
  | "roles_hbm_estado_multiuser_descripcion_list"
  | "roles_hbm_list"
  | "sales_stage_dom"
  | "sales_stage_kanban_order_dom"
  | "tipo_tarea_c_list"
  | "tipo_visita_c_list"
  | "tratamientosap_list";
