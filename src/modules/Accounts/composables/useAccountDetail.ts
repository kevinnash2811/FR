import { getAccountById, getDeliveryById } from "@accounts/services";
import { type ClientDetailResponse } from "@accounts/types";
import { useQuery } from "@tanstack/vue-query";
import { computed } from "vue";
import { useRoute } from "vue-router";
export const useAccountDetail = (accountId: string) => {
  const route = useRoute();
  const module = route.name as string;
  const { data, refetch, isLoading } = useQuery<ClientDetailResponse>({
    /** Revisar si la dependecia de accountId es fuerte o no */
    queryKey: ["accountDetails", accountId],
    queryFn: () =>
      module === "accounts"
        ? getAccountById(accountId)
        : getDeliveryById(accountId),
  });

  const clientInfo = computed(() => {
    return [
      {
        label: "Nombres",
        value: data.value?.info_account.nombre,
      },
      {
        label: "Apellidos",
        value: data.value?.info_account.nombre,
      },
      {
        label: "CI/NIT",
        value: data.value?.info_account.nit_ci_c,
      },
      {
        label: "Tipo",
        value: "Sin definir",
      },
      {
        label: "Rubro",
        value: data.value?.info_account.industry_name,
      },
      {
        label: "Subrubro",
        value: data.value?.info_account.subindustry,
      },
      {
        label: "Pais",
        value: data.value?.info_account.pais,
      },
      {
        label: "Departamento",
        value: data.value?.info_account.departamento,
      },
      {
        label: "Ciudad",
        value: data.value?.info_account.ciudad,
      },
    ];
  });

  const contactInfo = computed(() => {
    return [
      {
        label: "Telefono principal",
        value: "1234234",
      },
      {
        label: "Telefono de oficina",
        value: data.value?.info_account.phone_office,
      },
      {
        label: "Correo electronico",
        value: data.value?.info_account.email_address,
      },
      {
        label: "Direccion",
        value: data.value?.info_account.billing_address_street,
      },
      {
        label: "Latitud",
        value: data.value?.info_account.jjwg_maps_lat_c,
        modifiable: true,
      },
      {
        label: "Longitud",
        value: data.value?.info_account.jjwg_maps_lng_c,
        modifiable: true,
      },
    ];
  });

  const salesArea = computed(() => data.value?.area_ventas);

  const deliveries = computed(() => data.value?.entregas);

  return {
    clientInfo,
    contactInfo,
    salesArea,
    refetch,
    data,
    deliveries,
    isLoading,
  };
};
