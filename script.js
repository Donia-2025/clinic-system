document.addEventListener('DOMContentLoaded', () => {
  // 1. معالجة نموذج الحجز (Booking Form) وإرساله للسيرفر مع فتح الواتساب
  const bookingForm = document.getElementById('bookingForm');
  if (bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const name = document.getElementById('name').value.trim();
      const phone = document.getElementById('phone').value.trim();
      const country = document.getElementById('country').value;
      const consultation_type = document.getElementById('consultation-type').value;
      const date = document.getElementById('date').value || new Date().toISOString().split('T')[0];
      const time = document.getElementById('time').value;

      if (!name || !phone) {
        alert('يرجى ادخال الاسم ورقم الهاتف');
        return;
      }

      try {
        const response = await fetch('/api/appointments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, phone, country, consultation_type, date, time })
        });
        
        const result = await response.json();
        
        if (result.success) {
          alert('✅ تم تسجيل حجزك بنجاح في النظام!');
          bookingForm.reset();
          
          // فتح الواتساب تلقائياً بعد الحجز
          const waMessage = `مرحباً دكتور هشام، أرغب في تأكيد حجز موعد:%0Aالاسم: ${encodeURIComponent(name)}%0Aالهاتف: ${encodeURIComponent(phone)}%0Aالتاريخ: ${date} - الوقت: ${time}%0Aالنوع: ${consultation_type}`;
          window.open(`https://api.whatsapp.com/send?phone=966560533284&text=${waMessage}`, '_blank');
        } else {
          alert('❌ حدث خطأ: ' + (result.message || 'فشل الحجز'));
        }
      } catch (err) {
        console.error('Booking error:', err);
        alert('⚠️ تعذر الاتصال بالسيرفر، تأكد من تشغيل النظام');
      }
    });
  }

  // 2. معالجة نموذج التقييمات (Review Form)
  const reviewForm = document.getElementById('reviewForm');
  if (reviewForm) {
    reviewForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const patient_name = document.getElementById('reviewName').value.trim();
      const rating = document.getElementById('reviewRating').value;
      const comment = document.getElementById('reviewComment').value.trim();

      if (!patient_name || !comment) {
        alert('يرجى إدخال الاسم والتعليق');
        return;
      }

      try {
        const res = await fetch('/api/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ patient_name, rating, comment })
        });
        const data = await res.json();
        if (data.success) {
          alert(data.message);
          reviewForm.reset();
          loadPatientReviews();
        } else {
          alert('حدث خطأ أثناء حفظ التقييم');
        }
      } catch (err) {
        alert('حدث خطأ في الاتصال بالسيرفر');
      }
    });
  }

  // تحميل التقييمات تلقائياً عند فتح الصفحة
  loadPatientReviews();
});

// دالة لجلب وعرض التقييمات من السيرفر
async function loadPatientReviews() {
  const container = document.getElementById('reviewsContainer');
  if (!container) return;

  try {
    const res = await fetch('/api/reviews');
    const reviews = await res.json();
    
    if (reviews && reviews.length > 0) {
      container.innerHTML = reviews.map(r => `
        <div class="glass-card" style="padding: 20px; margin-bottom: 15px; border-radius: 12px; background: rgba(255,255,255,0.85);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <h4 style="margin: 0; color: var(--primary);">${escapeHtml(r.patient_name)}</h4>
            <span style="color: #f59e0b; font-size: 0.9rem;">${'★'.repeat(r.rating || 5)}</span>
          </div>
          <p style="margin: 0; color: var(--text-main); line-height: 1.6;">${escapeHtml(r.comment)}</p>
          <small style="display: block; margin-top: 10px; color: var(--text-muted); font-size: 0.75rem;">
            ${new Date(r.created_at || Date.now()).toLocaleDateString('ar-EG')}
          </small>
        </div>
      `).join('');
    } else {
      container.innerHTML = '<p style="text-align: center; color: var(--text-muted);">لا توجد تقييمات حتى الآن. كن أول المقيّمين!</p>';
    }
  } catch (err) {
    console.error('Error loading reviews:', err);
  }
}

// حماية النص من الثغرات
function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
