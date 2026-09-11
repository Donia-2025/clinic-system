const API_BASE = '/api';
let adminAuthenticated = false;

function verifyAdmin() {
  const password = document.getElementById('admin-pass-input').value;
  if (password === 'drhisham' || password === 'admin' || password === 'drhisham123456') {
    adminAuthenticated = true;
    document.getElementById('admin-auth').classList.add('hidden');
    document.getElementById('admin-dashboard').classList.remove('hidden');
    loadAdminData();
  } else {
    alert('كلمة المرور غير صحيحة!');
  }
}

async function loadAdminData() {
  await Promise.all([loadAppointments(), loadReviews()]);
}

// Fetch and display appointments
async function loadAppointments() {
  const tableBody = document.getElementById('appointmentsTableBody');
  if (!tableBody) return;

  try {
    const response = await fetch(`${API_BASE}/appointments`);
    const appointments = await response.json();

    tableBody.innerHTML = '';

    if (!appointments || appointments.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center;">لا توجد حجوزات حالية</td></tr>';
      updateStats(0, 0);
      return;
    }

    let egyptCount = 0;
    let saudiCount = 0;

    appointments.forEach((app) => {
      if (app.country === 'egypt') egyptCount++;
      if (app.country === 'saudi') saudiCount++;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>#${app.id}</td>
        <td><strong>${app.name}</strong></td>
        <td><a href="tel:${app.phone}" dir="ltr">${app.phone}</a></td>
        <td>${app.country === 'saudi' ? '🇸🇦 السعودية' : '🇪🇬 مصر'}</td>
        <td>${app.date || '-'} (${app.time || '-'})</td>
        <td>
          <button onclick="deleteAppointment(${app.id})" class="btn-delete" title="حذف الحجز">
            <i class="fas fa-trash"></i>
          </button>
          <a href="https://wa.me/${app.phone.replace(/[^0-9]/g, '')}" target="_blank" class="btn-whatsapp" title="تواصل عبر الواتساب">
            <i class="fab fa-whatsapp"></i>
          </a>
        </td>
      `;
      tableBody.appendChild(tr);
    });

    updateStats(appointments.length, egyptCount, saudiCount);
  } catch (error) {
    console.error('خطأ في تحميل الحجوزات:', error);
  }
}

function updateStats(total, egypt, saudi) {
  const totalEl = document.getElementById('statTotalAppointments');
  if (totalEl) totalEl.textContent = total;
  const egyptEl = document.getElementById('statEgypt');
  if (egyptEl) egyptEl.textContent = egypt || 0;
  const saudiEl = document.getElementById('statSaudi');
  if (saudiEl) saudiEl.textContent = saudi || 0;
}

// Delete an appointment
async function deleteAppointment(id) {
  if (!confirm('هل أنت متأكد من حذف هذا الحجز؟')) return;

  try {
    const response = await fetch(`${API_BASE}/appointments/${id}`, { method: 'DELETE' });
    const result = await response.json();
    if (result.success) {
      loadAppointments();
    } else {
      alert(result.message || 'فشل حذف الحجز');
    }
  } catch (err) {
    alert('حدث خطأ أثناء الحذف');
  }
}

// Fetch and display patient reviews
async function loadReviews() {
  const reviewsContainer = document.getElementById('admin-reviews-list');
  if (!reviewsContainer) return;

  try {
    const response = await fetch(`${API_BASE}/reviews`);
    const reviews = await response.json();

    reviewsContainer.innerHTML = '';

    if (!reviews || reviews.length === 0) {
      reviewsContainer.innerHTML = '<p style="text-align:center; color:#888;">لا توجد تقييمات حالية</p>';
      return;
    }

    reviews.forEach((rev) => {
      const card = document.createElement('div');
      card.className = 'admin-review-card';
      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <h4>${rev.patient_name} <span class="stars">${'★'.repeat(rev.rating || 5)}</span></h4>
          <button onclick="deleteReview(${rev.id})" class="btn-delete"><i class="fas fa-trash"></i> حذف</button>
        </div>
        <p style="margin-top:8px;">"${rev.comment}"</p>
      `;
      reviewsContainer.appendChild(card);
    });
  } catch (error) {
    console.error('خطأ في تحميل المراجعات:', error);
  }
}

// Delete a review
async function deleteReview(id) {
  if (!confirm('هل أنت متأكد من حذف هذه المراجعة؟')) return;

  try {
    const response = await fetch(`${API_BASE}/reviews/${id}`, { method: 'DELETE' });
    const result = await response.json();
    if (result.success) {
      loadReviews();
    } else {
      alert(result.message || 'فشل حذف المراجعة');
    }
  } catch (err) {
    alert('حدث خطأ أثناء الحذف');
  }
}

// Background Changer
function updateBackgroundFromAdmin() {
  const url = document.getElementById('admin-bg-url').value.trim();
  if (url) {
    localStorage.setItem('customBackground', url);
    alert('تم تحديث خلفية الموقع بنجاح!');
  }
}

window.onload = () => {
  // If user opens admin page directly, allow immediate access check
  const passInput = document.getElementById('admin-pass-input');
  if (passInput) {
    passInput.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') verifyAdmin();
    });
  }
};