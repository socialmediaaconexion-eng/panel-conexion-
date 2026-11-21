import { CredForm, Confirmar } from "./ui";
import { activarManual, reactivar, reembolsar, reenviar, revocar } from "./actions";

export const ESTADO_INSC: Record<string, [string, string]> = {
  pendiente_pago: ["Esperando pago", "warn"], activa: ["Activa", "good"], revocada: ["Revocada", "red"], reembolsada: ["Reembolsada", ""],
};

// Acciones de una inscripción según su estado (se usan en Ventas y en Alumnos).
export function AccionesInscripcion({ id, estado, vencida }: { id: string; estado: string; vencida?: boolean }) {
  return (
    <div className="row ws-acciones">
      {estado === "pendiente_pago" && <CredForm action={activarManual.bind(null, id)} submit="Activar a mano" className="ws-inline" fantasma />}
      {estado === "activa" && !vencida && (
        <>
          <CredForm action={reenviar.bind(null, id)} submit="Reenviar acceso" className="ws-inline" fantasma />
          <Confirmar action={revocar.bind(null, id)} texto="Revocar" pregunta="¿Quitarle el acceso a este alumno?" />
          <Confirmar action={reembolsar.bind(null, id)} texto="Reembolso" pregunta="¿Registrar la devolución (garantía de 3 días)? Recuerda procesarla en Bold. El alumno pierde el acceso." />
        </>
      )}
      {(estado === "revocada" || estado === "reembolsada" || (estado === "activa" && vencida)) && (
        <Confirmar action={reactivar.bind(null, id)} texto={vencida ? "Renovar acceso" : "Reactivar"} pregunta="¿Devolverle el acceso a este alumno?" />
      )}
    </div>
  );
}
