# Plantillas de WhatsApp para Meta

Se crean en **Meta Business Suite → WhatsApp Manager → Plantillas de mensajes → Crear plantilla**.
Para las cuatro: categoría **Utilidad**, idioma **Español**, y el nombre exactamente como aparece aquí
(el panel las busca por ese nombre). Las variables `{{1}}`, `{{2}}`, `{{3}}` las llena el panel solo.

## 1. `conexion_confirmacion_cita` — al lead, cuando agenda

> Hola {{1}}, tu llamada con Conexión quedó agendada para el {{2}} (hora de Colombia) con {{3}}. Si necesitas cambiar el horario, responde este mensaje.

Ejemplo para Meta: `{{1}}` = Laura · `{{2}}` = viernes 20 de noviembre, 10:00 a. m. · `{{3}}` = Andrés

## 2. `conexion_recordatorio_24h` — al lead, un día antes

> Hola {{1}}, te recordamos tu llamada con Conexión el {{2}} (hora de Colombia) con {{3}}. Te enviamos el enlace de la videollamada a tu correo.

## 3. `conexion_recordatorio_1h` — al lead, una hora antes

> Hola {{1}}, tu llamada con Conexión es hoy, {{2}} (hora de Colombia). {{3}} te espera en la videollamada.

## 4. `conexion_nueva_cita_closer` — al closer, cuando le llega una cita

> Nueva llamada agendada con {{1}} el {{2}} (hora de Colombia). Revisa la ficha en el panel de Conexión antes de la llamada.

---

Cuando Meta las apruebe, en el panel de Meta copia:
- el **token de acceso permanente** (usuario del sistema) → variable `WHATSAPP_TOKEN`
- el **identificador del número de teléfono** → variable `WHATSAPP_PHONE_NUMBER_ID`
