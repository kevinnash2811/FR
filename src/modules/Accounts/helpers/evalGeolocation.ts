import { Geolocation } from "@accounts/types";

export const evalGeoLocation = (withLocation: Geolocation) => {
  if (withLocation === Geolocation.ALL) return "";
  if (withLocation === Geolocation.WITH_LOCATION) return true;
  if (withLocation === Geolocation.WITHOUT_LOCATION) return false;
}