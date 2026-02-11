/* ============================================
   vehicles.js - Vehicle Management Module
   All DB operations via REST API (async)
   ============================================ */

/**
 * Get all vehicles, optionally filtered by type
 */
async function getVehicles(type = null) {
  const query = type ? `?type=${encodeURIComponent(type)}` : '';
  return apiGet(`/vehicles${query}`);
}

/**
 * Get a single vehicle by ID
 */
async function getVehicleById(id) {
  return apiGet(`/vehicles/${id}`);
}

/**
 * Add a new vehicle
 */
async function addVehicle(type, brand, model, vehicleId) {
  return apiPost('/vehicles', { type, brand, model, vehicle_id: vehicleId });
}

/**
 * Update an existing vehicle
 */
async function updateVehicle(id, type, brand, model, vehicleId) {
  return apiPut(`/vehicles/${id}`, { type, brand, model, vehicle_id: vehicleId });
}

/**
 * Delete a vehicle
 */
async function deleteVehicle(id) {
  return apiDelete(`/vehicles/${id}`);
}

/**
 * Count vehicles by type
 */
async function countVehicles(type = null) {
  const query = type ? `?type=${encodeURIComponent(type)}` : '';
  const result = await apiGet(`/vehicles/count${query}`);
  return result.count;
}

/* ============================================
   Vehicle UI Rendering Functions
   ============================================ */

/**
 * Render the vehicles list
 */
