const expenseBase = '/expense';
const referralBase = '/referral';
const adminBase = '/admin';

const state = {
  token: null,
  user: null,
  referrals: [],
  liquidations: [],
  selectedReferralId: null,
  selectedResidentId: 15,
  calculation: null,
  workflow: null,
  adminAction: null,
  adminSummary: null
};

const roleLabels = {
  MEDICO: 'Médico',
  ENFERMERIA: 'Enfermería',
  COORDINACION: 'Coordinación',
  ADMINISTRACION: 'Administración'
};

const viewRoles = {
  expenses: ['COORDINACION', 'ADMINISTRACION'],
  cash: ['ADMINISTRACION'],
  reports: ['COORDINACION', 'ADMINISTRACION']
};

const actionRoles = {
  resident: ['ADMINISTRACION'],
  visit: ['MEDICO'],
  lab: ['MEDICO'],
  'lab-result': ['ENFERMERIA'],
  medicine: ['ENFERMERIA'],
  movement: ['ADMINISTRACION'],
  payment: ['ADMINISTRACION'],
  export: ['COORDINACION', 'ADMINISTRACION'],
  report: ['COORDINACION', 'ADMINISTRACION']
};

const sectionLabels = {
  dashboard: 'Panel principal',
  residents: 'Registro de residentes',
  'medical-records': 'Fichas médicas',
  referrals: 'Citas y referencias',
  laboratory: 'Laboratorio clínico',
  pharmacy: 'Farmacia',
  expenses: 'Gastos médicos',
  cash: 'Caja y donaciones',
  reports: 'Reportes'
};

const statusLabels = {
  PENDING_NURSE_ASSIGNMENT: 'Pendiente de enfermero',
  PENDING_FOUNDATION: 'Pendiente de fundación',
  APPOINTMENT_SCHEDULED: 'Cita programada',
  IN_TRANSIT: 'En traslado',
  ATTENDED: 'Paciente atendido',
  COMPLETED: 'Completada',
  CANCELLED: 'Cancelada',
  FINALIZED: 'Finalizada',
  VOIDED: 'Anulada'
};

const eventLabels = {
  CREATED: 'Referencia creada',
  NURSE_ASSIGNED: 'Enfermero acompañante asignado',
  SCHEDULED: 'Cita programada por la fundación',
  RESCHEDULED: 'Cita reprogramada',
  STATUS_CHANGED: 'Estado actualizado',
  CONVERTED_TO_VISIT: 'Convertida en visita médica',
  CANCELLED: 'Referencia cancelada'
};

const residents = [
  { id: 15, name: 'Carlos Méndez', room: 'A-12', age: 78, condition: 'Hipertensión', family: 'Ana Méndez', status: 'Estable' },
  { id: 18, name: 'Rosa del Carmen López', room: 'A-08', age: 82, condition: 'Diabetes tipo 2', family: 'Miguel López', status: 'En observación' },
  { id: 22, name: 'Ernesto Ramírez', room: 'B-03', age: 74, condition: 'Artritis', family: 'Julia Ramírez', status: 'Estable' },
  { id: 27, name: 'María Elena García', room: 'B-09', age: 86, condition: 'Alzhéimer', family: 'Sofía García', status: 'Estable' },
  { id: 31, name: 'José Antonio Pérez', room: 'C-02', age: 80, condition: 'Cardiopatía', family: 'Luis Pérez', status: 'Hospitalizado' },
  { id: 36, name: 'Dolores Castillo', room: 'C-07', age: 76, condition: 'Osteoporosis', family: 'Marta Castillo', status: 'Estable' }
];

const laboratoryOrders = [
  { id: 1048, patient: 'Carlos Méndez', exams: 'Hematología, glucosa', date: '2026-09-12', doctor: 'Dra. María López', status: 'Resultados listos' },
  { id: 1049, patient: 'Rosa López', exams: 'Hemoglobina glicosilada', date: '2026-09-12', doctor: 'Dr. Juan Pérez', status: 'En procesamiento' },
  { id: 1050, patient: 'Ernesto Ramírez', exams: 'Ácido úrico, PCR', date: '2026-09-13', doctor: 'Dra. Elena Soto', status: 'Pendiente' },
  { id: 1051, patient: 'Dolores Castillo', exams: 'Calcio, vitamina D', date: '2026-09-14', doctor: 'Dr. Juan Pérez', status: 'Pendiente' },
  { id: 1045, patient: 'María García', exams: 'Perfil tiroideo', date: '2026-09-10', doctor: 'Dra. María López', status: 'Resultados listos' }
];

const medicines = [
  { name: 'Losartán 50 mg', presentation: 'Caja · 30 tabletas', stock: 84, max: 100, price: 45, status: 'Disponible' },
  { name: 'Metformina 850 mg', presentation: 'Caja · 30 tabletas', stock: 14, max: 100, price: 38, status: 'Existencia baja' },
  { name: 'Omeprazol 20 mg', presentation: 'Caja · 14 cápsulas', stock: 8, max: 100, price: 29, status: 'Reabastecer' },
  { name: 'Acetaminofén 500 mg', presentation: 'Caja · 100 tabletas', stock: 72, max: 100, price: 24, status: 'Disponible' },
  { name: 'Amlodipino 5 mg', presentation: 'Caja · 30 tabletas', stock: 45, max: 100, price: 52, status: 'Disponible' },
  { name: 'Calcio + Vitamina D', presentation: 'Frasco · 60 tabletas', stock: 27, max: 100, price: 68, status: 'Disponible' }
];

const cashMovements = [
  { date: '2026-09-12', concept: 'Cuota mensual · Paciente #15', source: 'Ana Méndez', type: 'Entrada', amount: 1200 },
  { date: '2026-09-11', concept: 'Donación empresarial', source: 'Alimentos del Pacífico, S.A.', type: 'Entrada', amount: 8500 },
  { date: '2026-09-10', concept: 'Pago servicio de energía', source: 'Energuate', type: 'Salida', amount: 2340 },
  { date: '2026-09-09', concept: 'Servicios médicos fundación', source: 'Fundación Vida Plena', type: 'Salida', amount: 4815 },
  { date: '2026-09-08', concept: 'Donación particular', source: 'Familia Morales', type: 'Entrada', amount: 2500 },
  { date: '2026-09-07', concept: 'Pago servicio de agua', source: 'Municipalidad', type: 'Salida', amount: 890 }
];

const money = new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ', minimumFractionDigits: 2 });
const dateFormatter = new Intl.DateTimeFormat('es-GT', { day: '2-digit', month: 'short', year: 'numeric' });

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function initials(name) {
  return String(name || 'Paciente').split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
}

