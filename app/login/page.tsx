"use client"

import type React from "react"
import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LoginService } from "../service/LoginService"
import { ArrowRight } from "lucide-react"

export default function LoginScreen() {
  const [login, setLogin] = useState("")
  const [senha, setSenha] = useState("")
  const [erroLogin, setErroLogin] = useState(false)
  const router = useRouter()
  const loginService = useMemo(() => new LoginService(), [])

  const efetuarLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setErroLogin(false) // reseta o erro antes de tentar de novo
    loginService
      .login(login, senha)
      .then((response) => {
        localStorage.setItem("TOKEN_FRONTEND", response.data.token)
        router.push("/dashboard")
      })
      .catch(() => {
        setErroLogin(true)
      })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="max-w-md w-full px-6 py-8">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Bem-vindo ao Upoint</h1>
          <p className="text-gray-500 mt-2">Faça login para acessar sua conta</p>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-100">
          <form className="space-y-5" onSubmit={efetuarLogin}>
            <div className="space-y-2">
              <Label htmlFor="matricula-cpf" className="text-gray-700 font-medium">
                Usuário
              </Label>
              <Input
                id="matricula-cpf"
                type="text"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                placeholder="Digite sua matrícula ou CPF"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-gray-700 font-medium">
                  Senha
                </Label>
                {/*<a href="#" className="text-sm text-blue-600 hover:text-blue-800">
                  Esqueceu a senha?
                </a>*/}
              </div>
              <Input
                id="password"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Digite sua senha"
                required
              />
            </div>

            {/* Mensagem de erro de login */}
            {erroLogin && (
              <p className="text-red-600 text-sm font-medium text-center">
                Usuário ou senha incorretos. Tente novamente.
              </p>
            )}

            <Button
              type="submit"
              className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              Entrar
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </form>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>© 2025 Upoint. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  )
}
