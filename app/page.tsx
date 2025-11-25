"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export default function Home() {
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [telefone, setTelefone] = useState("")
  const [formEnviado, setFormEnviado] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const data = { nome, email, telefone }

    try {
      const response = await fetch("https://upoint-deploy-jpa-production.up.railway.app/cliente", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error("Erro ao enviar")

      setFormEnviado(true)
    } catch (error) {
      console.error(error)
      alert("Erro ao enviar o formulário.")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <header className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
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
            <span className="text-2xl font-bold text-blue-600">Upoint</span>
          </div>

          <button className="md:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
          </button>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="grid gap-12 md:grid-cols-2 items-center">
          <div className="space-y-6">
            <div className="text-sm font-semibold text-blue-600 uppercase tracking-wider">
              O futuro da jornada de trabalho
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight">
              Controle de ponto sem burocracia,<br /> feito para empresas que valorizam pessoas
            </h1>

            <p className="text-gray-600 md:text-lg max-w-2xl">
              Automatize o registro de ponto, economize tempo com o cálculo de horas e tenha uma visão
              completa da jornada dos seus colaboradores — tudo em um só lugar, com tecnologia de verdade.
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="text-sm text-gray-600">Já possui conta?</div>
              <Link
                href="/login"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
              >
                Entrar
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-lg">
            {!formEnviado ? (
              <div className="space-y-6">
                <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mt-2">
                  Fale com um especialista
                </h2>

                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Nome
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      E-mail
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 mb-1">
                      Telefone
                    </label>
                    <input
                      id="telefone"
                      type="text"
                      value={telefone}
                      onChange={(e) => setTelefone(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Enviar
                  </button>
                </form>
              </div>
            ) : (
              <div className="text-center text-xl font-semibold text-green-600">
                Entraremos em contato!
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
