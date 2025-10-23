import type { UserAccount, UserCRM } from "@/types";

export const userCrmToUserAccount = (userCRM?: UserCRM): UserAccount => {
  return {
    a_mercado: userCRM?.amercado ?? '',
    email: userCRM?.email ?? '',
    id: userCRM?.id ?? '',
    avatar: `/upload/users/${userCRM?.id}`,
    cargo: userCRM?.rol ?? '',
    division: userCRM?.division  ?? '',
    employee_status: userCRM?.estado ?? '',
    idamercado_c: userCRM?.idamercado ?? '',
    iddivision_c: userCRM?.iddivision ?? '',
    idgrupocliente_c: userCRM?.idgrupocliente ?? '',
    idregional_c: userCRM?.idregional ?? '',
    idvendedor_c: userCRM?.codigo_vendedor ?? '',
    user_name: `${userCRM?.nombres} ${userCRM?.apellidos}`
  };
}