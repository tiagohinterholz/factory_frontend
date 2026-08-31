// URL base usada nos testes (bate com test.env.VITE_API_URL no vite.config.js).
export const API = "http://localhost:8000"

// Handlers globais ficam vazios de propósito: cada teste declara o que precisa
// com server.use(...). Mantém os testes explícitos sobre o tráfego que esperam.
export const handlers = []
