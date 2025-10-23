import { Module } from "@accounts/types"

export const moduleStrategy = (strategy: Module) => {
  if (strategy === Module.VISIT) {
    return {
      getAll: '/accounts/list/',
      getMarkers: '/accounts/all-accounts-latlng',
      getTotal: '/accounts/accounts-total',
      getById: '/accounts/account-get-id',
    }
  }

  return {
    getAll: '/hane-entregas/list/',
    getMarkers: '/hane-entregas/all-hane_entregas-latlng',
    getTotal: '/hane-entregas/hane-entregas-total',
    getById: '/hane-entregas/hane-entregas-get-id',
  }
}