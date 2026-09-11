const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'Frontend')));

// Local JSON Storage Configuration (Fast, Free, & 100% Reliable on Vercel)
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (!fs.existsSync(DB_FILE)) {
  const initialData = {
    appointments: [
      {
        id: 1,
        name: "أحمد محمود",
        phone: "01012345678",
        date: "2026-09-15",
        time: "18:00",
        country: "egypt",
        consultation_type: "in_clinic",
        created_at: new Date().toISOString()
      }
    ],
    reviews: [
      {
        id: 1,
        patient_name: "محمد علي",
        rating: 5,
        comment: "دكتور ممتاز جداً وخبرة عالية في جراحة الأنف والجيوب الأنفية. الرعاية كانت ممتازة والتنفس تحسن كثيراً بعد العملية.",
        imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        patient_name: "د. سارة الأحمد",
        rating: 5,
        comment: "عملت عملية تعديل حاجز أنفي وشخير، النتيجة فوق الممتازة والدكتور متابع خطوة بخطوة بعد العملية.",
        imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
        created_at: new Date().toISOString()
      }
    ]
  };
  fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
}

function readJsonDB() {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    return { appointments: [], reviews: [] };
  }
}

function writeJsonDB(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing to local JSON DB:', err);
  }
}

// --- API ENDPOINTS ---

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'Dr. Hisham Genedy Clinic System',
    db_type: 'JSON Storage (High Performance & Free)',
    timestamp: new Date().toISOString()
  });
});

// 1. Appointments APIs
app.post('/api/appointments', (req, res) => {
  const { name, phone, date, time, country, consultation_type } = req.body;
  if (!name || !phone) {
    return res.status(400).json({ success: false, message: 'الاسم ورقم الهاتف مطلوبان' });
  }

  const apptData = {
    name: name.trim(),
    phone: phone.trim(),
    date: date || new Date().toISOString().split('T')[0],
    time: time || '18:00',
    country: country || 'egypt',
    consultation_type: consultation_type || 'in_clinic'
  };

  const db = readJsonDB();
  const newId = db.appointments.length > 0 ? Math.max(...db.appointments.map(a => a.id || 0)) + 1 : 1;
  const newAppt = { id: newId, ...apptData, created_at: new Date().toISOString() };
  db.appointments.unshift(newAppt);
  writeJsonDB(db);
  
  // تتبع الحجز في الـ Logs للتأكد من التسجيل
  console.log("📌 تم تسجيل حجز جديد بنجاح:", newAppt);

  res.json({ success: true, message: 'تم تسجيل حجزك بنجاح!', id: newId });
});

app.get('/api/appointments', (req, res) => {
  const db = readJsonDB();
  res.json(db.appointments || []);
});

app.delete('/api/appointments/:id', (req, res) => {
  const id = req.params.id;
  const db = readJsonDB();
  db.appointments = db.appointments.filter(a => String(a.id) !== String(id));
  writeJsonDB(db);
  res.json({ success: true, message: 'تم حذف الحجز بنجاح' });
});

// 2. Reviews APIs
app.post('/api/reviews', (req, res) => {
  const { patient_name, comment, rating, imageUrl } = req.body;
  if (!patient_name || !comment) {
    return res.status(400).json({ success: false, message: 'الاسم والرأي مطلوبان' });
  }

  const reviewData = {
    patient_name: patient_name.trim(),
    comment: comment.trim(),
    rating: parseInt(rating) || 5,
    imageUrl: imageUrl || ''
  };

  const db = readJsonDB();
  const newId = db.reviews.length > 0 ? Math.max(...db.reviews.map(r => r.id || 0)) + 1 : 1;
  const newReview = { id: newId, ...reviewData, created_at: new Date().toISOString() };
  db.reviews.unshift(newReview);
  writeJsonDB(db);
  
  // تتبع التقييم في الـ Logs للتأكد من التسجيل
  console.log("⭐ تم تسجيل تقييم جديد بنجاح:", newReview);

  res.json({ success: true, message: 'شكراً لتقييمك ومشاركة تجربتك!' });
});

app.get('/api/reviews', (req, res) => {
  const db = readJsonDB();
  res.json(db.reviews || []);
});

app.delete('/api/reviews/:id', (req, res) => {
  const id = req.params.id;
  const db = readJsonDB();
  db.reviews = db.reviews.filter(r => String(r.id) !== String(id));
  writeJsonDB(db);
  res.json({ success: true, message: 'تم حذف التقييم بنجاح' });
});

// Fallback route to serve index.html for single-page routing (Express 5 compatible)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'Frontend', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Dr. Hisham Genedy Clinic Server is running on Port ${PORT}`);
  console.log(`🔗 Local Access: http://localhost:${PORT}`);
});
