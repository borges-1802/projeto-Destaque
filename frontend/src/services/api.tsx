import axios from "axios";

//const baseURL = process.env.REACT_APP_API_URL || "http://localhost:8000";
// E no .env de produção/host: REACT_APP_API_URL=https://seu-backend.example.com

const baseURL = "http://localhost:8000";

const api = axios.create({
  baseURL
});

export default api;
