import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useNavigate } from "react-router-dom"
import { useQueryClient } from "@tanstack/react-query"
import { useToast } from "@/modules/core/feedback/toast-context"
import { parseApiError } from "@/api/parse-api-error"

// Form genérico de módulo. O módulo passa:
//   schema        — zod
//   defaultValues — valores iniciais (create)
//   load          — async () => registro  (edit: carrega e faz form.reset)
//   submit        — async (values) => void  (create OU update, o módulo decide)
//   redirectTo    — pra onde navegar no sucesso
//   errorFallback — mensagem se a API não mandar nada estruturado
//
// Erros por campo do DRF (parseApiError().fields) viram form.setError(campo).
// Só quando não há erro de campo é que cai no toast.
export function useResourceForm({
  schema,
  defaultValues,
  load,
  submit,
  redirectTo,
  errorFallback = "Não foi possível salvar. Verifique os dados.",
}) {
  const navigate = useNavigate()
  const toast = useToast()
  const queryClient = useQueryClient()
  const [loading, setLoading] = useState(Boolean(load))

  const form = useForm({ resolver: zodResolver(schema), defaultValues })

  useEffect(() => {
    if (!load) return
    let alive = true
    load()
      .then((record) => {
        if (alive) form.reset(record)
      })
      .catch((error) => {
        if (alive)
          toast.error(parseApiError(error, "Não foi possível carregar o registro.").message)
      })
      .finally(() => {
        if (alive) setLoading(false)
      })
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await submit(values)
      // marca todo o cache como stale — a lista pra onde voltamos refaz
      // sozinha em vez de mostrar o dado antigo (staleTime de 30s).
      queryClient.invalidateQueries()
      if (redirectTo) navigate(redirectTo)
    } catch (error) {
      console.error(error)
      const { message, fields } = parseApiError(error, errorFallback)
      const entries = Object.entries(fields)
      if (entries.length) {
        entries.forEach(([name, msg]) => form.setError(name, { type: "server", message: msg }))
      } else {
        toast.error(message)
      }
    }
  })

  return { form, onSubmit, loading }
}
