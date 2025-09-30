# دليل تثبيت نظام إدارة المبيعات والمشتريات

## المتطلبات الأساسية

### للواجهة الخلفية (Backend)
- Python 3.11 أو أحدث
- قاعدة بيانات PostgreSQL (اختياري، يمكن استخدام SQLite للاختبار)

### للواجهة الأمامية (Frontend)
- Node.js 18 أو أحدث
- npm أو yarn

## خطوات التثبيت

### 1. تثبيت الواجهة الخلفية (Backend)

1. **استخراج الملفات**:
   ```
   unzip sales_management_system_backup.zip
   ```

2. **إنشاء بيئة افتراضية**:
   ```
   cd sales_management_api
   python -m venv venv
   
   # تفعيل البيئة الافتراضية
   # على Windows:
   venv\Scripts\activate
   # على macOS/Linux:
   source venv/bin/activate
   ```

3. **تثبيت المكتبات المطلوبة**:
   ```
   pip install flask flask-sqlalchemy flask-cors psycopg2-binary
   ```

4. **تشغيل الخادم**:
   ```
   python src/main.py
   ```
   سيعمل الخادم على المنفذ 5000: http://localhost:5000

### 2. تثبيت الواجهة الأمامية (Frontend)

1. **استخراج الملفات**:
   ```
   unzip sales_management_system_backup.zip
   ```

2. **تثبيت المكتبات المطلوبة**:
   ```
   cd sales-management-system
   npm install
   ```

3. **تعديل ملف التكوين**:
   قم بإنشاء ملف `src/config.js` بالمحتوى التالي:
   ```javascript
   // عنوان API
   export const API_URL = 'http://localhost:5000'; // للتطوير المحلي
   // export const API_URL = 'https://your-api-domain.com'; // للإنتاج
   ```

4. **تشغيل خادم التطوير**:
   ```
   npm run dev
   ```
   سيعمل الخادم على المنفذ 5173: http://localhost:5173

5. **بناء نسخة الإنتاج**:
   ```
   npm run build
   ```
   سيتم إنشاء نسخة الإنتاج في مجلد `dist`

## النشر على الإنترنت

### نشر الواجهة الخلفية (Backend)

1. **اختيار خدمة استضافة** تدعم Python مثل:
   - Heroku
   - Railway
   - Render
   - PythonAnywhere

2. **تكوين متغيرات البيئة**:
   - `DATABASE_URL`: رابط قاعدة البيانات PostgreSQL

3. **نشر الكود**:
   اتبع تعليمات خدمة الاستضافة المختارة لنشر تطبيق Flask

### نشر الواجهة الأمامية (Frontend)

1. **اختيار خدمة استضافة** للمواقع الثابتة مثل:
   - Netlify
   - Vercel
   - GitHub Pages
   - Firebase Hosting

2. **تحديث ملف التكوين**:
   قم بتعديل ملف `src/config.js` ليشير إلى عنوان API المنشور

3. **بناء نسخة الإنتاج**:
   ```
   npm run build
   ```

4. **نشر المجلد `dist`**:
   قم بنشر محتويات مجلد `dist` على خدمة الاستضافة المختارة

## بيانات تسجيل الدخول الافتراضية

- **مدير**: اسم المستخدم: `admin` / كلمة المرور: `admin123`
- **محاسب**: اسم المستخدم: `accountant` / كلمة المرور: `acc123`
- **مندوب مبيعات**: اسم المستخدم: `sales` / كلمة المرور: `sales123`
- **أمين مخزن**: اسم المستخدم: `inventory` / كلمة المرور: `inv123`

## الدعم والمساعدة

للحصول على المساعدة، يرجى التواصل مع:

- الاسم: م/أحمد الملا
- رقم الهاتف: 01008388450
- البريد الإلكتروني: ramzy.petro@gmail.com
