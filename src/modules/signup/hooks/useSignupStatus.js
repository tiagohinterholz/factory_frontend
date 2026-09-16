import { useQuery } from "@tanstack/react-query"
import { SignupService } from "@/modules/signup/services/signup"

// Enquanto pendente e sem checkout_url/erro, a cobrança ainda está sendo
// criada no gateway (create_signup_charge, assíncrona) — refaz a cada 3s
// até aparecer um dos dois. Mesmo padrão do useFiscalNote.
export function useSignupStatus(signupId) {
  const query = useQuery({
    queryKey: ["public-signup-status", signupId],
    enabled: Boolean(signupId),
    queryFn: () => SignupService.getStatus(signupId),
    refetchInterval: (currentQuery) => {
      const data = currentQuery.state.data
      if (!data) return 3000
      if (data.status === "pendente" && !data.checkout_url && !data.error_message) {
        return 3000
      }
      return false
    },
  })

  return {
    signup: query.data ?? null,
    loading: query.isLoading,
    error: query.error ?? null,
  }
}
