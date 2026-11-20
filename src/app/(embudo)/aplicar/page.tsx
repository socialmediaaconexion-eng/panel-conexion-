import { AplicarForm } from "./form";

export const metadata = { title: "¿Eres apto? — Conexión", description: "Cinco preguntas de un toque para saber si tu negocio es apto para un sistema de captación con IA." };

export default function AplicarPage() {
  return (
    <main className="embudo">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.png" alt="Conexión" className="embudo-logo" />
      <h1 className="embudo-h1">¿Eres apto para el servicio?</h1>
      <p className="embudo-lead">Un minuto, cinco preguntas de un toque. Si eres apto, eliges el horario de tu diagnóstico gratuito.</p>
      <AplicarForm />
    </main>
  );
}
