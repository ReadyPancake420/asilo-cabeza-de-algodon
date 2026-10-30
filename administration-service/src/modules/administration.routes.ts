import { Router } from 'express';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { z } from 'zod';
import { pool } from '../config/database';
import { asyncHandler } from '../shared/asyncHandler';
import { allowRoles } from '../shared/auth';
import { AppError } from '../shared/errors';

export const administrationRouter = Router();

const idSchema = z.coerce.number().int().positive();
const optionalId = z.union([z.coerce.number().int().positive(), z.literal(''), z.null()]).optional();
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const residentSchema = z.object({
  name: z.string().trim().min(3).max(150),
  birthDate: dateSchema,
  room: z.string().trim().min(1).max(20),
  condition: z.string().trim().min(2).max(180),
  family: z.string().trim().min(3).max(150),
  familyPhone: z.string().trim().min(4).max(30),
  status: z.enum(['Estable', 'En observación', 'Hospitalizado']).default('Estable'),
  bloodType: z.string().trim().max(20).default('No registrado'),
  psychopathology: z.string().trim().max(180).optional().default(''),
  allergies: z.string().trim().max(250).optional().default('')
});

const visitSchema = z.object({
  residentId: idSchema,
  visitDate: dateSchema,
  visitType: z.string().trim().min(3).max(100),
  doctorName: z.string().trim().min(3).max(150),
  reason: z.string().trim().min(5).max(500),
  diagnosis: z.string().trim().min(3).max(1000),
  treatment: z.string().trim().max(1000).optional().default(''),
  observations: z.string().trim().max(1000).optional().default('')
});

const laboratorySchema = z.object({
  residentId: idSchema,
  medicalVisitId: optionalId,
  exams: z.string().trim().min(3).max(500),
  date: dateSchema,
  doctor: z.string().trim().min(3).max(150),
  status: z.enum(['Pendiente', 'En procesamiento', 'Resultados listos']).default('Pendiente')
});

const laboratoryResultSchema = z.object({
  status: z.enum(['Pendiente', 'En procesamiento', 'Resultados listos']),
  resultNotes: z.string().trim().min(3).max(2000)
});

const medicineSchema = z.object({
  name: z.string().trim().min(3).max(180),
  presentation: z.string().trim().min(3).max(180),
  stock: z.coerce.number().int().nonnegative(),
  max: z.coerce.number().int().positive().default(100),
  price: z.coerce.number().nonnegative(),
  minimumStock: z.coerce.number().int().nonnegative().default(20)
});

const deliverySchema = z.object({
  residentId: idSchema,
  medicalVisitId: optionalId,
  medicineId: idSchema,
  quantity: z.coerce.number().int().positive(),
  prescribedBy: z.string().trim().min(3).max(150),
  notes: z.string().trim().max(500).optional().default('')
});

const cashSchema = z.object({
  date: dateSchema,
  concept: z.string().trim().min(3).max(250),
  source: z.string().trim().min(2).max(180),
  type: z.enum(['Entrada', 'Salida']),
  category: z.enum(['Cuota familiar', 'Donación', 'Gasto operativo', 'Pago fundación', 'Pago médico', 'Otro']),
  amount: z.coerce.number().positive(),
  residentId: optionalId
});

const residentSelect = `
  SELECT id, full_name AS name, DATE_FORMAT(birth_date, '%Y-%m-%d') AS birthDate,
    TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) AS age, room, condition_name AS \`condition\`,
    family_name AS family, family_phone AS familyPhone, status, blood_type AS bloodType,
    psychopathology, allergies, created_at AS createdAt
  FROM residents`;

administrationRouter.get('/residents', asyncHandler(async (request, response) => {
  const status = typeof request.query.status === 'string' ? request.query.status : '';
  const search = typeof request.query.search === 'string' ? request.query.search.trim() : '';
  const clauses: string[] = [];
  const values: string[] = [];
  if (status) { clauses.push('status = ?'); values.push(status); }
  if (search) { clauses.push('(full_name LIKE ? OR room LIKE ?)'); values.push(`%${search}%`, `%${search}%`); }
  const [rows] = await pool.execute<RowDataPacket[]>(`${residentSelect}${clauses.length ? ` WHERE ${clauses.join(' AND ')}` : ''} ORDER BY full_name`, values);
  response.json({ data: rows });
}));

administrationRouter.post('/residents', allowRoles('ADMINISTRACION'), asyncHandler(async (request, response) => {
  const data = residentSchema.parse(request.body);
  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO residents (full_name, birth_date, room, condition_name, family_name, family_phone, status, blood_type, psychopathology, allergies)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [data.name, data.birthDate, data.room, data.condition, data.family, data.familyPhone, data.status, data.bloodType, data.psychopathology, data.allergies]
  );
  const [rows] = await pool.execute<RowDataPacket[]>(`${residentSelect} WHERE id = ?`, [result.insertId]);
  response.status(201).json({ data: rows[0] });
}));