function number(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatDate(value) {
  if (!value) return 'Sin programar';
  const raw = String(value).slice(0, 10);
  const parsed = new Date(`${raw}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? raw : dateFormatter.format(parsed);
}

function statusTone(status) {
  if (['CANCELLED', 'VOIDED', 'Reabastecer'].includes(status)) return 'danger';
  if (['PENDING_NURSE_ASSIGNMENT', 'PENDING_FOUNDATION', 'Pendiente', 'Existencia baja'].includes(status)) return 'warning';
  if (['APPOINTMENT_SCHEDULED', 'IN_TRANSIT', 'En procesamiento'].includes(status)) return 'info';
  if (['Hospitalizado'].includes(status)) return 'danger';
  if (['En observación'].includes(status)) return 'warning';
  return '';
}

function badge(status, label = statusLabels[status] || status) {
  return `<span class="status-badge ${statusTone(status)}">${escapeHtml(label)}</span>`;
}

function showToast(title, message, error = false) {
  const toast = document.createElement('div');
  toast.className = `toast${error ? ' is-error' : ''}`;
  toast.innerHTML = `<span>${error ? '!' : '✓'}</span><div><strong>${escapeHtml(title)}</strong><small>${escapeHtml(message)}</small></div>`;
  $('#toast-region').append(toast);
  setTimeout(() => toast.remove(), 4800);
}

async function requestJson(url, options = {}) {
  const headers = new Headers(options.headers || {});
  if (state.token && !url.endsWith('/api/v1/auth/login')) headers.set('Authorization', `Bearer ${state.token}`);
  const response = await fetch(url, { ...options, headers });
  const contentType = response.headers.get('content-type') || '';
  const body = contentType.includes('application/json') ? await response.json() : null;
  if (!response.ok) {
    if (response.status === 401 && !url.endsWith('/api/v1/auth/login')) endSession('La sesión venció. Ingrese nuevamente.');
    throw new Error(body?.error?.message || `La solicitud no pudo completarse (${response.status})`);
  }
  return body;
}

function hasRole(...roles) {
  return Boolean(state.user && roles.includes(state.user.role));
}

function canView(viewName) {
  return !viewRoles[viewName] || hasRole(...viewRoles[viewName]);
}

function canRunAction(action) {
  return !actionRoles[action] || hasRole(...actionRoles[action]);
}

function applyRoleAccess() {
  if (!state.user) return;
  $$('[data-nav]').forEach((item) => item.classList.toggle('is-role-hidden', !canView(item.dataset.nav)));
  $$('[data-demo-action]').forEach((item) => item.classList.toggle('is-role-hidden', !canRunAction(item.dataset.demoAction)));
  $$('[data-open-referral]').forEach((item) => item.classList.toggle('is-role-hidden', !hasRole('MEDICO')));
  const expenseEditor = $('.expense-layout');
  if (expenseEditor) expenseEditor.classList.toggle('is-role-hidden', !hasRole('ADMINISTRACION'));
  $('#metric-expenses').closest('.metric-card')?.classList.toggle('is-role-hidden', !hasRole('COORDINACION', 'ADMINISTRACION'));
  $('#profile-initials').textContent = initials(state.user.fullName);
  $('#profile-name').textContent = state.user.fullName;
  $('#profile-role').textContent = roleLabels[state.user.role] || state.user.role;
  if (!canView(location.hash.slice(1))) navigate('dashboard');
}

function endSession(message = '') {
  state.token = null;
  state.user = null;
  sessionStorage.removeItem('asiloToken');
  $('.app-shell').classList.add('is-locked');
  $('#login-screen').hidden = false;
  $('#login-message').textContent = message;
  $$('.modal').forEach((modal) => modal.open && modal.close());
}

async function beginSession(token, user) {
  state.token = token;
  state.user = user;
  sessionStorage.setItem('asiloToken', token);
  $('#login-screen').hidden = true;
  $('.app-shell').classList.remove('is-locked');
  $('#login-message').textContent = '';
  applyRoleAccess();
  await refreshAll();
}

async function login(event) {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const submit = $('#login-submit');
  const credentials = Object.fromEntries(new FormData(form));
  submit.disabled = true;
  $('#login-message').textContent = 'Verificando…';
  try {
    const result = await requestJson(`${adminBase}/api/v1/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(credentials)
    });
    await beginSession(result.data.token, result.data.user);
    showToast('Sesión iniciada', `Acceso de ${roleLabels[result.data.user.role] || result.data.user.role}.`);
  } catch (error) {
    $('#login-message').textContent = error.message;
  } finally {
    submit.disabled = false;
  }
}

