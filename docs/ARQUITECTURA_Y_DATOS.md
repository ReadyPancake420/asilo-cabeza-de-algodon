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
```

## Entidades y relaciones en las bases de datos

Las líneas representan claves foráneas existentes dentro de cada base. Los identificadores de paciente o visita almacenados en otras bases son referencias lógicas: actualmente no tienen una clave foránea ni verificación automática entre servicios.

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
  }
  residents {
    int id PK
    string full_name
    date birth_date
    string room
  }
  medical_visits {
    int id PK
    int resident_id FK
    date visit_date
  }
  medical_referrals {
    int id PK
    int patient_id
    string status
  }
  medical_liquidations {
    int id PK
    int patient_id
    int medical_visit_id
    string status
  }
```

Para ver todos los campos y restricciones, consultar los archivos `database/init.sql` de cada servicio. Las cuentas están en la base administrativa; los servicios verifican las sesiones firmadas mediante una clave compartida.

## Limitación importante

La conversión de una referencia registra el identificador de una visita, pero no crea ni verifica que exista o que pertenezca al paciente. Las liquidaciones tampoco verifican esos identificadores contra la base administrativa. Esta integración debe completarse y probarse antes de considerar el sistema listo para datos reales.
