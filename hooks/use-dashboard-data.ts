"use client"

import { useState, useEffect } from "react"

export function useDashboardData() {
  const [totalFuncionarios, setTotalFuncionarios] = useState<number>(0)
  const [totalRegistros, setTotalRegistros] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Buscar total de funcionários
        const funcionariosResponse = await fetch("https://upoint-deploy-jpa-production.up.railway.app/auth/funcionarios/count")
        const funcionariosData = await funcionariosResponse.json()
        setTotalFuncionarios(funcionariosData.total)

        // Buscar total de registros
        const registrosResponse = await fetch("https://upoint-deploy-jpa-production.up.railway.app/registros/count")
        const registrosData = await registrosResponse.json()
        setTotalRegistros(registrosData.total)
      } catch (error) {
        console.error("Erro ao buscar dados do dashboard:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { totalFuncionarios, totalRegistros, loading }
}
