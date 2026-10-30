# Arquitectura y modelo de datos

Documento del prototipo local. Las flechas del diagrama de componentes representan comunicación; cada servicio utiliza su propia base de datos.

```mermaid
flowchart LR
  U[Usuario en navegador] --> UI[Interfaz web y Nginx]
  UI --> A[Servicio administrativo y autenticación]
  UI --> R[Servicio de referencias]
  UI --> G[Servicio de gastos médicos]
  A --> AD[(Base administrativa)]
  R --> RD[(Base de referencias)]
  G --> GD[(Base de liquidaciones)]
  R -->|verifica residente y visita| A
  G -->|verifica residente y visita| A
```

## Entidades y relaciones en las bases de datos

Las líneas representan claves foráneas existentes dentro de cada base. Los identificadores de paciente o visita almacenados en otras bases son referencias lógicas sin clave foránea entre bases; los servicios verifican los nuevos vínculos mediante el servicio administrativo.

```mermaid
erDiagram
  residents ||--o{ medical_visits : tiene
  residents ||--o{ laboratory_orders : tiene
  medical_visits o|--o{ laboratory_orders : relaciona
  residents ||--o{ medication_deliveries : recibe
  medical_visits o|--o{ medication_deliveries : relaciona
  medicines ||--o{ medication_deliveries : contiene
  residents o|--o{ cash_movements : relaciona
  medical_referrals ||--o{ referral_events : registra
  medical_liquidations ||--o{ medical_expense_items : contiene
  users {
    int id PK
    string username
    string role
    string password_hash
    boolean active
    timestamp last_login_at
    timestamp created_at
    timestamp updated_at
  }
  residents {
    int id PK
    string full_name
    date birth_date
    string room
    string condition_name
    string family_name
    string family_phone
    string status
    string blood_type
    string psychopathology
    string allergies
    timestamp created_at
  }
  medical_visits {
    int id PK
    int resident_id FK
    date visit_date
    string visit_type
    string doctor_name
    string reason
    text diagnosis
    text treatment
    text observations
    timestamp created_at
  }
  laboratory_orders {
    int id PK
    int resident_id FK
    int medical_visit_id FK
    string exams
    date scheduled_date
    string doctor_name
    string status
    text result_notes
    timestamp created_at
  }
  medicines {
    int id PK
    string name
    string presentation
    int stock
    int maximum_stock
    decimal unit_price
    int minimum_stock
    timestamp created_at
  }
  medication_deliveries {
    int id PK
    int resident_id FK
    int medical_visit_id FK
    int medicine_id FK
    int quantity
    decimal unit_price
    string prescribed_by
    string notes
    timestamp delivered_at
  }
  cash_movements {
    int id PK
    date movement_date
    string concept
    string source
    string type
    string category
    decimal amount
    int resident_id FK
    timestamp created_at
  }
  medical_referrals {
    int id PK
    int patient_id
    string specialty
    string reason
    int referring_doctor_id
    string referring_doctor_name
    int nurse_id
    string nurse_name
    int specialist_doctor_id
    string specialist_doctor_name
    date scheduled_date
    time scheduled_time
    string status
    int medical_visit_id
    string cancellation_reason
    timestamp created_at
    timestamp updated_at
  }
  referral_events {
    int id PK
    int referral_id FK
    string from_status
    string to_status
    string event_type
    string description
    timestamp occurred_at
  }
  medical_liquidations {
    int id PK
    int patient_id
    int medical_visit_id
    string appointment_status
    decimal consultation_amount
    decimal laboratory_subtotal
    decimal pharmacy_subtotal
    decimal gross_total
    decimal foundation_discount_percent
    decimal discount_amount
    decimal total_due
    string currency
    string status
    string void_reason
    timestamp created_at
    timestamp updated_at
  }
  medical_expense_items {
    int id PK
    int liquidation_id FK
    string item_type
    string name
    decimal quantity
    decimal unit_price
    decimal subtotal
    timestamp created_at
  }
```

Para ver todos los campos y restricciones, consultar los archivos `database/init.sql` de cada servicio. Las cuentas están en la base administrativa; los servicios verifican las sesiones firmadas mediante una clave compartida.

## Limitación importante

La conversión de una referencia vincula una visita ya registrada y comprueba que pertenezca al residente; no crea una visita. Las nuevas liquidaciones también validan el residente y su visita. Los registros anteriores no se corrigen automáticamente y el estado de cita de la liquidación sigue siendo proporcionado por el usuario. Las bases son independientes, por lo que la consulta no constituye una transacción distribuida. Se requieren pruebas completas de integración y aceptación antes de usar datos reales.