function navigate(viewName, updateHash = true) {
  if (!canView(viewName)) viewName = 'dashboard';
  const view = $(`[data-view="${viewName}"]`);
  if (!view) return;
  $$('.view').forEach((item) => item.classList.toggle('is-active', item === view));
  $$('.nav-item').forEach((item) => item.classList.toggle('is-active', item.dataset.nav === viewName));
  $('#section-label').textContent = sectionLabels[viewName] || 'Sistema administrativo';
  $('#sidebar').classList.remove('is-open');
  $('#sidebar-scrim').classList.remove('is-open');
  if (updateHash) history.replaceState(null, '', `#${viewName}`);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function checkHealth() {
  const card = $('#connection-card');
  const banner = $('#health-banner');
  const dot = $('.status-dot', card);
  dot.className = 'status-dot is-loading';
  try {
    const [expense, referral, administration] = await Promise.all([
      requestJson(`${expenseBase}/health`),
      requestJson(`${referralBase}/health`),
      requestJson(`${adminBase}/health`)
    ]);
    if (expense.status !== 'ok' || referral.status !== 'ok' || administration.status !== 'ok') throw new Error('Servicio no disponible');
    dot.className = 'status-dot';
    $('strong', card).textContent = 'Servicios conectados';
    $('small', card).textContent = '3 API y 3 bases activas';
    banner.classList.remove('is-error');
    $('strong', banner).textContent = 'Todos los servicios médicos están activos';
    $('small', banner).textContent = 'Gastos, referencias, administración y sus bases MySQL respondieron correctamente.';
    $('#health-time').textContent = new Intl.DateTimeFormat('es-GT', { hour: '2-digit', minute: '2-digit' }).format(new Date());
    return true;
  } catch (error) {
    dot.className = 'status-dot is-error';
    $('strong', card).textContent = 'Revisar servicios';
    $('small', card).textContent = 'No hay conexión completa';
    banner.classList.add('is-error');
    $('strong', banner).textContent = 'Uno o más servicios no respondieron';
    $('small', banner).textContent = 'Ejecuta INICIAR_DEMO.cmd e intenta actualizar nuevamente.';
    return false;
  }
}

function renderResidents() {
  const query = $('#resident-search').value.trim().toLowerCase();
  const status = $('#resident-filter').value;
  const filtered = residents.filter((resident) => {
    const matchesText = `${resident.name} ${resident.room} ${resident.id}`.toLowerCase().includes(query);
    return matchesText && (!status || resident.status === status);
  });
  $('#residents-table').innerHTML = filtered.length ? filtered.map((resident) => `
    <tr>
      <td><div class="person-cell"><span class="avatar">${initials(resident.name)}</span><span><strong>${escapeHtml(resident.name)}</strong><small>Paciente #${resident.id}</small></span></div></td>
      <td><strong>${escapeHtml(resident.room)}</strong><small>Pabellón ${resident.room[0]}</small></td>
      <td>${resident.age} años</td><td>${escapeHtml(resident.condition)}</td><td>${escapeHtml(resident.family)}</td>
      <td>${badge(resident.status)}</td><td><button class="table-action" type="button" data-resident-id="${resident.id}">Ver ficha</button></td>
    </tr>`).join('') : '<tr><td colspan="7" class="empty-cell">No se encontraron residentes.</td></tr>';
}

function renderLaboratory() {
  const query = $('#lab-search').value.trim().toLowerCase();
  const filtered = laboratoryOrders.filter((order) => `${order.patient} ${order.exams} ${order.id}`.toLowerCase().includes(query));
  $('#laboratory-table').innerHTML = filtered.map((order) => `
    <tr><td><strong>#${order.id}</strong><small>Orden de laboratorio</small></td><td>${escapeHtml(order.patient)}</td><td>${escapeHtml(order.exams)}</td><td>${formatDate(order.date)}</td><td>${escapeHtml(order.doctor)}</td><td>${badge(order.status)}</td><td><button class="table-action" type="button" data-demo-action="lab-result" data-lab-id="${order.id}">${order.status === 'Resultados listos' ? 'Ver resultado' : 'Abrir orden'}</button></td></tr>`).join('');
}

function renderPharmacy() {
  const query = $('#medicine-search').value.trim().toLowerCase();
  const filtered = medicines.filter((medicine) => medicine.name.toLowerCase().includes(query));
  $('#pharmacy-table').innerHTML = filtered.map((medicine) => `
    <tr><td><strong>${escapeHtml(medicine.name)}</strong><small>Código MED-${String(medicines.indexOf(medicine) + 1).padStart(3, '0')}</small></td><td>${escapeHtml(medicine.presentation)}</td><td><strong>${medicine.stock} unidades</strong><div class="stock-meter ${medicine.stock < 20 ? 'low' : ''}" style="--stock:${medicine.stock}%"><i></i></div></td><td>${money.format(medicine.price)}</td><td>${badge(medicine.status)}</td></tr>`).join('');
}

function renderCash() {
  const type = $('#cash-type-filter').value;
  const filtered = cashMovements.filter((movement) => !type || movement.type === type);
  $('#cash-table').innerHTML = filtered.map((movement) => `
    <tr><td>${formatDate(movement.date)}</td><td><strong>${escapeHtml(movement.concept)}</strong></td><td>${escapeHtml(movement.source)}</td><td>${badge(movement.type, movement.type)}</td><td class="${movement.type === 'Entrada' ? 'amount-positive' : 'amount-negative'}">${movement.type === 'Entrada' ? '+' : '−'} ${money.format(movement.amount)}</td></tr>`).join('');
}

function renderAdministrationMetrics() {
  const summary = state.adminSummary;
  if (!summary) return;
  const totalResidents = number(summary.residents?.total);
  const hospitalized = number(summary.residents?.hospitalized);
  const labTotal = number(summary.laboratory?.total);
  const labPending = number(summary.laboratory?.pending);
  const labReady = number(summary.laboratory?.ready);
  const income = number(summary.cash?.income);
  const expenses = number(summary.cash?.expenses);
  const capacity = 60;
  const occupancy = Math.min(100, Math.round((totalResidents / capacity) * 100));
  $('#metric-residents').textContent = totalResidents;
  $('#metric-residents-detail').textContent = `${totalResidents - hospitalized} activos · ${hospitalized} hospitalizado${hospitalized === 1 ? '' : 's'}`;
  $('#metric-lab-pending').textContent = labPending;
  $('#metric-lab-processing').textContent = Math.max(0, labTotal - labPending - labReady);
  $('#metric-lab-ready').textContent = labReady;
  $('#metric-cash-income').textContent = money.format(income);
  $('#metric-cash-expenses').textContent = money.format(expenses);
  $('#metric-cash-balance').textContent = money.format(income - expenses);
  $('#occupancy-percent').textContent = `${occupancy}%`;
  $('#occupancy-residents').textContent = `${totalResidents} residentes registrados`;
  $('#occupancy-available').textContent = `${Math.max(0, capacity - totalResidents)} espacios disponibles`;
  $('#occupancy-donut').style.setProperty('--occupancy', `${occupancy}%`);
}

function replaceItems(target, values) {
  target.splice(0, target.length, ...(values || []));
}

async function loadAdministration() {
  const [residentResult, laboratoryResult, medicineResult, cashResult, summaryResult] = await Promise.all([
    requestJson(`${adminBase}/api/v1/residents`),
    requestJson(`${adminBase}/api/v1/laboratory-orders`),
    requestJson(`${adminBase}/api/v1/medicines`),
    hasRole('ADMINISTRACION') ? requestJson(`${adminBase}/api/v1/cash-movements`) : Promise.resolve({ data: [] }),
    hasRole('COORDINACION', 'ADMINISTRACION') ? requestJson(`${adminBase}/api/v1/reports/summary`) : Promise.resolve({ data: null })
  ]);
  replaceItems(residents, residentResult.data);
  replaceItems(laboratoryOrders, laboratoryResult.data);
  replaceItems(medicines, medicineResult.data);
  replaceItems(cashMovements, cashResult.data);
  state.adminSummary = summaryResult.data || {
    residents: { total: residentResult.data.length, hospitalized: residentResult.data.filter((item) => item.status === 'Hospitalizado').length },
    laboratory: {
      total: laboratoryResult.data.length,
      pending: laboratoryResult.data.filter((item) => item.status === 'Pendiente').length,
      ready: laboratoryResult.data.filter((item) => item.status === 'Resultados listos').length
    },
    pharmacy: { total: medicineResult.data.length, lowStock: medicineResult.data.filter((item) => item.stock < item.minimumStock).length },
    cash: { income: 0, expenses: 0 }
  };
  renderResidents();
  renderLaboratory();
  renderPharmacy();
  renderCash();
  renderAdministrationMetrics();
  applyRoleAccess();
  const residentExists = residents.some((item) => item.id === state.selectedResidentId);
  if (!residentExists && residents[0]) state.selectedResidentId = residents[0].id;
  if (state.selectedResidentId) await loadMedicalRecord(state.selectedResidentId);
}

async function loadMedicalRecord(id) {
  const result = await requestJson(`${adminBase}/api/v1/residents/${id}`);
  const { resident, visits } = result.data;
  state.selectedResidentId = resident.id;
  $('#patient-card').innerHTML = `
    <div class="patient-profile"><span>${initials(resident.name)}</span><div><p>Residente seleccionado</p><h2>${escapeHtml(resident.name)}</h2><small>Paciente #${resident.id} · Habitación ${escapeHtml(resident.room)}</small></div></div>
    <dl class="patient-data"><div><dt>Fecha de nacimiento</dt><dd>${formatDate(resident.birthDate)}</dd></div><div><dt>Tipo de sangre</dt><dd>${escapeHtml(resident.bloodType || 'No registrado')}</dd></div><div><dt>Psicopatología</dt><dd>${escapeHtml(resident.psychopathology || 'Sin registro')}</dd></div><div><dt>Alergias</dt><dd>${escapeHtml(resident.allergies || 'Ninguna conocida')}</dd></div><div><dt>Responsable familiar</dt><dd>${escapeHtml(resident.family)} · ${escapeHtml(resident.familyPhone)}</dd></div></dl>
    <div class="record-alert"><strong>Padecimiento principal</strong><span>${escapeHtml(resident.condition)} · Estado: ${escapeHtml(resident.status)}</span></div>`;
  $('#medical-timeline').innerHTML = visits.length ? visits.map((visit) => `
    <li><time>${formatDate(visit.visitDate)}</time><div><span class="visit-type">${escapeHtml(visit.visitType)}</span><h3>${escapeHtml(visit.reason)}</h3><p><strong>Diagnóstico:</strong> ${escapeHtml(visit.diagnosis)}</p><small>${escapeHtml(visit.doctorName)}${visit.treatment ? ` · Tratamiento: ${escapeHtml(visit.treatment)}` : ''}${visit.observations ? ` · ${escapeHtml(visit.observations)}` : ''}</small></div></li>`).join('') : '<li><div><h3>Sin visitas registradas</h3><p>Utiliza “Nueva visita médica” para iniciar el historial.</p></div></li>';
}

async function selectResident(id) {
  navigate('medical-records');
  try {
    await loadMedicalRecord(number(id));
  } catch (error) {
    showToast('No fue posible abrir la ficha', error.message, true);
  }
}

async function loadLiquidations(filters = {}) {
  const params = new URLSearchParams();
  if (filters.patientId) params.set('patientId', filters.patientId);
  if (filters.status) params.set('status', filters.status);
  try {
    const result = await requestJson(`${expenseBase}/api/v1/liquidations${params.size ? `?${params}` : ''}`);
    state.liquidations = result.data || [];
    renderLiquidations();
    renderDashboardMetrics();
  } catch (error) {
    $('#liquidations-table').innerHTML = `<tr><td colspan="9" class="empty-cell">${escapeHtml(error.message)}</td></tr>`;
  }
}

function renderLiquidations() {
  const tbody = $('#liquidations-table');
  if (!state.liquidations.length) {
    tbody.innerHTML = '<tr><td colspan="9" class="empty-cell">No hay liquidaciones con estos filtros.</td></tr>';
    return;
  }
  tbody.innerHTML = state.liquidations.map((item) => `
    <tr><td><strong>#${item.id}</strong><small>Liquidación médica</small></td><td>Paciente #${item.patientId}</td><td>#${item.medicalVisitId}</td><td>${formatDate(item.createdAt)}</td><td>${money.format(number(item.grossTotal))}</td><td>− ${money.format(number(item.discountAmount))}</td><td><strong>${money.format(number(item.totalDue))}</strong></td><td>${badge(item.status)}</td><td><button class="table-action" type="button" data-liquidation-id="${item.id}">Detalle</button></td></tr>`).join('');
}

async function loadReferrals(filters = {}) {
  const params = new URLSearchParams();
  if (filters.patientId) params.set('patientId', filters.patientId);
  if (filters.status) params.set('status', filters.status);
  try {
    const result = await requestJson(`${referralBase}/api/v1/referrals${params.size ? `?${params}` : ''}`);
    state.referrals = result.data || [];
    renderReferrals();
    renderDashboardMetrics();
    renderDashboardReferrals();
    renderDashboardAppointments();
  } catch (error) {
    $('#referrals-table').innerHTML = `<tr><td colspan="6" class="empty-cell">${escapeHtml(error.message)}</td></tr>`;
    $('#dashboard-referrals').innerHTML = `<p class="empty-cell">${escapeHtml(error.message)}</p>`;
  }
}

function renderReferrals() {
  const tbody = $('#referrals-table');
  if (!state.referrals.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="empty-cell">No hay referencias con estos filtros.</td></tr>';
    return;
  }
  tbody.innerHTML = state.referrals.map((referral) => `
    <tr><td><strong>#${referral.id}</strong><small>${escapeHtml(referral.referringDoctorName)}</small></td><td>Paciente #${referral.patientId}</td><td>${escapeHtml(referral.specialty)}</td><td><strong>${formatDate(referral.scheduledDate)}</strong><small>${referral.scheduledTime || 'Hora pendiente'}</small></td><td>${badge(referral.status)}</td><td><button class="table-action" type="button" data-referral-id="${referral.id}">Seguimiento</button></td></tr>`).join('');
}

function renderDashboardMetrics() {
  const active = state.referrals.filter((item) => !['COMPLETED', 'CANCELLED'].includes(item.status));
  const scheduled = state.referrals.filter((item) => item.status === 'APPOINTMENT_SCHEDULED');
  const total = state.liquidations.filter((item) => item.status === 'FINALIZED').reduce((sum, item) => sum + number(item.totalDue), 0);
  $('#metric-referrals').textContent = active.length;
  $('#metric-scheduled').textContent = scheduled.length;
  $('#metric-expenses').textContent = money.format(total);
  $('#nav-referral-count').textContent = active.length;
}

function renderDashboardReferrals() {
  const container = $('#dashboard-referrals');
  const items = state.referrals.slice(0, 4);
  if (!items.length) {
    container.innerHTML = '<p class="empty-cell">No hay referencias recientes.</p>';
    return;
  }
  container.innerHTML = items.map((referral) => `
    <div class="activity-row"><div class="activity-person"><span class="avatar">P${referral.patientId}</span><span><strong>Paciente #${referral.patientId}</strong><small>Referencia #${referral.id}</small></span></div><div class="activity-meta"><strong>${escapeHtml(referral.specialty)}</strong><small>${escapeHtml(referral.specialistDoctorName || 'Especialista por asignar')}</small></div><button class="table-action" type="button" data-dashboard-referral="${referral.id}">${statusLabels[referral.status] || referral.status}</button></div>`).join('');
}

function renderDashboardAppointments() {
  const container = $('#dashboard-appointments');
  const scheduled = state.referrals.filter((item) => item.scheduledDate).slice(0, 3);
  const fallback = [{ patientId: 18, specialty: 'Endocrinología', specialistDoctorName: 'Dr. Estuardo Ruiz', scheduledDate: '2026-09-17', scheduledTime: '09:00' }];
  const items = scheduled.length ? scheduled : fallback;
  container.innerHTML = items.map((item) => {
    const parsed = new Date(`${String(item.scheduledDate).slice(0,10)}T12:00:00`);
    return `<div class="appointment-row"><span class="date-tile"><strong>${parsed.getDate()}</strong><small>${new Intl.DateTimeFormat('es-GT',{month:'short'}).format(parsed).toUpperCase()}</small></span><div><strong>Paciente #${item.patientId} · ${escapeHtml(item.specialty)}</strong><small>${escapeHtml(item.specialistDoctorName || 'Médico por asignar')}</small></div><time>${escapeHtml(item.scheduledTime || '--:--')}</time></div>`;
  }).join('');
}

async function selectReferral(id) {
  state.selectedReferralId = Number(id);
  const detail = $('#referral-detail');
  detail.innerHTML = '<div class="empty-state"><h2>Consultando referencia…</h2></div>';
  try {
    const result = await requestJson(`${referralBase}/api/v1/referrals/${id}`);
    renderReferralDetail(result.data);
  } catch (error) {
    detail.innerHTML = `<div class="empty-state"><h2>No fue posible consultar</h2><p>${escapeHtml(error.message)}</p></div>`;
  }
}

function referralActionButtons(referral) {
  const buttons = [];
  if (referral.status === 'PENDING_NURSE_ASSIGNMENT' && hasRole('COORDINACION')) buttons.push(['nurse', 'Asignar enfermero']);
  if (referral.status === 'PENDING_FOUNDATION' && hasRole('COORDINACION')) buttons.push(['schedule', 'Programar cita']);
  if (referral.status === 'APPOINTMENT_SCHEDULED') {
    if (hasRole('ENFERMERIA')) buttons.push(['transit', 'Iniciar traslado']);
    if (hasRole('COORDINACION')) buttons.push(['schedule', 'Reprogramar']);
  }
  if (referral.status === 'IN_TRANSIT' && hasRole('ENFERMERIA')) buttons.push(['attended', 'Marcar atención']);
  if (referral.status === 'ATTENDED' && hasRole('COORDINACION')) buttons.push(['convert', 'Convertir en visita']);
  if (!['ATTENDED', 'COMPLETED', 'CANCELLED'].includes(referral.status) && hasRole('COORDINACION')) buttons.push(['cancel', 'Cancelar']);
  return buttons.map(([action, label], index) => `<button class="${index === 0 ? 'primary-button' : 'outline-button'} small" type="button" data-workflow="${action}" data-id="${referral.id}">${label}</button>`).join('');
}

function renderReferralDetail(referral) {
  $('#referral-detail').innerHTML = `
    <div class="detail-head"><div><p class="eyebrow">Referencia #${referral.id}</p><h2>Paciente #${referral.patientId}</h2><p>${escapeHtml(referral.specialty)}</p></div>${badge(referral.status)}</div>
    <dl class="detail-data"><div><dt>Médico general</dt><dd>${escapeHtml(referral.referringDoctorName)}</dd></div><div><dt>Enfermero acompañante</dt><dd>${escapeHtml(referral.nurseName || 'Pendiente')}</dd></div><div><dt>Especialista</dt><dd>${escapeHtml(referral.specialistDoctorName || 'Pendiente')}</dd></div><div><dt>Fecha y hora</dt><dd>${formatDate(referral.scheduledDate)}${referral.scheduledTime ? ` · ${escapeHtml(referral.scheduledTime)}` : ''}</dd></div></dl>
    <div class="reason-box"><strong>Motivo de la referencia</strong><p>${escapeHtml(referral.reason)}</p></div>
    <div class="detail-actions">${referralActionButtons(referral) || '<span class="status-badge neutral">El flujo ha finalizado</span>'}</div>
    <h3 class="timeline-title">Trazabilidad completa</h3>
    <ol class="referral-timeline">${(referral.timeline || []).map((event) => `<li><strong>${escapeHtml(eventLabels[event.eventType] || event.eventType)}</strong><span>${escapeHtml(event.description)}</span><time>${formatDate(event.occurredAt)}</time></li>`).join('')}</ol>`;
}

function workflowConfig(action) {
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const uniqueVisit = Math.floor(Date.now() / 1000) % 100000000;
  const configs = {
    nurse: { kicker: 'Asignación del asilo', title: 'Asignar enfermero acompañante', description: 'El enfermero será responsable de acompañar al paciente.', submit: 'Asignar enfermero', fields: `<div class="form-grid two"><label><span>ID del enfermero *</span><input name="nurseId" type="number" min="1" value="8" required></label><label><span>Nombre completo *</span><input name="nurseName" minlength="3" value="Enfermero Carlos Díaz" required></label></div>` },
    schedule: { kicker: 'Módulo de la fundación', title: 'Programar atención con especialista', description: 'Asigna médico, fecha y hora para la consulta.', submit: 'Guardar programación', fields: `<div class="form-grid two"><label><span>ID del especialista *</span><input name="specialistDoctorId" type="number" min="1" value="35" required></label><label><span>Nombre del especialista *</span><input name="specialistDoctorName" minlength="3" value="Dra. María López" required></label><label><span>Fecha *</span><input name="scheduledDate" type="date" value="${tomorrow}" required></label><label><span>Hora *</span><input name="scheduledTime" type="time" value="10:30" required></label></div>` },
    transit: { kicker: 'Traslado del paciente', title: 'Iniciar traslado', description: 'La referencia cambiará al estado “En traslado”.', submit: 'Confirmar traslado', fields: '<p class="reason-box">Confirma que el paciente salió del asilo acompañado por el enfermero asignado.</p>' },
    attended: { kicker: 'Confirmación médica', title: 'Marcar paciente atendido', description: 'El especialista ya recibió y evaluó al paciente.', submit: 'Confirmar atención', fields: '<p class="reason-box">Después de confirmar, la solicitud podrá convertirse en una visita médica.</p>' },
    convert: { kicker: 'Creación de ficha médica', title: 'Convertir en visita médica', description: 'Relaciona la referencia atendida con una nueva visita.', submit: 'Crear relación', fields: `<div class="form-grid"><label><span>ID de la nueva visita médica *</span><input name="medicalVisitId" type="number" min="1" value="${uniqueVisit}" required></label></div>` },
    cancel: { kicker: 'Cambio de estado', title: 'Cancelar referencia', description: 'El motivo quedará guardado en la trazabilidad.', submit: 'Cancelar referencia', fields: '<div class="form-grid"><label><span>Motivo de cancelación *</span><textarea name="reason" minlength="5" maxlength="250" rows="3" required>La cita fue cancelada por indicación médica.</textarea></label></div>' }
  };
  return configs[action];
}

function openWorkflow(action, id) {
  const allowedRoles = {
    nurse: ['COORDINACION'], schedule: ['COORDINACION'], convert: ['COORDINACION'], cancel: ['COORDINACION'],
    transit: ['ENFERMERIA'], attended: ['ENFERMERIA']
  };
  if (!hasRole(...(allowedRoles[action] || []))) {
    showToast('Acción no permitida', 'Su rol no tiene permiso para realizar este cambio.', true);
    return;
  }
  const config = workflowConfig(action);
  if (!config) return;
  state.workflow = { action, id: Number(id) };
  $('#workflow-kicker').textContent = config.kicker;
  $('#workflow-title').textContent = config.title;
  $('#workflow-description').textContent = config.description;
  $('#workflow-submit').textContent = config.submit;
  $('#workflow-fields').innerHTML = config.fields;
  $('#workflow-modal').showModal();
}

async function submitWorkflow(event) {
  event.preventDefault();
  const form = event.currentTarget;
  if (event.submitter?.value === 'cancel') {
    form.closest('dialog')?.close();
    return;
  }
  if (!form.reportValidity() || !state.workflow) return;
  const { action, id } = state.workflow;
  const data = Object.fromEntries(new FormData(form));
  let url;
  let method = 'PATCH';
  let body;
  if (action === 'nurse') {
    url = `${referralBase}/api/v1/referrals/${id}/nurse`;
    body = { nurseId: number(data.nurseId), nurseName: data.nurseName };
  } else if (action === 'schedule') {
    url = `${referralBase}/api/v1/referrals/${id}/schedule`;
    body = { specialistDoctorId: number(data.specialistDoctorId), specialistDoctorName: data.specialistDoctorName, scheduledDate: data.scheduledDate, scheduledTime: data.scheduledTime };
  } else if (action === 'convert') {
    url = `${referralBase}/api/v1/referrals/${id}/convert-to-visit`;
    method = 'POST';
    body = { medicalVisitId: number(data.medicalVisitId) };
  } else {
    url = `${referralBase}/api/v1/referrals/${id}/status`;
    const status = action === 'transit' ? 'IN_TRANSIT' : action === 'attended' ? 'ATTENDED' : 'CANCELLED';
    body = { status, ...(action === 'cancel' ? { reason: data.reason } : {}) };
  }
  const submit = $('#workflow-submit');
  submit.disabled = true;
  try {
    await requestJson(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    $('#workflow-modal').close();
    showToast('Referencia actualizada', 'El cambio fue registrado en la línea de tiempo.');
    await loadReferrals();
    await selectReferral(id);
  } catch (error) {
    showToast('No fue posible actualizar', error.message, true);
  } finally {
    submit.disabled = false;
  }
}

async function createReferral(event) {
  event.preventDefault();
  const form = event.currentTarget;
  if (event.submitter?.value === 'cancel') {
    form.closest('dialog')?.close();
    return;
  }
  if (!form.reportValidity()) return;
  const values = Object.fromEntries(new FormData(form));
  const submit = $('#create-referral-submit');
  submit.disabled = true;
  try {
    const result = await requestJson(`${referralBase}/api/v1/referrals`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientId: number(values.patientId), specialty: values.specialty, reason: values.reason, referringDoctorId: number(values.referringDoctorId), referringDoctorName: values.referringDoctorName })
    });
    $('#referral-modal').close();
    navigate('referrals');
    showToast('Referencia creada', 'La solicitud quedó pendiente de asignación de enfermero.');
    await loadReferrals();
    await selectReferral(result.data.id);
  } catch (error) {
    showToast('No fue posible crear la referencia', error.message, true);
  } finally {
    submit.disabled = false;
  }
}

