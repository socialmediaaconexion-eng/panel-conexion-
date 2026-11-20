// Diseño de producto de Conexión (propuesta de estratega-producto + investigador-mercado, 20-nov-2026).
// Precios y cantidades PENDIENTES DE CONFIRMAR por Fernanda.
export type PlanId = "sprint" | "impl3" | "impl6" | "mes";

export const PAGOS: Record<PlanId, { concepto: string; monto: number }> = {
  sprint: { concepto: "Sprint de Marca y Guion", monto: 490 },
  impl3: { concepto: "Implementación Dirección de Captación (plan 3 meses)", monto: 1800 },
  impl6: { concepto: "Implementación Dirección de Captación (plan 6 meses)", monto: 900 },
  mes: { concepto: "Dirección de Captación · mensualidad", monto: 1500 },
};
