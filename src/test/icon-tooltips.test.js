import { describe, it, expect } from "vitest"
import { readFileSync, readdirSync, statSync } from "node:fs"
import { join } from "node:path"

const ICON_ONLY = /<(button|Link|a)\b([^>]*)>\s*<[A-Z][A-Za-z0-9]*\s[^>]*\/>\s*<\/\1>/g

function jsxFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return jsxFiles(path)
    return path.endsWith(".jsx") && !path.includes(".test.") ? [path] : []
  })
}

describe("tooltips nos ícones", () => {
  it("todo botão ou link só com ícone tem title ou aria-label", () => {
    const missing = jsxFiles("src/modules").flatMap((file) => {
      const source = readFileSync(file, "utf8")
      return [...source.matchAll(ICON_ONLY)]
        .filter(([, , attrs]) => !attrs.includes("title=") && !attrs.includes("aria-label="))
        .map((match) => `${file}:${source.slice(0, match.index).split("\n").length}`)
    })

    expect(missing).toEqual([])
  })
})