function addExpenseItem(type, values = {}) {
  const fragment = $('#expense-item-template').content.cloneNode(true);
  const row = $('.expense-item', fragment);
  row.dataset.type = type;
  $('.item-name', row).value = values.name || '';
  $('.item-quantity', row).value = values.quantity ?? 1;
  $('.item-price', row).value = values.unitPrice ?? 0;
  $('.remove-item', row).addEventListener('click', () => {
    row.remove();
    invalidateCalculation();
  });
  row.addEventListener('input', invalidateCalculation);
  $(`#${type}-items`).append(fragment);
  invalidateCalculation();
}

function invalidateCalculation() {
  state.calculation = null;
  $('#save-expense').disabled = true;
  $('#expense-message').textContent = 'Hay cambios pendientes. Calcula nuevamente antes de guardar.';
}

function collectItems(type) {
  return $$('.expense-item', $(`#${type}-items`)).map((row) => ({
    name: $('.item-name', row).value.trim(),
    quantity: number($('.item-quantity', row).value),
    unitPrice: number($('.item-price', row).value)
  }));
}

function expensePayload(includeRecordFields = false) {
  const form = $('#expense-form');
  if (!form.reportValidity()) return null;
  const values = Object.fromEntries(new FormData(form));
  const payload = {
    consultationAmount: number(values.consultationAmount),
    foundationDiscountPercent: number(values.foundationDiscountPercent),
    laboratoryItems: collectItems('laboratory'),
    pharmacyItems: collectItems('pharmacy')
  };
  if (includeRecordFields) {
    payload.patientId = number(values.patientId);
    payload.medicalVisitId = number(values.medicalVisitId);
    payload.appointmentStatus = values.appointmentStatus;
  }
  return payload;
}

