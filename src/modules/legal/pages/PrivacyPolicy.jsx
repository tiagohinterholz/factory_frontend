import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Factory } from "lucide-react"
import { LegalService } from "@/modules/legal/services/legal"
import { parseApiError } from "@/api/parse-api-error"

// Render bem simples do markdown do aviso (headings, listas e parágrafos).
// Se o texto ganhar negrito/links/tabelas, trocar por react-markdown.
function renderMarkdown(markdown) {
  return markdown
    .trim()
    .split(/\n{2,}/)
    .map((block, index) => {
      const lines = block.split("\n")

      if (lines[0].startsWith("# ")) {
        return (
          <h1 key={index} className="text-2xl font-semibold text-ink mb-4">
            {lines[0].slice(2)}
          </h1>
        )
      }
      if (lines[0].startsWith("## ")) {
        return (
          <h2 key={index} className="text-base font-semibold text-ink mt-6 mb-2">
            {lines[0].slice(3)}
          </h2>
        )
      }
      if (lines[0].startsWith("- ")) {
        const items = []
        for (const line of lines) {
          if (line.startsWith("- ")) items.push(line.slice(2))
          else if (items.length) items[items.length - 1] += ` ${line.trim()}`
        }
        return (
          <ul key={index} className="list-disc pl-5 space-y-1 text-muted">
            {items.map((item, itemIndex) => (
              <li key={itemIndex}>{item}</li>
            ))}
          </ul>
        )
      }
      return (
        <p key={index} className="text-muted leading-relaxed">
          {block.replace(/\n/g, " ")}
        </p>
      )
    })
}

export default function PrivacyPolicy() {
  const [content, setContent] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let alive = true
    LegalService.getPrivacyPolicy()
      .then((data) => alive && setContent(data.content))
      .catch(
        (fetchError) =>
          alive &&
          setError(parseApiError(fetchError, "Não foi possível carregar o aviso.").message),
      )
    return () => {
      alive = false
    }
  }, [])

  return (
    <div className="min-h-screen bg-ground">
      <header className="border-b border-line bg-surface">
        <div className="max-w-2xl mx-auto flex items-center gap-2.5 px-4 py-4">
          <span className="w-8 h-8 rounded-lg bg-brand text-brand-fg grid place-items-center">
            <Factory className="w-4 h-4" />
          </span>
          <span className="font-semibold text-ink">THDev Factory System</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10">
        <div className="card-premium">
          {error ? (
            <p className="text-danger text-sm">{error}</p>
          ) : content === null ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="space-y-3">{renderMarkdown(content)}</div>
          )}
        </div>

        <p className="text-center text-[13px] text-muted mt-6">
          <Link to="/" className="hover:text-ink transition-colors">
            Voltar para o início
          </Link>
        </p>
      </main>
    </div>
  )
}
