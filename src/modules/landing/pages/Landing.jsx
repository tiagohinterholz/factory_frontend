import { Link } from "react-router-dom"
import {
  Wrench,
  Users,
  ClipboardList,
  Package,
  CalendarDays,
  FileText,
  BarChart3,
  ShieldCheck,
  Gauge,
  PaintBucket,
  Zap,
  Droplet,
  ArrowRight,
  ChevronDown,
} from "lucide-react"

const SEGMENTS = [
  { icon: Gauge, label: "Oficina mecânica" },
  { icon: PaintBucket, label: "Funilaria e pintura" },
  { icon: Wrench, label: "Auto center" },
  { icon: Droplet, label: "Troca de óleo" },
  { icon: Zap, label: "Elétrica automotiva" },
  { icon: Gauge, label: "Retífica" },
]

const FEATURES = [
  {
    icon: Users,
    title: "Clientes & Veículos",
    text: "Cada carro com placa, modelo, quilometragem e o histórico completo de atendimentos.",
  },
  {
    icon: ClipboardList,
    title: "Orçamento → OS",
    text: "Monta o orçamento com produtos e serviços; aprovado, ele vira ordem de serviço.",
  },
  {
    icon: Package,
    title: "Estoque & Catálogo",
    text: "Produtos com quantidade, serviços com preço e os fornecedores de cada item.",
  },
  {
    icon: CalendarDays,
    title: "Agenda",
    text: "O que entra e o que sai na semana, ligado ao cliente, ao veículo e à OS.",
  },
  {
    icon: FileText,
    title: "NF-e",
    text: "Emite a nota fiscal direto da OS faturada, com DANFE e XML pra baixar.",
  },
  {
    icon: BarChart3,
    title: "Relatórios em PDF",
    text: "Ordens, orçamentos e estoque — filtrando por período, cliente, veículo ou status.",
  },
]

const STEPS = [
  {
    n: "01",
    title: "Configura o empreendimento",
    text: "Cadastra a empresa, os dados fiscais e a equipe — dono, admin e colaborador, cada um com o seu acesso.",
  },
  {
    n: "02",
    title: "Monta a base",
    text: "Catálogo de produtos e serviços, fornecedores, e os clientes com seus veículos.",
  },
  {
    n: "03",
    title: "Orça, executa, fatura",
    text: "Do primeiro orçamento à OS faturada — e, no fim, a NF-e. Tudo com histórico.",
  },
]

// Preços provisórios — ajustar aqui. Todo plano: 1 admin + 3 usuários.
// Curva: quanto mais longo o ciclo, menor o R$/mês (mensal 250 -> anual 190).
const PLANS = [
  { period: "Quinzenal", price: "150", cycle: "a cada 15 dias", equiv: "R$ 300/mês" },
  { period: "Mensal", price: "250", cycle: "por mês", equiv: null },
  {
    period: "Trimestral",
    price: "660",
    cycle: "a cada 3 meses",
    equiv: "R$ 220/mês",
    tag: "Mais popular",
  },
  { period: "Semestral", price: "1.260", cycle: "a cada 6 meses", equiv: "R$ 210/mês" },
  { period: "Anual", price: "2.280", cycle: "por ano", equiv: "R$ 190/mês", tag: "Melhor preço" },
]

function Brand({ className = "" }) {
  return (
    <span
      className={`flex items-center gap-2 font-display font-extrabold tracking-tight ${className}`}
    >
      <span className="w-[30px] h-[30px] rounded-lg bg-brand text-brand-fg grid place-items-center">
        <Wrench className="w-[17px] h-[17px]" />
      </span>
      THDev <span className="font-sans font-medium text-muted">Factory</span>
    </span>
  )
}

const kicker = "text-[12.5px] font-semibold uppercase tracking-[0.09em] text-brand"
const h2 =
  "font-display font-extrabold tracking-[-0.025em] text-[clamp(24px,3.4vw,34px)] leading-[1.12] text-balance mt-2.5"

