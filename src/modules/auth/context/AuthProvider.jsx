import { useReducer, useMemo, useCallback } from "react"
import { AuthService } from "@/modules/auth/services/auth"
import { authStorage } from "@/api/auth-storage"
import { AuthContext } from "./auth-context"

function reducer(state, action) {
  switch (action.type) {
    case "LOGIN":
      return { user: action.user, loading: false }
    case "LOGOUT":
      return { user: null, loading: false }
    default:
      return state
  }
}

// Lê o que ficou persistido — roda uma única vez, no mount do Provider.
function init() {
  return { user: authStorage.getUser(), loading: false }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, init)

  const login = useCallback(async (credentials) => {
    const data = await AuthService.login(credentials)
    authStorage.setSession({ access: data.access, user: data })
    dispatch({ type: "LOGIN", user: data })
    return data
  }, [])

  const logout = useCallback(async () => {
    await AuthService.logout()
    authStorage.clear()
    dispatch({ type: "LOGOUT" })
  }, [])

  // Sem useMemo, `value` seria um objeto novo a cada render do Provider
  // e re-renderizaria todos os consumidores à toa.
  const value = useMemo(
    () => ({ user: state.user, loading: state.loading, login, logout }),
    [state.user, state.loading, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
