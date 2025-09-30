# تعديلات نظام إدارة المبيعات والمشتريات

## المقدمة

هذا المستند يحتوي على التعديلات المطلوبة لنظام إدارة المبيعات والمشتريات، مع تعليمات مفصلة لتنفيذها. التعديلات تشمل:

1. تفعيل حفظ البيانات وإصلاح قاعدة البيانات
2. إضافة توقيع المطور ومعلومات التواصل
3. تفعيل دورة العمل المتكاملة (إدارة العملاء، الموردين، الموظفين)
4. تفعيل نظام التقارير

## 1. تفعيل حفظ البيانات وإصلاح قاعدة البيانات

### 1.1 تكوين قاعدة بيانات دائمة

#### تعديل ملف الاتصال بقاعدة البيانات

قم بتعديل ملف `sales_management_api/src/models/models.py` ليستخدم قاعدة بيانات PostgreSQL بدلاً من SQLite:

```python
from flask_sqlalchemy import SQLAlchemy
import os

db = SQLAlchemy()

def init_db(app):
    # استخدام قاعدة بيانات PostgreSQL إذا كانت متاحة، وإلا استخدام SQLite
    database_url = os.environ.get('DATABASE_URL', 'sqlite:///database/app.db')
    
    # تعديل رابط PostgreSQL إذا كان من Heroku (يبدأ بـ postgres://)
    if database_url.startswith('postgres://'):
        database_url = database_url.replace('postgres://', 'postgresql://', 1)
    
    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    db.init_app(app)
    
    # إنشاء جميع الجداول إذا لم تكن موجودة
    with app.app_context():
        db.create_all()
```

#### إنشاء ملف للتهيئة الأولية للبيانات

قم بإنشاء ملف `sales_management_api/src/init_data.py` لتهيئة البيانات الأولية:

```python
from models.models import db, User, Role, Company
from werkzeug.security import generate_password_hash

def init_data():
    # إنشاء الأدوار إذا لم تكن موجودة
    roles = {
        'admin': 'مدير النظام',
        'accountant': 'محاسب',
        'sales': 'مندوب مبيعات',
        'inventory': 'أمين مخزن'
    }
    
    for role_name, role_desc in roles.items():
        if not Role.query.filter_by(name=role_name).first():
            role = Role(name=role_name, description=role_desc)
            db.session.add(role)
    
    # إنشاء المستخدمين الافتراضيين إذا لم يكونوا موجودين
    default_users = [
        {'username': 'admin', 'password': 'admin123', 'name': 'مدير النظام', 'role': 'admin'},
        {'username': 'accountant', 'password': 'acc123', 'name': 'محاسب', 'role': 'accountant'},
        {'username': 'sales', 'password': 'sales123', 'name': 'مندوب مبيعات', 'role': 'sales'},
        {'username': 'inventory', 'password': 'inv123', 'name': 'أمين مخزن', 'role': 'inventory'}
    ]
    
    for user_data in default_users:
        if not User.query.filter_by(username=user_data['username']).first():
            role = Role.query.filter_by(name=user_data['role']).first()
            user = User(
                username=user_data['username'],
                password_hash=generate_password_hash(user_data['password']),
                name=user_data['name'],
                role_id=role.id if role else None
            )
            db.session.add(user)
    
    # إنشاء بيانات الشركة الافتراضية إذا لم تكن موجودة
    if not Company.query.first():
        company = Company(
            name="شركة نموذجية",
            address="العنوان، المدينة، البلد",
            phone="01234567890",
            email="info@example.com",
            tax_number="123456789",
            logo_url="/static/images/logo.png"
        )
        db.session.add(company)
    
    # حفظ التغييرات
    db.session.commit()
```

#### تعديل ملف `main.py` لاستدعاء تهيئة البيانات

قم بتعديل ملف `sales_management_api/src/main.py` لاستدعاء تهيئة البيانات:

