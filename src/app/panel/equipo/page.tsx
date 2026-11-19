import { requireGestor } from "@/lib/auth";
import { ActionForm } from "@/components/action-form";
import { agregarMiembro, actualizarMiembro } from "./actions";

export default async function EquipoPage() {
  const { seller, supabase } = await requireGestor();
  const esAdmin = seller.rol === "admin";
  const { data: equipo } = await supabase.from("sellers").select("*").order("activo", { ascending: false }).order("nombre");

  return (
    <>
      <h1>Equipo</h1>
      <p className="muted">
        Solo los vendedores activos con rol &quot;vendedor&quot; reciben leads automáticos. Los setters contactan; cuando un lead
        suyo agenda, la cita pasa a un closer libre. &quot;Puede reasignar&quot; permite mover leads entre vendedores.
      </p>

      <div className="table-wrap" style={{ marginTop: 14 }}><table>
        <thead><tr><th>Nombre</th><th>Correo</th><th>Rol</th><th>Tipo</th><th>Puede reasignar</th><th>Activo</th>{esAdmin && <th></th>}</tr></thead>
        <tbody>{(equipo ?? []).map((s) => (
          <tr key={s.id}>
            <td>{s.nombre}</td>
            <td>{s.email}</td>
            {esAdmin ? (
              <td colSpan={5}>
                <form action={actualizarMiembro.bind(null, s.id)} className="inline">
                  <select name="rol" defaultValue={s.rol} aria-label={`Rol de ${s.nombre}`}>
                    <option value="admin">admin</option><option value="manager">manager</option><option value="vendedor">vendedor</option>
                  </select>
                  <select name="tipo" defaultValue={s.tipo} aria-label={`Tipo de ${s.nombre}`}>
                    <option value="closer">closer</option><option value="setter">setter</option>
                  </select>
                  <label className="row"><input type="checkbox" name="es_asignador" defaultChecked={s.es_asignador} /> reasigna</label>
                  <label className="row"><input type="checkbox" name="activo" defaultChecked={s.activo} /> activo</label>
                  <button type="submit" className="ghost">Guardar</button>
                </form>
              </td>
            ) : (
              <>
                <td>{s.rol}</td><td>{s.tipo}</td><td>{s.es_asignador ? "Sí" : "No"}</td>
                <td>{s.activo ? <span className="pill good">Activo</span> : <span className="pill">Inactivo</span>}</td>
              </>
            )}
          </tr>
        ))}</tbody>
      </table></div>

      {esAdmin && (
        <>
          <h2>Agregar miembro</h2>
          <ActionForm action={agregarMiembro} submit="Crear acceso">
            <label htmlFor="m-nombre">Nombre<input id="m-nombre" name="nombre" required /></label>
            <label htmlFor="m-email">Correo<input id="m-email" name="email" type="email" required /></label>
            <label htmlFor="m-pass">Contraseña inicial (mínimo 8)<input id="m-pass" name="password" type="text" minLength={8} required /></label>
            <label htmlFor="m-wa">WhatsApp<input id="m-wa" name="whatsapp" /></label>
            <label htmlFor="m-rol">Rol
              <select id="m-rol" name="rol" defaultValue="vendedor"><option value="vendedor">vendedor</option><option value="manager">manager</option><option value="admin">admin</option></select>
            </label>
            <label htmlFor="m-tipo">Tipo
              <select id="m-tipo" name="tipo" defaultValue="closer"><option value="closer">closer</option><option value="setter">setter</option></select>
            </label>
            <label className="row"><input type="checkbox" name="es_asignador" /> Puede reasignar leads</label>
          </ActionForm>
        </>
      )}
    </>
  );
}
