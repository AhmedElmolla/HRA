from flask import Blueprint, request, jsonify
from src.models.models import db, Company
from datetime import datetime

company_bp = Blueprint('company', __name__)

@company_bp.route('/company', methods=['GET'])
def get_company():
    """الحصول على بيانات الشركة"""
    company = Company.query.first()
    if not company:
        return jsonify({'message': 'لم يتم العثور على بيانات الشركة'}), 404
    
    return jsonify({
        'id': company.id,
        'name': company.name,
        'address': company.address,
        'phone': company.phone,
        'email': company.email,
        'tax_number': company.tax_number,
        'commercial_register': company.commercial_register,
        'logo_path': company.logo_path,
        'manager_signature_path': company.manager_signature_path,
        'accountant_signature_path': company.accountant_signature_path
    })

@company_bp.route('/company', methods=['POST'])
def create_or_update_company():
    """إنشاء أو تحديث بيانات الشركة"""
    data = request.get_json()
    
    company = Company.query.first()
    if company:
        # تحديث البيانات الموجودة
        company.name = data.get('name', company.name)
        company.address = data.get('address', company.address)
        company.phone = data.get('phone', company.phone)
        company.email = data.get('email', company.email)
        company.tax_number = data.get('tax_number', company.tax_number)
        company.commercial_register = data.get('commercial_register', company.commercial_register)
        company.logo_path = data.get('logo_path', company.logo_path)
        company.manager_signature_path = data.get('manager_signature_path', company.manager_signature_path)
        company.accountant_signature_path = data.get('accountant_signature_path', company.accountant_signature_path)
        company.updated_at = datetime.utcnow()
    else:
        # إنشاء شركة جديدة
        company = Company(
            name=data.get('name'),
            address=data.get('address'),
            phone=data.get('phone'),
            email=data.get('email'),
            tax_number=data.get('tax_number'),
            commercial_register=data.get('commercial_register'),
            logo_path=data.get('logo_path'),
            manager_signature_path=data.get('manager_signature_path'),
            accountant_signature_path=data.get('accountant_signature_path')
        )
        db.session.add(company)
    
    try:
        db.session.commit()
        return jsonify({'message': 'تم حفظ بيانات الشركة بنجاح'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'حدث خطأ أثناء حفظ البيانات'}), 500
