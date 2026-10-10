CREATE TABLE IF NOT EXISTS medical_referrals (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  patient_id BIGINT UNSIGNED NOT NULL,
  specialty VARCHAR(120) NOT NULL,
  reason VARCHAR(1000) NOT NULL,
  referring_doctor_id BIGINT UNSIGNED NOT NULL,
  referring_doctor_name VARCHAR(150) NOT NULL,
  nurse_id BIGINT UNSIGNED NULL,
  nurse_name VARCHAR(150) NULL,
  specialist_doctor_id BIGINT UNSIGNED NULL,
  specialist_doctor_name VARCHAR(150) NULL,
  scheduled_date DATE NULL,
  scheduled_time TIME NULL,
  status ENUM(
    'PENDING_NURSE_ASSIGNMENT',
    'PENDING_FOUNDATION',
    'APPOINTMENT_SCHEDULED',
    'IN_TRANSIT',
    'ATTENDED',
    'COMPLETED',
    'CANCELLED'
  ) NOT NULL DEFAULT 'PENDING_NURSE_ASSIGNMENT',
  medical_visit_id BIGINT UNSIGNED NULL,
  cancellation_reason VARCHAR(250) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_referral_medical_visit (medical_visit_id),
  KEY idx_referral_patient (patient_id),
  KEY idx_referral_status (status),
  KEY idx_referral_specialty (specialty)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS referral_events (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  referral_id BIGINT UNSIGNED NOT NULL,
  from_status VARCHAR(40) NULL,
  to_status VARCHAR(40) NOT NULL,
  event_type ENUM(
    'CREATED',
    'NURSE_ASSIGNED',
    'SCHEDULED',
    'RESCHEDULED',
    'STATUS_CHANGED',
    'CONVERTED_TO_VISIT',
    'CANCELLED'
  ) NOT NULL,
  description VARCHAR(500) NOT NULL,
  occurred_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_event_referral (referral_id, occurred_at),
  CONSTRAINT fk_event_referral
    FOREIGN KEY (referral_id) REFERENCES medical_referrals(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO medical_referrals (
  id, patient_id, specialty, reason,
  referring_doctor_id, referring_doctor_name,
  nurse_id, nurse_name,
  specialist_doctor_id, specialist_doctor_name,
  scheduled_date, scheduled_time, status
) VALUES (
  1, 15, 'Cardiologia', 'Dolor recurrente en el pecho y dificultad para respirar',
  21, 'Dr. Juan Perez',
  8, 'Enfermero Carlos Diaz',
  35, 'Dra. Maria Lopez',
  '2026-09-15', '10:30:00', 'APPOINTMENT_SCHEDULED'
) ON DUPLICATE KEY UPDATE id = id;

INSERT INTO referral_events
  (id, referral_id, from_status, to_status, event_type, description)
VALUES
  (1, 1, NULL, 'PENDING_NURSE_ASSIGNMENT', 'CREATED', 'Referencia creada por el medico general'),
  (2, 1, 'PENDING_NURSE_ASSIGNMENT', 'PENDING_FOUNDATION', 'NURSE_ASSIGNED', 'Enfermero acompañante asignado: Enfermero Carlos Diaz'),
  (3, 1, 'PENDING_FOUNDATION', 'APPOINTMENT_SCHEDULED', 'SCHEDULED', 'Cita programada con Dra. Maria Lopez para 2026-09-15 10:30')
ON DUPLICATE KEY UPDATE id = id;

