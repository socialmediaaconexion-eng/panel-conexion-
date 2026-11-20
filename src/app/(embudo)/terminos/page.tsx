import Link from "next/link";

export const metadata = { title: "Términos y condiciones — Conexión", description: "Términos de uso del sitio y de la llamada de diagnóstico de Conexión." };

export default function TerminosPage() {
  return (
    <main className="legal">
      <Link href="/vsl" className="legal-volver">← Volver</Link>
      <h1>Términos y condiciones</h1>
      <p className="muted">Última actualización: 19 de noviembre de 2026</p>

      <h2>Sobre este sitio</h2>
      <p>conexionteam.app es el sitio de Conexión, agencia boutique que implementa sistemas de captación: landing pages, embudos, paneles de gestión, videos y campañas.</p>

      <h2>La llamada</h2>
      <p>La llamada de diagnóstico es gratuita y sin compromiso. Sirve para entender tu caso y decirte con honestidad si podemos ayudarte. Agendarla no implica ninguna compra.</p>

      <h2>Resultados</h2>
      <p>Cada negocio es distinto. No prometemos ingresos ni resultados específicos: los resultados dependen de tu oferta, tu mercado, tu inversión y tu ejecución. Lo que sí hacemos es implementar el sistema acordado y medirlo con transparencia.</p>

      <h2>Propuestas y servicios</h2>
      <p>Los alcances, precios, tiempos y condiciones de cada proyecto se definen por escrito en la propuesta que te enviamos después de la llamada.</p>

      <h2>Propiedad intelectual</h2>
      <p>Los textos, diseños, videos y la marca Conexión que ves en este sitio son propiedad de Conexión o se usan con autorización. Los nombres de personas y marcas mencionados pertenecen a sus titulares.</p>

      <h2>Datos personales</h2>
      <p>El uso de tus datos se rige por nuestra <Link href="/privacidad">política de privacidad</Link>.</p>
    </main>
  );
}
