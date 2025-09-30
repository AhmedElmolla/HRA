from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from decimal import Decimal

db = SQLAlchemy()

# جدول الشركة
class Company(db.Model):
    __tablename__ = 'companies'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    address = db.Column(db.Text)
    phone = db.Column(db.String(50))
    email = db.Column(db.String(100))
    tax_number = db.Column(db.String(50))
    commercial_register = db.Column(db.String(50))
    logo_path = db.Column(db.String(255))
    manager_signature_path = db.Column(db.String(255))
    accountant_signature_path = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# جدول الموظفين
class Employee(db.Model):
    __tablename__ = 'employees'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    position = db.Column(db.String(100))
    phone = db.Column(db.String(50))
    email = db.Column(db.String(100))
    salary = db.Column(db.Numeric(10, 2))
    username = db.Column(db.String(50), unique=True)
    password_hash = db.Column(db.String(255))
    role = db.Column(db.String(50), default='employee')  # admin, manager, accountant, employee
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# جدول فئات الأصناف
class Category(db.Model):
    __tablename__ = 'categories'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # العلاقات
    products = db.relationship('Product', backref='category', lazy=True)

# جدول الأصناف
class Product(db.Model):
    __tablename__ = 'products'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    code = db.Column(db.String(50), unique=True)
    description = db.Column(db.Text)
    unit = db.Column(db.String(50))  # قطعة، كيلو، متر، إلخ
    purchase_price = db.Column(db.Numeric(10, 2))
    selling_price = db.Column(db.Numeric(10, 2))
    min_stock = db.Column(db.Integer, default=0)
    max_stock = db.Column(db.Integer)
    current_stock = db.Column(db.Integer, default=0)
    image_path = db.Column(db.String(255))
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'))
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# جدول الموردين
class Supplier(db.Model):
    __tablename__ = 'suppliers'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    contact_person = db.Column(db.String(100))
    address = db.Column(db.Text)
    phone = db.Column(db.String(50))
    email = db.Column(db.String(100))
    tax_number = db.Column(db.String(50))
    commercial_register = db.Column(db.String(50))
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # العلاقات
    purchases = db.relationship('Purchase', backref='supplier', lazy=True)

# جدول العملاء
class Customer(db.Model):
    __tablename__ = 'customers'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    contact_person = db.Column(db.String(100))
    address = db.Column(db.Text)
    phone = db.Column(db.String(50))
    email = db.Column(db.String(100))
    tax_number = db.Column(db.String(50))
    customer_type = db.Column(db.String(50), default='customer')  # customer, dealer
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # العلاقات
    sales = db.relationship('Sale', backref='customer', lazy=True)

# جدول المشتريات
class Purchase(db.Model):
    __tablename__ = 'purchases'
    
    id = db.Column(db.Integer, primary_key=True)
    invoice_number = db.Column(db.String(50), unique=True)
    supplier_id = db.Column(db.Integer, db.ForeignKey('suppliers.id'), nullable=False)
    employee_id = db.Column(db.Integer, db.ForeignKey('employees.id'))
    purchase_date = db.Column(db.Date, default=datetime.utcnow().date)
    total_amount = db.Column(db.Numeric(12, 2), default=0)
    tax_amount = db.Column(db.Numeric(10, 2), default=0)
    discount_amount = db.Column(db.Numeric(10, 2), default=0)
    net_amount = db.Column(db.Numeric(12, 2), default=0)
    status = db.Column(db.String(50), default='pending')  # pending, completed, cancelled
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # العلاقات
    items = db.relationship('PurchaseItem', backref='purchase', lazy=True, cascade='all, delete-orphan')

# جدول عناصر المشتريات
class PurchaseItem(db.Model):
    __tablename__ = 'purchase_items'
    
    id = db.Column(db.Integer, primary_key=True)
    purchase_id = db.Column(db.Integer, db.ForeignKey('purchases.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    unit_price = db.Column(db.Numeric(10, 2), nullable=False)
    total_price = db.Column(db.Numeric(12, 2), nullable=False)
    
    # العلاقات
    product = db.relationship('Product', backref='purchase_items')

# جدول المبيعات
class Sale(db.Model):
    __tablename__ = 'sales'
    
    id = db.Column(db.Integer, primary_key=True)
    invoice_number = db.Column(db.String(50), unique=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('customers.id'), nullable=False)
    employee_id = db.Column(db.Integer, db.ForeignKey('employees.id'))
    sale_date = db.Column(db.Date, default=datetime.utcnow().date)
    total_amount = db.Column(db.Numeric(12, 2), default=0)
    tax_amount = db.Column(db.Numeric(10, 2), default=0)
    discount_amount = db.Column(db.Numeric(10, 2), default=0)
    net_amount = db.Column(db.Numeric(12, 2), default=0)
    invoice_type = db.Column(db.String(50), default='regular')  # regular, tax
    status = db.Column(db.String(50), default='pending')  # pending, completed, cancelled
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # العلاقات
    items = db.relationship('SaleItem', backref='sale', lazy=True, cascade='all, delete-orphan')

# جدول عناصر المبيعات
class SaleItem(db.Model):
    __tablename__ = 'sale_items'
    
    id = db.Column(db.Integer, primary_key=True)
    sale_id = db.Column(db.Integer, db.ForeignKey('sales.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    unit_price = db.Column(db.Numeric(10, 2), nullable=False)
    total_price = db.Column(db.Numeric(12, 2), nullable=False)
    
    # العلاقات
    product = db.relationship('Product', backref='sale_items')

# جدول حركة المخزون
class StockMovement(db.Model):
    __tablename__ = 'stock_movements'
    
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    movement_type = db.Column(db.String(50), nullable=False)  # in, out, adjustment
    quantity = db.Column(db.Integer, nullable=False)
    reference_type = db.Column(db.String(50))  # purchase, sale, adjustment
    reference_id = db.Column(db.Integer)
    notes = db.Column(db.Text)
    movement_date = db.Column(db.DateTime, default=datetime.utcnow)
    employee_id = db.Column(db.Integer, db.ForeignKey('employees.id'))
    
    # العلاقات
    product = db.relationship('Product', backref='stock_movements')
    employee = db.relationship('Employee', backref='stock_movements')

# جدول أنواع المصروفات
class ExpenseCategory(db.Model):
    __tablename__ = 'expense_categories'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # العلاقات
    expenses = db.relationship('Expense', backref='category', lazy=True)

# جدول المصروفات
class Expense(db.Model):
    __tablename__ = 'expenses'
    
    id = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.String(200), nullable=False)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    expense_date = db.Column(db.Date, default=datetime.utcnow().date)
    category_id = db.Column(db.Integer, db.ForeignKey('expense_categories.id'))
    employee_id = db.Column(db.Integer, db.ForeignKey('employees.id'))
    receipt_path = db.Column(db.String(255))
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # العلاقات
    employee = db.relationship('Employee', backref='expenses')
