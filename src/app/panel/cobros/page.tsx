import { requireGestor } from "@/lib/auth";
import { fechaHora, waLink } from "@/lib/format";
import { boldConfigurado } from "@/lib/bold";
import { NuevoCobro } from "./nuevo-cobro";
import { reintentarCobro, sincronizarCobros } from "./actions";
import { CopiarLink } from "./copiar";

export const dynamic = "force-dynamic";

const ESTADO: Record<string, [string, string]> = {
  borrador: ["Borrador", ""], pendiente: ["Esperando pago", "warn"], procesando: ["Procesando", "warn"],
  pagado: ["Pagado", "good"], rechazado: ["Rechazado", "red"], cancelado: ["Cancelado", ""], expirado: ["Vencido", ""],
};

const dinero = (n: number, m: string) => new Intl.NumberFormat("es-CO", { style: "currency", currency: m, maximumFractionDigits: m === "COP" ? 0 : 2 }).format(n);

export default async function CobrosPage() {
  const { supabase } = await requireGestor();
  if (boldConfigurado()) await sincronizarCobros();
  const { data } = await supabase.from("cobros").select("*").order("created_at", { ascending: false }).limit(100);
  const cobros = data ?? [];
  const mes = new Date(); mes.setDate(1); mes.setHours(0, 0, 0, 0);
  const pagadoMes = cobros.filter((c) => c.estado === "pagado" && c.moneda === "USD" && new Date(c.pagado_at ?? c.created_at) >= mes).reduce((t, c) => t + Number(c.monto), 0);
  const pendiente = cobros.filter((c) => c.estado === "pendiente" && c.moneda === "USD").reduce((t, c) => t + Number(c.monto), 0);

  return (
    <>
      <h1>Cobros</h1>
      <p className="muted">Crea links de pago de Bold y envíaselos a tus clientes. El estado se actualiza solo al abrir esta página.</p>
      {!boldConfigurado() && <div className="alert error">Bold todavía no está conectado: los cobros se guardan como borrador y no se genera el link. Falta la llave de identidad del Botón de pagos en Vercel (BOLD_API_KEY).</div>}

      <div className="grid" style={{ margin: "14px 0" }}>
        <div className="card stat"><div className="n">{dinero(pagadoMes, "USD")}</div><div className="l">Pagado este mes (USD)</div></div>
        <div className="card stat"><div className="n">{dinero(pendiente, "USD")}</div><div className="l">Esperando pago (USD)</div></div>
        <div className="card stat"><div className="n">{cobros.filter((c) => c.estado === "pagado").length}</div><div className="l">Cobros pagados</div></div>
      </div>

      <h2>Nuevo cobro</h2>
      <NuevoCobro />

      <h2>Historial</h2>
      <div className="table-wrap"><table>
        <thead><tr><th>Cliente</th><th>Concepto</th><th>Monto</th><th>Estado</th><th>Link</th></tr></thead>
        <tbody>
          {cobros.length === 0 && <tr><td colSpan={5} className="muted">Todavía no hay cobros.</td></tr>}
          {cobros.map((c) => {
            const [label, pill] = ESTADO[c.estado] ?? [c.estado, ""];
            const wa = c.url ? waLink(c.cliente_telefono, `Hola ${c.cliente_nombre.split(" ")[0]}, este es tu link de pago de Conexión (${c.concepto}): ${c.url}`) : null;
            return (
              <tr key={c.id}>
                <td><strong>{c.cliente_nombre}</strong><div className="muted small">{fechaHora(c.created_at)}</div></td>
                <td>{c.concepto}</td>
                <td className="num">{dinero(Number(c.monto), c.moneda)}</td>
                <td><span className={`pill ${pill}`}>{label}</span>{c.error && <div className="muted small" title={c.error}>Bold: {c.error.slice(0, 60)}</div>}</td>
                <td>
                  {c.url ? (
                    <div className="row" style={{ gap: 6 }}>
                      <CopiarLink url={c.url} />
                      {wa && <a className="pill" href={wa} target="_blank" rel="noopener">WhatsApp</a>}
                    </div>
                  ) : c.estado === "borrador" && boldConfigurado() ? (
                    <form action={reintentarCobro.bind(null, c.id)}><button type="submit" className="ghost small">Crear link</button></form>
                  ) : <span className="muted small">—</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table></div>
    </>
  );
}
