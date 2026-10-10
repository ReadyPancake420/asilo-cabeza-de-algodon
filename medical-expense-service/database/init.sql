CREATE TABLE IF NOT EXISTS medical_liquidations (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  medical_visit_id BIGINT UNSIGNED NOT NULL,
  patient_id BIGINT UNSIGNED NOT NULL,
  appointment_status ENUM('SCHEDULED', 'COMPLETED', 'CANCELLED') NOT NULL,
  consultation_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  laboratory_subtotal DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  pharmacy_subtotal DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  gross_total DECIMAL(15,2) NOT NULL,
  foundation_discount_percent DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  discount_amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  total_due DECIMAL(15,2) NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'GTQ',
  status ENUM('FINALIZED', 'VOIDED') NOT NULL DEFAULT 'FINALIZED',
  void_reason VARCHAR(250) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_liquidation_medical_visit (medical_visit_id),
  KEY idx_liquidation_patient (patient_id),
  KEY idx_liquidation_status (status),
  CONSTRAINT chk_discount_percent CHECK (foundation_discount_percent BETWEEN 0 AND 100),
  CONSTRAINT chk_total_due CHECK (total_due >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS medical_expense_items (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  liquidation_id BIGINT UNSIGNED NOT NULL,
  item_type ENUM('LABORATORY', 'PHARMACY') NOT NULL,
  name VARCHAR(150) NOT NULL,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 1.00,
  unit_price DECIMAL(15,2) NOT NULL,
  subtotal DECIMAL(15,2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_item_liquidation (liquidation_id),
  CONSTRAINT fk_item_liquidation
    FOREIGN KEY (liquidation_id) REFERENCES medical_liquidations(id)
    ON DELETE CASCADE,
  CONSTRAINT chk_item_quantity CHECK (quantity > 0),
  CONSTRAINT chk_item_prices CHECK (unit_price >= 0 AND subtotal >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO medical_liquidations (
  id, medical_visit_id, patient_id, appointment_status, consultation_amount,
  laboratory_subtotal, pharmacy_subtotal, gross_total,
  foundation_discount_percent, discount_amount, total_due, currency, status
) VALUES (
  1, 9001, 15, 'COMPLETED', 150.00, 175.00, 90.00,
  415.00, 20.00, 83.00, 332.00, 'GTQ', 'FINALIZED'
) ON DUPLICATE KEY UPDATE id = id;

INSERT INTO medical_expense_items
  (id, liquidation_id, item_type, name, quantity, unit_price, subtotal)
VALUES
  (1, 1, 'LABORATORY', 'Hematologia', 1.00, 100.00, 100.00),
  (2, 1, 'LABORATORY', 'Glucosa', 1.00, 75.00, 75.00),
  (3, 1, 'PHARMACY', 'Losartan', 2.00, 45.00, 90.00)
ON DUPLICATE KEY UPDATE id = id;
