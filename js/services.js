/* ============================================
   services.js - Service Record Management
   All DB operations via REST API (async)
   ============================================ */

/**
 * Get all service records for a vehicle
 */
async function getServiceRecords(vehicleId) {
  return apiGet(`/services?vehicleId=${vehicleId}`);
}

/**
 * Get all service records (admin overview)
 */
async function getAllServiceRecords(vehicleType = null) {
  const query = vehicleType ? `?vehicleType=${encodeURIComponent(vehicleType)}` : '';
  return apiGet(`/services${query}`);
}

/**
 * Get a single service record by ID
 */
async function getServiceRecordById(id) {
  return apiGet(`/services/${id}`);
}

/**
 * Add a new service record
 */
async function addServiceRecord(vehicleId, serviceType, serviceDate, interval, mileage, nextServiceDate, description, cost, technicianName, sparesChanged, notes) {
  return apiPost('/services', {
    vehicle_id: vehicleId,
    service_type: serviceType,
    service_date: serviceDate,
    service_interval: interval || '',
    mileage: mileage || '',
    next_service_date: nextServiceDate || null,
    description,
    cost: cost || 0,
    technician_name: technicianName || '',
    spares_changed: sparesChanged || '',
    notes: notes || ''
  });
}

/**
 * Update a service record
 */
async function updateServiceRecord(id, serviceType, serviceDate, interval, mileage, nextServiceDate, description, cost, technicianName, sparesChanged, notes) {
  return apiPut(`/services/${id}`, {
    service_type: serviceType,
    service_date: serviceDate,
    service_interval: interval || '',
    mileage: mileage || '',
    next_service_date: nextServiceDate || null,
    description,
    cost: cost || 0,
    technician_name: technicianName || '',
    spares_changed: sparesChanged || '',
    notes: notes || ''
  });
}

/**
 * Delete a service record
 */
async function deleteServiceRecord(id) {
  return apiDelete(`/services/${id}`);
}

/**
 * Count service records
 */
async function countServiceRecords(vehicleType = null) {
  const query = vehicleType ? `?vehicleType=${encodeURIComponent(vehicleType)}` : '';
  const result = await apiGet(`/services/count${query}`);
  return result.count;
}

/**
 * Count service records by type
 */
async function countServiceRecordsByType(serviceType, vehicleType = null) {
  let query = `?serviceType=${encodeURIComponent(serviceType)}`;
  if (vehicleType) query += `&vehicleType=${encodeURIComponent(vehicleType)}`;
  const result = await apiGet(`/services/count${query}`);
  return result.count;
}

/* ============================================
   Service Record Card Rendering
   ============================================ */

function getServiceTypeBadge(type) {
  const map = {
    'Inspection': { cls: 'svc-badge-inspection', label: 'INSP', color: '#6c5ce7' },
    'Repair':     { cls: 'svc-badge-repair',     label: 'RPR',  color: '#e17055' },
    'Maintenance':{ cls: 'svc-badge-maintenance', label: 'MAINT', color: '#00b894' },
  };
  return map[type] || map['Maintenance'];
}

function getCostBadgeClass(cost) {
  if (cost === 0) return 'svc-cost-free';
  if (cost <= 2000) return 'svc-cost-low';
  if (cost <= 5000) return 'svc-cost-medium';
  return 'svc-cost-high';
}

/**
 * Render a single service record card (pure rendering, no async)
 */
