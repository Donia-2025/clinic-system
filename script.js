// Dynamic API URL Helper (Works on Localhost, Vercel, Render, and Custom Domain)
const API_BASE = '/api';

// 1. Handling Appointment Form Submission
document.addEventListener('DOMContentLoaded', () => {
  const bookingForm = document.getElementById('bookingForm');
  if (bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = bookingForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري حفظ الحجز...';
      }

      const bookingData = {
        name: document.getElementById('name')?.value || '',
        phone: document.getElementById('phone')?.value || '',
        country: document.getElementById('country')?.value || 'egypt',
        date: document.getElementById('date')?.value || new Date().toISOString().split('T')[0],
        time: document.getElementById('time')?.value || '18:00',
        consultation_type: document.getElementById('consultation-type')?.value || 'in_clinic'
      };

      try {
        const response = await fetch(`${API_BASE}/appointments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bookingData)
        });

        const result = await response.json();

        if (response.ok && result.success) {
          showToast(result.message || 'تم تسجيل حجزك بنجاح!', 'success');
          
          // Ask if user wants to notify via WhatsApp as well
          let whatsappNumber = bookingData.country === 'egypt' ? "201146141421" : "966560533284";
          let message = `*طلب حجز كشف - د. هشام الجندي*\n\n`;
          message += `• *الاسم:* ${bookingData.name}\n`;
          message += `• *الهاتف:* ${bookingData.phone}\n`;
          message += `• *الدولة:* ${bookingData.country === 'egypt' ? 'مصر' : 'السعودية'}\n`;
          message += `• *تاريخ الحجز:* ${bookingData.date}\n`;
          message += `• *نوع الاستشارة:* ${bookingData.consultation_type === 'online' ? 'استشارة أونلاين' : 'في العيادة'}`;

          const encodedMessage = encodeURIComponent(message);
          window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, "_blank");

          bookingForm.reset();
        } else {
          showToast(result.message || 'تعذر تسجيل الحجز، يرجى المحاولة مرة أخرى.', 'error');
        }
      } catch (error) {
        console.error('Booking Error:', error);
        showToast('حدث خطأ أثناء الاتصال بالسيرفر. جاري التوجيه للواتساب مباشر...', 'warning');

        // Direct fallback to WhatsApp if server offline
        let whatsappNumber = bookingData.country === 'egypt' ? "201146141421" : "966560533284";
        let message = `*طلب حجز مباشر - د. هشام الجندي*\n• الاسم: ${bookingData.name}\n• الهاتف: ${bookingData.phone}`;
        window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, "_blank");
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnText;
        }
      }
    });
  }

  // 2. Load Reviews dynamically from backend API
  loadPatientReviews();
});

// Load patient reviews from backend REST API
async function loadPatientReviews() {
  const reviewsContainer = document.getElementById('reviewsContainer');
  if (!reviewsContainer) return;

  try {
    const response = await fetch(`${API_BASE}/reviews`);
    if (!response.ok) throw new Error('Network error');

    const reviews = await response.json();
    if (reviews && reviews.length > 0) {
      reviewsContainer.innerHTML = '';
      reviews.forEach(rev => {
        const stars = '★'.repeat(rev.rating || 5) + '☆'.repeat(5 - (rev.rating || 5));
        const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(rev.patient_name)}&background=0e7490&color=fff`;

        const box = document.createElement('div');
        box.className = 'testimonial-box glass-card';
        box.innerHTML = `
          <div class="review-header">
            <img src="${rev.imageUrl || defaultAvatar}" alt="${rev.patient_name}" class="review-avatar" onerror="this.src='${defaultAvatar}'">
            <div>
              <h4>${rev.patient_name}</h4>
              <div class="stars-rating">${stars}</div>
            </div>
          </div>
          <p class="review-comment">"${rev.comment}"</p>
        `;
        reviewsContainer.appendChild(box);
      });
    }
  } catch (err) {
    console.log('Reviews fetch fallback to embedded list:', err.message);
  }
}

// Global Toast Notification Helper
function showToast(message, type = 'info') {
  let toastContainer = document.getElementById('toastContainer');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toastContainer';
    toastContainer.style.cssText = `
      position: fixed;
      bottom: 25px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 99999;
      display: flex;
      flex-direction: column;
      gap: 10px;
    `;
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  const bgColors = {
    success: '#059669',
    error: '#dc2626',
    warning: '#d97706',
    info: '#0e7490'
  };

  toast.style.cssText = `
    background: ${bgColors[type] || bgColors.info};
    color: white;
    padding: 12px 24px;
    border-radius: 50px;
    font-size: 0.95rem;
    font-weight: 500;
    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    display: flex;
    align-items: center;
    gap: 10px;
    animation: toastIn 0.3s ease forwards;
  `;

  toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-triangle' : 'fa-info-circle'}"></i> ${message}`;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'toastOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}