import axios from 'axios'

export interface FuncionarioDTO {
  login: string
  senha: string
  role: string
  cpf: string
  nome: string
  email: string
  telefone: string
  departamento: string
  cargo: string
  empresaId: string
  logradouro: string
  numero: string
  complemento: string
  bairro: string
  cidade: string
  estado: string
  cep: string
}

export async function cadastrarFuncionario(data: FuncionarioDTO) {
  const response = await axios.post("https://upoint-deploy-jpa-production.up.railway.app/auth/register", data)
  return response.data
}