function renderServiceCard(r, admin, parentVehicleId, showVehicleInfo = false) {
  const typeBadge = getServiceTypeBadge(r.service_type);
  const costClass = getCostBadgeClass(r.cost);
  const costLabel = r.cost > 0 ? '₹' + Math.round(Number(r.cost)).toLocaleString() : 'Free';

  return `
    <div class="svc-record-card">
      <div class="svc-card-header">
        <div class="svc-card-badges">
          <span class="svc-badge ${typeBadge.cls}">${r.service_type || 'Maintenance'}</span>
          <span class="svc-badge ${costClass}">${costLabel}</span>
        </div>
        ${admin ? `
          <div class="svc-card-actions">
            <button class="btn btn-sm btn-warning" onclick="showEditServiceModal(${r.id}, ${parentVehicleId})" title="Edit">Edit</button>
            <button class="btn btn-sm btn-danger" onclick="confirmDeleteService(${r.id}, ${parentVehicleId})" title="Delete">Delete</button>
          </div>
        ` : ''}
      </div>

      <div class="svc-card-summary">
        <h4>${r.description}</h4>
        ${showVehicleInfo ? `<p class="svc-vehicle-label">${r.brand} ${r.model} <span class="text-muted">(${r.vid})</span></p>` : ''}
      </div>

      <div class="svc-card-grid">
        <div class="svc-card-field">
          <div class="svc-field-label">Service Date</div>
          <div class="svc-field-value">${formatDate(r.service_date)}</div>
        </div>
        <div class="svc-card-field">
          <div class="svc-field-label">Next Service Interval</div>
          <div class="svc-field-value">${r.service_interval || '—'}</div>
        </div>
        <div class="svc-card-field">
          <div class="svc-field-label">Mileage</div>
          <div class="svc-field-value">${r.mileage || '—'}</div>
        </div>
        <div class="svc-card-field">
          <div class="svc-field-label">Next Service Due</div>
          <div class="svc-field-value ${isOverdue(r.next_service_date) ? 'svc-overdue' : ''}">${r.next_service_date ? formatDate(r.next_service_date) : '—'}</div>
        </div>
        <div class="svc-card-field">
          <div class="svc-field-label">Technician</div>
          <div class="svc-field-value">${r.technician_name || '—'}</div>
        </div>
        <div class="svc-card-field">
          <div class="svc-field-label">Cost</div>
          <div class="svc-field-value">${r.cost > 0 ? '₹' + Math.round(Number(r.cost)).toLocaleString() : '—'}</div>
        </div>
      </div>

      ${r.spares_changed ? `
        <div class="svc-card-notes">
          <div class="svc-field-label">Spares Changed</div>
          <p>${r.spares_changed}</p>
        </div>
      ` : ''}

      ${r.notes ? `
        <div class="svc-card-notes">
          <div class="svc-field-label">Notes</div>
          <p>${r.notes}</p>
        </div>
      ` : ''}
    </div>
  `;
}

function isOverdue(dateStr) {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}

/* ============================================
   Service Records UI Rendering
   ============================================ */

async function viewServiceRecords(vehicleId) {
  const vehicle = await getVehicleById(vehicleId);
  if (!vehicle) return;
  sessionStorage.setItem('viewingVehicleId', vehicleId);
  switchSection('services');
}

async function renderServiceRecordsForVehicle(vehicleId) {
  const container = document.getElementById('servicesList');
  if (!container) return;

  const vehicle = await getVehicleById(vehicleId);
  const records = await getServiceRecords(vehicleId);
  const admin = isAdmin();
  const totalCost = records.reduce((sum, r) => sum + (Number(r.cost) || 0), 0);

  let html = `
    <button class="back-btn" onclick="switchSection('vehicles')">← Back to Vehicles</button>

    <div class="svc-vehicle-banner">
      <div class="svc-vehicle-banner-info">
        <span class="svc-vehicle-banner-icon">${vehicle.type}</span>
        <div>
          <h2>${vehicle.brand} ${vehicle.model}</h2>
          <p>Vehicle ID: <strong>${vehicle.vehicle_id}</strong> · Type: <span class="badge ${vehicle.type === 'Bike' ? 'badge-bike' : 'badge-car'}">${vehicle.type}</span></p>
        </div>
      </div>
      <div class="svc-vehicle-banner-stats">
        <div class="svc-banner-stat">
          <span class="svc-banner-stat-num">${records.length}</span>
          <span class="svc-banner-stat-label">Records</span>
        </div>
        <div class="svc-banner-stat">
          <span class="svc-banner-stat-num">${totalCost > 0 ? '₹' + Math.round(totalCost).toLocaleString() : '—'}</span>
          <span class="svc-banner-stat-label">Total Cost</span>
        </div>
        ${admin ? `
          <button class="btn btn-success" onclick="showAddServiceModal(${vehicleId})">Add Record</button>
        ` : ''}
      </div>
    </div>
  `;

  if (records.length === 0) {
    html += `
      <div class="empty-state">
        <p>No service records found for this vehicle.</p>
      </div>
    `;
  } else {
    html += `<div class="svc-timeline">`;
    records.forEach(r => {
      html += renderServiceCard(r, admin, vehicleId, false);
    });
    html += `</div>`;
  }

  container.innerHTML = html;
}

