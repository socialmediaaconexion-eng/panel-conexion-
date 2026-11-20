// Producto de Conexión (definido por Fernanda, 20-nov-2026):
// 1) Implementación del sistema USD 1.800 (pago único). 2) Dirección mensual USD 1.500/mes.
// Sin descuentos ni escalones baratos: posicionamiento premium.
export type PlanId = "impl" | "mes";

export const PAGOS: Record<PlanId, { concepto: string; monto: number }> = {
  impl: { concepto: "Implementación del Sistema de Captación Conexión", monto: 1800 },
  mes: { concepto: "Dirección de Captación Conexión · mensualidad", monto: 1500 },
};
