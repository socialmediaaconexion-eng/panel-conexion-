import { AplicarForm } from "./form";

export const metadata = { title: "Aplica — Conexión" };

export default function AplicarPage() {
  return (
    <main className="embudo">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.png" alt="Conexión" className="embudo-logo" />
      <h1 className="embudo-h1">Cuéntanos de tu proyecto</h1>
      <p className="embudo-lead">4 preguntas rápidas para llegar a la llamada sabiendo cómo ayudarte. En el siguiente paso eliges tu horario.</p>
      <AplicarForm />
    </main>
  );
}