async function renderAllServiceRecords() {
  const container = document.getElementById('servicesList');
  if (!container) return;

  const vehicleType = getSelectedVehicleType();
  const records = await getAllServiceRecords(vehicleType);
  const admin = isAdmin();

  let html = `
    <div class="page-header">
      <h2>Service Records</h2>
      <div class="actions">
        ${admin ? `<button class="btn btn-success" onclick="showAddServiceModalGlobal()">Add Service Record</button>` : ''}
      </div>
    </div>
  `;

  if (records.length === 0) {
    html += `
      <div class="empty-state">
        <p>No service records found. ${admin ? 'Click "Add Service Record" to create one.' : ''}</p>
      </div>
    `;
    container.innerHTML = html;
    return;
  }

  const totalCost = records.reduce((sum, r) => sum + (Number(r.cost) || 0), 0);
  const inspections = records.filter(r => r.service_type === 'Inspection').length;
  const repairs = records.filter(r => r.service_type === 'Repair').length;
  const maintenance = records.filter(r => r.service_type === 'Maintenance').length;

  html += `
    <div class="svc-summary-bar">
      <div class="svc-summary-item">
        <span class="svc-badge svc-badge-maintenance">Maintenance</span>
        <strong>${maintenance}</strong>
      </div>
      <div class="svc-summary-item">
        <span class="svc-badge svc-badge-inspection">Inspection</span>
        <strong>${inspections}</strong>
      </div>
      <div class="svc-summary-item">
        <span class="svc-badge svc-badge-repair">Repair</span>
        <strong>${repairs}</strong>
      </div>
      <div class="svc-summary-item">
        <span style="font-weight: 600;">Total Spend:</span>
        <strong>₹${Math.round(totalCost).toLocaleString()}</strong>
      </div>
    </div>

    <div class="svc-timeline">
  `;

  records.forEach(r => {
    html += renderServiceCard(r, admin, r.vehicle_id, true);
  });

  html += `</div>`;
  container.innerHTML = html;
}

function renderServiceCardsForCustomer(records) {
  if (records.length === 0) {
    return `
      <div class="empty-state">
        <p>No service records found for this vehicle.</p>
      </div>
    `;
  }

  const totalCost = records.reduce((sum, r) => sum + (Number(r.cost) || 0), 0);

  let html = `
    <div class="svc-summary-bar">
      <div class="svc-summary-item">
        <strong>${records.length}</strong> <span>Service Records</span>
      </div>
      <div class="svc-summary-item">
        <span style="font-weight: 600;">Total Spend:</span>
        <strong>₹${Math.round(totalCost).toLocaleString()}</strong>
      </div>
    </div>

    <div class="svc-timeline">
  `;

  records.forEach(r => {
    html += renderServiceCard(r, false, null, false);
  });

  html += `</div>`;
  return html;
}

/* ============================================
   Add / Edit Modals
   ============================================ */