```python
from flask import Flask
from flask_cors import CORS
from models.models import init_db
from init_data import init_data
from routes import user, company, employees, products, customers_suppliers, sales_purchases, inventory, reports

app = Flask(__name__)
CORS(app)

# تهيئة قاعدة البيانات
init_db(app)

# تسجيل جميع المسارات
app.register_blueprint(user.bp)
app.register_blueprint(company.bp)
app.register_blueprint(employees.bp)
app.register_blueprint(products.bp)
app.register_blueprint(customers_suppliers.bp)
app.register_blueprint(sales_purchases.bp)
app.register_blueprint(inventory.bp)
app.register_blueprint(reports.bp)

@app.route('/')
def index():
    return {'message': 'مرحباً بك في نظام إدارة المبيعات والمشتريات'}

@app.route('/api/health')
def health():
    return {'status': 'healthy'}

if __name__ == '__main__':
    with app.app_context():
        # تهيئة البيانات الأولية
        init_data()
    
    app.run(host='0.0.0.0', port=5000, debug=True)
```

### 1.2 تعديل مسارات API لدعم عمليات الإضافة والتعديل والحذف

#### تعديل مسار العملاء والموردين

قم بتعديل ملف `sales_management_api/src/routes/customers_suppliers.py`:

```python
from flask import Blueprint, request, jsonify
from models.models import db, Customer, Supplier

bp = Blueprint('customers_suppliers', __name__, url_prefix='/api')

# مسارات العملاء
@bp.route('/customers', methods=['GET'])
def get_customers():
    customers = Customer.query.all()
    return jsonify([{
        'id': c.id,
        'name': c.name,
        'contact': c.contact,
        'phone': c.phone,
        'email': c.email,
        'address': c.address,
        'balance': c.balance,
        'created_at': c.created_at.isoformat() if c.created_at else None
    } for c in customers])

@bp.route('/customers/<int:id>', methods=['GET'])
def get_customer(id):
    customer = Customer.query.get_or_404(id)
    return jsonify({
        'id': customer.id,
        'name': customer.name,
        'contact': customer.contact,
        'phone': customer.phone,
        'email': customer.email,
        'address': customer.address,
        'balance': customer.balance,
        'created_at': customer.created_at.isoformat() if customer.created_at else None
    })

@bp.route('/customers', methods=['POST'])
def create_customer():
    data = request.json
    
    if not data or not data.get('name'):
        return jsonify({'error': 'يجب توفير اسم العميل'}), 400
    
    customer = Customer(
        name=data.get('name'),
        contact=data.get('contact', ''),
        phone=data.get('phone', ''),
        email=data.get('email', ''),
        address=data.get('address', ''),
        balance=data.get('balance', 0)
    )
    
    db.session.add(customer)
    db.session.commit()
    
    return jsonify({
        'id': customer.id,
        'name': customer.name,
        'message': 'تم إضافة العميل بنجاح'
    }), 201

@bp.route('/customers/<int:id>', methods=['PUT'])
def update_customer(id):
    customer = Customer.query.get_or_404(id)
    data = request.json
    
    if data.get('name'):
        customer.name = data['name']
    if 'contact' in data:
        customer.contact = data['contact']
    if 'phone' in data:
        customer.phone = data['phone']
    if 'email' in data:
        customer.email = data['email']
    if 'address' in data:
        customer.address = data['address']
    if 'balance' in data:
        customer.balance = data['balance']
    
    db.session.commit()
    
    return jsonify({
        'id': customer.id,
        'name': customer.name,
        'message': 'تم تحديث بيانات العميل بنجاح'
    })

@bp.route('/customers/<int:id>', methods=['DELETE'])
def delete_customer(id):
    customer = Customer.query.get_or_404(id)
    
    db.session.delete(customer)
    db.session.commit()
    
    return jsonify({
        'message': 'تم حذف العميل بنجاح'
    })

# مسارات الموردين (مشابهة لمسارات العملاء)
@bp.route('/suppliers', methods=['GET'])
def get_suppliers():
    suppliers = Supplier.query.all()
    return jsonify([{
        'id': s.id,
        'name': s.name,
        'contact': s.contact,
        'phone': s.phone,
        'email': s.email,
        'address': s.address,
        'balance': s.balance,
        'created_at': s.created_at.isoformat() if s.created_at else None
    } for s in suppliers])

@bp.route('/suppliers/<int:id>', methods=['GET'])
def get_supplier(id):
    supplier = Supplier.query.get_or_404(id)
    return jsonify({
        'id': supplier.id,
        'name': supplier.name,
        'contact': supplier.contact,
        'phone': supplier.phone,
        'email': supplier.email,
        'address': supplier.address,
        'balance': supplier.balance,
        'created_at': supplier.created_at.isoformat() if supplier.created_at else None
    })

@bp.route('/suppliers', methods=['POST'])
def create_supplier():
    data = request.json
    
    if not data or not data.get('name'):
        return jsonify({'error': 'يجب توفير اسم المورد'}), 400
    
    supplier = Supplier(
        name=data.get('name'),
        contact=data.get('contact', ''),
        phone=data.get('phone', ''),
        email=data.get('email', ''),
        address=data.get('address', ''),
        balance=data.get('balance', 0)
    )
    
    db.session.add(supplier)
    db.session.commit()
    
    return jsonify({
        'id': supplier.id,
        'name': supplier.name,
        'message': 'تم إضافة المورد بنجاح'
    }), 201

@bp.route('/suppliers/<int:id>', methods=['PUT'])
def update_supplier(id):
    supplier = Supplier.query.get_or_404(id)
    data = request.json
    
    if data.get('name'):
        supplier.name = data['name']
    if 'contact' in data:
        supplier.contact = data['contact']
    if 'phone' in data:
        supplier.phone = data['phone']
    if 'email' in data:
        supplier.email = data['email']
    if 'address' in data:
        supplier.address = data['address']
    if 'balance' in data:
        supplier.balance = data['balance']
    
    db.session.commit()
    
    return jsonify({
        'id': supplier.id,
        'name': supplier.name,
        'message': 'تم تحديث بيانات المورد بنجاح'
    })

@bp.route('/suppliers/<int:id>', methods=['DELETE'])
def delete_supplier(id):
    supplier = Supplier.query.get_or_404(id)
    
    db.session.delete(supplier)
    db.session.commit()
    
    return jsonify({
        'message': 'تم حذف المورد بنجاح'
    })
```

