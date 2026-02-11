/* ============================================
   tickets.js - Ticket / Query System
   All DB operations via REST API (async)
   ============================================ */

/**
 * Get all tickets (Admin) or user tickets (Customer)
 */
async function getAllTickets() {
  const vt = getSelectedVehicleType();
  const query = vt ? `?vehicleType=${vt}` : '';
  return apiGet(`/tickets${query}`);
}

async function getUserTickets(userId) {
  const vt = getSelectedVehicleType();
  const vtQuery = vt ? `&vehicleType=${vt}` : '';
  return apiGet(`/tickets?userId=${userId}${vtQuery}`);
}

/**
 * Add a new ticket
 */
async function addTicket(vehicleId, userId, issue) {
  return apiPost('/tickets', {
    vehicle_id: vehicleId,
    user_id: userId,
    issue
  });
}

/**
 * Update ticket status
 */
async function updateTicketStatus(id, status) {
  return apiPut(`/tickets/${id}`, { status });
}

/**
 * Delete a ticket
 */
async function deleteTicket(id) {
  return apiDelete(`/tickets/${id}`);
}

/**
 * Count open tickets
 */
async function countOpenTickets() {
  const vt = getSelectedVehicleType();
  const vtQuery = vt ? `&vehicleType=${vt}` : '';
  const result = await apiGet(`/tickets/count?status=open${vtQuery}`);
  return result.count;
}

/**
 * Count all tickets for a user
 */
async function countTickets(userId = null) {
  const vt = getSelectedVehicleType();
  const vtQuery = vt ? `&vehicleType=${vt}` : '';
  const query = userId ? `?userId=${userId}${vtQuery}` : `?${vtQuery.substring(1)}`;
  const result = await apiGet(`/tickets/count${query}`);
  return result.count;
}

/**
 * Count open tickets for a user
 */
async function countOpenTicketsForUser(userId) {
  const vt = getSelectedVehicleType();
  const vtQuery = vt ? `&vehicleType=${vt}` : '';
  const result = await apiGet(`/tickets/count?userId=${userId}&status=open${vtQuery}`);
  return result.count;
}

/* ============================================
   Tickets UI Rendering
   ============================================ */

async function renderTickets() {
  const container = document.getElementById('ticketsList');
  if (!container) return;

  const user = getCurrentUser();
  const admin = isAdmin();
  const tickets = admin ? await getAllTickets() : await getUserTickets(user.id);

  let html = `
    <div class="page-header">
      <h2>Service Tickets</h2>
      <div class="actions">
        ${!admin ? `<button class="btn btn-success" onclick="showRaiseTicketModal()">Raise Ticket</button>` : ''}
      </div>
    </div>
  `;

  if (tickets.length === 0) {
    html += `
      <div class="empty-state">
        <p>No tickets found. ${!admin ? 'Raise one if you have an issue!' : ''}</p>
      </div>
    `;
  } else {
    html += `
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Ticket #</th>
              ${admin ? '<th>Customer</th>' : ''}
              <th>Vehicle</th>
              <th>Vehicle ID</th>
              <th>Issue</th>
              <th>Status</th>
              <th>Created</th>
              ${admin ? '<th>Actions</th>' : ''}
            </tr>
          </thead>
          <tbody>
            ${tickets.map(t => `
              <tr>
                <td><strong>TKT-${String(t.id).padStart(4, '0')}</strong></td>
                ${admin ? `<td>${t.full_name}</td>` : ''}
                <td>${t.brand} ${t.model}</td>
                <td>${t.vid}</td>
                <td>${t.issue}</td>
                <td>${getStatusBadge(t.status)}</td>
                <td>${t.created_at ? formatDate(t.created_at) : '—'}</td>
                ${admin ? `
                  <td>
                    <div class="actions-cell">
                      <select onchange="changeTicketStatus(${t.id}, this.value)" class="btn btn-sm btn-secondary" style="padding: 0.3rem 0.5rem;">
                        <option value="Open" ${t.status === 'Open' ? 'selected' : ''}>Open</option>
                        <option value="In Progress" ${t.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                        <option value="Closed" ${t.status === 'Closed' ? 'selected' : ''}>Closed</option>
                      </select>
                    </div>
                  </td>
                ` : ''}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  container.innerHTML = html;
}

async function showRaiseTicketModal() {
  const vehicleType = getSelectedVehicleType();
  const allVehicles = await getVehicles();
  const filteredVehicles = vehicleType ? allVehicles.filter(v => v.type === vehicleType) : allVehicles;

  const body = `
    <div class="form-group">
      <label>Select Vehicle</label>
      <select id="modalTicketVehicle">
        <option value="">— Select a vehicle —</option>
        ${filteredVehicles.map(v => `
          <option value="${v.id}">${v.brand} ${v.model} (${v.vehicle_id})</option>
        `).join('')}
      </select>
    </div>
    <div class="form-group">
      <label>Issue Description</label>
      <textarea id="modalTicketIssue" placeholder="Describe your issue or query in detail..." rows="4"></textarea>
    </div>
  `;

  showModal('Raise a Service Ticket', body, async () => {
    const vehicleId = document.getElementById('modalTicketVehicle').value;
    const issue = document.getElementById('modalTicketIssue').value.trim();
    const user = getCurrentUser();

    if (!vehicleId || !issue) {
      showToast('Please select a vehicle and describe the issue.', 'error');
      return;
    }

    try {
      await addTicket(parseInt(vehicleId), user.id, issue);
      closeModal();
      showToast('Ticket raised successfully!');
      await renderTickets();
      await updateDashboardStats();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }, 'Submit Ticket');
}

async function changeTicketStatus(id, status) {
  try {
    await updateTicketStatus(id, status);
    showToast(`Ticket status updated to ${status}`);
    await renderTickets();
    await updateDashboardStats();
  } catch (err) {
    showToast(err.message, 'error');
  }
}
