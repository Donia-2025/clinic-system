// حالة اللغة الحالية (افتراضياً الإنجليزية أو حسب تفضيلك)
let isArabic = false;

// دالة التنقل بين الصفحات (Show / Hide Pages)
function showPage(pageId) {
  const pages = document.querySelectorAll('main > div');
  pages.forEach(page => {
    page.classList.add('hidden');
    page.classList.remove('active-page');
  });

  const targetPage = document.getElementById(pageId);
  if (targetPage) {
    targetPage.classList.remove('hidden');
    targetPage.classList.add('active-page');
  }

  const navLinks = document.querySelectorAll('.nav-links a');
  navLinks.forEach(link => {
    link.classList.remove('active');
    const onclickAttr = link.getAttribute('onclick');
    if (onclickAttr && onclickAttr.includes(pageId)) {
      link.classList.add('active');
    }
  });

  const navMenu = document.getElementById('navLinks');
  if (navMenu) {
    navMenu.classList.remove('mobile-active');
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// دالة تبديل اللغة (عربي / إنجليزي)
function toggleLanguage() {
  isArabic = !isArabic;
  const htmlTag = document.documentElement;
  const langText = document.getElementById('langText');

  if (isArabic) {
    htmlTag.setAttribute('dir', 'rtl');
    htmlTag.setAttribute('lang', 'ar');
    if (langText) langText.textContent = 'English';
  } else {
    htmlTag.setAttribute('dir', 'ltr');
    htmlTag.setAttribute('lang', 'en');
    if (langText) langText.textContent = 'عربي';
  }

  const elements = document.querySelectorAll('[data-ar][data-en]');
  elements.forEach(el => {
    if (isArabic) {
      el.textContent = el.getAttribute('data-ar');
    } else {
      el.textContent = el.getAttribute('data-en');
    }
  });
}

// دالة تفعيل قائمة الموبايل الجانبية
function toggleMobileMenu() {
  const navLinks = document.getElementById('navLinks');
  if (navLinks) {
    navLinks.classList.toggle('mobile-active');
  }
}

// دالة لإظهار خانة الوقت المخصص إذا تم اختيار "وقت أخري"
function checkCustomTime(selectElement) {
  const customTimeGroup = document.getElementById('customTimeGroup');
  if (selectElement.value === 'وقت أخري') {
    customTimeGroup.style.display = 'block';
    document.getElementById('custom-time').required = true;
  } else {
    customTimeGroup.style.display = 'none';
    document.getElementById('custom-time').required = false;
  }
}

// دالة فتح وإغلاق الأسئلة الشائعة (FAQ Accordion)
function toggleFaq(element) {
  const answer = element.querySelector('.faq-answer');
  const icon = element.querySelector('.faq-icon');
  
  if (answer.style.display === 'block') {
    answer.style.display = 'none';
    icon.style.transform = 'rotate(0deg)';
  } else {
    answer.style.display = 'block';
    icon.style.transform = 'rotate(180deg)';
  }
}

// ===== رابط شيت التقييمات الجديد =====
const reviewsSheetUrl = "https://script.google.com/macros/s/AKfycbwPEI_YL4J2kmobWWcodLj8-bZBIpaN2sHDXZVVTknatPduVugA1CA6TL31Aw6T14mX/exec";

document.addEventListener('DOMContentLoaded', () => {
  loadReviews();

  const reviewForm = document.getElementById('reviewForm');
  if (reviewForm) {
    reviewForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const name = document.getElementById('reviewName').value;
      const rating = document.getElementById('reviewRating').value;
      const comment = document.getElementById('reviewComment').value;

      const queryString = `?name=${encodeURIComponent(name)}&rating=${encodeURIComponent(rating)}&comment=${encodeURIComponent(comment)}`;
      
      fetch(reviewsSheetUrl + queryString, { mode: 'no-cors' })
        .then(() => {
          reviewForm.reset();
          alert(isArabic ? 'شكراً لك! تم إضافة تقييمك بنجاح وعرضه.' : 'Thank you! Your review has been added and displayed successfully.');
          setTimeout(loadReviews, 2500); // تحديث القائمة بعد ثوانٍ لتظهر البيانات المقروءة من الشيت
        })
        .catch(error => console.log('Review Submit Error:', error));
    });
  }
});