## 2. إضافة توقيع المطور ومعلومات التواصل

### 2.1 إنشاء مكون Footer

قم بإنشاء ملف `sales-management-system/src/components/Footer.jsx`:

```jsx
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-100 border-t border-gray-200 py-4 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-2 md:mb-0">
            <p className="text-gray-600 text-sm">
              تم التصميم بواسطة م/أحمد الملا
            </p>
          </div>
          <div className="flex flex-col md:flex-row md:items-center">
            <div className="flex items-center mb-1 md:mb-0 md:mr-4">
              <i className="fas fa-phone text-blue-600 mr-2"></i>
              <span className="text-gray-600 text-sm">01008388450</span>
            </div>
            <div className="flex items-center">
              <i className="fas fa-envelope text-blue-600 mr-2"></i>
              <span className="text-gray-600 text-sm">ramzy.petro@gmail.com</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
```

### 2.2 إضافة Footer إلى App.jsx

قم بتعديل ملف `sales-management-system/src/App.jsx` لإضافة Footer:

```jsx
import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CompanyManagement from './components/CompanyManagement';
import EmployeeManagement from './components/EmployeeManagement';
import ProductManagement from './components/ProductManagement';
import CustomerManagement from './components/CustomerManagement';
import SupplierManagement from './components/SupplierManagement';
import SalesManagement from './components/SalesManagement';
import PurchaseManagement from './components/PurchaseManagement';
import InventoryManagement from './components/InventoryManagement';
import ExpenseManagement from './components/ExpenseManagement';
import ReportsManagement from './components/ReportsManagement';
import ProfitLossAnalysis from './components/ProfitLossAnalysis';
import Login from './components/Login';
import UserManagement from './components/UserManagement';
import AboutSystem from './components/AboutSystem';
import ContactUs from './components/ContactUs';
import Footer from './components/Footer';
import './App.css';

function App() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState({});

  useEffect(() => {
    // التحقق من وجود مستخدم مسجل الدخول
    const loggedInUser = localStorage.getItem('user');
    if (loggedInUser) {
      const foundUser = JSON.parse(loggedInUser);
      setUser(foundUser);
      
      // تعيين الصلاحيات بناءً على دور المستخدم
      setPermissions(getRolePermissions(foundUser.role));
    }
  }, []);

  // تحديد الصلاحيات بناءً على الدور
  const getRolePermissions = (role) => {
    const allPermissions = {
      dashboard: true,
      company: false,
      employees: false,
      products: false,
      customers: false,
      suppliers: false,
      sales: false,
      purchases: false,
      inventory: false,
      expenses: false,
      reports: false,
      'profit-loss': false,
      users: false,
      about: true,
      contact: true
    };

    switch (role) {
      case 'admin':
        // المدير لديه جميع الصلاحيات
        return Object.keys(allPermissions).reduce((acc, key) => {
          acc[key] = true;
          return acc;
        }, {});
      
      case 'accountant':
        return {
          ...allPermissions,
          company: true,
          customers: true,
          suppliers: true,
          sales: true,
          purchases: true,
          expenses: true,
          reports: true,
          'profit-loss': true
        };
      
      case 'sales':
        return {
          ...allPermissions,
          customers: true,
          products: true,
          sales: true,
          reports: true
        };
      
      case 'inventory':
        return {
          ...allPermissions,
          products: true,
          inventory: true,
          purchases: true
        };
      
      default:
        return allPermissions;
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
    setPermissions(getRolePermissions(userData.role));
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    setPermissions({});
    localStorage.removeItem('user');
    setActiveSection('dashboard');
  };

  // إذا لم يكن هناك مستخدم مسجل الدخول، عرض صفحة تسجيل الدخول
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Login onLogin={handleLogin} />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-1">
        <Sidebar 
          activeSection={activeSection} 
          onSectionChange={setActiveSection} 
          user={user}
          onLogout={handleLogout}
          permissions={permissions}
        />
        
        <main className="flex-1 bg-gray-50 p-6 overflow-y-auto">
          {activeSection === 'dashboard' && <Dashboard />}
          {activeSection === 'company' && <CompanyManagement />}
          {activeSection === 'employees' && <EmployeeManagement />}
          {activeSection === 'products' && <ProductManagement />}
          {activeSection === 'customers' && <CustomerManagement />}
          {activeSection === 'suppliers' && <SupplierManagement />}
          {activeSection === 'sales' && <SalesManagement />}
          {activeSection === 'purchases' && <PurchaseManagement />}
          {activeSection === 'inventory' && <InventoryManagement />}
          {activeSection === 'expenses' && <ExpenseManagement />}
          {activeSection === 'reports' && <ReportsManagement />}
          {activeSection === 'profit-loss' && <ProfitLossAnalysis />}
          {activeSection === 'users' && <UserManagement />}
          {activeSection === 'about' && <AboutSystem />}
          {activeSection === 'contact' && <ContactUs />}
        </main>
      </div>
      
      <Footer />
    </div>
  );
}

export default App;
```

