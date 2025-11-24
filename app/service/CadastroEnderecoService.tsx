import axios from "axios";

// Configurando a instância do Axios
export const axiosInstance = axios.create({
  baseURL: "http://upoint-deploy-jpa-production.up.railway.app", // URL base do backend
  withCredentials: true, // Inclui cookies e credenciais automaticamente
});

export class CadastrarEnderecoService {
  // Método para cadastrar uma empresa
  cadastrarEndereco(
    logradouro: string,
    numero: string,
    complemento: string,
    bairro: string,
    cidade: string,
    uf: string,
    cep: string
  ) {
    // Obtemos o token do localStorage
    const token = localStorage.getItem("TOKEN_FRONTEND");

    // Certifique-se de que o token está presente antes de prosseguir
    if (!token) {
      return Promise.reject(new Error("Usuário não autenticado. Token ausente."));
    }

    // Fazemos a requisição com o cabeçalho Authorization
    return axiosInstance.post(
      "/endereco",
      {  logradouro,
        numero,
        complemento,
        bairro,
        cidade,
        uf,
        cep},
      {
        headers: {
          Authorization: `Bearer ${token}`, // Adicionamos o token no cabeçalho
        },
      }
    );
  }
}
