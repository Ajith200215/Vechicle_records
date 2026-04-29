/* ============================================
   appointments.js - Service Appointment System
   All DB operations via REST API (async)
   ============================================ */

/**
 * Get all appointments (Admin) or user appointments (Customer)
 */
async function getAllAppointments() {
  const vt = getSelectedVehicleType();
  const query = vt ? `?vehicleType=${vt}` : '';
  return apiGet(`/appointments${query}`);
}

async function getUserAppointments(userId) {
  const vt = getSelectedVehicleType();
  const vtQuery = vt ? `&vehicleType=${vt}` : '';
  return apiGet(`/appointments?userId=${userId}${vtQuery}`);
}

/**
 * Add a new appointment
 */
async function addAppointment(vehicleId, userId, appointmentDate, notes) {
  return apiPost('/appointments', {
    vehicle_id: vehicleId,
    user_id: userId,
    appointment_date: appointmentDate,
    notes: notes || ''
  });
}

/**
 * Update appointment status
 */
async function updateAppointmentStatus(id, status) {
  return apiPut(`/appointments/${id}`, { status });
}

/**
 * Delete an appointment
 */
async function deleteAppointment(id) {
  return apiDelete(`/appointments/${id}`);
}

/**
 * Count appointments
 */
async function countAppointments(userId = null) {
  const vt = getSelectedVehicleType();
  const vtQuery = vt ? `&vehicleType=${vt}` : '';
  const query = userId ? `?userId=${userId}${vtQuery}` : `?${vtQuery.substring(1)}`;
  const result = await apiGet(`/appointments/count${query}`);
  return result.count;
}

/* ============================================
   Appointments UI Rendering
   ============================================ */

async function renderAppointments() {
  const container = document.getElementById('appointmentsList');
  if (!container) return;

  const user = getCurrentUser();
  const admin = isAdmin();
  const appointments = admin ? await getAllAppointments() : await getUserAppointments(user.id);

  let html = `
    <div class="page-header">
      <h2>Service Appointments</h2>
      <div class="actions">
        ${!admin ? `<button class="btn btn-success" onclick="showBookAppointmentModal()">Book Appointment</button>` : ''}
      </div>
    </div>
  `;

  if (appointments.length === 0) {
    html += `
      <div class="empty-state">
        <p>No appointments found. ${!admin ? 'Book one to get started!' : ''}</p>
      </div>
    `;
  } else {
    html += `
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>#</th>
              ${admin ? '<th>Customer</th>' : ''}
              <th>Vehicle</th>
              <th>Vehicle ID</th>
              <th>Date</th>
              <th>Notes</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${appointments.map((a, i) => `
              <tr>
                <td>${i + 1}</td>
                ${admin ? `<td>${a.full_name}</td>` : ''}
                <td>${a.brand} ${a.model}</td>
                <td>${a.vid}</td>
                <td>${formatDate(a.appointment_date)}</td>
                <td>${a.notes || '—'}</td>
                <td>${getStatusBadge(a.status)}</td>
                <td>
                  <div class="actions-cell">
                    ${admin ? `
                      <select onchange="changeAppointmentStatus(${a.id}, this.value)" class="btn btn-sm btn-secondary" style="padding: 0.3rem 0.5rem;">
                        <option value="Pending" ${a.status === 'Pending' ? 'selected' : ''}>Pending</option>
                        <option value="Confirmed" ${a.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
                        <option value="Completed" ${a.status === 'Completed' ? 'selected' : ''}>Completed</option>
                        <option value="Cancelled" ${a.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                      </select>
                    ` : `
                      ${a.status === 'Pending' ? `<button class="btn btn-sm btn-danger" onclick="cancelAppointment(${a.id})">Cancel</button>` : ''}
                    `}
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  container.innerHTML = html;
}

async function showBookAppointmentModal() {
  const vehicleType = getSelectedVehicleType();
  const allVehicles = await getVehicles();
  const filteredVehicles = vehicleType ? allVehicles.filter(v => v.type === vehicleType) : allVehicles;

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  const body = `
    <div class="form-group">
      <label>Select Vehicle</label>
      <select id="modalAppVehicle">
        <option value="">— Select a vehicle —</option>
        ${filteredVehicles.map(v => `
          <option value="${v.id}">${v.brand} ${v.model} (${v.vehicle_id})</option>
        `).join('')}
      </select>
    </div>
    <div class="form-group">
      <label>Preferred Date</label>
      <input type="date" id="modalAppDate" min="${minDate}">
    </div>
    <div class="form-group">
      <label>Notes (Optional)</label>
      <textarea id="modalAppNotes" placeholder="Describe what service you need..."></textarea>
    </div>
  `;

  showModal('Book Service Appointment', body, async () => {
    const vehicleId = document.getElementById('modalAppVehicle').value;
    const date = document.getElementById('modalAppDate').value;
    const notes = document.getElementById('modalAppNotes').value.trim();
    const user = getCurrentUser();

    if (!vehicleId || !date) {
      showToast('Please select a vehicle and date.', 'error');
      return;
    }

    try {
      await addAppointment(parseInt(vehicleId), user.id, date, notes);
      closeModal();
      showToast('Appointment booked successfully!');
      await renderAppointments();
      await updateDashboardStats();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }, 'Book');
}

async function changeAppointmentStatus(id, status) {
  try {
    if (status === 'Completed') {
      await deleteAppointment(id);
      showToast('Appointment completed and removed.');
    } else {
      await updateAppointmentStatus(id, status);
      showToast(`Appointment status updated to ${status}`);
    }
    await renderAppointments();
    if (typeof updateDashboardStats === 'function') {
      await updateDashboardStats();
    }
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function cancelAppointment(id) {
  const body = `<p>Are you sure you want to cancel this appointment?</p>`;

  showModal('Cancel Appointment', body, async () => {
    try {
      await updateAppointmentStatus(id, 'Cancelled');
      closeModal();
      showToast('Appointment cancelled.');
      await renderAppointments();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }, 'Yes, Cancel');
}

function getStatusBadge(status) {
  const map = {
    'Pending': 'badge-open',
    'Confirmed': 'badge-in-progress',
    'Completed': 'badge-closed',
    'Cancelled': 'badge-open',
    'Open': 'badge-open',
    'In Progress': 'badge-in-progress',
    'Closed': 'badge-closed'
  };
  return `<span class="badge ${map[status] || 'badge-open'}">${status}</span>`;
}
