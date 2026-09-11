const scriptURL = 'https://script.google.com/macros/s/AKfycbzHlGljWOFQZdu4tVIAUPi94hXFd8IFJF8lEwYUgu4-9e1G74qEyKrMN39wyi5O2ApYaQ/exec';

document.addEventListener('DOMContentLoaded', () => {
  const bookingForm = document.getElementById('bookingForm');
  
  if (bookingForm) {
    bookingForm.addEventListener('submit', e => {
      e.preventDefault();
      
      // جمع البيانات من حقول الفورم (تأكدي أن الـ IDs تطابق الـ HTML عندك)
      const formData = {
        name: document.getElementById('name').value,
        phone: document.getElementById('phone').value,
        date: document.getElementById('date').value,
        time: document.getElementById('time').value
      };

      fetch(scriptURL, {
        method: 'POST',
        mode: 'no-cors', // ضروري جداً لتجنب أخطاء الـ CORS مع جوجل
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      .then(() => {
        alert('تم حجز موعدك بنجاح!');
        bookingForm.reset();
        
        // لو حابّة توجهي المريض لواتساب بعد الحجز، ممكن تفعلي السطر ده وتعدلي رقمك:
        // window.location.href = `https://wa.me/2010xxxxxxxx?text=مرحباً، لقد قمت بحجز موعد باسم ${formData.name}`;
      })
      .catch(error => {
        console.error('Error!', error.message);
        alert('حدث خطأ في الاتصال، تأكدي من الإنترنت وجربي مرة أخرى.');
      });
    });
  }
});