function renderCalculation(calculation) {
  $('#calc-consultation').textContent = money.format(number(calculation.consultationAmount));
  $('#calc-laboratory').textContent = money.format(number(calculation.laboratorySubtotal));
  $('#calc-pharmacy').textContent = money.format(number(calculation.pharmacySubtotal));
  $('#calc-gross').textContent = money.format(number(calculation.grossTotal));
  $('#calc-discount').textContent = `− ${money.format(number(calculation.discountAmount))}`;
  $('#calc-total').textContent = money.format(number(calculation.totalDue));
}

async function calculateExpense() {
  const payload = expensePayload(false);
  if (!payload) return;
  const button = $('#calculate-expense');
  button.disabled = true;
  $('#expense-message').textContent = 'Consultando el microservicio de gastos…';
  try {
    const result = await requestJson(`${expenseBase}/api/v1/liquidations/preview`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    state.calculation = result.data;
    renderCalculation(result.data);
    const cancelled = new FormData($('#expense-form')).get('appointmentStatus') === 'CANCELLED';
    $('#save-expense').disabled = cancelled;
    $('#expense-message').textContent = cancelled ? 'Cálculo correcto, pero una cita cancelada no puede liquidarse.' : 'Cálculo recibido correctamente. Ya puedes guardar la liquidación.';
    showToast('Cálculo completado', `Total a cargar: ${money.format(number(result.data.totalDue))}`);
  } catch (error) {
    $('#expense-message').textContent = error.message;
    showToast('Error de cálculo', error.message, true);
  } finally {
    button.disabled = false;
  }
}

async function saveExpense() {
  if (!state.calculation) return;
  const payload = expensePayload(true);
  if (!payload) return;
  const button = $('#save-expense');
  button.disabled = true;
  try {
    const result = await requestJson(`${expenseBase}/api/v1/liquidations`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    showToast('Liquidación guardada', `Se creó el registro #${result.data.id} por ${money.format(number(result.data.totalDue))}.`);
    $('#medical-visit-id').value = Math.floor(Date.now() / 1000) % 100000000;
    state.calculation = null;
    $('#expense-message').textContent = 'Liquidación registrada. Puedes preparar una nueva operación.';
    await loadLiquidations();
  } catch (error) {
    showToast('No fue posible guardar', error.message, true);
    button.disabled = false;
  }
}

async function showLiquidation(id) {
  try {
    const result = await requestJson(`${expenseBase}/api/v1/liquidations/${id}`);
    const item = result.data;
    $('#liquidation-title').textContent = `Liquidación #${item.id}`;
    $('#liquidation-body').innerHTML = `
      <dl class="detail-money"><div><dt>Paciente</dt><dd>#${item.patientId}</dd></div><div><dt>Visita médica</dt><dd>#${item.medicalVisitId}</dd></div><div><dt>Consulta</dt><dd>${money.format(number(item.consultationAmount))}</dd></div><div><dt>Laboratorio</dt><dd>${money.format(number(item.laboratorySubtotal))}</dd></div><div><dt>Farmacia</dt><dd>${money.format(number(item.pharmacySubtotal))}</dd></div><div><dt>Descuento (${number(item.foundationDiscountPercent)}%)</dt><dd>− ${money.format(number(item.discountAmount))}</dd></div><div class="total-row"><dt>Total</dt><dd>${money.format(number(item.totalDue))}</dd></div></dl>
      <div class="detail-items"><h3>Detalle de servicios y productos</h3>${(item.items || []).map((entry) => `<p>${entry.itemType === 'LABORATORY' ? 'Laboratorio' : 'Farmacia'} · ${escapeHtml(entry.name)} · ${number(entry.quantity)} × ${money.format(number(entry.unitPrice))}</p>`).join('') || '<p>Sin renglones adicionales.</p>'}</div>`;
    $('#liquidation-modal').showModal();
  } catch (error) {
    showToast('No fue posible consultar', error.message, true);
  }
}

function residentOptions(selectedId = state.selectedResidentId) {
  return residents.map((resident) => `<option value="${resident.id}"${resident.id === number(selectedId) ? ' selected' : ''}>#${resident.id} · ${escapeHtml(resident.name)}</option>`).join('');
}

function medicineOptions() {
  return medicines.map((medicine) => `<option value="${medicine.id}">${escapeHtml(medicine.name)} · ${medicine.stock} disponibles</option>`).join('');
}

function adminFormConfig(action, contextId) {
  const today = new Date().toISOString().slice(0, 10);
  const order = laboratoryOrders.find((item) => item.id === number(contextId));
  const configs = {
    resident: {
      kicker: 'Registro del asilo', title: 'Nuevo residente', description: 'Guarda sus datos personales, médicos y del responsable familiar.', submit: 'Guardar residente',
      fields: `<div class="form-grid two"><label><span>Nombre completo *</span><input name="name" minlength="3" maxlength="150" required></label><label><span>Fecha de nacimiento *</span><input name="birthDate" type="date" value="1950-01-01" max="${today}" required></label><label><span>Habitación *</span><input name="room" maxlength="20" placeholder="A-01" required></label><label><span>Estado *</span><select name="status"><option>Estable</option><option>En observación</option><option>Hospitalizado</option></select></label><label class="span-two"><span>Padecimiento principal *</span><input name="condition" minlength="2" maxlength="180" required></label><label><span>Responsable familiar *</span><input name="family" minlength="3" maxlength="150" required></label><label><span>Teléfono *</span><input name="familyPhone" minlength="4" maxlength="30" required></label><label><span>Tipo de sangre</span><input name="bloodType" value="No registrado" maxlength="20"></label><label><span>Psicopatología</span><input name="psychopathology" maxlength="180"></label><label class="span-two"><span>Alergias</span><input name="allergies" maxlength="250" value="Ninguna conocida"></label></div>`
    },
    visit: {
      kicker: 'Historial clínico', title: 'Nueva visita médica', description: 'La atención quedará agregada a la ficha del residente seleccionado.', submit: 'Registrar visita',
      fields: `<div class="form-grid two"><label><span>Residente *</span><select name="residentId" required>${residentOptions()}</select></label><label><span>Fecha *</span><input name="visitDate" type="date" value="${today}" required></label><label><span>Tipo de atención *</span><input name="visitType" value="Medicina general" minlength="3" required></label><label><span>Médico *</span><input name="doctorName" value="Dr. Juan Pérez" minlength="3" required></label><label class="span-two"><span>Motivo *</span><textarea name="reason" minlength="5" rows="2" required></textarea></label><label class="span-two"><span>Diagnóstico *</span><textarea name="diagnosis" minlength="3" rows="3" required></textarea></label><label class="span-two"><span>Tratamiento</span><textarea name="treatment" rows="2"></textarea></label><label class="span-two"><span>Observaciones</span><textarea name="observations" rows="2"></textarea></label></div>`
    },
    lab: {
      kicker: 'Laboratorio clínico', title: 'Nueva orden de laboratorio', description: 'Asocia los exámenes solicitados con el residente y, opcionalmente, una visita.', submit: 'Crear orden',
      fields: `<div class="form-grid two"><label><span>Residente *</span><select name="residentId" required>${residentOptions()}</select></label><label><span>ID de visita médica</span><input name="medicalVisitId" type="number" min="1" placeholder="Opcional"></label><label><span>Fecha programada *</span><input name="date" type="date" value="${today}" required></label><label><span>Médico solicitante *</span><input name="doctor" value="Dr. Juan Pérez" minlength="3" required></label><label class="span-two"><span>Exámenes solicitados *</span><textarea name="exams" minlength="3" rows="3" placeholder="Hematología, glucosa..." required></textarea></label><label><span>Estado *</span><select name="status"><option>Pendiente</option><option>En procesamiento</option><option>Resultados listos</option></select></label></div>`
    },
    'lab-result': {
      kicker: `Orden de laboratorio #${order?.id || contextId}`, title: order?.status === 'Resultados listos' ? 'Consultar o actualizar resultado' : 'Registrar resultado clínico', description: order ? `${order.patient} · ${order.exams}` : 'Actualiza el estado y las observaciones del laboratorio.', submit: 'Guardar resultado',
      fields: `<div class="form-grid"><label><span>Estado *</span><select name="status"><option${order?.status === 'Pendiente' ? ' selected' : ''}>Pendiente</option><option${order?.status === 'En procesamiento' ? ' selected' : ''}>En procesamiento</option><option${order?.status === 'Resultados listos' ? ' selected' : ''}>Resultados listos</option></select></label><label><span>Resultado u observaciones *</span><textarea name="resultNotes" minlength="3" maxlength="2000" rows="5" required>${escapeHtml(order?.resultNotes || '')}</textarea></label></div>`
    },
    medicine: {
      kicker: 'Farmacia', title: 'Registrar entrega de medicamento', description: 'Descuenta automáticamente la cantidad entregada del inventario.', submit: 'Registrar entrega',
      fields: `<div class="form-grid two"><label><span>Residente *</span><select name="residentId" required>${residentOptions()}</select></label><label><span>Medicamento *</span><select name="medicineId" required>${medicineOptions()}</select></label><label><span>Cantidad *</span><input name="quantity" type="number" min="1" value="1" required></label><label><span>ID de visita médica</span><input name="medicalVisitId" type="number" min="1" placeholder="Opcional"></label><label class="span-two"><span>Prescrito por *</span><input name="prescribedBy" value="Dr. Juan Pérez" minlength="3" required></label><label class="span-two"><span>Indicaciones</span><textarea name="notes" rows="3" placeholder="Dosis y frecuencia"></textarea></label></div>`
    },
    movement: {
      kicker: 'Libro de caja', title: 'Nuevo movimiento', description: 'Registra una entrada o salida con su categoría y procedencia.', submit: 'Guardar movimiento',
      fields: `<div class="form-grid two"><label><span>Fecha *</span><input name="date" type="date" value="${today}" required></label><label><span>Tipo *</span><select name="type"><option>Entrada</option><option>Salida</option></select></label><label class="span-two"><span>Concepto *</span><input name="concept" minlength="3" maxlength="250" required></label><label><span>Origen o responsable *</span><input name="source" minlength="2" maxlength="180" required></label><label><span>Categoría *</span><select name="category"><option>Cuota familiar</option><option>Donación</option><option>Gasto operativo</option><option>Pago fundación</option><option>Pago médico</option><option>Otro</option></select></label><label><span>Monto *</span><div class="money-input"><b>Q</b><input name="amount" type="number" min="0.01" step="0.01" required></div></label><label><span>ID de residente</span><input name="residentId" type="number" min="1" placeholder="Opcional"></label></div>`
    },
    payment: {
      kicker: 'Cuenta familiar', title: 'Registrar pago familiar', description: 'El pago se guardará como entrada asociada al residente.', submit: 'Aplicar pago',
      fields: `<input name="type" type="hidden" value="Entrada"><input name="category" type="hidden" value="Cuota familiar"><div class="form-grid two"><label><span>Residente *</span><select name="residentId" required>${residentOptions(15)}</select></label><label><span>Fecha *</span><input name="date" type="date" value="${today}" required></label><label class="span-two"><span>Responsable que paga *</span><input name="source" value="Ana Méndez" minlength="2" required></label><label class="span-two"><span>Concepto *</span><input name="concept" value="Pago de cuenta familiar" minlength="3" required></label><label><span>Monto *</span><div class="money-input"><b>Q</b><input name="amount" type="number" min="0.01" step="0.01" value="332" required></div></label></div>`
    }
  };
  return configs[action];
}

function openAdminAction(action, contextId = null) {
  const config = adminFormConfig(action, contextId);
  if (!config) return;
  state.adminAction = { action, contextId: contextId ? number(contextId) : null };
  $('#admin-kicker').textContent = config.kicker;
  $('#admin-title').textContent = config.title;
  $('#admin-description').textContent = config.description;
  $('#admin-submit').textContent = config.submit;
  $('#admin-fields').innerHTML = config.fields;
  $('#admin-modal').showModal();
}

async function submitAdminForm(event) {
  event.preventDefault();
  const form = event.currentTarget;
  if (event.submitter?.value === 'cancel') {
    form.closest('dialog')?.close();
    return;
  }
  if (!form.reportValidity() || !state.adminAction) return;
  const values = Object.fromEntries(new FormData(form));
  const { action, contextId } = state.adminAction;
  let url;
  let method = 'POST';
  let body;
  let successTitle;
  if (action === 'resident') {
    url = `${adminBase}/api/v1/residents`; body = values; successTitle = 'Residente guardado';
  } else if (action === 'visit') {
    url = `${adminBase}/api/v1/medical-visits`; body = { ...values, residentId: number(values.residentId) }; successTitle = 'Visita registrada';
  } else if (action === 'lab') {
    url = `${adminBase}/api/v1/laboratory-orders`; body = { ...values, residentId: number(values.residentId), medicalVisitId: values.medicalVisitId ? number(values.medicalVisitId) : null }; successTitle = 'Orden creada';
  } else if (action === 'lab-result') {
    url = `${adminBase}/api/v1/laboratory-orders/${contextId}/result`; method = 'PATCH'; body = values; successTitle = 'Resultado actualizado';
  } else if (action === 'medicine') {
    url = `${adminBase}/api/v1/pharmacy-deliveries`; body = { ...values, residentId: number(values.residentId), medicineId: number(values.medicineId), quantity: number(values.quantity), medicalVisitId: values.medicalVisitId ? number(values.medicalVisitId) : null }; successTitle = 'Entrega registrada';
  } else {
    url = `${adminBase}/api/v1/cash-movements`; body = { ...values, amount: number(values.amount), residentId: values.residentId ? number(values.residentId) : null }; successTitle = action === 'payment' ? 'Pago aplicado' : 'Movimiento guardado';
  }
  const submit = $('#admin-submit');
  submit.disabled = true;
  try {
    const result = await requestJson(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (action === 'resident' && result.data?.id) state.selectedResidentId = result.data.id;
    if (action === 'visit') state.selectedResidentId = body.residentId;
    $('#admin-modal').close();
    showToast(successTitle, 'La información quedó guardada en MySQL.');
    await loadAdministration();
  } catch (error) {
    showToast('No fue posible guardar', error.message, true);
  } finally {
    submit.disabled = false;
  }
}

async function refreshAll(showMessage = false) {
  const button = $('#refresh-button');
  button.disabled = true;
  const tasks = [checkHealth(), loadReferrals(), loadAdministration()];
  if (canView('expenses')) tasks.push(loadLiquidations());
  const results = await Promise.allSettled(tasks);
  button.disabled = false;
  if (showMessage) {
    const failed = results.some((item) => item.status === 'rejected');
    showToast(failed ? 'Actualización parcial' : 'Información actualizada', failed ? 'Algunos datos no respondieron.' : 'Los módulos muestran la información más reciente.', failed);
  }
}

function handleDemoAction(action, element) {
  if (!canRunAction(action)) {
    showToast('Acción no permitida', 'Su rol tiene acceso de consulta, pero no puede modificar este módulo.', true);
    return;
  }
  if (action === 'export' || action === 'report') {
    showToast('Reporte preparado', 'Se abrió la vista de impresión para guardar como PDF.');
    setTimeout(() => window.print(), 350);
    return;
  }
  openAdminAction(action, element?.dataset.labId || null);
}

function bindEvents() {
  document.addEventListener('click', (event) => {
    const nav = event.target.closest('[data-nav]');
    if (nav) navigate(nav.dataset.nav);
    const openReferral = event.target.closest('[data-open-referral]');
    if (openReferral && hasRole('MEDICO')) $('#referral-modal').showModal();
    const referral = event.target.closest('[data-referral-id]');
    if (referral) selectReferral(referral.dataset.referralId);
    const dashboardReferral = event.target.closest('[data-dashboard-referral]');
    if (dashboardReferral) { navigate('referrals'); selectReferral(dashboardReferral.dataset.dashboardReferral); }
    const workflow = event.target.closest('[data-workflow]');
    if (workflow) openWorkflow(workflow.dataset.workflow, workflow.dataset.id);
    const liquidation = event.target.closest('[data-liquidation-id]');
    if (liquidation) showLiquidation(liquidation.dataset.liquidationId);
    const resident = event.target.closest('[data-resident-id]');
    if (resident) selectResident(resident.dataset.residentId);
    const demo = event.target.closest('[data-demo-action]');
    if (demo) handleDemoAction(demo.dataset.demoAction, demo);
  });

  $('#menu-button').addEventListener('click', () => { $('#sidebar').classList.add('is-open'); $('#sidebar-scrim').classList.add('is-open'); });
  $('#sidebar-scrim').addEventListener('click', () => { $('#sidebar').classList.remove('is-open'); $('#sidebar-scrim').classList.remove('is-open'); });
  $('#refresh-button').addEventListener('click', () => refreshAll(true));
  $('#logout-button').addEventListener('click', () => endSession('Sesión cerrada correctamente.'));
  $('#login-form').addEventListener('submit', login);
  $('#toggle-password').addEventListener('click', (event) => {
    const input = $('#login-password');
    const showing = input.type === 'password';
    input.type = showing ? 'text' : 'password';
    event.currentTarget.textContent = showing ? 'Ocultar' : 'Mostrar';
    event.currentTarget.setAttribute('aria-pressed', String(showing));
    event.currentTarget.setAttribute('aria-label', showing ? 'Ocultar contraseña' : 'Mostrar contraseña');
  });
  $('#demo-account').addEventListener('change', (event) => {
    const option = event.currentTarget.selectedOptions[0];
    $('#login-username').value = option.value;
    $('#login-password').value = option.dataset.password || '';
    $('#login-message').textContent = '';
  });
  $('#resident-search').addEventListener('input', renderResidents);
  $('#resident-filter').addEventListener('change', renderResidents);
  $('#lab-search').addEventListener('input', renderLaboratory);
  $('#medicine-search').addEventListener('input', renderPharmacy);
  $('#cash-type-filter').addEventListener('change', renderCash);
  $('#referral-filter-form').addEventListener('submit', (event) => { event.preventDefault(); loadReferrals(Object.fromEntries(new FormData(event.currentTarget))); });
  $('#expense-filter-form').addEventListener('submit', (event) => { event.preventDefault(); loadLiquidations(Object.fromEntries(new FormData(event.currentTarget))); });
  $('#create-referral-form').addEventListener('submit', createReferral);
  $('#workflow-form').addEventListener('submit', submitWorkflow);
  $('#admin-form').addEventListener('submit', submitAdminForm);
  $$('[data-add-item]').forEach((button) => button.addEventListener('click', () => addExpenseItem(button.dataset.addItem)));
  $('#expense-form').addEventListener('input', (event) => { if (!event.target.closest('.expense-item')) invalidateCalculation(); });
  $('#calculate-expense').addEventListener('click', calculateExpense);
  $('#save-expense').addEventListener('click', saveExpense);
  $$('[data-close-liquidation]').forEach((button) => button.addEventListener('click', () => $('#liquidation-modal').close()));
  $$('.modal').forEach((modal) => modal.addEventListener('click', (event) => { if (event.target === modal) modal.close(); }));
}

async function initialize() {
  bindEvents();
  renderResidents();
  renderLaboratory();
  renderPharmacy();
  renderCash();
  $('#medical-visit-id').value = Math.floor(Date.now() / 1000) % 100000000;
  addExpenseItem('laboratory', { name: 'Hematología', quantity: 1, unitPrice: 100 });
  addExpenseItem('laboratory', { name: 'Glucosa', quantity: 1, unitPrice: 75 });
  addExpenseItem('pharmacy', { name: 'Losartán 50 mg', quantity: 2, unitPrice: 45 });
  $('#demo-account').dispatchEvent(new Event('change'));
  const initialView = location.hash.slice(1);
  navigate(sectionLabels[initialView] ? initialView : 'dashboard', false);
  const savedToken = sessionStorage.getItem('asiloToken');
  if (!savedToken) {
    endSession();
    return;
  }
  state.token = savedToken;
  try {
    const result = await requestJson(`${adminBase}/api/v1/auth/me`);
    await beginSession(savedToken, result.data);
  } catch {
    endSession('La sesión anterior ya no es válida.');
  }
}

initialize();
