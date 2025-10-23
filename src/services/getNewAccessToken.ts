import { accountsApi } from "@/connections/axiosCRM";
import type { TokenResponse } from "@/types";

const body = {
  client_id: import.meta.env.VITE_CLIENT_ID as string,
  client_secret: import.meta.env.VITE_CLIENT_SECRET as string,
  grant_type: import.meta.env.VITE_GRANT_TYPE as string,
  provision_key: import.meta.env.VITE_PROVISION_KEY as string,
  authenticated_userid: import.meta.env.VITE_AUTHENTICATED_USERID as string,
  scope: import.meta.env.VITE_SCOPE as string,
};

export const getNewAccessToken = async () => {
  const response = await accountsApi.post<TokenResponse>("/oauth2/token", body);
  const dateOfExpire = new Date(response.data.expires_in * 1000 + Date.now());
  localStorage.setItem("token", response.data.access_token);
  localStorage.setItem("expires_in", `${dateOfExpire.getTime()}`);

  return response;
};