administrationRouter.get('/residents/:id', asyncHandler(async (request, response) => {
  const id = idSchema.parse(request.params.id);
  const [residents] = await pool.execute<RowDataPacket[]>(`${residentSelect} WHERE id = ?`, [id]);
  if (!residents[0]) throw new AppError(404, 'RESIDENT_NOT_FOUND', 'No se encontro el residente');
  const [visits] = await pool.execute<RowDataPacket[]>(
    `SELECT id, resident_id AS residentId, DATE_FORMAT(visit_date, '%Y-%m-%d') AS visitDate,
      visit_type AS visitType, doctor_name AS doctorName, reason, diagnosis, treatment, observations, created_at AS createdAt
     FROM medical_visits WHERE resident_id = ? ORDER BY visit_date DESC, id DESC`, [id]
  );
  response.json({ data: { resident: residents[0], visits } });
}));

administrationRouter.get('/medical-visits', asyncHandler(async (request, response) => {
  const residentId = request.query.residentId ? idSchema.parse(request.query.residentId) : null;
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT v.id, v.resident_id AS residentId, r.full_name AS residentName,
      DATE_FORMAT(v.visit_date, '%Y-%m-%d') AS visitDate, v.visit_type AS visitType,
      v.doctor_name AS doctorName, v.reason, v.diagnosis, v.treatment, v.observations
     FROM medical_visits v JOIN residents r ON r.id = v.resident_id
     ${residentId ? 'WHERE v.resident_id = ?' : ''} ORDER BY v.visit_date DESC`, residentId ? [residentId] : []
  );
  response.json({ data: rows });
}));

administrationRouter.post('/medical-visits', allowRoles('MEDICO'), asyncHandler(async (request, response) => {
  const data = visitSchema.parse(request.body);
  const [resident] = await pool.execute<RowDataPacket[]>('SELECT id FROM residents WHERE id = ?', [data.residentId]);
  if (!resident[0]) throw new AppError(404, 'RESIDENT_NOT_FOUND', 'No se encontro el residente');
  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO medical_visits (resident_id, visit_date, visit_type, doctor_name, reason, diagnosis, treatment, observations)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [data.residentId, data.visitDate, data.visitType, data.doctorName, data.reason, data.diagnosis, data.treatment, data.observations]
  );
  response.status(201).json({ data: { id: result.insertId, ...data } });
}));

administrationRouter.get('/laboratory-orders', asyncHandler(async (_request, response) => {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT l.id, l.resident_id AS patientId, r.full_name AS patient, l.medical_visit_id AS medicalVisitId,
      l.exams, DATE_FORMAT(l.scheduled_date, '%Y-%m-%d') AS date, l.doctor_name AS doctor,
      l.status, l.result_notes AS resultNotes
     FROM laboratory_orders l JOIN residents r ON r.id = l.resident_id ORDER BY l.scheduled_date DESC, l.id DESC`
  );
  response.json({ data: rows });
}));

administrationRouter.post('/laboratory-orders', allowRoles('MEDICO'), asyncHandler(async (request, response) => {
  const data = laboratorySchema.parse(request.body);
  const visitId = data.medicalVisitId === '' || data.medicalVisitId == null ? null : data.medicalVisitId;
  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO laboratory_orders (resident_id, medical_visit_id, exams, scheduled_date, doctor_name, status)
     VALUES (?, ?, ?, ?, ?, ?)`, [data.residentId, visitId, data.exams, data.date, data.doctor, data.status]
  );
  response.status(201).json({ data: { id: result.insertId, ...data } });
}));

administrationRouter.patch('/laboratory-orders/:id/result', allowRoles('ENFERMERIA'), asyncHandler(async (request, response) => {
  const id = idSchema.parse(request.params.id);
  const data = laboratoryResultSchema.parse(request.body);
  const [result] = await pool.execute<ResultSetHeader>(
    'UPDATE laboratory_orders SET status = ?, result_notes = ? WHERE id = ?', [data.status, data.resultNotes, id]
  );
  if (!result.affectedRows) throw new AppError(404, 'LAB_ORDER_NOT_FOUND', 'No se encontro la orden de laboratorio');
  response.json({ data: { id, ...data } });
}));

administrationRouter.get('/medicines', asyncHandler(async (_request, response) => {
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT id, name, presentation, stock, maximum_stock AS max, unit_price AS price,
      CASE WHEN stock = 0 OR stock < minimum_stock / 2 THEN 'Reabastecer'
           WHEN stock < minimum_stock THEN 'Existencia baja' ELSE 'Disponible' END AS status,
      minimum_stock AS minimumStock
     FROM medicines ORDER BY name`
  );
  response.json({ data: rows });
}));

administrationRouter.post('/medicines', allowRoles('ADMINISTRACION'), asyncHandler(async (request, response) => {
  const data = medicineSchema.parse(request.body);
  const [result] = await pool.execute<ResultSetHeader>(
    'INSERT INTO medicines (name, presentation, stock, maximum_stock, unit_price, minimum_stock) VALUES (?, ?, ?, ?, ?, ?)',
    [data.name, data.presentation, data.stock, data.max, data.price, data.minimumStock]
  );
  response.status(201).json({ data: { id: result.insertId, ...data } });
}));