### 2.3 إنشاء صفحة "عن البرنامج"

قم بإنشاء ملف `sales-management-system/src/components/AboutSystem.jsx`:

```jsx
import React from 'react';

const AboutSystem = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">عن البرنامج</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">نظام إدارة المبيعات والمشتريات</h2>
        <p className="text-gray-600 mb-4">
          نظام متكامل لإدارة المبيعات والمشتريات والمخزون، مصمم خصيصاً لتلبية احتياجات الشركات والمؤسسات التجارية.
          يوفر النظام مجموعة شاملة من الأدوات لإدارة العملاء والموردين والمنتجات والفواتير والتقارير.
        </p>
        
        <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">المميزات الرئيسية:</h3>
        <ul className="list-disc list-inside text-gray-600 space-y-2 mb-6">
          <li>إدارة بيانات الشركة والموظفين</li>
          <li>إدارة العملاء والموردين</li>
          <li>إدارة المنتجات والأصناف</li>
          <li>نظام المبيعات مع إنشاء الفواتير</li>
          <li>نظام المشتريات وتتبع الطلبيات</li>
          <li>إدارة المخزون مع تنبيهات المخزون المنخفض</li>
          <li>إدارة المصروفات والتكاليف</li>
          <li>تقارير شاملة للمبيعات والمشتريات والأرباح</li>
          <li>نظام صلاحيات متكامل للمستخدمين</li>
        </ul>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">معلومات المطور</h2>
        
        <div className="flex flex-col md:flex-row md:items-center mb-6">
          <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center mb-4 md:mb-0 md:mr-6">
            <i className="fas fa-user-tie text-4xl text-blue-600"></i>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold text-gray-800">م/أحمد الملا</h3>
            <p className="text-gray-600 mt-1">مطور برمجيات ومصمم أنظمة إدارية</p>
          </div>
        </div>
        
        <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">معلومات التواصل:</h3>
        <div className="space-y-3">
          <div className="flex items-center">
            <i className="fas fa-phone w-8 text-blue-600"></i>
            <span className="text-gray-600">01008388450</span>
          </div>
          <div className="flex items-center">
            <i className="fas fa-envelope w-8 text-blue-600"></i>
            <span className="text-gray-600">ramzy.petro@gmail.com</span>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} جميع الحقوق محفوظة - نظام إدارة المبيعات والمشتريات
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutSystem;
```