function showAddServiceModal(vehicleId) {
  const body = `
    <div class="form-group">
      <label>Service Type</label>
      <select id="modalServiceType">
        <option value="Maintenance">Maintenance</option>
        <option value="Inspection">Inspection</option>
        <option value="Repair">Repair</option>
      </select>
    </div>
    <div class="form-group">
      <label>Service Summary</label>
      <textarea id="modalServiceDesc" placeholder="Describe what was done in the service..." rows="3"></textarea>
    </div>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem;">
      <div class="form-group">
        <label>Service Date</label>
        <input type="date" id="modalServiceDate" value="${new Date().toISOString().split('T')[0]}">
      </div>
      <div class="form-group">
        <label>Next Service Due</label>
        <input type="date" id="modalNextServiceDate">
      </div>
    </div>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem;">
      <div class="form-group">
        <label>Mileage at Service</label>
        <input type="text" id="modalMileage" placeholder="e.g. 10,500 km">
      </div>
      <div class="form-group">
        <label>Next Service Interval</label>
        <input type="text" id="modalServiceInterval" placeholder="e.g. 5000 km / 6 months">
      </div>
    </div>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem;">
      <div class="form-group">
        <label>Technician Name</label>
        <input type="text" id="modalTechnicianName" placeholder="e.g. Rajesh Kumar">
      </div>
      <div class="form-group">
        <label>Total Cost (INR)</label>
        <input type="number" id="modalServiceCost" placeholder="0" min="0">
      </div>
    </div>
    <div class="form-group">
      <label>Spares Changed</label>
      <textarea id="modalSparesChanged" placeholder="e.g. Engine oil, Oil filter, Air filter, Spark plug..." rows="2"></textarea>
    </div>
    <div class="form-group">
      <label>Notes / Observations (Optional)</label>
      <textarea id="modalServiceNotes" placeholder="Additional remarks..." rows="2"></textarea>
    </div>
  `;

  showModal('Add Service Record', body, async () => {
    const serviceType = document.getElementById('modalServiceType').value;
    const date = document.getElementById('modalServiceDate').value;
    const nextDate = document.getElementById('modalNextServiceDate').value;
    const mileage = document.getElementById('modalMileage').value.trim();
    const interval = document.getElementById('modalServiceInterval').value.trim();
    const desc = document.getElementById('modalServiceDesc').value.trim();
    const cost = parseFloat(document.getElementById('modalServiceCost').value) || 0;
    const technicianName = document.getElementById('modalTechnicianName').value.trim();
    const sparesChanged = document.getElementById('modalSparesChanged').value.trim();
    const notes = document.getElementById('modalServiceNotes').value.trim();

    if (!date || !desc) {
      showToast('Please fill in date and service summary.', 'error');
      return;
    }

    try {
      await addServiceRecord(vehicleId, serviceType, date, interval, mileage, nextDate, desc, cost, technicianName, sparesChanged, notes);
      closeModal();
      showToast('Service record added!');
      await renderServiceRecordsForVehicle(vehicleId);
      await updateDashboardStats();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}

async function showAddServiceModalGlobal() {
  const vehicleType = getSelectedVehicleType();
  const vehicles = await getVehicles(vehicleType);

  if (vehicles.length === 0) {
    showToast('No vehicles found. Add a vehicle first.', 'error');
    return;
  }

  const body = `
    <div class="form-group">
      <label>Select Vehicle</label>
      <select id="modalGlobalVehicle">
        <option value="">-- Select a vehicle --</option>
        ${vehicles.map(v => `<option value="${v.id}">${v.brand} ${v.model} (${v.vehicle_id})</option>`).join('')}
      </select>
    </div>
    <div class="form-group">
      <label>Service Type</label>
      <select id="modalServiceType">
        <option value="Maintenance">Maintenance</option>
        <option value="Inspection">Inspection</option>
        <option value="Repair">Repair</option>
      </select>
    </div>
    <div class="form-group">
      <label>Service Summary</label>
      <textarea id="modalServiceDesc" placeholder="Describe what was done in the service..." rows="3"></textarea>
    </div>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem;">
      <div class="form-group">
        <label>Service Date</label>
        <input type="date" id="modalServiceDate" value="${new Date().toISOString().split('T')[0]}">
      </div>
      <div class="form-group">
        <label>Next Service Due</label>
        <input type="date" id="modalNextServiceDate">
      </div>
    </div>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem;">
      <div class="form-group">
        <label>Mileage at Service</label>
        <input type="text" id="modalMileage" placeholder="e.g. 10,500 km">
      </div>
      <div class="form-group">
        <label>Next Service Interval</label>
        <input type="text" id="modalServiceInterval" placeholder="e.g. 5000 km / 6 months">
      </div>
    </div>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem;">
      <div class="form-group">
        <label>Technician Name</label>
        <input type="text" id="modalTechnicianName" placeholder="e.g. Rajesh Kumar">
      </div>
      <div class="form-group">
        <label>Total Cost (INR)</label>
        <input type="number" id="modalServiceCost" placeholder="0" min="0">
      </div>
    </div>
    <div class="form-group">
      <label>Spares Changed</label>
      <textarea id="modalSparesChanged" placeholder="e.g. Engine oil, Oil filter, Air filter, Spark plug..." rows="2"></textarea>
    </div>
    <div class="form-group">
      <label>Notes / Observations (Optional)</label>
      <textarea id="modalServiceNotes" placeholder="Additional remarks..." rows="2"></textarea>
    </div>
  `;

  showModal('Add Service Record', body, async () => {
    const vehicleId = document.getElementById('modalGlobalVehicle').value;
    const serviceType = document.getElementById('modalServiceType').value;
    const date = document.getElementById('modalServiceDate').value;
    const nextDate = document.getElementById('modalNextServiceDate').value;
    const mileage = document.getElementById('modalMileage').value.trim();
    const interval = document.getElementById('modalServiceInterval').value.trim();
    const desc = document.getElementById('modalServiceDesc').value.trim();
    const cost = parseFloat(document.getElementById('modalServiceCost').value) || 0;
    const technicianName = document.getElementById('modalTechnicianName').value.trim();
    const sparesChanged = document.getElementById('modalSparesChanged').value.trim();
    const notes = document.getElementById('modalServiceNotes').value.trim();

    if (!vehicleId) {
      showToast('Please select a vehicle.', 'error');
      return;
    }
    if (!date || !desc) {
      showToast('Please fill in date and service summary.', 'error');
      return;
    }

    try {
      await addServiceRecord(parseInt(vehicleId), serviceType, date, interval, mileage, nextDate, desc, cost, technicianName, sparesChanged, notes);
      closeModal();
      showToast('Service record added!');
      await renderAllServiceRecords();
      await updateDashboardStats();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}

async function showEditServiceModal(id, vehicleId) {
  const record = await getServiceRecordById(id);
  if (!record) return;

  const body = `
    <div class="form-group">
      <label>Service Type</label>
      <select id="modalServiceType">
        <option value="Maintenance" ${record.service_type === 'Maintenance' ? 'selected' : ''}>Maintenance</option>
        <option value="Inspection" ${record.service_type === 'Inspection' ? 'selected' : ''}>Inspection</option>
        <option value="Repair" ${record.service_type === 'Repair' ? 'selected' : ''}>Repair</option>
      </select>
    </div>
    <div class="form-group">
      <label>Service Summary</label>
      <textarea id="modalServiceDesc" rows="3">${record.description}</textarea>
    </div>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem;">
      <div class="form-group">
        <label>Service Date</label>
        <input type="date" id="modalServiceDate" value="${record.service_date}">
      </div>
      <div class="form-group">
        <label>Next Service Due</label>
        <input type="date" id="modalNextServiceDate" value="${record.next_service_date || ''}">
      </div>
    </div>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem;">
      <div class="form-group">
        <label>Mileage at Service</label>
        <input type="text" id="modalMileage" value="${record.mileage || ''}">
      </div>
      <div class="form-group">
        <label>Next Service Interval</label>
        <input type="text" id="modalServiceInterval" value="${record.service_interval || ''}">
      </div>
    </div>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem;">
      <div class="form-group">
        <label>Technician Name</label>
        <input type="text" id="modalTechnicianName" value="${record.technician_name || ''}">
      </div>
      <div class="form-group">
        <label>Total Cost (INR)</label>
        <input type="number" id="modalServiceCost" value="${record.cost || 0}" min="0">
      </div>
    </div>
    <div class="form-group">
      <label>Spares Changed</label>
      <textarea id="modalSparesChanged" rows="2">${record.spares_changed || ''}</textarea>
    </div>
    <div class="form-group">
      <label>Notes / Observations</label>
      <textarea id="modalServiceNotes" rows="2">${record.notes || ''}</textarea>
    </div>
  `;

  showModal('Edit Service Record', body, async () => {
    const serviceType = document.getElementById('modalServiceType').value;
    const date = document.getElementById('modalServiceDate').value;
    const nextDate = document.getElementById('modalNextServiceDate').value;
    const mileage = document.getElementById('modalMileage').value.trim();
    const interval = document.getElementById('modalServiceInterval').value.trim();
    const desc = document.getElementById('modalServiceDesc').value.trim();
    const cost = parseFloat(document.getElementById('modalServiceCost').value) || 0;
    const technicianName = document.getElementById('modalTechnicianName').value.trim();
    const sparesChanged = document.getElementById('modalSparesChanged').value.trim();
    const notes = document.getElementById('modalServiceNotes').value.trim();

    if (!date || !desc) {
      showToast('Please fill in date and service summary.', 'error');
      return;
    }

    try {
      await updateServiceRecord(id, serviceType, date, interval, mileage, nextDate, desc, cost, technicianName, sparesChanged, notes);
      closeModal();
      showToast('Service record updated!');

      if (vehicleId) {
        await renderServiceRecordsForVehicle(vehicleId);
      } else {
        await renderAllServiceRecords();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  }, 'Update');
}

async function confirmDeleteService(id, vehicleId) {
  const body = `<p>Are you sure you want to delete this service record? This action cannot be undone.</p>`;

  showModal('Delete Service Record', body, async () => {
    try {
      await deleteServiceRecord(id);
      closeModal();
      showToast('Service record deleted!');

      if (vehicleId) {
        await renderServiceRecordsForVehicle(vehicleId);
      } else {
        await renderAllServiceRecords();
      }
      await updateDashboardStats();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }, 'Delete');
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}