function loadReviews() {
  const container = document.getElementById('reviewsContainer');
  if (!container) return;

  fetch(reviewsSheetUrl)
    .then(response => response.json())
    .then(reviews => {
      if (!reviews || reviews.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-muted);">لا توجد تقييمات حتى الآن. كن أول من يقييم!</p>';
        return;
      }

      container.innerHTML = '';
      // عكس الترتيب لتظهر أحدث التقييمات في الأعلى
      reviews.reverse().forEach(rev => {
        let stars = '★'.repeat(parseInt(rev.rating) || 5) + '☆'.repeat(5 - (parseInt(rev.rating) || 5));
        const card = document.createElement('div');
        card.className = 'glass-card review-card';
        card.style.cssText = 'padding: 15px; margin-bottom: 12px; border-radius: 12px;';
        card.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <strong style="font-size: 1rem;">${rev.name}</strong>
            <span style="color: #f39c12; font-size: 0.95rem;">${stars}</span>
          </div>
          <p style="margin: 0; font-size: 0.95rem; color: var(--text-muted); line-height: 1.5;">${rev.comment}</p>
          <span style="font-size: 0.75rem; color: #888; display: block; margin-top: 8px;">${rev.date}</span>
        `;
        container.appendChild(card);
      });
    })
    .catch(error => {
      console.log('Error loading reviews:', error);
    });
}

// دالة إرسال الحجز لشيت جوجل للحجوزات وتوجيه المستخدم للواتساب معاً
function sendBookingWhatsApp(event) {
  event.preventDefault();
  
  const name = document.getElementById('name').value;
  const phone = document.getElementById('phone').value;
  const country = document.getElementById('country').value;
  const consultationType = document.getElementById('consultation-type').value;
  const complaint = document.getElementById('complaint').value;
  const date = document.getElementById('date').value;
  
  let time = document.getElementById('time').value;
  if (time === 'وقت أخري') {
    const customTime = document.getElementById('custom-time').value;
    if (customTime) {
      time = customTime;
    }
  }

  // ===== رابط شيت جوجل الخاص بالحجوزات =====
  const googleSheetUrl = "https://script.google.com/macros/s/AKfycbzGSNPJcKhWdo6NP_AzTbAYLQsmo6ox1cqOTmRwD4V5CduOw_xQg3GiHjKnnvVbDhd1LQ/exec"; 

  // إرسال بيانات الحجز في الخلفية لتسجيلها في الشيت
  const queryString = `?name=${encodeURIComponent(name)}&phone=${encodeURIComponent(phone)}&country=${encodeURIComponent(country)}&time=${encodeURIComponent(time)}&date=${encodeURIComponent(date)}&consultant=${encodeURIComponent(consultationType)}&complaint=${encodeURIComponent(complaint)}`;
  
  fetch(googleSheetUrl + queryString, { mode: 'no-cors' }).catch(e => console.log('Sheet Error:', e));

  // ===== فتح واتساب بالرسالة المنسقة فوراً =====
  const clinicWhatsAppNumber = "966560533284";
  const message = `مرحباً، أرغب في حجز موعد جديد في عيادة د. هشام جنيدي:
  
👤 الاسم: ${name}
📞 الهاتف: ${phone}
🌍 الدولة: ${country}
🏥 نوع الاستشارة: ${consultationType}
🩺 الشكوى / سبب الكشف: ${complaint}
📅 التاريخ المفضل: ${date}
⏰ الوقت المفضل: ${time}`;

  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${clinicWhatsAppNumber}&text=${encodedMessage}`;
  
  window.open(whatsappUrl, '_blank');
}

// مشغل الموسيقى الخلفي للعيادة
function toggleMusic() {
  const music = document.getElementById('background-music');
  const icon = document.getElementById('music-icon');
  
  if (music.paused) {
    music.play().then(() => {
      icon.classList.remove('fa-play');
      icon.classList.add('fa-pause');
    }).catch(e => {
      console.log("Audio autoplay restricted:", e);
    });
  } else {
    music.pause();
    icon.classList.remove('fa-pause');
    icon.classList.add('fa-play');
  }
}

// فتح صور المعرض (Lightbox)
function openLightbox(index) {
  const images = [
    "https://i.postimg.cc/PqScW0T4/IMG-20250411-WA0014.jpg",
    "https://i.postimg.cc/7LHdTq8h/IMG-20250411-WA0018.jpg",
    "https://i.postimg.cc/d3yxK1dH/IMG-20250411-WA0019.jpg",
    "https://i.postimg.cc/rwcYvqpj/IMG-20250411-WA0024.jpg",
    "https://i.postimg.cc/662SZHSr/IMG-20250411-WA0022.jpg",
    "https://i.postimg.cc/65K0QYN5/Whats-App-Image-2025-04-11-at-01-28-57-763a52fa.jpg"
  ];
  
  const lightbox = document.getElementById('gallery-lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  
  if (lightbox && lightboxImg && images[index]) {
    lightboxImg.src = images[index];
    lightbox.style.display = 'flex';
  }
}

function closeLightbox() {
  const lightbox = document.getElementById('gallery-lightbox');
  if (lightbox) {
    lightbox.style.display = 'none';
  }
}
