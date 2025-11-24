import axios from "axios";

// Configurando a instância do Axios
export const axiosInstance = axios.create({
  baseURL: "http://upoint-deploy-jpa-production.up.railway.app/", // URL base do backend
  withCredentials: true, // Inclui cookies e credenciais automaticamente
});

export class CadastrarEmpresaService {
  async cadastrarEmpresaCompleta(
    empresaData: {
      razaoSocial: string;
      nomeFantasia: string;
      cnpj: string;
      email: string;
      telefone: string;
    },
    enderecoData: {
      bairro: string;
      cep: string;
      cidade: string;
      complemento?: string;
      logradouro: string;
      numero: string;
      uf: string;
    },
    localizacaoData: {
      latitude: number;
      longitude: number;
    }
  ) {
    const token = localStorage.getItem("TOKEN_FRONTEND");

    if (!token) {
      return Promise.reject(new Error("Usuário não autenticado. Token ausente."));
    }

    try {
      // Envia tudo junto como um único objeto
      const response = await axiosInstance.post(
        "/empresa",
        {
          ...empresaData,
          ...localizacaoData,
          endereco: enderecoData,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response;
    } catch (error) {
      console.error("Erro ao cadastrar empresa com endereço:", error);
      throw error;
    }
  }
}