### 2.4 إنشاء صفحة "اتصل بنا"

قم بإنشاء ملف `sales-management-system/src/components/ContactUs.jsx`:

```jsx
import React, { useState } from 'react';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [formStatus, setFormStatus] = useState({
    submitted: false,
    success: false,
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // التحقق من البيانات
    if (!formData.name || !formData.email || !formData.message) {
      setFormStatus({
        submitted: true,
        success: false,
        message: 'يرجى ملء جميع الحقول المطلوبة'
      });
      return;
    }
    
    // محاكاة إرسال النموذج
    setTimeout(() => {
      setFormStatus({
        submitted: true,
        success: true,
        message: 'تم إرسال رسالتك بنجاح. سنتواصل معك قريباً.'
      });
      
      // إعادة تعيين النموذج
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    }, 1000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">اتصل بنا</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">أرسل لنا رسالة</h2>
          
          {formStatus.submitted && (
            <div className={`p-4 mb-4 rounded-md ${formStatus.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {formStatus.message}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-gray-700 font-medium mb-2">الاسم *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 font-medium mb-2">البريد الإلكتروني *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="subject" className="block text-gray-700 font-medium mb-2">الموضوع</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="message" className="block text-gray-700 font-medium mb-2">الرسالة *</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="5"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              ></textarea>
            </div>
            
            <button
              type="submit"
              className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition duration-300"
            >
              إرسال الرسالة
            </button>
          </form>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">معلومات التواصل</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">المطور</h3>
              <p className="text-gray-600">م/أحمد الملا</p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">رقم الهاتف</h3>
              <p className="text-gray-600 flex items-center">
                <i className="fas fa-phone text-blue-600 mr-2"></i>
                01008388450
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">البريد الإلكتروني</h3>
              <p className="text-gray-600 flex items-center">
                <i className="fas fa-envelope text-blue-600 mr-2"></i>
                ramzy.petro@gmail.com
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">ساعات العمل</h3>
              <p className="text-gray-600">الأحد - الخميس: 9:00 صباحاً - 5:00 مساءً</p>
              <p className="text-gray-600">الجمعة - السبت: مغلق</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
```

## 3. تفعيل دورة العمل المتكاملة

### 3.1 تعديل مكون إدارة العملاء

قم بتعديل ملف `sales-management-system/src/components/CustomerManagement.jsx`:

```jsx
import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';

const CustomerManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    contact: '',
    phone: '',
    email: '',
    address: '',
    balance: 0
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // جلب بيانات العملاء
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/customers`);
      if (!response.ok) {
        throw new Error('فشل في جلب بيانات العملاء');
      }
      const data = await response.json();
      setCustomers(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'balance' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = isEditing 
        ? `${API_URL}/api/customers/${formData.id}`
        : `${API_URL}/api/customers`;
      
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        throw new Error('فشل في حفظ بيانات العميل');
      }
      
      // تحديث قائمة العملاء
      fetchCustomers();
      
      // إعادة تعيين النموذج
      resetForm();
      
      // إغلاق النموذج
      setShowForm(false);
      
    } catch (err) {
      setError(err.message);
      console.error('Error saving customer:', err);
    }
  };

  const handleEdit = (customer) => {
    setFormData({
      id: customer.id,
      name: customer.name,
      contact: customer.contact || '',
      phone: customer.phone || '',
      email: customer.email || '',
      address: customer.address || '',
      balance: customer.balance || 0
    });
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا العميل؟')) {
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/api/customers/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('فشل في حذف العميل');
      }
      
      // تحديث قائمة العملاء
      setCustomers(customers.filter(customer => customer.id !== id));
      
    } catch (err) {
      setError(err.message);
      console.error('Error deleting customer:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      id: null,
      name: '',
      contact: '',
      phone: '',
      email: '',
      address: '',
      balance: 0
    });
    setIsEditing(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-700">إدارة العملاء</h1>
        <button
          onClick={() => { resetForm(); setShowForm(!showForm); }}
          className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300"
        >
          {showForm ? 'إلغاء' : 'إضافة عميل جديد'}
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">
          {error}
        </div>
      )}
      
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {isEditing ? 'تعديل بيانات العميل' : 'إضافة عميل جديد'}
          </h2>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="name" className="block text-gray-700 font-medium mb-2">اسم العميل *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="contact" className="block text-gray-700 font-medium mb-2">جهة الاتصال</label>
                <input
                  type="text"
                  id="contact"
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-gray-700 font-medium mb-2">رقم الهاتف</label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-gray-700 font-medium mb-2">البريد الإلكتروني</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="address" className="block text-gray-700 font-medium mb-2">العنوان</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="balance" className="block text-gray-700 font-medium mb-2">الرصيد</label>
                <input
                  type="number"
                  id="balance"
                  name="balance"
                  value={formData.balance}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => { resetForm(); setShowForm(false); }}
                className="bg-gray-300 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-400 transition duration-300 ml-2"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300"
              >
                {isEditing ? 'تحديث' : 'إضافة'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-2 text-gray-600">جاري تحميل البيانات...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {customers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">لا يوجد عملاء مسجلين حالياً</p>
              <button
                onClick={() => { resetForm(); setShowForm(true); }}
                className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300"
              >
                إضافة عميل جديد
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الاسم</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">جهة الاتصال</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">رقم الهاتف</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">البريد الإلكتروني</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الرصيد</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {customers.map(customer => (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{customer.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.contact || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.phone || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.email || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{customer.balance?.toFixed(2) || '0.00'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEdit(customer)}
                          className="text-blue-600 hover:text-blue-900 ml-3"
                        >
                          تعديل
                        </button>
                        <button
                          onClick={() => handleDelete(customer.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          حذف
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerManagement;
```

### 3.2 إنشاء ملف التكوين للواجهة الأمامية

قم بإنشاء ملف `sales-management-system/src/config.js`:

```javascript
// عنوان API
export const API_URL = 'https://9yhyi3cp7edy.manus.space';
```

## 4. تفعيل نظام التقارير

### 4.1 تعديل مكون التقارير

قم بتعديل ملف `sales-management-system/src/components/ReportsManagement.jsx`:

```jsx
import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';

const ReportsManagement = () => {
  const [activeTab, setActiveTab] = useState('sales');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  
  const [salesData, setSalesData] = useState([]);
  const [purchasesData, setPurchasesData] = useState([]);
  const [inventoryData, setInventoryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (activeTab === 'sales') {
      fetchSalesReport();
    } else if (activeTab === 'purchases') {
      fetchPurchasesReport();
    } else if (activeTab === 'inventory') {
      fetchInventoryReport();
    }
  }, [activeTab, dateRange]);

  const fetchSalesReport = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/reports/sales?start=${dateRange.start}&end=${dateRange.end}`);
      if (!response.ok) {
        throw new Error('فشل في جلب تقرير المبيعات');
      }
      const data = await response.json();
      setSalesData(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching sales report:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPurchasesReport = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/reports/purchases?start=${dateRange.start}&end=${dateRange.end}`);
      if (!response.ok) {
        throw new Error('فشل في جلب تقرير المشتريات');
      }
      const data = await response.json();
      setPurchasesData(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching purchases report:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchInventoryReport = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/reports/inventory`);
      if (!response.ok) {
        throw new Error('فشل في جلب تقرير المخزون');
      }
      const data = await response.json();
      setInventoryData(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching inventory report:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    let data;
    let filename;
    
    if (activeTab === 'sales') {
      data = salesData;
      filename = `sales_report_${dateRange.start}_to_${dateRange.end}.json`;
    } else if (activeTab === 'purchases') {
      data = purchasesData;
      filename = `purchases_report_${dateRange.start}_to_${dateRange.end}.json`;
    } else if (activeTab === 'inventory') {
      data = inventoryData;
      filename = `inventory_report_${new Date().toISOString().split('T')[0]}.json`;
    }
    
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = href;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(href);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">التقارير</h1>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">
          {error}
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-wrap border-b border-gray-200 mb-6">
          <button
            className={`px-4 py-2 font-medium text-sm ${activeTab === 'sales' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('sales')}
          >
            تقرير المبيعات
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${activeTab === 'purchases' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('purchases')}
          >
            تقرير المشتريات
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${activeTab === 'inventory' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('inventory')}
          >
            تقرير المخزون
          </button>
        </div>
        
        {(activeTab === 'sales' || activeTab === 'purchases') && (
          <div className="flex flex-wrap items-center mb-6">
            <div className="w-full md:w-auto flex items-center mb-4 md:mb-0 md:ml-4">
              <label htmlFor="start" className="block text-gray-700 font-medium ml-2">من:</label>
              <input
                type="date"
                id="start"
                name="start"
                value={dateRange.start}
                onChange={handleDateChange}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="w-full md:w-auto flex items-center mb-4 md:mb-0 md:ml-4">
              <label htmlFor="end" className="block text-gray-700 font-medium ml-2">إلى:</label>
              <input
                type="date"
                id="end"
                name="end"
                value={dateRange.end}
                onChange={handleDateChange}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="w-full md:w-auto flex">
              <button
                onClick={handlePrint}
                className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition duration-300 ml-2"
              >
                طباعة
              </button>
              <button
                onClick={handleExport}
                className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition duration-300"
              >
                تصدير
              </button>
            </div>
          </div>
        )}
        
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
            <p className="mt-2 text-gray-600">جاري تحميل البيانات...</p>
          </div>
        ) : (
          <div>
            {activeTab === 'sales' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">تقرير المبيعات</h2>
                
                {salesData.length === 0 ? (
                  <p className="text-gray-600 text-center py-4">لا توجد بيانات مبيعات للفترة المحددة</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">رقم الفاتورة</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">التاريخ</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">العميل</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">إجمالي المبلغ</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الضريبة</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجمالي النهائي</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {salesData.map(sale => (
                          <tr key={sale.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sale.invoice_number}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(sale.date).toLocaleDateString('ar-EG')}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sale.customer_name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sale.subtotal?.toFixed(2) || '0.00'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sale.tax?.toFixed(2) || '0.00'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{sale.total?.toFixed(2) || '0.00'}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50 border-t border-gray-200">
                        <tr>
                          <td colSpan="3" className="px-6 py-4 text-sm font-medium text-gray-900 text-right">الإجمالي</td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {salesData.reduce((sum, sale) => sum + (sale.subtotal || 0), 0).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {salesData.reduce((sum, sale) => sum + (sale.tax || 0), 0).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {salesData.reduce((sum, sale) => sum + (sale.total || 0), 0).toFixed(2)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'purchases' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">تقرير المشتريات</h2>
                
                {purchasesData.length === 0 ? (
                  <p className="text-gray-600 text-center py-4">لا توجد بيانات مشتريات للفترة المحددة</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">رقم الفاتورة</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">التاريخ</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المورد</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">إجمالي المبلغ</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الضريبة</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجمالي النهائي</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {purchasesData.map(purchase => (
                          <tr key={purchase.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{purchase.invoice_number}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(purchase.date).toLocaleDateString('ar-EG')}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{purchase.supplier_name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{purchase.subtotal?.toFixed(2) || '0.00'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{purchase.tax?.toFixed(2) || '0.00'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{purchase.total?.toFixed(2) || '0.00'}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50 border-t border-gray-200">
                        <tr>
                          <td colSpan="3" className="px-6 py-4 text-sm font-medium text-gray-900 text-right">الإجمالي</td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {purchasesData.reduce((sum, purchase) => sum + (purchase.subtotal || 0), 0).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {purchasesData.reduce((sum, purchase) => sum + (purchase.tax || 0), 0).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {purchasesData.reduce((sum, purchase) => sum + (purchase.total || 0), 0).toFixed(2)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'inventory' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">تقرير المخزون</h2>
                
                <div className="flex justify-end mb-4">
                  <button
                    onClick={handlePrint}
                    className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition duration-300 ml-2"
                  >
                    طباعة
                  </button>
                  <button
                    onClick={handleExport}
                    className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition duration-300"
                  >
                    تصدير
                  </button>
                </div>
                
                {inventoryData.length === 0 ? (
                  <p className="text-gray-600 text-center py-4">لا توجد بيانات مخزون</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">كود المنتج</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">اسم المنتج</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الكمية المتاحة</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">سعر الشراء</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">سعر البيع</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">القيمة الإجمالية</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {inventoryData.map(item => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.code}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.quantity}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.purchase_price?.toFixed(2) || '0.00'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.selling_price?.toFixed(2) || '0.00'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{(item.quantity * item.purchase_price)?.toFixed(2) || '0.00'}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                item.quantity <= 0 ? 'bg-red-100 text-red-800' : 
                                item.quantity <= item.min_quantity ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-green-100 text-green-800'
                              }`}>
                                {item.quantity <= 0 ? 'نافد' : 
                                 item.quantity <= item.min_quantity ? 'منخفض' : 
                                 'متوفر'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50 border-t border-gray-200">
                        <tr>
                          <td colSpan="5" className="px-6 py-4 text-sm font-medium text-gray-900 text-right">إجمالي قيمة المخزون</td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {inventoryData.reduce((sum, item) => sum + (item.quantity * item.purchase_price || 0), 0).toFixed(2)}
                          </td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsManagement;
```

## 5. تعليمات النشر

### 5.1 نشر الواجهة الخلفية (Backend)

1. قم بتحميل الملفات المحدثة للواجهة الخلفية إلى الخادم
2. قم بتثبيت المكتبات المطلوبة:
   ```
   pip install flask flask-sqlalchemy flask-cors psycopg2-binary
   ```
3. قم بتكوين متغير البيئة `DATABASE_URL` للإشارة إلى قاعدة بيانات PostgreSQL
4. قم بتشغيل الخادم:
   ```
   python src/main.py
   ```

### 5.2 نشر الواجهة الأمامية (Frontend)

1. قم بتحديث ملف `src/config.js` ليشير إلى عنوان API الصحيح
2. قم ببناء نسخة الإنتاج:
   ```
   npm run build
   ```
3. قم بنشر محتويات مجلد `build` أو `dist` على خادم ويب

## 6. اختبار النظام

بعد تنفيذ التعديلات ونشر النظام، قم باختبار الوظائف التالية:

1. تسجيل الدخول باستخدام حسابات مختلفة للتحقق من نظام الصلاحيات
2. إضافة وتعديل وحذف العملاء والموردين والموظفين
3. إضافة وتعديل المنتجات وتتبع المخزون
4. إنشاء فواتير المبيعات والمشتريات
5. عرض التقارير المختلفة
6. التحقق من ظهور توقيع المطور ومعلومات التواصل في جميع الصفحات

## 7. الدعم والمساعدة

إذا واجهت أي مشاكل أثناء تنفيذ هذه التعديلات، يرجى التواصل مع:

- الاسم: م/أحمد الملا
- رقم الهاتف: 01008388450
- البريد الإلكتروني: ramzy.petro@gmail.com
