// روابط الـ Web Apps الخاصة بجوجل
const bookingURL = 'https://script.google.com/macros/s/AKfycbzHlGljWOFQZdu4tVIAUPi94hXFd8IFJF8lEwYUgu4-9e1G74qEyKrMN39wyi5O2ApYaQ/exec'; // رابط الحجز
const reviewScriptURL = 'https://script.google.com/macros/s/AKfycbxWYwAhWlCfH41VR-ogi3viZtFfNNHK9R7PM9-bWGF5bf4uCzkPLVYnaclfUkJfuYeZ/exec'; // رابط الآراء والتقييمات

document.addEventListener('DOMContentLoaded', () => {
  
  // 1. التعامل مع فورم الحجز
  const bookingForm = document.getElementById('bookingForm');
  if (bookingForm) {
    bookingForm.addEventListener('submit', e => {
      e.preventDefault();
      
      const formData = {
        name: document.getElementById('name').value,
        phone: document.getElementById('phone').value,
        country: document.getElementById('country').value,
        consultationType: document.getElementById('consultation-type').value,
        date: document.getElementById('date').value,
        time: document.getElementById('time').value
      };

      fetch(bookingURL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      .then(() => {
        alert('تم حجز موعدك بنجاح!');
        bookingForm.reset();
      })
      .catch(error => {
        console.error('Error!', error);
        alert('حدث خطأ في الاتصال، جربي مرة أخرى.');
      });
    });
  }

  // 2. جلب وعرض الآراء تلقائياً عند فتح الصفحة
  loadReviews();

  // 3. التعامل مع فورم إرسال التقييم/الرأي
  const reviewForm = document.getElementById('reviewForm');
  if (reviewForm) {
    reviewForm.addEventListener('submit', async e => {
      e.preventDefault();
      
      const reviewData = {
        name: document.getElementById('reviewName').value,
        rating: document.getElementById('reviewRating').value,
        comment: document.getElementById('reviewComment').value
      };

      try {
        await fetch(reviewScriptURL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(reviewData)
        });
        
        alert('شكراً لك! تم إرسال تقييمك بنجاح.');
        reviewForm.reset();
        
        // إعادة تحميل الآراء بعد ثوانٍ لتظهر فوراً على الصفحة
        setTimeout(loadReviews, 2000);
      } catch (error) {
        console.error('Error!', error);
        alert('حدث خطأ أثناء إرسال التقييم.');
      }
    });
  }

});

// دالة جلب الآراء من الشيت وعرضها في الكارتات
async function loadReviews() {
  const container = document.getElementById('reviewsContainer');
  if (!container) return;

  try {
    const response = await fetch(reviewScriptURL);
    const reviews = await response.json();
    
    if (!reviews || reviews.length === 0) {
      container.innerHTML = '<p style="text-align: center; color: var(--text-muted);">لا توجد آراء مسجلة حتى الآن. كُن أول من يشاركنا رأيه!</p>';
      return;
    }
    
    container.innerHTML = '';
    // ترتيب الآراء بحيث الأحدث يظهر أولاً
    reviews.reverse().forEach(rev => {
      const stars = '★'.repeat(Number(rev.rating) || 5) + '☆'.repeat(5 - (Number(rev.rating) || 5));
      
      const card = document.createElement('div');
      card.className = 'glass-card';
      card.style.cssText = 'margin-bottom: 15px; padding: 15px; border-radius: 12px;';
      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <strong style="font-size: 1.05rem; color: var(--dark);">${rev.name}</strong>
          <span style="color: #f59e0b; font-size: 0.9rem;">${stars}</span>
        </div>
        <p style="color: var(--text-main); margin-bottom: 8px; line-height: 1.6;">${rev.comment}</p>
        <small style="color: var(--text-muted); font-size: 0.8rem;">${rev.date || ''}</small>
      `;
      container.appendChild(card);
    });
  } catch (error) {
    console.error('Error loading reviews:', error);
    container.innerHTML = '<p style="text-align: center; color: var(--text-muted);">تعذر تحميل الآراء حالياً.</p>';
  }
}
