SET NAMES utf8mb4;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS residents (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  full_name VARCHAR(150) NOT NULL,
  birth_date DATE NOT NULL,
  room VARCHAR(20) NOT NULL,
  condition_name VARCHAR(180) NOT NULL,
  family_name VARCHAR(150) NOT NULL,
  family_phone VARCHAR(30) NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'Estable',
  blood_type VARCHAR(20) NOT NULL DEFAULT 'No registrado',
  psychopathology VARCHAR(180) NULL,
  allergies VARCHAR(250) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_resident_room (room)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS medical_visits (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  resident_id INT UNSIGNED NOT NULL,
  visit_date DATE NOT NULL,
  visit_type VARCHAR(100) NOT NULL,
  doctor_name VARCHAR(150) NOT NULL,
  reason VARCHAR(500) NOT NULL,
  diagnosis TEXT NOT NULL,
  treatment TEXT NULL,
  observations TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_visits_resident_date (resident_id, visit_date),
  CONSTRAINT fk_visits_resident FOREIGN KEY (resident_id) REFERENCES residents(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS laboratory_orders (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  resident_id INT UNSIGNED NOT NULL,
  medical_visit_id INT UNSIGNED NULL,
  exams VARCHAR(500) NOT NULL,
  scheduled_date DATE NOT NULL,
  doctor_name VARCHAR(150) NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'Pendiente',
  result_notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_lab_resident FOREIGN KEY (resident_id) REFERENCES residents(id),
  CONSTRAINT fk_lab_visit FOREIGN KEY (medical_visit_id) REFERENCES medical_visits(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS medicines (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(180) NOT NULL,
  presentation VARCHAR(180) NOT NULL,
  stock INT UNSIGNED NOT NULL,
  maximum_stock INT UNSIGNED NOT NULL DEFAULT 100,
  unit_price DECIMAL(12,2) UNSIGNED NOT NULL,
  minimum_stock INT UNSIGNED NOT NULL DEFAULT 20,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_medicine_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS medication_deliveries (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  resident_id INT UNSIGNED NOT NULL,
  medical_visit_id INT UNSIGNED NULL,
  medicine_id INT UNSIGNED NOT NULL,
  quantity INT UNSIGNED NOT NULL,
  unit_price DECIMAL(12,2) UNSIGNED NOT NULL,
  prescribed_by VARCHAR(150) NOT NULL,
  notes VARCHAR(500) NULL,
  delivered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_delivery_resident FOREIGN KEY (resident_id) REFERENCES residents(id),
  CONSTRAINT fk_delivery_visit FOREIGN KEY (medical_visit_id) REFERENCES medical_visits(id),
  CONSTRAINT fk_delivery_medicine FOREIGN KEY (medicine_id) REFERENCES medicines(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS cash_movements (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  movement_date DATE NOT NULL,
  concept VARCHAR(250) NOT NULL,
  source VARCHAR(180) NOT NULL,
  type VARCHAR(20) NOT NULL,
  category VARCHAR(60) NOT NULL,
  amount DECIMAL(12,2) UNSIGNED NOT NULL,
  resident_id INT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY ix_cash_date_type (movement_date, type),
  CONSTRAINT fk_cash_resident FOREIGN KEY (resident_id) REFERENCES residents(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO residents (id, full_name, birth_date, room, condition_name, family_name, family_phone, status, blood_type, psychopathology, allergies) VALUES
  (15, 'Carlos Méndez', '1948-04-18', 'A-12', 'Hipertensión', 'Ana Méndez', '5555-0148', 'Estable', 'O positivo', 'Ansiedad generalizada', 'Penicilina'),
  (18, 'Rosa del Carmen López', '1944-07-09', 'A-08', 'Diabetes tipo 2', 'Miguel López', '5555-0182', 'En observación', 'A positivo', '', 'Ninguna conocida'),
  (22, 'Ernesto Ramírez', '1952-01-23', 'B-03', 'Artritis', 'Julia Ramírez', '5555-0224', 'Estable', 'B positivo', '', 'Ninguna conocida'),
  (27, 'María Elena García', '1940-05-11', 'B-09', 'Alzhéimer', 'Sofía García', '5555-0278', 'Estable', 'O negativo', 'Deterioro cognitivo', 'Ninguna conocida'),
  (31, 'José Antonio Pérez', '1946-08-30', 'C-02', 'Cardiopatía', 'Luis Pérez', '5555-0316', 'Hospitalizado', 'A negativo', '', 'Sulfas'),
  (36, 'Dolores Castillo', '1950-02-14', 'C-07', 'Osteoporosis', 'Marta Castillo', '5555-0361', 'Estable', 'AB positivo', '', 'Ninguna conocida');

INSERT INTO medical_visits (id, resident_id, visit_date, visit_type, doctor_name, reason, diagnosis, treatment, observations) VALUES
  (2001, 15, '2026-08-21', 'Medicina general', 'Dr. Juan Pérez', 'Dolor recurrente en el pecho', 'Evaluación preventiva; se solicita consulta con cardiología.', 'Mantener control de presión arterial.', 'Referencia médica creada para cardiología.'),
  (2002, 15, '2026-07-12', 'Control periódico', 'Dra. Elena Soto', 'Seguimiento de hipertensión', 'Presión arterial controlada.', 'Losartán 50 mg por 30 días.', 'Continuar control mensual.'),
  (2003, 15, '2026-05-03', 'Laboratorio', 'Dra. María López', 'Hematología y glucosa', 'Glucosa ligeramente elevada.', 'Continuar observación.', 'Resultados adjuntos a la ficha.');

INSERT INTO laboratory_orders (id, resident_id, medical_visit_id, exams, scheduled_date, doctor_name, status, result_notes) VALUES
  (1045, 27, NULL, 'Perfil tiroideo', '2026-09-10', 'Dra. María López', 'Resultados listos', 'Valores dentro del rango esperado.'),
  (1048, 15, 2003, 'Hematología, glucosa', '2026-09-12', 'Dra. María López', 'Resultados listos', 'Glucosa ligeramente elevada; hematología normal.'),
  (1049, 18, NULL, 'Hemoglobina glicosilada', '2026-09-12', 'Dr. Juan Pérez', 'En procesamiento', NULL),
  (1050, 22, NULL, 'Ácido úrico, PCR', '2026-09-13', 'Dra. Elena Soto', 'Pendiente', NULL),
  (1051, 36, NULL, 'Calcio, vitamina D', '2026-09-14', 'Dr. Juan Pérez', 'Pendiente', NULL);

INSERT INTO medicines (id, name, presentation, stock, maximum_stock, unit_price, minimum_stock) VALUES
  (1, 'Losartán 50 mg', 'Caja · 30 tabletas', 84, 100, 45.00, 20),
  (2, 'Metformina 850 mg', 'Caja · 30 tabletas', 14, 100, 38.00, 20),
  (3, 'Omeprazol 20 mg', 'Caja · 14 cápsulas', 8, 100, 29.00, 20),
  (4, 'Acetaminofén 500 mg', 'Caja · 100 tabletas', 72, 100, 24.00, 20),
  (5, 'Amlodipino 5 mg', 'Caja · 30 tabletas', 45, 100, 52.00, 20),
  (6, 'Calcio + Vitamina D', 'Frasco · 60 tabletas', 27, 100, 68.00, 20);

INSERT INTO cash_movements (movement_date, concept, source, type, category, amount, resident_id) VALUES
  ('2026-09-12', 'Cuota mensual · Paciente #15', 'Ana Méndez', 'Entrada', 'Cuota familiar', 1200.00, 15),
  ('2026-09-11', 'Donación empresarial', 'Alimentos del Pacífico, S.A.', 'Entrada', 'Donación', 8500.00, NULL),
  ('2026-09-10', 'Pago servicio de energía', 'Energuate', 'Salida', 'Gasto operativo', 2340.00, NULL),
  ('2026-09-09', 'Servicios médicos fundación', 'Fundación Vida Plena', 'Salida', 'Pago fundación', 4815.00, NULL),
  ('2026-09-08', 'Donación particular', 'Familia Morales', 'Entrada', 'Donación', 2500.00, NULL),
  ('2026-09-07', 'Pago servicio de agua', 'Municipalidad', 'Salida', 'Gasto operativo', 890.00, NULL);
