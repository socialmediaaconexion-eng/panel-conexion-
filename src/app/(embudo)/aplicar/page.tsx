import { AplicarForm } from "./form";

export const metadata = { title: "¿Esto es para ti? — Conexión", description: "Cinco preguntas de un toque para saber si tu negocio está listo para un sistema de captación con IA." };

export default function AplicarPage() {
  return (
    <main className="embudo">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.png" alt="Conexión" className="embudo-logo" />
      <h1 className="embudo-h1">¿Esto es para ti?</h1>
      <p className="embudo-lead">Un minuto, cinco preguntas de un toque. Si es para ti, eliges el horario de tu diagnóstico gratuito.</p>
      <AplicarForm />
    </main>
  );
}
