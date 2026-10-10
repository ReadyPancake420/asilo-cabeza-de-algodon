import { describe, expect, it } from 'vitest';
import { calculateMedicalExpense } from '../src/modules/liquidations/liquidation.calculator';

describe('calculateMedicalExpense', () => {
  it('suma consulta, laboratorios y farmacia y aplica el descuento', () => {
    const result = calculateMedicalExpense({
      consultationAmount: 150,
      foundationDiscountPercent: 20,
      laboratoryItems: [
        { name: 'Hematologia', quantity: 1, unitPrice: 100 },
        { name: 'Glucosa', quantity: 1, unitPrice: 75 }
      ],
      pharmacyItems: [{ name: 'Losartan', quantity: 2, unitPrice: 45 }]
    });

    expect(result.grossTotal).toBe(415);
    expect(result.discountAmount).toBe(83);
    expect(result.totalDue).toBe(332);
  });

  it('redondea montos monetarios a dos decimales', () => {
    const result = calculateMedicalExpense({
      consultationAmount: 100.01,
      foundationDiscountPercent: 15,
      laboratoryItems: [],
      pharmacyItems: []
    });

    expect(result.discountAmount).toBe(15);
    expect(result.totalDue).toBe(85.01);
  });
});

