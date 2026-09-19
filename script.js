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

// دالة إرسال الحجز لشيت جوجل وتوجيه المستخدم للواتساب معاً
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

  // ===== (1) إرسال البيانات إلى شيت جوجل (Google Sheets Web App URL) =====
  // استبدلي الرابط التالي برابط الـ Web App الخاص بكِ
  const googleSheetUrl = "https://script.google.com/macros/s/AKfycby.../exec"; 

  const formData = new URLSearchParams();
  formData.append('name', name);
  formData.append('phone', phone);
  formData.append('country', country);
  formData.append('consultationType', consultationType);
  formData.append('complaint', complaint);
  formData.append('date', date);
  formData.append('time', time);

  // إرسال البيانات في الخلفية لشيت جوجل دون مغادرة الصفحة
  fetch(googleSheetUrl, {
    method: 'POST',
    mode: 'no-cors',
    body: formData
  }).catch(error => console.log('Google Sheet Error:', error));

  // ===== (2) فتح واتساب بالرسالة المنسقة =====
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
  
  // فتح الواتساب في تبويب جديد
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
