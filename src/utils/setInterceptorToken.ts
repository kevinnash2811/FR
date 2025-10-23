import { accountsApi, listApi } from "@/connections/axiosCRM";
import type { AxiosInstance } from "axios";
import { isExpiredToken } from "./isExpiredToken";

export const setInterceptorToken = (token: string, onExpire: () => void) => {
  const apis = [accountsApi, listApi];

  const addRequestInterceptor = (api: AxiosInstance) => {
    api.interceptors.request.use((config) => {
      const expires_in = localStorage.getItem("expires_in");

      if (expires_in && isExpiredToken(expires_in)) {
        onExpire();
        localStorage.removeItem("token");
        localStorage.removeItem("expires_in");
        window.location.reload();
        return config;
      }
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
  };

  const addResponseInterceptor = (api: AxiosInstance) => {
    api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          onExpire();
          localStorage.removeItem("token");
          localStorage.removeItem("expires_in");
          window.location.reload();
        }
        return Promise.reject(error);
      },
    );
  };

  apis.forEach(api => {
    addRequestInterceptor(api);
    addResponseInterceptor(api);
  });
};
