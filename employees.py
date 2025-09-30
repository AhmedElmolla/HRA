from flask import Blueprint, request, jsonify
from src.models.models import db, Employee
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

employees_bp = Blueprint('employees', __name__)

@employees_bp.route('/employees', methods=['GET'])
def get_employees():
    """الحصول على قائمة الموظفين"""
    employees = Employee.query.filter_by(is_active=True).all()
    
    employees_list = []
    for employee in employees:
        employees_list.append({
            'id': employee.id,
            'name': employee.name,
            'position': employee.position,
            'phone': employee.phone,
            'email': employee.email,
            'salary': float(employee.salary) if employee.salary else None,
            'username': employee.username,
            'role': employee.role,
            'is_active': employee.is_active,
            'created_at': employee.created_at.isoformat() if employee.created_at else None
        })
    
    return jsonify(employees_list)

@employees_bp.route('/employees/<int:employee_id>', methods=['GET'])
def get_employee(employee_id):
    """الحصول على بيانات موظف محدد"""
    employee = Employee.query.get_or_404(employee_id)
    
    return jsonify({
        'id': employee.id,
        'name': employee.name,
        'position': employee.position,
        'phone': employee.phone,
        'email': employee.email,
        'salary': float(employee.salary) if employee.salary else None,
        'username': employee.username,
        'role': employee.role,
        'is_active': employee.is_active,
        'created_at': employee.created_at.isoformat() if employee.created_at else None
    })

@employees_bp.route('/employees', methods=['POST'])
def create_employee():
    """إضافة موظف جديد"""
    data = request.get_json()
    
    # التحقق من وجود اسم المستخدم
    if data.get('username'):
        existing_employee = Employee.query.filter_by(username=data['username']).first()
        if existing_employee:
            return jsonify({'message': 'اسم المستخدم موجود بالفعل'}), 400
    
    employee = Employee(
        name=data.get('name'),
        position=data.get('position'),
        phone=data.get('phone'),
        email=data.get('email'),
        salary=data.get('salary'),
        username=data.get('username'),
        password_hash=generate_password_hash(data.get('password', '123456')),
        role=data.get('role', 'employee')
    )
    
    try:
        db.session.add(employee)
        db.session.commit()
        return jsonify({'message': 'تم إضافة الموظف بنجاح', 'id': employee.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'حدث خطأ أثناء إضافة الموظف'}), 500

@employees_bp.route('/employees/<int:employee_id>', methods=['PUT'])
def update_employee(employee_id):
    """تحديث بيانات موظف"""
    employee = Employee.query.get_or_404(employee_id)
    data = request.get_json()
    
    # التحقق من اسم المستخدم إذا تم تغييره
    if data.get('username') and data['username'] != employee.username:
        existing_employee = Employee.query.filter_by(username=data['username']).first()
        if existing_employee:
            return jsonify({'message': 'اسم المستخدم موجود بالفعل'}), 400
    
    employee.name = data.get('name', employee.name)
    employee.position = data.get('position', employee.position)
    employee.phone = data.get('phone', employee.phone)
    employee.email = data.get('email', employee.email)
    employee.salary = data.get('salary', employee.salary)
    employee.username = data.get('username', employee.username)
    employee.role = data.get('role', employee.role)
    employee.updated_at = datetime.utcnow()
    
    # تحديث كلمة المرور إذا تم توفيرها
    if data.get('password'):
        employee.password_hash = generate_password_hash(data['password'])
    
    try:
        db.session.commit()
        return jsonify({'message': 'تم تحديث بيانات الموظف بنجاح'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'حدث خطأ أثناء تحديث البيانات'}), 500

@employees_bp.route('/employees/<int:employee_id>', methods=['DELETE'])
def delete_employee(employee_id):
    """حذف موظف (إلغاء تفعيل)"""
    employee = Employee.query.get_or_404(employee_id)
    
    employee.is_active = False
    employee.updated_at = datetime.utcnow()
    
    try:
        db.session.commit()
        return jsonify({'message': 'تم حذف الموظف بنجاح'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'حدث خطأ أثناء حذف الموظف'}), 500
