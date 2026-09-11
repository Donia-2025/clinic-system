const express = require('express');
const mysql = require('mysql2');
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

// Local JSON Storage Fallback configuration
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

// Database Connection Manager (MySQL with auto fallback to JSON DB)
let useMySQL = false;

const dbConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'clinic_booking_db',
  port: process.env.MYSQL_PORT || 3306,
  connectTimeout: 3000
};

const pool = mysql.createPool({ ...dbConfig, waitForConnections: true, connectionLimit: 10 });

pool.getConnection((err, connection) => {
  if (err) {
    console.log('ℹ️ MySQL database not reachable. Running on built-in resilient JSON Database.');
    useMySQL = false;
  } else {
    console.log('✅ Connected successfully to MySQL Database!');
    useMySQL = true;
    connection.release();
    
    // Auto-create MySQL Tables if they don't exist
    const createAppointmentsTable = `
      CREATE TABLE IF NOT EXISTS appointments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        date VARCHAR(50) NOT NULL,
        time VARCHAR(50) NOT NULL,
        country VARCHAR(50) DEFAULT 'egypt',
        consultation_type VARCHAR(50) DEFAULT 'in_clinic',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;

    const createReviewsTable = `
      CREATE TABLE IF NOT EXISTS reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        patient_name VARCHAR(255) NOT NULL,
        rating INT DEFAULT 5,
        comment TEXT NOT NULL,
        imageUrl VARCHAR(500) DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;

    pool.query(createAppointmentsTable, (err) => {
      if (err) console.error('Error creating appointments table:', err.message);
      else {
        // Upgrade existing table columns if missing
        pool.query("SHOW COLUMNS FROM appointments", (err, rows) => {
          if (!err && rows) {
            const cols = rows.map(r => r.Field.toLowerCase());
            if (!cols.includes('name')) pool.query("ALTER TABLE appointments ADD COLUMN name VARCHAR(255) DEFAULT ''");
            if (!cols.includes('phone')) pool.query("ALTER TABLE appointments ADD COLUMN phone VARCHAR(50) DEFAULT ''");
            if (!cols.includes('date')) pool.query("ALTER TABLE appointments ADD COLUMN date VARCHAR(50) DEFAULT ''");
            if (!cols.includes('time')) pool.query("ALTER TABLE appointments ADD COLUMN time VARCHAR(50) DEFAULT ''");
            if (!cols.includes('country')) pool.query("ALTER TABLE appointments ADD COLUMN country VARCHAR(50) DEFAULT 'egypt'");
            if (!cols.includes('consultation_type')) pool.query("ALTER TABLE appointments ADD COLUMN consultation_type VARCHAR(50) DEFAULT 'in_clinic'");
          }
        });
      }
    });

    pool.query(createReviewsTable, (err) => {
      if (err) console.error('Error creating reviews table:', err.message);
      else {
        pool.query("SHOW COLUMNS FROM reviews", (err, rows) => {
          if (!err && rows) {
            const cols = rows.map(r => r.Field.toLowerCase());
            if (!cols.includes('patient_name')) pool.query("ALTER TABLE reviews ADD COLUMN patient_name VARCHAR(255) DEFAULT ''");
            if (!cols.includes('comment')) pool.query("ALTER TABLE reviews ADD COLUMN comment TEXT");
            if (!cols.includes('rating')) pool.query("ALTER TABLE reviews ADD COLUMN rating INT DEFAULT 5");
            if (!cols.includes('imageurl')) pool.query("ALTER TABLE reviews ADD COLUMN imageUrl VARCHAR(500) DEFAULT ''");
          }
        });
      }
    });
  }
});

// --- API ENDPOINTS ---

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'Dr. Hisham Genedy Clinic System',
    db_type: useMySQL ? 'MySQL' : 'JSON Storage (Production Resilient)',
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

  if (useMySQL) {
    const sql = 'INSERT INTO appointments (name, phone, date, time, country, consultation_type) VALUES (?, ?, ?, ?, ?, ?)';
    pool.query(sql, [apptData.name, apptData.phone, apptData.date, apptData.time, apptData.country, apptData.consultation_type], (err, result) => {
      if (err) {
        console.error('MySQL Insert Error:', err.message);
        // Fallback to JSON DB if MySQL query fails
        const db = readJsonDB();
        const newId = db.appointments.length > 0 ? Math.max(...db.appointments.map(a => a.id || 0)) + 1 : 1;
        db.appointments.unshift({ id: newId, ...apptData, created_at: new Date().toISOString() });
        writeJsonDB(db);
        return res.json({ success: true, message: 'تم تسجيل حجزك بنجاح!', id: newId });
      }
      res.json({ success: true, message: 'تم تسجيل حجزك بنجاح!', id: result.insertId });
    });
  } else {
    const db = readJsonDB();
    const newId = db.appointments.length > 0 ? Math.max(...db.appointments.map(a => a.id || 0)) + 1 : 1;
    const newAppt = { id: newId, ...apptData, created_at: new Date().toISOString() };
    db.appointments.unshift(newAppt);
    writeJsonDB(db);
    res.json({ success: true, message: 'تم تسجيل حجزك بنجاح!', id: newId });
  }
});

