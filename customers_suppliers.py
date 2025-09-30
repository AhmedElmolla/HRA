from flask import Blueprint, request, jsonify
from src.models.models import db, Customer, Supplier
from datetime import datetime

customers_suppliers_bp = Blueprint('customers_suppliers', __name__)

# العملاء
@customers_suppliers_bp.route('/customers', methods=['GET'])
def get_customers():
    """الحصول على قائمة العملاء"""
    customers = Customer.query.filter_by(is_active=True).all()
    
    customers_list = []
    for customer in customers:
        customers_list.append({
            'id': customer.id,
            'name': customer.name,
            'contact_person': customer.contact_person,
            'address': customer.address,
            'phone': customer.phone,
            'email': customer.email,
            'tax_number': customer.tax_number,
            'customer_type': customer.customer_type,
            'is_active': customer.is_active,
            'created_at': customer.created_at.isoformat() if customer.created_at else None
        })
    
    return jsonify(customers_list)

@customers_suppliers_bp.route('/customers/<int:customer_id>', methods=['GET'])
def get_customer(customer_id):
    """الحصول على بيانات عميل محدد"""
    customer = Customer.query.get_or_404(customer_id)
    
    return jsonify({
        'id': customer.id,
        'name': customer.name,
        'contact_person': customer.contact_person,
        'address': customer.address,
        'phone': customer.phone,
        'email': customer.email,
        'tax_number': customer.tax_number,
        'customer_type': customer.customer_type,
        'is_active': customer.is_active,
        'created_at': customer.created_at.isoformat() if customer.created_at else None
    })

@customers_suppliers_bp.route('/customers', methods=['POST'])
def create_customer():
    """إضافة عميل جديد"""
    data = request.get_json()
    
    customer = Customer(
        name=data.get('name'),
        contact_person=data.get('contact_person'),
        address=data.get('address'),
        phone=data.get('phone'),
        email=data.get('email'),
        tax_number=data.get('tax_number'),
        customer_type=data.get('customer_type', 'customer')
    )
    
    try:
        db.session.add(customer)
        db.session.commit()
        return jsonify({'message': 'تم إضافة العميل بنجاح', 'id': customer.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'حدث خطأ أثناء إضافة العميل'}), 500

@customers_suppliers_bp.route('/customers/<int:customer_id>', methods=['PUT'])
def update_customer(customer_id):
    """تحديث بيانات عميل"""
    customer = Customer.query.get_or_404(customer_id)
    data = request.get_json()
    
    customer.name = data.get('name', customer.name)
    customer.contact_person = data.get('contact_person', customer.contact_person)
    customer.address = data.get('address', customer.address)
    customer.phone = data.get('phone', customer.phone)
    customer.email = data.get('email', customer.email)
    customer.tax_number = data.get('tax_number', customer.tax_number)
    customer.customer_type = data.get('customer_type', customer.customer_type)
    customer.updated_at = datetime.utcnow()
    
    try:
        db.session.commit()
        return jsonify({'message': 'تم تحديث بيانات العميل بنجاح'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'حدث خطأ أثناء تحديث البيانات'}), 500

@customers_suppliers_bp.route('/customers/<int:customer_id>', methods=['DELETE'])
def delete_customer(customer_id):
    """حذف عميل (إلغاء تفعيل)"""
    customer = Customer.query.get_or_404(customer_id)
    
    customer.is_active = False
    customer.updated_at = datetime.utcnow()
    
    try:
        db.session.commit()
        return jsonify({'message': 'تم حذف العميل بنجاح'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'حدث خطأ أثناء حذف العميل'}), 500

# الموردين
@customers_suppliers_bp.route('/suppliers', methods=['GET'])
def get_suppliers():
    """الحصول على قائمة الموردين"""
    suppliers = Supplier.query.filter_by(is_active=True).all()
    
    suppliers_list = []
    for supplier in suppliers:
        suppliers_list.append({
            'id': supplier.id,
            'name': supplier.name,
            'contact_person': supplier.contact_person,
            'address': supplier.address,
            'phone': supplier.phone,
            'email': supplier.email,
            'tax_number': supplier.tax_number,
            'commercial_register': supplier.commercial_register,
            'is_active': supplier.is_active,
            'created_at': supplier.created_at.isoformat() if supplier.created_at else None
        })
    
    return jsonify(suppliers_list)

@customers_suppliers_bp.route('/suppliers/<int:supplier_id>', methods=['GET'])
def get_supplier(supplier_id):
    """الحصول على بيانات مورد محدد"""
    supplier = Supplier.query.get_or_404(supplier_id)
    
    return jsonify({
        'id': supplier.id,
        'name': supplier.name,
        'contact_person': supplier.contact_person,
        'address': supplier.address,
        'phone': supplier.phone,
        'email': supplier.email,
        'tax_number': supplier.tax_number,
        'commercial_register': supplier.commercial_register,
        'is_active': supplier.is_active,
        'created_at': supplier.created_at.isoformat() if supplier.created_at else None
    })

@customers_suppliers_bp.route('/suppliers', methods=['POST'])
def create_supplier():
    """إضافة مورد جديد"""
    data = request.get_json()
    
    supplier = Supplier(
        name=data.get('name'),
        contact_person=data.get('contact_person'),
        address=data.get('address'),
        phone=data.get('phone'),
        email=data.get('email'),
        tax_number=data.get('tax_number'),
        commercial_register=data.get('commercial_register')
    )
    
    try:
        db.session.add(supplier)
        db.session.commit()
        return jsonify({'message': 'تم إضافة المورد بنجاح', 'id': supplier.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'حدث خطأ أثناء إضافة المورد'}), 500

@customers_suppliers_bp.route('/suppliers/<int:supplier_id>', methods=['PUT'])
def update_supplier(supplier_id):
    """تحديث بيانات مورد"""
    supplier = Supplier.query.get_or_404(supplier_id)
    data = request.get_json()
    
    supplier.name = data.get('name', supplier.name)
    supplier.contact_person = data.get('contact_person', supplier.contact_person)
    supplier.address = data.get('address', supplier.address)
    supplier.phone = data.get('phone', supplier.phone)
    supplier.email = data.get('email', supplier.email)
    supplier.tax_number = data.get('tax_number', supplier.tax_number)
    supplier.commercial_register = data.get('commercial_register', supplier.commercial_register)
    supplier.updated_at = datetime.utcnow()
    
    try:
        db.session.commit()
        return jsonify({'message': 'تم تحديث بيانات المورد بنجاح'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'حدث خطأ أثناء تحديث البيانات'}), 500

@customers_suppliers_bp.route('/suppliers/<int:supplier_id>', methods=['DELETE'])
def delete_supplier(supplier_id):
    """حذف مورد (إلغاء تفعيل)"""
    supplier = Supplier.query.get_or_404(supplier_id)
    
    supplier.is_active = False
    supplier.updated_at = datetime.utcnow()
    
    try:
        db.session.commit()
        return jsonify({'message': 'تم حذف المورد بنجاح'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'حدث خطأ أثناء حذف المورد'}), 500