administrationRouter.post('/pharmacy-deliveries', allowRoles('ENFERMERIA'), asyncHandler(async (request, response) => {
  const data = deliverySchema.parse(request.body);
  const visitId = data.medicalVisitId === '' || data.medicalVisitId == null ? null : data.medicalVisitId;
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [medicines] = await connection.execute<RowDataPacket[]>('SELECT id, name, stock, unit_price AS price FROM medicines WHERE id = ? FOR UPDATE', [data.medicineId]);
    const medicine = medicines[0];
    if (!medicine) throw new AppError(404, 'MEDICINE_NOT_FOUND', 'No se encontro el medicamento');
    if (Number(medicine.stock) < data.quantity) throw new AppError(409, 'INSUFFICIENT_STOCK', `Solo hay ${medicine.stock} unidades disponibles`);
    await connection.execute('UPDATE medicines SET stock = stock - ? WHERE id = ?', [data.quantity, data.medicineId]);
    const [result] = await connection.execute<ResultSetHeader>(
      `INSERT INTO medication_deliveries (resident_id, medical_visit_id, medicine_id, quantity, unit_price, prescribed_by, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`, [data.residentId, visitId, data.medicineId, data.quantity, medicine.price, data.prescribedBy, data.notes]
    );
    await connection.commit();
    response.status(201).json({ data: { id: result.insertId, medicine: medicine.name, remainingStock: Number(medicine.stock) - data.quantity } });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}));

administrationRouter.get('/cash-movements', allowRoles('ADMINISTRACION'), asyncHandler(async (request, response) => {
  const type = typeof request.query.type === 'string' ? request.query.type : '';
  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT id, DATE_FORMAT(movement_date, '%Y-%m-%d') AS date, concept, source, type, category, amount,
      resident_id AS residentId FROM cash_movements ${type ? 'WHERE type = ?' : ''}
     ORDER BY movement_date DESC, id DESC`, type ? [type] : []
  );
  response.json({ data: rows });
}));

administrationRouter.post('/cash-movements', allowRoles('ADMINISTRACION'), asyncHandler(async (request, response) => {
  const data = cashSchema.parse(request.body);
  const residentId = data.residentId === '' || data.residentId == null ? null : data.residentId;
  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO cash_movements (movement_date, concept, source, type, category, amount, resident_id)
     VALUES (?, ?, ?, ?, ?, ?, ?)`, [data.date, data.concept, data.source, data.type, data.category, data.amount, residentId]
  );
  response.status(201).json({ data: { id: result.insertId, ...data, residentId } });
}));

administrationRouter.get('/reports/summary', allowRoles('COORDINACION', 'ADMINISTRACION'), asyncHandler(async (_request, response) => {
  const [[residentTotals], [labTotals], [stockTotals], [cashTotals]] = await Promise.all([
    pool.execute<RowDataPacket[]>(`SELECT COUNT(*) AS total, SUM(status = 'Hospitalizado') AS hospitalized FROM residents`),
    pool.execute<RowDataPacket[]>(`SELECT COUNT(*) AS total, SUM(status = 'Pendiente') AS pending, SUM(status = 'Resultados listos') AS ready FROM laboratory_orders`),
    pool.execute<RowDataPacket[]>(`SELECT COUNT(*) AS total, SUM(stock < minimum_stock) AS lowStock FROM medicines`),
    pool.execute<RowDataPacket[]>(`SELECT COALESCE(SUM(CASE WHEN type = 'Entrada' THEN amount ELSE 0 END), 0) AS income,
      COALESCE(SUM(CASE WHEN type = 'Salida' THEN amount ELSE 0 END), 0) AS expenses FROM cash_movements`)
  ]);
  response.json({ data: { residents: residentTotals[0], laboratory: labTotals[0], pharmacy: stockTotals[0], cash: cashTotals[0] } });
}));

// Datos de reportes: lectura limitada a los mismos roles autorizados para el módulo.
administrationRouter.get('/reports/data', allowRoles('COORDINACION', 'ADMINISTRACION'), asyncHandler(async (_request, response) => {
  const [[movements], [deliveries]] = await Promise.all([
    pool.execute<RowDataPacket[]>(`SELECT id, DATE_FORMAT(movement_date, '%Y-%m-%d') AS date,
      concept, source, type, category, amount, resident_id AS residentId
      FROM cash_movements ORDER BY movement_date DESC, id DESC`),
    pool.execute<RowDataPacket[]>(`SELECT d.id, d.resident_id AS residentId, r.full_name AS residentName,
      d.medical_visit_id AS medicalVisitId, m.name AS medicine, d.quantity, d.unit_price AS unitPrice,
      d.prescribed_by AS prescribedBy, d.notes, DATE_FORMAT(d.delivered_at, '%Y-%m-%d') AS date
      FROM medication_deliveries d JOIN residents r ON r.id = d.resident_id
      JOIN medicines m ON m.id = d.medicine_id ORDER BY d.delivered_at DESC, d.id DESC`)
  ]);
  response.set('Cache-Control', 'no-store').json({ data: { movements, deliveries } });
}));
