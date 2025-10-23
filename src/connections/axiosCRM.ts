import axios from "axios";
import { ACCOUNTS_API, API_LIST } from "./api_conectors";

const accountsApi = axios.create({
  baseURL: ACCOUNTS_API,
});

const listApi = axios.create({
  baseURL: API_LIST,
});

export { accountsApi, listApi };