app.get('/api/appointments', (req, res) => {
  if (useMySQL) {
    const sql = 'SELECT * FROM appointments ORDER BY id DESC';
    pool.query(sql, (err, results) => {
      if (err) {
        const db = readJsonDB();
        return res.json(db.appointments || []);
      }
      res.json(results);
    });
  } else {
    const db = readJsonDB();
    res.json(db.appointments || []);
  }
});

app.delete('/api/appointments/:id', (req, res) => {
  const id = req.params.id;
  if (useMySQL) {
    pool.query('DELETE FROM appointments WHERE id = ?', [id], (err, result) => {
      const db = readJsonDB();
      db.appointments = db.appointments.filter(a => String(a.id) !== String(id));
      writeJsonDB(db);
      res.json({ success: true, message: 'تم حذف الحجز بنجاح' });
    });
  } else {
    const db = readJsonDB();
    db.appointments = db.appointments.filter(a => String(a.id) !== String(id));
    writeJsonDB(db);
    res.json({ success: true, message: 'تم حذف الحجز بنجاح' });
  }
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

  if (useMySQL) {
    const sql = 'INSERT INTO reviews (patient_name, comment, rating, imageUrl) VALUES (?, ?, ?, ?)';
    pool.query(sql, [reviewData.patient_name, reviewData.comment, reviewData.rating, reviewData.imageUrl], (err, result) => {
      if (err) {
        const db = readJsonDB();
        const newId = db.reviews.length > 0 ? Math.max(...db.reviews.map(r => r.id || 0)) + 1 : 1;
        db.reviews.unshift({ id: newId, ...reviewData, created_at: new Date().toISOString() });
        writeJsonDB(db);
        return res.json({ success: true, message: 'شكراً لتقييمك ومشاركة تجربتك!' });
      }
      res.json({ success: true, message: 'شكراً لتقييمك ومشاركة تجربتك!' });
    });
  } else {
    const db = readJsonDB();
    const newId = db.reviews.length > 0 ? Math.max(...db.reviews.map(r => r.id || 0)) + 1 : 1;
    const newReview = { id: newId, ...reviewData, created_at: new Date().toISOString() };
    db.reviews.unshift(newReview);
    writeJsonDB(db);
    res.json({ success: true, message: 'شكراً لتقييمك ومشاركة تجربتك!' });
  }
});

app.get('/api/reviews', (req, res) => {
  if (useMySQL) {
    const sql = 'SELECT * FROM reviews ORDER BY id DESC';
    pool.query(sql, (err, results) => {
      if (err) {
        const db = readJsonDB();
        return res.json(db.reviews || []);
      }
      res.json(results);
    });
  } else {
    const db = readJsonDB();
    res.json(db.reviews || []);
  }
});

app.delete('/api/reviews/:id', (req, res) => {
  const id = req.params.id;
  if (useMySQL) {
    pool.query('DELETE FROM reviews WHERE id = ?', [id], (err, result) => {
      const db = readJsonDB();
      db.reviews = db.reviews.filter(r => String(r.id) !== String(id));
      writeJsonDB(db);
      res.json({ success: true, message: 'تم حذف التقييم بنجاح' });
    });
  } else {
    const db = readJsonDB();
    db.reviews = db.reviews.filter(r => String(r.id) !== String(id));
    writeJsonDB(db);
    res.json({ success: true, message: 'تم حذف التقييم بنجاح' });
  }
});

// Fallback route to serve index.html for single-page routing (Express 5 compatible)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'Frontend', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Dr. Hisham Genedy Clinic Server is running on Port ${PORT}`);
  console.log(`🔗 Local Access: http://localhost:${PORT}`);
});