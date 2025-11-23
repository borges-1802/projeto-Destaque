import axios from "axios";

const baseURL = "https://projeto-destaque-backend.onrender.com";

const api = axios.create({
  baseURL
});

export default api;
