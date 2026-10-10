import { RowDataPacket } from 'mysql2';
import { pool } from '../config/database';
import { hashPassword, Role } from '../shared/auth';

type DemoUser = {
  username: string;
  fullName: string;
  role: Role;
  password: string;
};

const DEMO_USERS: DemoUser[] = [
  { username: 'medico.demo', fullName: 'Dra. Maria Lopez', role: 'MEDICO', password: 'DemoMedico2026!' },
  { username: 'enfermeria.demo', fullName: 'Enf. Andrea Morales', role: 'ENFERMERIA', password: 'DemoEnfermeria2026!' },
  { username: 'coordinacion.demo', fullName: 'Lic. Carlos Herrera', role: 'COORDINACION', password: 'DemoCoordinacion2026!' },
  { username: 'administracion.demo', fullName: 'Ana Rodriguez', role: 'ADMINISTRACION', password: 'DemoAdministracion2026!' }
];

export async function ensureAuthSchema(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      username VARCHAR(80) NOT NULL,
      full_name VARCHAR(150) NOT NULL,
      role VARCHAR(30) NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      active BOOLEAN NOT NULL DEFAULT TRUE,
      last_login_at TIMESTAMP NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uq_users_username (username),
      CONSTRAINT chk_users_role CHECK (role IN ('MEDICO', 'ENFERMERIA', 'COORDINACION', 'ADMINISTRACION'))
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  `);

  const [rows] = await pool.query<RowDataPacket[]>('SELECT username FROM users');
  const existing = new Set(rows.map((row) => String(row.username)));
  for (const user of DEMO_USERS) {
    if (existing.has(user.username)) continue;
    await pool.execute(
      'INSERT INTO users (username, full_name, role, password_hash) VALUES (?, ?, ?, ?)',
      [user.username, user.fullName, user.role, hashPassword(user.password)]
    );
  }
}
