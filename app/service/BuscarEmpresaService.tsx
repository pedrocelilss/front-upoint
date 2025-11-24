// src/services/funcionarioService.ts

import axios from 'axios'
import { ReactNode } from 'react'

const API_URL = 'https://upoint-deploy-jpa-production.up.railway.app/' // ajuste se necessário

export interface FuncionarioRequestDTO {
  login: string
  senha: string
  role: string
  cpf: string
  nome: string
  email: string
  telefone: string
  empresaId: string
  logradouro: string
  numero: string
  complemento: string
  bairro: string
  cidade: string
  estado: string
  cep: string
}

export interface Empresa {
  nomeFantasia: ReactNode
  id: string
  nome: string
}

export const cadastrarFuncionario = async (data: FuncionarioRequestDTO) => {
  return axios.post(`${API_URL}/auth/register`, data)
}

export const listarEmpresas = async () => {
  const response = await axios.get<Empresa[]>(`${API_URL}/empresa`)
  return response.data
}
