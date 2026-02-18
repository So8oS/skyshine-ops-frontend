import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL ?? "https://yos484kg8oc88wsk8csowkc8.37.16.74.252.sslip.io";

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});