async function renderVehicles() {
  const container = document.getElementById('vehiclesList');
  if (!container) return;

  const vehicleType = getSelectedVehicleType();
  const admin = isAdmin();

  if (!admin) {
    await renderCustomerVehicleSearch(container, vehicleType);
    return;
  }

  const vehicles = await getVehicles(vehicleType);

  if (vehicles.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p>No ${vehicleType || 'vehicle'}s found. Add one to get started!</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="cards-grid">
      ${vehicles.map(v => renderVehicleCard(v, true)).join('')}
    </div>
  `;
}

/**
 * Render a single vehicle card (pure rendering, no async)
 */
function renderVehicleCard(v, admin) {
  return `
    <div class="card ${v.type === 'Bike' ? 'bike-card' : 'car-card'}">
      <h3>${v.brand} ${v.model}</h3>
      <div class="card-detail">
        <span>Type:</span>
        <span><span class="badge ${v.type === 'Bike' ? 'badge-bike' : 'badge-car'}">${v.type}</span></span>
      </div>
      <div class="card-detail">
        <span>Vehicle ID:</span>
        <span>${v.vehicle_id}</span>
      </div>
      <div class="card-detail">
        <span>Brand:</span>
        <span>${v.brand}</span>
      </div>
      <div class="card-detail">
        <span>Model:</span>
        <span>${v.model}</span>
      </div>
      <div class="card-actions">
        <button class="btn btn-sm btn-secondary" onclick="viewServiceRecords(${v.id})">Service History</button>
        ${admin ? `
          <button class="btn btn-sm btn-warning" onclick="showEditVehicleModal(${v.id})">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="confirmDeleteVehicle(${v.id})">Delete</button>
        ` : ''}
      </div>
    </div>
  `;
}

/**
 * Render customer vehicle search form
 */
async function renderCustomerVehicleSearch(container, vehicleType) {
  const query = vehicleType ? `?type=${encodeURIComponent(vehicleType)}` : '';
  const brands = await apiGet(`/vehicles/brands${query}`);

  container.innerHTML = `
    <div class="card" style="max-width: 600px; margin: 0 auto; border-left-color: var(--beige-dark);">
      <h3>Search Your Vehicle</h3>
      <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 1.2rem;">
        Enter your vehicle details below to view service status
      </p>

      <div class="form-group">
        <label>Brand Name</label>
        <select id="searchBrand" onchange="onBrandChange()">
          <option value="">— Select Brand —</option>
          ${brands.map(b => `<option value="${b.brand}">${b.brand}</option>`).join('')}
        </select>
      </div>

      <div class="form-group">
        <label>Model</label>
        <select id="searchModel" disabled>
          <option value="">— Select a brand first —</option>
        </select>
      </div>

      <div class="form-group">
        <label>Vehicle Number / ID</label>
        <input type="text" id="searchVehicleId" placeholder="e.g. BK-RE-001 or CR-HY-002">
      </div>

      <button class="btn btn-primary" onclick="searchCustomerVehicle()" style="margin-top: 0.5rem;">
        Search Vehicle
      </button>

      <p class="login-error" id="searchError" style="margin-top: 0.8rem;"></p>
    </div>

    <div id="customerSearchResults" style="margin-top: 1.5rem;"></div>
  `;
}

/**
 * When brand changes, populate model dropdown
 */
async function onBrandChange() {
  const brand = document.getElementById('searchBrand').value;
  const modelSelect = document.getElementById('searchModel');
  const vehicleType = getSelectedVehicleType();

  if (!brand) {
    modelSelect.innerHTML = '<option value="">— Select a brand first —</option>';
    modelSelect.disabled = true;
    return;
  }

  let query = `?brand=${encodeURIComponent(brand)}`;
  if (vehicleType) query += `&type=${encodeURIComponent(vehicleType)}`;
  const models = await apiGet(`/vehicles/models${query}`);

  modelSelect.innerHTML = `
    <option value="">— Select Model —</option>
    ${models.map(m => `<option value="${m.model}">${m.model}</option>`).join('')}
  `;
  modelSelect.disabled = false;
}

/**
 * Search for a vehicle (customer)
 */
async function searchCustomerVehicle() {
  const brand = document.getElementById('searchBrand').value;
  const model = document.getElementById('searchModel').value;
  const vehicleId = document.getElementById('searchVehicleId').value.trim();
  const errorEl = document.getElementById('searchError');
  const resultsEl = document.getElementById('customerSearchResults');

  errorEl.textContent = '';
  resultsEl.innerHTML = '';

  if (!brand || !model || !vehicleId) {
    errorEl.textContent = 'Please fill in all three fields — Brand, Model, and Vehicle Number.';
    return;
  }

  try {
    const vehicle = await apiGet(`/vehicles/search?brand=${encodeURIComponent(brand)}&model=${encodeURIComponent(model)}&vehicle_id=${encodeURIComponent(vehicleId)}`);
    const records = await apiGet(`/services?vehicleId=${vehicle.id}`);

    let html = `
      <div class="cards-grid" style="max-width: 600px; margin: 0 auto;">
        ${renderVehicleCard(vehicle, false)}
      </div>

      <div style="max-width: 900px; margin: 1.5rem auto 0;">
        <h3 style="margin-bottom: 1rem;">Service History</h3>
        ${renderServiceCardsForCustomer(records)}
      </div>
    `;

    resultsEl.innerHTML = html;
    showToast('Vehicle found! Showing service status.', 'success');
  } catch (err) {
    errorEl.textContent = 'No vehicle found matching your details. Please check and try again.';
  }
}

/**
 * Show modal to add a new vehicle
 */
async function showAddVehicleModal() {
  const vehicleType = getSelectedVehicleType();

  const body = `
    <div class="form-group">
      <label>Vehicle Type</label>
      <select id="modalVehicleType">
        <option value="Bike" ${vehicleType === 'Bike' ? 'selected' : ''}>Bike</option>
        <option value="Car" ${vehicleType === 'Car' ? 'selected' : ''}>Car</option>
      </select>
    </div>
    <div class="form-group">
      <label>Brand Name</label>
      <input type="text" id="modalBrand" placeholder="e.g. Honda, Toyota">
    </div>
    <div class="form-group">
      <label>Model</label>
      <input type="text" id="modalModel" placeholder="e.g. City, Civic">
    </div>
    <div class="form-group">
      <label>Vehicle ID</label>
      <input type="text" id="modalVehicleId" placeholder="e.g. CR-HN-006">
    </div>
  `;

  showModal('Add New Vehicle', body, async () => {
    const type = document.getElementById('modalVehicleType').value;
    const brand = document.getElementById('modalBrand').value.trim();
    const model = document.getElementById('modalModel').value.trim();
    const vehicleId = document.getElementById('modalVehicleId').value.trim();

    if (!brand || !model || !vehicleId) {
      showToast('Please fill in all fields.', 'error');
      return;
    }

    try {
      await addVehicle(type, brand, model, vehicleId);
      closeModal();
      showToast('Vehicle added successfully!');
      await renderVehicles();
      await updateDashboardStats();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}

/**
 * Show modal to edit a vehicle
 */
async function showEditVehicleModal(id) {
  const vehicle = await getVehicleById(id);
  if (!vehicle) return;

  const body = `
    <div class="form-group">
      <label>Vehicle Type</label>
      <select id="modalVehicleType">
        <option value="Bike" ${vehicle.type === 'Bike' ? 'selected' : ''}>Bike</option>
        <option value="Car" ${vehicle.type === 'Car' ? 'selected' : ''}>Car</option>
      </select>
    </div>
    <div class="form-group">
      <label>Brand Name</label>
      <input type="text" id="modalBrand" value="${vehicle.brand}">
    </div>
    <div class="form-group">
      <label>Model</label>
      <input type="text" id="modalModel" value="${vehicle.model}">
    </div>
    <div class="form-group">
      <label>Vehicle ID</label>
      <input type="text" id="modalVehicleId" value="${vehicle.vehicle_id}">
    </div>
  `;

  showModal('Edit Vehicle', body, async () => {
    const type = document.getElementById('modalVehicleType').value;
    const brand = document.getElementById('modalBrand').value.trim();
    const model = document.getElementById('modalModel').value.trim();
    const vehicleId = document.getElementById('modalVehicleId').value.trim();

    if (!brand || !model || !vehicleId) {
      showToast('Please fill in all fields.', 'error');
      return;
    }

    try {
      await updateVehicle(id, type, brand, model, vehicleId);
      closeModal();
      showToast('Vehicle updated successfully!');
      await renderVehicles();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }, 'Update');
}

/**
 * Confirm and delete a vehicle
 */
async function confirmDeleteVehicle(id) {
  const vehicle = await getVehicleById(id);
  if (!vehicle) return;

  const body = `
    <p>Are you sure you want to delete <strong>${vehicle.brand} ${vehicle.model}</strong> (${vehicle.vehicle_id})?</p>
    <p style="color: var(--text-secondary); font-size: 0.9rem; margin-top: 0.5rem;">
      This will also delete all associated service records, appointments, and tickets.
    </p>
  `;

  showModal('Delete Vehicle', body, async () => {
    try {
      await deleteVehicle(id);
      closeModal();
      showToast('Vehicle deleted successfully!');
      await renderVehicles();
      await updateDashboardStats();
    } catch (err) {
      showToast(err.message, 'error');
    }
  }, 'Delete');
}
