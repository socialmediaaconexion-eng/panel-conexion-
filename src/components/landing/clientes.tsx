export type Cliente = { nombre: string; foto: string; rol?: string };

// Cinta de tarjetas altas en blanco y negro con el nombre abajo, en movimiento continuo para que se vean todas.
// Se pausa al pasar el mouse o al tocar; las tarjetas se colorean al pasar el mouse.
// La lista va duplicada para que el bucle no tenga salto (la copia queda oculta a lectores de pantalla).
export function Clientes({ clientes }: { clientes: Cliente[] }) {
  if (clientes.length === 0) return null;

  const tarjeta = (c: Cliente, copia: boolean, i: number) => {
    const y = c.nombre.indexOf(" y "); // dos personas: corta en " y "; si no, después de la primera palabra
    const [uno, ...resto] = y > 0 ? [c.nombre.slice(0, y), c.nombre.slice(y + 1)] : c.nombre.split(" ");
    return (
      <figure key={`${copia ? "b" : "a"}${i}`} className="cliente" role={copia ? undefined : "listitem"} aria-hidden={copia || undefined}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={c.foto} alt={copia ? "" : c.nombre} loading="lazy" draggable={false} />
        <figcaption>
          <strong>{uno}<br />{resto.join(" ")}</strong>
          {c.rol && <span>{c.rol}</span>}
        </figcaption>
      </figure>
    );
  };

  return (
    <div className="clientes" tabIndex={0} aria-label="Personas y marcas con las que he trabajado">
      <div className="clientes-cinta" role="list" style={{ ["--n" as string]: clientes.length }}>
        {clientes.map((c, i) => tarjeta(c, false, i))}
        {clientes.map((c, i) => tarjeta(c, true, i))}
      </div>
    </div>
  );
}
