import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool } from '../../config/database';
import { ExpenseCalculation, CreateLiquidationInput } from './liquidation.types';

type LiquidationFilters = {
  patientId?: number;
  status?: string;
};

export async function insertLiquidation(
  input: CreateLiquidationInput,
  calculation: ExpenseCalculation
): Promise<number> {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const [result] = await connection.execute<ResultSetHeader>(
      `INSERT INTO medical_liquidations (
        medical_visit_id, patient_id, appointment_status, consultation_amount,
        laboratory_subtotal, pharmacy_subtotal, gross_total,
        foundation_discount_percent, discount_amount, total_due, currency, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'GTQ', 'FINALIZED')`,
      [
        input.medicalVisitId,
        input.patientId,
        input.appointmentStatus,
        calculation.consultationAmount,
        calculation.laboratorySubtotal,
        calculation.pharmacySubtotal,
        calculation.grossTotal,
        calculation.foundationDiscountPercent,
        calculation.discountAmount,
        calculation.totalDue
      ]
    );

    const items = [
      ...calculation.laboratoryItems.map((item) => ({ ...item, type: 'LABORATORY' })),
      ...calculation.pharmacyItems.map((item) => ({ ...item, type: 'PHARMACY' }))
    ];

    for (const item of items) {
      await connection.execute(
        `INSERT INTO medical_expense_items
          (liquidation_id, item_type, name, quantity, unit_price, subtotal)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [result.insertId, item.type, item.name, item.quantity, item.unitPrice, item.subtotal]
      );
    }

    await connection.commit();
    return result.insertId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

const SELECT_SUMMARY = `
  SELECT
    id,
    medical_visit_id AS medicalVisitId,
    patient_id AS patientId,
    appointment_status AS appointmentStatus,
    consultation_amount AS consultationAmount,
    laboratory_subtotal AS laboratorySubtotal,
    pharmacy_subtotal AS pharmacySubtotal,
    gross_total AS grossTotal,
    foundation_discount_percent AS foundationDiscountPercent,
    discount_amount AS discountAmount,
    total_due AS totalDue,
    currency,
    status,
    void_reason AS voidReason,
    created_at AS createdAt,
    updated_at AS updatedAt
  FROM medical_liquidations`;

export async function findLiquidationById(id: number): Promise<Record<string, unknown> | null> {
  const [rows] = await pool.execute<RowDataPacket[]>(`${SELECT_SUMMARY} WHERE id = ?`, [id]);
  const liquidation = rows[0];
  if (!liquidation) return null;

  const [items] = await pool.execute<RowDataPacket[]>(
    `SELECT id, item_type AS itemType, name, quantity, unit_price AS unitPrice, subtotal
     FROM medical_expense_items WHERE liquidation_id = ? ORDER BY id`,
    [id]
  );

  return { ...liquidation, items };
}

export async function findLiquidationByVisitId(
  medicalVisitId: number
): Promise<Record<string, unknown> | null> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    'SELECT id FROM medical_liquidations WHERE medical_visit_id = ?',
    [medicalVisitId]
  );
  return rows[0] ? findLiquidationById(Number(rows[0].id)) : null;
}

export async function listLiquidations(filters: LiquidationFilters): Promise<RowDataPacket[]> {
  const conditions: string[] = [];
  const values: Array<number | string> = [];

  if (filters.patientId !== undefined) {
    conditions.push('patient_id = ?');
    values.push(filters.patientId);
  }
  if (filters.status !== undefined) {
    conditions.push('status = ?');
    values.push(filters.status);
  }

  const where = conditions.length ? ` WHERE ${conditions.join(' AND ')}` : '';
  const [rows] = await pool.execute<RowDataPacket[]>(
    `${SELECT_SUMMARY}${where} ORDER BY created_at DESC LIMIT 100`,
    values
  );
  return rows;
}

export async function voidLiquidation(id: number, reason: string): Promise<boolean> {
  const [result] = await pool.execute<ResultSetHeader>(
    `UPDATE medical_liquidations
     SET status = 'VOIDED', void_reason = ?
     WHERE id = ? AND status = 'FINALIZED'`,
    [reason, id]
  );
  return result.affectedRows === 1;
}

