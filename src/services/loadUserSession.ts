import { setInterceptorToken } from "@/utils";
import { getNewAccessToken } from "./";

export const loadUserSession = async (onExpire: () => void) => {
  const token = localStorage.getItem("token");
  const expires_in = localStorage.getItem("expires_in");
  if (token && expires_in) {
    const dateOfExpire = new Date(+expires_in);
    const currentDate = new Date();

    if (dateOfExpire < currentDate) {
      localStorage.removeItem("token");
      localStorage.removeItem("expires_in");

      const { data } = await getNewAccessToken();
      setInterceptorToken(data.access_token, onExpire);
    } else {
      setInterceptorToken(token, onExpire);
    }
  } else {
    /**
     * El refrescamiento del accesstoken aqui es forzoso
     *
     * Se debe revisar la posibilidad de trabajar con un refreshtoken
     */
    const { data } = await getNewAccessToken();
    setInterceptorToken(data.access_token, onExpire);
  }

  return true;
};
