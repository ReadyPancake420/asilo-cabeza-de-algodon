import { PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { pool } from '../../config/database';
import {
  CreateReferralInput,
  ReferralStatus
} from './referral.types';

type ReferralFilters = {
  patientId?: number;
  status?: ReferralStatus;
  specialty?: string;
};

type UpdateFields = Partial<{
  nurse_id: number;
  nurse_name: string;
  specialist_doctor_id: number;
  specialist_doctor_name: string;
  scheduled_date: string;
  scheduled_time: string;
  medical_visit_id: number;
  cancellation_reason: string;
}>;

const SELECT_REFERRAL = `
  SELECT
    id,
    patient_id AS patientId,
    specialty,
    reason,
    referring_doctor_id AS referringDoctorId,
    referring_doctor_name AS referringDoctorName,
    nurse_id AS nurseId,
    nurse_name AS nurseName,
    specialist_doctor_id AS specialistDoctorId,
    specialist_doctor_name AS specialistDoctorName,
    scheduled_date AS scheduledDate,
    TIME_FORMAT(scheduled_time, '%H:%i') AS scheduledTime,
    status,
    medical_visit_id AS medicalVisitId,
    cancellation_reason AS cancellationReason,
    created_at AS createdAt,
    updated_at AS updatedAt
  FROM medical_referrals`;

async function insertEvent(
  connection: PoolConnection,
  referralId: number,
  fromStatus: ReferralStatus | null,
  toStatus: ReferralStatus,
  eventType: string,
  description: string
): Promise<void> {
  await connection.execute(
    `INSERT INTO referral_events
      (referral_id, from_status, to_status, event_type, description)
     VALUES (?, ?, ?, ?, ?)`,
    [referralId, fromStatus, toStatus, eventType, description]
  );
}

export async function insertReferral(input: CreateReferralInput): Promise<number> {
  const connection = await pool.getConnection();
  const initialStatus: ReferralStatus = 'PENDING_NURSE_ASSIGNMENT';

  try {
    await connection.beginTransaction();
    const [result] = await connection.execute<ResultSetHeader>(
      `INSERT INTO medical_referrals
        (patient_id, specialty, reason, referring_doctor_id, referring_doctor_name, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        input.patientId,
        input.specialty,
        input.reason,
        input.referringDoctorId,
        input.referringDoctorName,
        initialStatus
      ]
    );
    await insertEvent(
      connection,
      result.insertId,
      null,
      initialStatus,
      'CREATED',
      'Referencia creada por el medico general'
    );
    await connection.commit();
    return result.insertId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function findReferralById(id: number): Promise<Record<string, unknown> | null> {
  const [rows] = await pool.execute<RowDataPacket[]>(`${SELECT_REFERRAL} WHERE id = ?`, [id]);
  const referral = rows[0];
  if (!referral) return null;

  const [events] = await pool.execute<RowDataPacket[]>(
    `SELECT
       id,
       from_status AS fromStatus,
       to_status AS toStatus,
       event_type AS eventType,
       description,
       occurred_at AS occurredAt
     FROM referral_events
     WHERE referral_id = ?
     ORDER BY occurred_at, id`,
    [id]
  );

  return { ...referral, timeline: events };
}

export async function listReferrals(filters: ReferralFilters): Promise<RowDataPacket[]> {
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
  if (filters.specialty !== undefined) {
    conditions.push('specialty LIKE ?');
    values.push(`%${filters.specialty}%`);
  }

  const where = conditions.length ? ` WHERE ${conditions.join(' AND ')}` : '';
  const [rows] = await pool.execute<RowDataPacket[]>(
    `${SELECT_REFERRAL}${where} ORDER BY created_at DESC LIMIT 100`,
    values
  );
  return rows;
}

export async function updateReferralWithEvent(options: {
  id: number;
  expectedStatus: ReferralStatus;
  newStatus: ReferralStatus;
  fields: UpdateFields;
  eventType: string;
  description: string;
}): Promise<boolean> {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const entries = Object.entries(options.fields);
    const assignments = [...entries.map(([column]) => `${column} = ?`), 'status = ?'];
    const values = [
      ...entries.map(([, value]) => value),
      options.newStatus,
      options.id,
      options.expectedStatus
    ];
    const [result] = await connection.execute<ResultSetHeader>(
      `UPDATE medical_referrals SET ${assignments.join(', ')} WHERE id = ? AND status = ?`,
      values
    );

    if (result.affectedRows !== 1) {
      await connection.rollback();
      return false;
    }

    await insertEvent(
      connection,
      options.id,
      options.expectedStatus,
      options.newStatus,
      options.eventType,
      options.description
    );
    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

