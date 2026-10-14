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
  if (!customTimeGroup) return;
  if (selectElement.value === 'وقت أخري') {
    customTimeGroup.style.display = 'block';
    const customTimeInput = document.getElementById('custom-time');
    if (customTimeInput) customTimeInput.required = true;
  } else {
    customTimeGroup.style.display = 'none';
    const customTimeInput = document.getElementById('custom-time');
    if (customTimeInput) customTimeInput.required = false;
  }
}

// دالة فتح وإغلاق الأسئلة الشائعة (FAQ Accordion)
function toggleFaq(element) {
  const answer = element.querySelector('.faq-answer');
  const icon = element.querySelector('.faq-icon');
  
  if (answer) {
    if (answer.style.display === 'block') {
      answer.style.display = 'none';
      if (icon) icon.style.transform = 'rotate(0deg)';
    } else {
      answer.style.display = 'block';
      if (icon) icon.style.transform = 'rotate(180deg)';
    }
  }
}

// ===== رابط شيت التقييمات =====
const reviewsSheetUrl = "https://script.google.com/macros/s/AKfycbzNQRevxzEqFaiR7UQuBnc9PY-Eilved8Xx1WwuwFkLMZg3D_vQMyjBVN8JdZAOu3IO/exec";

document.addEventListener('DOMContentLoaded', () => {
  // إظهار الصفحة الرئيسية افتراضياً عند تحميل الموقع حتى لا يظهر فارغاً
  showPage('home');
  
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
          setTimeout(loadReviews, 2000);
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
        container.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 20px;">لا توجد تقييمات حتى الآن. كن أول من يقييم!</p>';
        return;
      }

      container.innerHTML = '';
      reviews.reverse().forEach(rev => {
        let stars = '★'.repeat(parseInt(rev.rating) || 5) + '☆'.repeat(5 - (parseInt(rev.rating) || 5));
        
        const card = document.createElement('div');
        card.className = 'glass-card review-card';
        card.style.cssText = 'background: #ffffff; border: 1px solid #e2e8f0; padding: 20px; margin-bottom: 16px; border-radius: 16px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);';
        
        card.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="width: 38px; height: 38px; background: #0f766e; color: white; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1rem;">
                ${rev.name ? rev.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <strong style="font-size: 1rem; color: #1e293b; display: block;">${rev.name}</strong>
                <span style="font-size: 0.75rem; color: #94a3b8;">${rev.date}</span>
              </div>
            </div>
            <div style="color: #f59e0b; font-size: 1rem; letter-spacing: 1px;">
              ${stars}
            </div>
          </div>
          <p style="margin: 0; font-size: 0.95rem; color: #475569; line-height: 1.6;">${rev.comment}</p>
        `;
        container.appendChild(card);
      });
    })
    .catch(error => {
      console.log('Error loading reviews:', error);
    });
}

// ===== دالة إرسال الحجز لشيت الحجوزات والواتساب =====
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

  const googleSheetUrl = "https://script.google.com/macros/s/AKfycbzGSNPJcKhWdo6NP_AzTbAYLQsmo6ox1cqOTmRwD4V5CduOw_xQg3GiHjKnnvVbDhd1LQ/exec"; 

  const queryString = `?name=${encodeURIComponent(name)}&phone=${encodeURIComponent(phone)}&country=${encodeURIComponent(country)}&time=${encodeURIComponent(time)}&date=${encodeURIComponent(date)}&consultant=${encodeURIComponent(consultationType)}&complaint=${encodeURIComponent(complaint)}`;
  
  fetch(googleSheetUrl + queryString, { mode: 'no-cors' }).catch(e => console.log('Sheet Error:', e));

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

// ===== مشغل الموسيقى الخلفي =====
function toggleMusic() {
  const music = document.getElementById('background-music');
  const icon = document.getElementById('music-icon');
  
  if (music && music.paused) {
    music.play().then(() => {
      if (icon) {
        icon.classList.remove('fa-play');
        icon.classList.add('fa-pause');
      }
    }).catch(e => {
      console.log("Audio autoplay restricted:", e);
    });
  } else if (music) {
    music.pause();
    if (icon) {
      icon.classList.remove('fa-pause');
      icon.classList.add('fa-play');
    }
  }
}

// ===== معرض الصور (Lightbox) =====
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
