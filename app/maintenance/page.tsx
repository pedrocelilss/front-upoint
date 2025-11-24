/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, Search, Plus, Edit3, Save, Trash2, X, Check, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface RegistroPonto {
  id: string // UUID real do backend
  nome: string
  data: string
  hora: string
  tipoRegistro: string
  isEditing?: boolean
  isNew?: boolean
  isModified?: boolean
}

// Interface para o DTO que será enviado para o backend
interface RegistroPatchDTO {
  id: string
  registro?: string
  data: string
  hora: string
}

const tiposRegistro = [
  { value: "ENTRADA", label: "Entrada" },
  { value: "SAIDA_INTERVALO", label: "Saída Intervalo" },
  { value: "RETORNO_INTERVALO", label: "Retorno" },
  { value: "SAIDA", label: "Saída" },
]

export default function RegistrosPorUsuario() {
  const [nome, setNome] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [registros, setRegistros] = useState<RegistroPonto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingCell, setEditingCell] = useState<string | null>(null)
  const [tempValues, setTempValues] = useState<{ [key: string]: string }>({})
  const [open, setOpen] = useState(false)
  const [registroToDelete, setRegistroToDelete] = useState<string | null>(null)
  const [recentlySaved, setRecentlySaved] = useState(false)

  async function buscarRegistros() {
    if (!nome.trim()) {
      setError("Por favor, digite um nome.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `http://localhost:8071/editar-registros/usuario/edit?nome=${encodeURIComponent(nome)}`,
      )
      if (!response.ok) throw new Error("Erro ao buscar registros")
      const data = await response.json()

      console.log("Dados recebidos do backend:", data)

      // Transformar os dados para o formato linear
      const registrosTransformados: RegistroPonto[] = []

      data.forEach((dia: any) => {
        dia.registros.forEach((reg: any, index: number) => {
          // Formatar a hora removendo milissegundos se necessário
          const horaFormatada = reg.hora.includes(".") ? reg.hora.split(".")[0] : reg.hora

          // Capturar o UUID do campo 'id'
          const uuid = reg.id

          console.log(`✅ Registro encontrado - UUID: ${uuid}, Tipo: ${reg.registro}, Hora: ${horaFormatada}`)

          registrosTransformados.push({
            id: uuid, // UUID real do backend
            nome: nome,
            data: dia.data,
            hora: horaFormatada,
            tipoRegistro: reg.registro,
            isModified: false,
          })
        })
      })

      // Adicionar após a linha onde os registros são transformados:
      registrosTransformados.forEach((registro) => {
        console.log(`📅 Data processada: ${registro.data}, Hora processada: ${registro.hora}`)
      })

      // Verificar se todos os registros têm UUID válido
      const registrosSemUUID = registrosTransformados.filter((r) => !r.id || r.id.length < 10)
      if (registrosSemUUID.length > 0) {
        console.error("❌ Registros sem UUID:", registrosSemUUID)
        setError(`⚠️ ${registrosSemUUID.length} registro(s) sem UUID válido.`)
        toast.error("Erro de validação", {
          description: `${registrosSemUUID.length} registro(s) sem UUID válido.`,
        })
      } else {
        console.log(`✅ Todos os ${registrosTransformados.length} registros têm UUID válido!`)
        setError(null) // Limpar erro se tudo estiver OK

        // Toast de sucesso na busca
        toast.success("Registros carregados", {
          description: `${registrosTransformados.length} registro(s) encontrado(s) para ${nome}`,
        })
      }

      // Ordenar por data e depois por hora
      registrosTransformados.sort((a, b) => {
        const dataComparison = b.data.localeCompare(a.data) // Comparação direta de strings YYYY-MM-DD
        if (dataComparison !== 0) return dataComparison
        return a.hora.localeCompare(b.hora)
      })

      setRegistros(registrosTransformados)
    } catch (err: any) {
      setError(err.message || "Erro desconhecido")
      setRegistros([])

      // Toast de erro na busca
      toast.error("Erro ao buscar registros", {
        description: err.message || "Erro desconhecido",
      })
    } finally {
      setLoading(false)
    }
  }

  function adicionarRegistro() {
    const hoje = new Date().toISOString().split("T")[0]
    const agora = new Date().toTimeString().split(" ")[0]

    const novoRegistro: RegistroPonto = {
      id: `new-${Date.now()}`,
      nome: nome || "",
      data: hoje,
      hora: agora,
      tipoRegistro: "ENTRADA",
      isNew: true,
      isEditing: true,
    }

    setRegistros((prev) => [novoRegistro, ...prev])

    toast.info("Novo registro adicionado", {
      description: "Preencha os dados e salve as alterações",
    })
  }

  function removerRegistro(id: string) {
    setRegistroToDelete(id)
    setOpen(true)
  }

  async function confirmarRemocao() {
    if (!registroToDelete) {
      setOpen(false)
      return
    }

    // Encontrar o registro que será deletado
    const registro = registros.find((r) => r.id === registroToDelete)

    if (!registro) {
      toast.error("Erro", {
        description: "Registro não encontrado",
      })
      setOpen(false)
      return
    }

    // Se for um registro novo (ainda não salvo no backend), apenas remove da lista
    if (registro.isNew || registro.id.startsWith("new-")) {
      setRegistros((prev) => prev.filter((reg) => reg.id !== registroToDelete))
      setRegistroToDelete(null)
      setOpen(false)

      toast.success("Registro removido", {
        description: "O registro foi removido da lista",
      })
      return
    }

    // Para registros existentes, fazer DELETE no backend
    const loadingToast = toast.loading("Excluindo registro...", {
      description: "Removendo registro do sistema",
    })

    try {
      console.log("🗑️ Deletando registro com UUID:", registro.id)

      const response = await fetch(`http://localhost:8071/editar-registros/${registro.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })

      console.log("📥 Delete response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ Erro do servidor:", errorText)
        throw new Error(`Erro ${response.status}: ${errorText}`)
      }

      // Remover da lista local após sucesso no backend
      setRegistros((prev) => prev.filter((reg) => reg.id !== registroToDelete))
      setRegistroToDelete(null)

      console.log("✅ Registro deletado com sucesso")

      // Dismiss loading toast e mostrar sucesso
      toast.dismiss(loadingToast)
      toast.success("✅ Registro excluído com sucesso!", {
        description: "O registro foi removido permanentemente do sistema",
      })
    } catch (error: any) {
      console.error("❌ Erro ao deletar registro:", error)

      // Dismiss loading toast e mostrar erro
      toast.dismiss(loadingToast)
      toast.error("Erro ao excluir registro", {
        description: error.message || "Não foi possível excluir o registro",
      })
    } finally {
      setOpen(false)
    }
  }

  function iniciarEdicao(cellId: string, currentValue: string) {
    setEditingCell(cellId)
    setTempValues({ [cellId]: currentValue })
  }

  function cancelarEdicao() {
    setEditingCell(null)
    setTempValues({})
  }

  async function salvarRegistroIndividual(registro: RegistroPonto) {
    try {
      // Verificar se é um registro válido com UUID
      if (registro.isNew || !registro.id || registro.id.startsWith("new-")) {
        throw new Error("Registro novo não pode ser atualizado via PATCH. Use POST para criar novos registros.")
      }

      console.log("🔄 Salvando registro com UUID:", registro.id)

      // Criar o DTO exatamente como esperado pelo backend
      const updateDTO: RegistroPatchDTO = {
        id: registro.id,
        registro: registro.tipoRegistro,
        data: registro.data,
        hora: registro.hora,
      }

      console.log("📤 RegistroPatchDTO enviado:", updateDTO)
      console.log("🌐 URL:", `http://localhost:8071/editar-registros/${registro.id}`)

      const response = await fetch(`http://localhost:8071/editar-registros/${registro.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateDTO),
      })

      console.log("📥 Response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ Erro do servidor:", errorText)
        throw new Error(`Erro ${response.status}: ${errorText}`)
      }

      const registroAtualizado = await response.json()
      console.log("✅ Registro atualizado com sucesso:", registroAtualizado)
      return registroAtualizado
    } catch (error) {
      console.error("❌ Erro ao salvar registro:", error)
      throw error
    }
  }

  function salvarEdicao(registroId: string, field: keyof RegistroPonto) {
    const cellId = `${registroId}-${field}`
    const newValue = tempValues[cellId] || ""

    setRegistros((prev) =>
      prev.map((reg) => (reg.id === registroId ? { ...reg, [field]: newValue, isNew: false, isModified: true } : reg)),
    )

    setEditingCell(null)
    setTempValues({})
  }

  function atualizarTipoRegistro(registroId: string, novoTipo: string) {
    setRegistros((prev) =>
      prev.map((reg) =>
        reg.id === registroId ? { ...reg, tipoRegistro: novoTipo, isNew: false, isModified: true } : reg,
      ),
    )
  }

  async function salvarTodosRegistros() {
    const registrosModificados = registros.filter((reg) => reg.isModified && !reg.isNew)

    if (registrosModificados.length === 0) {
      toast.warning("Nenhuma alteração", {
        description: "Nenhum registro foi modificado.",
      })
      return
    }

    // Verificar se todos os registros modificados têm UUID válido
    const registrosSemUUID = registrosModificados.filter((r) => !r.id || r.id.startsWith("new-") || r.id.length < 10)
    if (registrosSemUUID.length > 0) {
      toast.error("Erro de validação", {
        description: "Alguns registros não têm UUID válido.",
      })
      return
    }

    setLoading(true)
    setError(null)

    // Toast de loading
    const loadingToast = toast.loading("Salvando registros...", {
      description: `Salvando ${registrosModificados.length} registro(s)`,
    })

    try {
      console.log("🚀 Iniciando salvamento de", registrosModificados.length, "registros modificados")

      const promises = registrosModificados.map((registro) => salvarRegistroIndividual(registro))
      const resultados = await Promise.all(promises)

      setRegistros((prev) => prev.map((reg) => ({ ...reg, isModified: false })))
      setError(null)
      console.log("🎉 Todos os registros foram salvos com sucesso!", resultados)

      // Dismiss loading toast e mostrar sucesso
      toast.dismiss(loadingToast)
      setRecentlySaved(true)

      // Remover o indicador após 3 segundos
      setTimeout(() => setRecentlySaved(false), 3000)

      toast.success("✅ Registros salvos com sucesso!", {
        description: `${registrosModificados.length} registro(s) alterado(s) com sucesso`,
        action: {
          label: "Recarregar",
          onClick: () => buscarRegistros(),
        },
        duration: 5000,
      })
    } catch (error: any) {
      setError(`Erro ao salvar registros: ${error.message}`)
      console.error("❌ Erro ao salvar registros:", error)

      // Dismiss loading toast e mostrar erro
      toast.dismiss(loadingToast)
      toast.error("Erro ao salvar registros", {
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  function renderCell(registro: RegistroPonto, field: keyof RegistroPonto, value: string) {
    const cellId = `${registro.id}-${field}`
    const isEditing = editingCell === cellId

    // Definir placeholder específico para cada campo
    const placeholders = {
      nome: "Digite o nome",
      data: "AAAA-MM-DD",
      hora: "HH:MM:SS",
      tipoRegistro: "Selecione o tipo",
    }

    if (isEditing) {
      return (
        <div className="flex items-center gap-2">
          <Input
            value={tempValues[cellId] || ""}
            onChange={(e) => setTempValues((prev) => ({ ...prev, [cellId]: e.target.value }))}
            className="h-8 border-blue-200 focus:border-blue-400 focus:ring-blue-400"
            placeholder={placeholders[field as keyof typeof placeholders]}
            type={field === "data" ? "date" : field === "hora" ? "time" : "text"}
            step={field === "hora" ? "1" : undefined}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                salvarEdicao(registro.id, field)
              } else if (e.key === "Escape") {
                cancelarEdicao()
              }
            }}
          />
          <Button size="sm" variant="ghost" onClick={() => salvarEdicao(registro.id, field)} className="h-8 w-8 p-0">
            <Check className="h-4 w-4 text-green-600" />
          </Button>
          <Button size="sm" variant="ghost" onClick={cancelarEdicao} className="h-8 w-8 p-0">
            <X className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      )
    }

    // Formatar a exibição
    let displayValue = value
    if (field === "data" && value) {
      // ✅ CORREÇÃO: Extrair data sem problemas de fuso horário
      const [year, month, day] = value.split("-").map(Number)
      const dataObj = new Date(year, month - 1, day) // month é 0-indexed
      displayValue = dataObj.toLocaleDateString("pt-BR")
    } else if (field === "tipoRegistro" && value) {
      const tipo = tiposRegistro.find((t) => t.value === value)
      displayValue = tipo ? tipo.label : value
    }

    return (
      <div
        className={cn(
          "flex items-center justify-between group cursor-pointer p-2 rounded hover:bg-blue-50 transition-colors min-h-[40px]",
          registro.isNew && "bg-blue-50 border border-blue-200",
          registro.isModified && "bg-yellow-50 border border-yellow-200",
        )}
        onClick={() => iniciarEdicao(cellId, value)}
      >
        <span className={cn("flex-1", !value && "text-gray-400")}>
          {displayValue || placeholders[field as keyof typeof placeholders]}
        </span>
        <div className="flex items-center gap-1">
          {registro.isModified && <div className="w-2 h-2 bg-yellow-500 rounded-full" />}
          <Edit3 className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600" />
        </div>
      </div>
    )
  }

  function renderTipoRegistroCell(registro: RegistroPonto) {
    return (
      <div className="p-2">
        <Select value={registro.tipoRegistro} onValueChange={(value) => atualizarTipoRegistro(registro.id, value)}>
          <SelectTrigger className="h-8 border-blue-200 focus:border-blue-400 focus:ring-blue-400">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {tiposRegistro.map((tipo) => (
              <SelectItem key={tipo.value} value={tipo.value}>
                {tipo.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    )
  }

  // Filtrar registros baseado na busca
  const registrosFiltrados = registros.filter(
    (registro) =>
      registro.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      registro.data.includes(searchQuery) ||
      registro.hora.includes(searchQuery) ||
      tiposRegistro
        .find((t) => t.value === registro.tipoRegistro)
        ?.label.toLowerCase()
        .includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-blue-50 to-blue-100 min-h-screen">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 text-white p-2 rounded-lg">
            <Clock size={20} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Registros de Ponto por Usuário</h1>
        </div>

        {/* Barra de busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-600" size={18} />
          <Input
            className="pl-10 w-full md:w-96 border-blue-200 focus:border-blue-400 focus:ring-blue-400 bg-white shadow-sm"
            placeholder="Buscar por nome, data, hora ou tipo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Card className="border border-blue-100 shadow-sm">
        <CardHeader className="bg-white border-b border-blue-100">
          <div className="flex items-center justify-between">
            <CardTitle className="text-gray-800">Buscar Registros</CardTitle>
            <Button
              onClick={salvarTodosRegistros}
              className={cn(
                "gap-2 transition-all duration-300",
                recentlySaved ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700",
              )}
              disabled={loading}
            >
              {recentlySaved ? (
                <>
                  <Check className="h-4 w-4" />
                  Salvo!
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {loading ? "Salvando..." : "Salvar Alterações"}
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="bg-white p-6">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-4 sm:space-y-0">
              <div className="flex-1">
                <Label htmlFor="nome" className="text-gray-700 mb-1.5 block">
                  Nome do Usuário *
                </Label>
                <Input
                  id="nome"
                  placeholder="Digite o nome do usuário"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  disabled={loading}
                  className="border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                />
              </div>
              <div className="flex gap-2 pt-6">
                <Button onClick={buscarRegistros} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                  {loading ? "Buscando..." : "Buscar"}
                </Button>
                <Button
                  onClick={adicionarRegistro}
                  variant="outline"
                  className="border-blue-200 text-blue-600 hover:bg-blue-50 gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Adicionar
                </Button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span className="text-red-700 font-medium">{error}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {registrosFiltrados.length > 0 && (
        <Card className="border border-blue-100 shadow-sm">
          <CardHeader className="bg-white border-b border-blue-100">
            <CardTitle className="text-gray-800">Registros Encontrados ({registrosFiltrados.length})</CardTitle>
          </CardHeader>
          <CardContent className="bg-white p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-blue-50 border-b border-blue-100">
                    <TableHead className="text-gray-700 font-semibold">Nome</TableHead>
                    <TableHead className="text-gray-700 font-semibold">Data</TableHead>
                    <TableHead className="text-gray-700 font-semibold">Hora</TableHead>
                    <TableHead className="text-gray-700 font-semibold">Tipo de Registro</TableHead>
                    <TableHead className="text-gray-700 font-semibold w-20">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registrosFiltrados.map((registro) => (
                    <TableRow
                      key={registro.id}
                      className={cn(
                        "hover:bg-blue-50/50 transition-colors border-b border-blue-50",
                        registro.isNew && "bg-blue-50/30",
                        registro.isModified && "bg-yellow-50/30 border-yellow-200",
                      )}
                    >
                      <TableCell className="p-0">{renderCell(registro, "nome", registro.nome)}</TableCell>
                      <TableCell className="p-0">{renderCell(registro, "data", registro.data)}</TableCell>
                      <TableCell className="p-0">{renderCell(registro, "hora", registro.hora)}</TableCell>
                      <TableCell className="p-0">{renderTipoRegistroCell(registro)}</TableCell>
                      <TableCell className="p-2">
                        <Button
                          onClick={() => removerRegistro(registro.id)}
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {registrosFiltrados.length === 0 && !loading && !error && registros.length === 0 && (
        <Card className="border border-blue-100 shadow-sm">
          <CardContent className="bg-white p-8 text-center">
            <Clock className="h-12 w-12 text-blue-300 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum registro encontrado. Faça uma busca para começar.</p>
          </CardContent>
        </Card>
      )}

      {/* Dialog de confirmação para exclusão */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <p className="text-sm text-gray-500">
              Tem certeza que deseja excluir este registro permanentemente? Esta ação não pode ser desfeita e o registro
              será removido do sistema.
            </p>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={confirmarRemocao}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
