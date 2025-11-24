/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState, useEffect, useCallback } from "react"
import { Loader2, FileText, Filter, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"



export default function GerarRelatorio() {
  const [loading, setLoading] = useState(false)
  const [nomeUsuario] = useState("")
  const [dataInicial, setDataInicial] = useState("")
  const [dataFinal, setDataFinal] = useState("")
  const [usuarios, setUsuarios] = useState<string[]>([])
  const [loadingUsuarios, setLoadingUsuarios] = useState(false)
  //const [openCombobox, setOpenCombobox] = useState(false)

  const buscarUsuarios = useCallback(async (termo: string) => {
    if (termo.length < 2) {
      setUsuarios([])
      return
    }

    setLoadingUsuarios(true)
    try {
      const token = localStorage.getItem("token")

      const response = await fetch(`https://upoint-deploy-jpa-production.up.railway.app/auth/busca?search=${encodeURIComponent(termo)}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        // Assumindo que a API retorna um array de objetos com propriedade 'nome'
        // Ajuste conforme a estrutura real da sua API
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const nomes = data.map((usuario: any) => usuario.nome || usuario.nomeUsuario || usuario)
        setUsuarios(nomes)
      }
    } catch (error) {
      console.error("Erro ao buscar usuários:", error)
    } finally {
      setLoadingUsuarios(false)
    }
  }, [])

  // Debounce para evitar muitas chamadas à API
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      buscarUsuarios(nomeUsuario)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [nomeUsuario, buscarUsuarios])

  const handleGerarRelatorio = async () => {
    setLoading(true)

    try {
      const token = localStorage.getItem("token")

      const params = new URLSearchParams({
        nomeUsuario,
        dataInicial,
        dataFinal,
      })

      const response = await fetch(`https://upoint-deploy-jpa-production.up.railway.app/relatorios/registros?${params.toString()}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Erro ao gerar relatório")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)

      const a = document.createElement("a")
      a.href = url
      a.download = "relatorio-historico.pdf"
      document.body.appendChild(a)
      a.click()
      a.remove()

      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Erro:", error)
      alert("Erro ao gerar relatório")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-800">Gerador de Relatórios</h1>
              <p className="text-sm text-gray-500">Extraia dados em formato PDF</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full md:w-64 bg-white rounded-lg shadow-sm p-6 h-fit">
            <div className="flex items-center gap-2 mb-6">
              <Filter className="h-4 w-4 text-blue-600" />
              <h2 className="font-medium text-gray-800">Instruções</h2>
            </div>

            <div className="space-y-4 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <div className="bg-blue-100 text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs mt-0.5">
                  1
                </div>
                <p>Preencha o nome do usuário para filtrar os registros</p>
              </div>

              <div className="flex items-start gap-2">
                <div className="bg-blue-100 text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs mt-0.5">
                  2
                </div>
                <p>Defina o período desejado selecionando as datas inicial e final</p>
              </div>

              <div className="flex items-start gap-2">
                <div className="bg-blue-100 text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs mt-0.5">
                  3
                </div>
                <p>Clique em Gerar Relatório para baixar o arquivo em PDF</p>
              </div>
            </div>

            <Separator className="my-6" />
          </div>

          {/* Main Form */}
          <div className="flex-1 bg-white rounded-lg shadow-sm p-6">
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-800 mb-1">Filtros do Relatório</h2>
              <p className="text-sm text-gray-500">Personalize os parâmetros para seu relatório</p>
            </div>

            <div className="space-y-6">
             {/* <div>
                <Label htmlFor="nomeUsuario" className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Nome do Usuário
                </Label>
                <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openCombobox}
                      className="w-full justify-between border-gray-200 focus:border-blue-500 focus:ring-blue-500 h-10"
                    >
                      {nomeUsuario || "Digite o nome para filtrar"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput
                        placeholder="Buscar usuário..."
                        value={nomeUsuario}
                        onValueChange={setNomeUsuario}
                      />
                      <CommandList>
                        {loadingUsuarios && (
                          <div className="p-2 text-sm text-gray-500 flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Buscando usuários...
                          </div>
                        )}
                        {!loadingUsuarios && usuarios.length === 0 && nomeUsuario.length >= 2 && (
                          <CommandEmpty>Nenhum usuário encontrado.</CommandEmpty>
                        )}
                        {!loadingUsuarios && usuarios.length > 0 && (
                          <CommandGroup>
                            {usuarios.map((usuario) => (
                              <CommandItem
                                key={usuario}
                                value={usuario}
                                onSelect={(currentValue) => {
                                  setNomeUsuario(currentValue === nomeUsuario ? "" : currentValue)
                                  setOpenCombobox(false)
                                }}
                              >
                                <Check
                                  className={`mr-2 h-4 w-4 ${nomeUsuario === usuario ? "opacity-100" : "opacity-0"}`}
                                />
                                {usuario}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        )}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>*/}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dataInicial" className="text-sm font-medium text-gray-700 mb-1.5 block">
                    Data Inicial
                  </Label>
                  <Input
                    id="dataInicial"
                    type="date"
                    value={dataInicial}
                    onChange={(e) => setDataInicial(e.target.value)}
                    className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <Label htmlFor="dataFinal" className="text-sm font-medium text-gray-700 mb-1.5 block">
                    Data Final
                  </Label>
                  <Input
                    id="dataFinal"
                    type="date"
                    value={dataFinal}
                    onChange={(e) => setDataFinal(e.target.value)}
                    className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button
                  onClick={handleGerarRelatorio}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="animate-spin h-5 w-5" />
                      <span>Processando...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <FileText className="h-5 w-5" />
                      <span>Gerar Relatório</span>
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </div>
                  )}
                </Button>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div>Formato: PDF</div>
                <div>Relatório gerado automaticamente</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