export default function Landing() {
  return (
    <div className="bg-surface text-ink font-sans text-base leading-[1.55]">
      {/* React 19 hoista o <link> pro <head>; a fonte só carrega nesta página */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Archivo:wght@600;700;800&display=swap"
      />

      {/* ---------- header ---------- */}
      <header className="sticky top-0 z-50 border-b border-line bg-white/80 backdrop-blur-md backdrop-saturate-150">
        <div className="max-w-[1120px] mx-auto px-[22px] h-16 flex items-center gap-7">
          <Brand />
          <nav className="hidden md:flex gap-[22px] ml-2 text-sm font-medium text-muted">
            <a href="#solucao" className="hover:text-ink transition-colors">
              A solução
            </a>
            <a href="#recursos" className="hover:text-ink transition-colors">
              Recursos
            </a>
            <a href="#como" className="hover:text-ink transition-colors">
              Como funciona
            </a>
            <a href="#planos" className="hover:text-ink transition-colors">
              Planos
            </a>
          </nav>
          <span className="flex-1" />
          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-[9px] bg-brand px-4 py-2.5 text-sm font-semibold text-brand-fg hover:bg-brand-hover transition-colors"
          >
            Entrar <ArrowRight className="w-[15px] h-[15px]" />
          </Link>
        </div>
      </header>

      <main>
        {/* ---------- hero ---------- */}
        <section
          id="solucao"
          className="pt-[74px] pb-10 bg-[radial-gradient(60%_50%_at_85%_0%,rgba(15,107,107,0.06),transparent_70%)]"
        >
          <div className="max-w-[1120px] mx-auto px-[22px] grid lg:grid-cols-[1.05fr_0.95fr] gap-[54px] items-center">
            <div>
              <p className={`${kicker} mb-4`}>Gestão para oficinas e prestadores de serviço</p>
              <h1 className="font-display font-extrabold tracking-[-0.03em] text-[clamp(34px,5vw,52px)] leading-[1.05] text-balance">
                Do orçamento à nota fiscal, num sistema só.
              </h1>
              <p className="text-[17.5px] text-muted max-w-[30ch] mt-[18px] mb-[26px]">
                Clientes, veículos, orçamentos, ordens de serviço, estoque e agenda — com emissão de
                NF-e e relatórios em PDF. Sem caderno, sem planilha solta.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-[11px] bg-brand px-[22px] py-[13px] text-[15px] font-semibold text-brand-fg hover:bg-brand-hover transition-colors"
                >
                  Entrar no sistema <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="#recursos"
                  className="inline-flex items-center gap-2 rounded-[11px] border border-line bg-white px-[22px] py-[13px] text-[15px] font-semibold text-ink hover:border-muted transition-colors"
                >
                  Ver recursos <ChevronDown className="w-4 h-4" />
                </a>
              </div>
              <div className="flex flex-wrap gap-2 mt-[22px]">
                {["Multi-empreendimento", "Acesso por perfil", "Conforme a LGPD"].map((chip) => (
                  <span
                    key={chip}
                    className="text-[12.5px] font-medium text-muted bg-ground border border-line rounded-full px-3 py-1.5"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            </div>

            {/* mock do painel */}
            <div
              className="rounded-2xl border border-line bg-surface overflow-hidden rotate-[0.4deg] shadow-[0_24px_60px_-24px_rgba(11,43,43,0.35)]"
              role="img"
              aria-label="Prévia do painel do Factory System"
            >
              <div className="h-[38px] bg-brand-deep flex items-center gap-1.5 px-3.5">
                <i className="w-2 h-2 rounded-full bg-white/25" />
                <i className="w-2 h-2 rounded-full bg-white/25" />
                <i className="w-2 h-2 rounded-full bg-white/25" />
                <span className="ml-2 text-white/70 text-xs">Painel — a semana</span>
              </div>
              <div className="p-4 bg-ground">
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    ["A faturar", "R$ 8.240", false],
                    ["Faturado no mês", "R$ 31.900", true],
                    ["Agendados", "7", false],
                    ["OS a faturar", "12", false],
                  ].map(([t, v, pos]) => (
                    <div key={t} className="bg-surface border border-line rounded-[10px] p-3">
                      <div className="text-[11.5px] text-muted">{t}</div>
                      <div
                        className={`font-display font-bold text-xl mt-0.5 tabular-nums ${
                          pos ? "text-ok" : "text-ink"
                        }`}
                      >
                        {v}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-2.5 bg-surface border border-line rounded-[10px] overflow-hidden">
                  {[
                    ["OS #1284 · Corolla", "a faturar", "warn"],
                    ["OS #1283 · Onix", "faturado", "ok"],
                    ["OS #1282 · HB20", "faturado", "ok"],
                  ].map(([label, status, tone]) => (
                    <div
                      key={label}
                      className="flex justify-between items-center px-3 py-2.5 text-[12.5px] border-b border-line last:border-b-0"
                    >
                      <span>{label}</span>
                      <span
                        className={`text-[10.5px] font-bold uppercase px-[7px] py-px rounded-full ${
                          tone === "warn" ? "bg-warn-subtle text-warn" : "bg-ok-subtle text-ok"
                        }`}
                      >
                        {status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- pra quem ---------- */}
        <section className="py-[62px] bg-ground border-y border-line">
          <div className="max-w-[1120px] mx-auto px-[22px]">
            <p className={kicker}>Feito pra quem trabalha com carro</p>
            <h2 className={h2}>Um sistema, vários tipos de oficina.</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-[30px]">
              {SEGMENTS.map(({ icon: Icon, label }, index) => (
                <span
                  key={`${label}-${index}`}
                  className="flex items-center gap-2.5 bg-surface border border-line rounded-xl p-3.5 font-medium text-[14.5px]"
                >
                  <Icon className="w-[18px] h-[18px] text-brand shrink-0" />
                  {label}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- recursos ---------- */}
        <section id="recursos" className="py-[62px]">
          <div className="max-w-[1120px] mx-auto px-[22px]">
            <p className={kicker}>Recursos</p>
            <h2 className={h2}>Tudo o que a oficina precisa registrar.</h2>
            <p className="max-w-[46ch] text-muted mt-3">
              Cada peça conversa com a próxima: o orçamento vira OS, a OS baixa o estoque, a OS
              faturada emite a nota.
            </p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-[34px]">
              {FEATURES.map(({ icon: Icon, title, text }) => (
                <article
                  key={title}
                  className="bg-surface border border-line rounded-2xl p-5 shadow-card"
                >
                  <div className="w-10 h-10 rounded-[10px] bg-brand-subtle text-brand grid place-items-center mb-3.5">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-display font-bold text-[16.5px] tracking-[-0.01em] mb-1.5">
                    {title}
                  </h3>
                  <p className="text-sm text-muted">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- como funciona ---------- */}
        <section id="como" className="py-[62px] bg-brand-deep text-[#eaf1f0]">
          <div className="max-w-[1120px] mx-auto px-[22px]">
            <p className="text-[12.5px] font-semibold uppercase tracking-[0.09em] text-[#7fbcbc]">
              Como funciona
            </p>
            <h2 className={`${h2} text-white`}>Três passos pra sair do caderno.</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-[26px] mt-[38px]">
              {STEPS.map(({ n, title, text }) => (
                <div key={n}>
                  <div
                    className="font-display font-extrabold text-[40px] tracking-[-0.03em] text-transparent"
                    style={{ WebkitTextStroke: "1.5px rgba(255,255,255,0.4)" }}
                  >
                    {n}
                  </div>
                  <h3 className="font-display font-bold text-[17px] text-white mt-2.5 mb-1.5">
                    {title}
                  </h3>
                  <p className="text-sm text-[#eaf1f0]/70">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- planos ---------- */}
        <section id="planos" className="py-[62px]">
          <div className="max-w-[1120px] mx-auto px-[22px]">
            <p className={kicker}>Planos</p>
            <h2 className={h2}>Escolha o ciclo que cabe no caixa.</h2>
            <p className="max-w-[52ch] text-muted mt-3">
              É o sistema completo em qualquer plano — muda só a periodicidade. Todo plano inclui{" "}
              <span className="text-ink font-medium">1 administrador + 3 usuários</span>.
            </p>

            <div className="grid gap-4 mt-[34px] sm:grid-cols-2 lg:grid-cols-5">
              {PLANS.map(({ period, price, cycle, equiv, tag }) => (
                <div
                  key={period}
                  className={`flex flex-col rounded-2xl border bg-surface p-5 ${
                    tag ? "border-brand shadow-card" : "border-line"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-display font-bold text-[15px]">{period}</span>
                    {tag && (
                      <span className="text-[10.5px] font-bold uppercase tracking-wide bg-brand-subtle text-brand rounded-full px-2 py-0.5">
                        {tag}
                      </span>
                    )}
                  </div>
                  <div className="mt-3 font-display font-extrabold tracking-tight text-[26px] tabular-nums">
                    <span className="text-[15px] font-semibold text-muted align-top">R$ </span>
                    {price}
                  </div>
                  <div className="text-[12.5px] text-muted">{cycle}</div>
                  <div className="text-[12px] text-muted mt-1 min-h-[16px]">
                    {equiv ? `equivale a ${equiv}` : ""}
                  </div>
                  <div className="border-t border-line mt-4 pt-4 text-[13px] text-muted">
                    1 admin + 3 usuários
                  </div>
                  <Link
                    to="/login"
                    className={`mt-3 inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-semibold transition-colors ${
                      tag
                        ? "bg-brand text-brand-fg hover:bg-brand-hover"
                        : "border border-line text-ink hover:bg-ground"
                    }`}
                  >
                    Assinar
                  </Link>
                </div>
              ))}
            </div>

            <p className="text-[13px] text-muted mt-5">
              Precisa de mais usuários ou de algo específico?{" "}
              <span className="text-ink font-medium">
                Fale com a gente para consultar condições.
              </span>{" "}
              A contratação e a renovação são feitas junto ao time.
            </p>
          </div>
        </section>

        {/* ---------- confiança / LGPD ---------- */}
        <section className="py-[62px] bg-ground border-y border-line">
          <div className="max-w-[1120px] mx-auto px-[22px]">
            <p className={kicker}>Segurança e privacidade</p>
            <h2 className={h2}>Dados dos seus clientes, tratados como deve ser.</h2>
            <div className="grid grid-cols-[44px_1fr] gap-4 items-start mt-[26px] max-w-[760px]">
              <div className="w-11 h-11 rounded-xl bg-brand-subtle text-brand grid place-items-center">
                <ShieldCheck className="w-[22px] h-[22px]" />
              </div>
              <p className="text-muted text-[15px]">
                Login com token de curta duração e renovação em cookie protegido. Aviso de
                privacidade público e anonimização de cliente sob demanda — o histórico de serviço
                continua, os dados pessoais são apagados. Em conformidade com a LGPD.
                <br />
                <Link to="/privacidade" className="text-brand font-semibold">
                  Ler o aviso de privacidade →
                </Link>
              </p>
            </div>
          </div>
        </section>

        {/* ---------- CTA final ---------- */}
        <section className="py-[62px] text-center">
          <div className="max-w-[1120px] mx-auto px-[22px]">
            <p className={kicker}>Pronto pra começar</p>
            <h2 className={`${h2} mb-5`}>Tire a oficina do caderno hoje.</h2>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-[11px] bg-brand px-[22px] py-[13px] text-[15px] font-semibold text-brand-fg hover:bg-brand-hover transition-colors"
            >
              Entrar no sistema <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-line bg-ground">
        <div className="max-w-[1120px] mx-auto px-[22px] py-[26px] flex flex-wrap items-center gap-x-[22px] gap-y-3.5 text-[13px] text-muted">
          <Brand className="text-sm" />
          <span className="flex-1" />
          <Link to="/login" className="hover:text-ink transition-colors">
            Entrar
          </Link>
          <Link to="/privacidade" className="hover:text-ink transition-colors">
            Aviso de Privacidade
          </Link>
          <span>© 2026 THDev</span>
        </div>
      </footer>
    </div>
  )
}
