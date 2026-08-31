// Fallback de Suspense para as páginas carregadas com React.lazy.
export default function PageLoader() {
  return (
    <div className="flex items-center justify-center h-[400px]">
      <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  )
}
