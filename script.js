document.addEventListener('DOMContentLoaded', () => {
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
        // إرسال البيانات مباشرة إلى ملف Google Sheets عبر Apps Script Web App
        const response = await fetch('https://script.google.com/macros/s/AKfycbx2IUPPFrhk1Iu7DsqeLpFoe1OMh5gIAUdjaqk94tmACGkpx4Ir7735YXt0lNM3oD-qAg/exec', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, phone, country, consultation_type, date, time })
        });
        
        if (response.ok) {
          alert('✅ تم تسجيل حجزك بنجاح وإرساله إلى جدول العيادة!');
          bookingForm.reset();
          
          // فتح الواتساب تلقائياً لتأكيد الحجز مع العيادة
          const waMessage = `مرحباً، أرغب في تأكيد حجز موعد:%0Aالاسم: ${encodeURIComponent(name)}%0Aالهاتف: ${encodeURIComponent(phone)}%0Aالتاريخ: ${date} - الوقت: ${time}%0Aالنوع: ${consultation_type}`;
          window.open(`https://api.whatsapp.com/send?phone=966560533284&text=${waMessage}`, '_blank');
        } else {
          alert('❌ حدث خطأ أثناء تسجيل الحجز، حاول مرة أخرى.');
        }
      } catch (err) {
        console.error('Booking error:', err);
        alert('⚠️ تعذر الاتصال بقاعدة البيانات.');
      }
    });
  }

  // تحميل وعرض التقييمات المخزنة محلياً
  loadPatientReviews();
});

function loadPatientReviews() {
  const container = document.getElementById('reviewsContainer');
  if (!container) return;
  
  const savedReviews = JSON.parse(localStorage.getItem('clinic_reviews') || '[]');
  if (savedReviews.length > 0) {
    container.innerHTML = savedReviews.map(r => `
      <div class="glass-card" style="padding: 20px; margin-bottom: 15px; border-radius: 12px; background: rgba(255,255,255,0.85);">
        <h4 style="margin: 0 0 5px 0; color: var(--primary);">${escapeHtml(r.name)}</h4>
        <span style="color: #f59e0b;">${'★'.repeat(r.rating)}</span>
        <p style="margin: 10px 0 0 0; color: var(--text-main);">${escapeHtml(r.comment)}</p>
      </div>
    `).join('');
  } else {
    container.innerHTML = '<p style="text-align: center; color: var(--text-muted);">كن أول من يشاركنا رأيه!</p>';
  }
}

// نموذج التقييم لتخزينه وعرضه فوراً
document.addEventListener('submit', (e) => {
  if (e.target && e.target.id === 'reviewForm') {
    e.preventDefault();
    const name = document.getElementById('reviewName').value.trim();
    const rating = document.getElementById('reviewRating').value;
    const comment = document.getElementById('reviewComment').value.trim();

    const reviews = JSON.parse(localStorage.getItem('clinic_reviews') || '[]');
    reviews.unshift({ name, rating, comment, date: new Date().toLocaleDateString() });
    localStorage.setItem('clinic_reviews', JSON.stringify(reviews));

    alert('شكراً لك! تم إضافة تقييمك بنجاح.');
    e.target.reset();
    loadPatientReviews();
  }
});

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
