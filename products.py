from flask import Blueprint, request, jsonify
from src.models.models import db, Product, Category
from datetime import datetime

products_bp = Blueprint('products', __name__)

@products_bp.route('/products', methods=['GET'])
def get_products():
    """الحصول على قائمة الأصناف"""
    products = Product.query.filter_by(is_active=True).all()
    
    products_list = []
    for product in products:
        products_list.append({
            'id': product.id,
            'name': product.name,
            'code': product.code,
            'description': product.description,
            'unit': product.unit,
            'purchase_price': float(product.purchase_price) if product.purchase_price else None,
            'selling_price': float(product.selling_price) if product.selling_price else None,
            'min_stock': product.min_stock,
            'max_stock': product.max_stock,
            'current_stock': product.current_stock,
            'image_path': product.image_path,
            'category_id': product.category_id,
            'category_name': product.category.name if product.category else None,
            'is_active': product.is_active,
            'created_at': product.created_at.isoformat() if product.created_at else None
        })
    
    return jsonify(products_list)

@products_bp.route('/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    """الحصول على بيانات صنف محدد"""
    product = Product.query.get_or_404(product_id)
    
    return jsonify({
        'id': product.id,
        'name': product.name,
        'code': product.code,
        'description': product.description,
        'unit': product.unit,
        'purchase_price': float(product.purchase_price) if product.purchase_price else None,
        'selling_price': float(product.selling_price) if product.selling_price else None,
        'min_stock': product.min_stock,
        'max_stock': product.max_stock,
        'current_stock': product.current_stock,
        'image_path': product.image_path,
        'category_id': product.category_id,
        'category_name': product.category.name if product.category else None,
        'is_active': product.is_active,
        'created_at': product.created_at.isoformat() if product.created_at else None
    })

@products_bp.route('/products', methods=['POST'])
def create_product():
    """إضافة صنف جديد"""
    data = request.get_json()
    
    # التحقق من وجود الكود
    if data.get('code'):
        existing_product = Product.query.filter_by(code=data['code']).first()
        if existing_product:
            return jsonify({'message': 'كود الصنف موجود بالفعل'}), 400
    
    product = Product(
        name=data.get('name'),
        code=data.get('code'),
        description=data.get('description'),
        unit=data.get('unit'),
        purchase_price=data.get('purchase_price'),
        selling_price=data.get('selling_price'),
        min_stock=data.get('min_stock', 0),
        max_stock=data.get('max_stock'),
        current_stock=data.get('current_stock', 0),
        image_path=data.get('image_path'),
        category_id=data.get('category_id')
    )
    
    try:
        db.session.add(product)
        db.session.commit()
        return jsonify({'message': 'تم إضافة الصنف بنجاح', 'id': product.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'حدث خطأ أثناء إضافة الصنف'}), 500

@products_bp.route('/products/<int:product_id>', methods=['PUT'])
def update_product(product_id):
    """تحديث بيانات صنف"""
    product = Product.query.get_or_404(product_id)
    data = request.get_json()
    
    # التحقق من الكود إذا تم تغييره
    if data.get('code') and data['code'] != product.code:
        existing_product = Product.query.filter_by(code=data['code']).first()
        if existing_product:
            return jsonify({'message': 'كود الصنف موجود بالفعل'}), 400
    
    product.name = data.get('name', product.name)
    product.code = data.get('code', product.code)
    product.description = data.get('description', product.description)
    product.unit = data.get('unit', product.unit)
    product.purchase_price = data.get('purchase_price', product.purchase_price)
    product.selling_price = data.get('selling_price', product.selling_price)
    product.min_stock = data.get('min_stock', product.min_stock)
    product.max_stock = data.get('max_stock', product.max_stock)
    product.current_stock = data.get('current_stock', product.current_stock)
    product.image_path = data.get('image_path', product.image_path)
    product.category_id = data.get('category_id', product.category_id)
    product.updated_at = datetime.utcnow()
    
    try:
        db.session.commit()
        return jsonify({'message': 'تم تحديث بيانات الصنف بنجاح'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'حدث خطأ أثناء تحديث البيانات'}), 500

@products_bp.route('/products/<int:product_id>', methods=['DELETE'])
def delete_product(product_id):
    """حذف صنف (إلغاء تفعيل)"""
    product = Product.query.get_or_404(product_id)
    
    product.is_active = False
    product.updated_at = datetime.utcnow()
    
    try:
        db.session.commit()
        return jsonify({'message': 'تم حذف الصنف بنجاح'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'حدث خطأ أثناء حذف الصنف'}), 500

# فئات الأصناف
@products_bp.route('/categories', methods=['GET'])
def get_categories():
    """الحصول على قائمة فئات الأصناف"""
    categories = Category.query.all()
    
    categories_list = []
    for category in categories:
        categories_list.append({
            'id': category.id,
            'name': category.name,
            'description': category.description,
            'created_at': category.created_at.isoformat() if category.created_at else None
        })
    
    return jsonify(categories_list)

@products_bp.route('/categories', methods=['POST'])
def create_category():
    """إضافة فئة جديدة"""
    data = request.get_json()
    
    category = Category(
        name=data.get('name'),
        description=data.get('description')
    )
    
    try:
        db.session.add(category)
        db.session.commit()
        return jsonify({'message': 'تم إضافة الفئة بنجاح', 'id': category.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'حدث خطأ أثناء إضافة الفئة'}), 500
