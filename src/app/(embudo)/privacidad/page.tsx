import Link from "next/link";

export const metadata = { title: "Política de privacidad — Conexión", description: "Cómo Conexión trata tus datos personales (Ley 1581 de 2012)." };

const CONTACTO = "socialmediaaconexion@gmail.com";

export default function PrivacidadPage() {
  return (
    <main className="legal">
      <Link href="/vsl" className="legal-volver">← Volver</Link>
      <h1>Política de privacidad y tratamiento de datos</h1>
      <p className="muted">Última actualización: 19 de noviembre de 2026</p>

      <h2>Quién trata tus datos</h2>
      <p>Conexión, agencia boutique con sede en Medellín, Colombia (conexionteam.app), es responsable del tratamiento de los datos que nos entregas en este sitio, conforme a la Ley 1581 de 2012 y el Decreto 1377 de 2013 de Colombia.</p>

      <h2>Qué datos recogemos</h2>
      <ul>
        <li>Los que escribes en los formularios: nombre, correo, WhatsApp y las respuestas sobre tu negocio.</li>
        <li>El horario que eliges para tu llamada.</li>
        <li>Datos de navegación anónimos del embudo: páginas que visitas, si reproduces el video, desde qué anuncio llegas (UTM) y si entras desde celular o computador. No usamos cookies de terceros para esto.</li>
      </ul>

      <h2>Para qué los usamos</h2>
      <ul>
        <li>Revisar tu aplicación y preparar la llamada.</li>
        <li>Confirmar tu cita y enviarte recordatorios por correo y WhatsApp.</li>
        <li>Responder tus cotizaciones.</li>
        <li>Medir qué funciona en nuestro embudo para mejorarlo.</li>
      </ul>
      <p>No vendemos ni compartimos tus datos con terceros para fines comerciales. Los guardamos en proveedores que nos prestan el servicio técnico (alojamiento, base de datos, envío de correos y mensajes) y que solo los usan para eso.</p>

      <h2>Tus derechos</h2>
      <p>Puedes conocer, actualizar, rectificar o pedir que eliminemos tus datos, y revocar tu autorización, escribiendo a <a href={`mailto:${CONTACTO}`}>{CONTACTO}</a>. Respondemos en los plazos que fija la ley.</p>

      <h2>Autorización</h2>
      <p>Al enviar un formulario en este sitio autorizas el tratamiento de tus datos para las finalidades descritas aquí.</p>
    </main>
  );
}
