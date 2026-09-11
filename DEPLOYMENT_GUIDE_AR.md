# دليل رفع واستضافة موقع عيادة د. هشام الجندي وربطه بالدومين الخاص (drhishamgenedy.com)

هذا الدليل يشرح خطوة بخطوة كيفية رفع النظام وربطه بالدومين الخاص بك بأسهل وأفضل الطرق المتاحة.

---

## 🌟 الطريقة الأولى: الرفع المباشر والمجاني على منصة Render (موصى بها للسيرفرات وقواعد البيانات)

### الخطوات:
1. قم بإنشاء حساب مجاني على موقع [Render.com](https://render.com).
2. قم برفع مجلد المشروع إلى حسابك على **GitHub**.
3. في Render، اضغط على **New +** ثم اختر **Web Service**.
4. اختر المستودع (Repository) الخاص بالمشروع من GitHub.
5. املأ البيانات التالية:
   - **Name**: `dr-hisham-clinic`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
6. اضغط على **Create Web Service**. سيتم تشغيل الموقع والسيرفر خلال دقيقة!

---

## ⚡ الطريقة الثانية: الرفع على Vercel (سريعة جداً)

### الخطوات:
1. قم بإنشاء حساب على [Vercel.com](https://vercel.com).
2. اضغط على **Add New** -> **Project**.
3. قم بربط حساب GitHub واختيار مجلد المشروع.
4. اترك الإعدادات الافتراضية كما هي (الملف `vercel.json` الموجود بالمشروع سيتكفل بالباقي تلقائياً).
5. اضغط **Deploy**.

---

## 🌐 كيفية ربط الدومين الخاص بك (مثال: `drhishamgenedy.com`)

بعد رفع الموقع على Vercel أو Render، يمكنك ربط أي دومين قمت بشائه (من Namecheap أو GoDaddy أو Hostinger):

### 1️⃣ إضافة الدومين في لوحة استضافة الموقع (Render / Vercel):
- ادخل إلى **Settings** -> **Custom Domains**.
- اكتب اسم الدومين الخاص بك: `drhishamgenedy.com` و `www.drhishamgenedy.com`.
- سيظهر لك الموقع سجلات DNS المطلوب إضافتها (CNAME أو A Record).

### 2️⃣ ضبط سجلات الـ DNS في الشركة المزودة للدومين (GoDaddy / Namecheap):
- ادخل لشركة الدومينات واذهب إلى **DNS Management**.
- اضغط **Add Record**:
  - **Type**: `A` | **Name**: `@` | **Value**: `216.24.57.1` *(أو IP المنصة)*
  - **Type**: `CNAME` | **Name**: `www` | **Value**: `dr-hisham-clinic.onrender.com`
- تحفظ التغييرات. ينشط الدومين وشهادة الأمان SSL (HTTPS) تلقائياً خلال دقائق!

---

## 🗄️ ربط قاعدة البيانات MySQL (اختياري)

النظام يحتوي على **نظام حماية وسرعة ذكي جداً**:
- يعمل تلقائياً وبشكل مباشر دون أي إعدادات معقدة باستخدام قاعدة بيانات سريعة (JSON DB).
- إذا رغبت في ربطه بقاعدة بيانات **MySQL خارجية** (مثل PlanetScale أو Railway أو Hostinger):
  - قم بإضافة متغيرات البيئة التالية في لوحة التحكم الخاصة بالاستضافة (Environment Variables):
    ```env
    MYSQL_HOST=your-db-host.com
    MYSQL_USER=your_db_user
    MYSQL_PASSWORD=your_db_password
    MYSQL_DATABASE=clinic_booking_db
    MYSQL_PORT=3306
    ```
  - وسيتصل النظام تلقائياً بالـ MySQL دون الحاجة للتعديل على الكود!

---

## 🛠️ تجربة وتشغيل المشروع محلياً على جهازك

لتشغيل المشروع الآن على جهازك الشخصي:
```bash
npm start
```
ثم فتح المتصفح على: `http://localhost:5000`
ولوحة التحكم على: `http://localhost:5000/admin.html`
