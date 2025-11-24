import axios from "axios";

export const axiosInstace = axios.create({
  baseURL: "http://upoint-deploy-jpa-production.up.railway.app/",
  withCredentials: true
});

export class LoginService {
  login(login: string, senha: string) {
    return axiosInstace.post("/auth/login", {
      login,
      password: senha
    });
  }
}
