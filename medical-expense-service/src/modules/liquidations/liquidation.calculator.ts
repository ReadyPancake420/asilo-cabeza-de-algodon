import {
  CalculateExpenseInput,
  CalculatedItem,
  ExpenseCalculation,
  ExpenseItemInput
} from './liquidation.types';

const toCents = (amount: number): number => Math.round(amount * 100);
const fromCents = (amount: number): number => amount / 100;

function calculateItems(items: ExpenseItemInput[]): { items: CalculatedItem[]; subtotalCents: number } {
  let subtotalCents = 0;

  const calculatedItems = items.map((item) => {
    const itemSubtotalCents = Math.round(toCents(item.unitPrice) * item.quantity);
    subtotalCents += itemSubtotalCents;

    return {
      ...item,
      subtotal: fromCents(itemSubtotalCents)
    };
  });

  return { items: calculatedItems, subtotalCents };
}

export function calculateMedicalExpense(input: CalculateExpenseInput): ExpenseCalculation {
  const consultationCents = toCents(input.consultationAmount);
  const laboratories = calculateItems(input.laboratoryItems);
  const pharmacy = calculateItems(input.pharmacyItems);
  const grossTotalCents = consultationCents + laboratories.subtotalCents + pharmacy.subtotalCents;
  const discountCents = Math.round(grossTotalCents * (input.foundationDiscountPercent / 100));
  const totalDueCents = grossTotalCents - discountCents;

  return {
    consultationAmount: fromCents(consultationCents),
    laboratorySubtotal: fromCents(laboratories.subtotalCents),
    pharmacySubtotal: fromCents(pharmacy.subtotalCents),
    grossTotal: fromCents(grossTotalCents),
    foundationDiscountPercent: input.foundationDiscountPercent,
    discountAmount: fromCents(discountCents),
    totalDue: fromCents(totalDueCents),
    currency: 'GTQ',
    laboratoryItems: laboratories.items,
    pharmacyItems: pharmacy.items
  };
}

