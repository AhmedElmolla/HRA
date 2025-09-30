from flask import Blueprint, request, jsonify
from src.models.models import db, Product, StockMovement, Employee
from datetime import datetime, date
from sqlalchemy import func

inventory_bp = Blueprint('inventory', __name__)

@inventory_bp.route('/inventory/stock-movements', methods=['GET'])
def get_stock_movements():
    """الحصول على حركات المخزون"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 50, type=int)
    product_id = request.args.get('product_id', type=int)
    movement_type = request.args.get('movement_type')
    
    query = StockMovement.query
    
    if product_id:
        query = query.filter_by(product_id=product_id)
    if movement_type:
        query = query.filter_by(movement_type=movement_type)
    
    movements = query.order_by(StockMovement.movement_date.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    movements_list = []
    for movement in movements.items:
        movements_list.append({
            'id': movement.id,
            'product_id': movement.product_id,
            'product_name': movement.product.name if movement.product else None,
            'movement_type': movement.movement_type,
            'quantity': movement.quantity,
            'reference_type': movement.reference_type,
            'reference_id': movement.reference_id,
            'notes': movement.notes,
            'movement_date': movement.movement_date.isoformat() if movement.movement_date else None,
            'employee_name': movement.employee.name if movement.employee else None
        })
    
    return jsonify({
        'movements': movements_list,
        'total': movements.total,
        'pages': movements.pages,
        'current_page': movements.page
    })

@inventory_bp.route('/inventory/stock-adjustment', methods=['POST'])
def stock_adjustment():
    """تعديل المخزون يدوياً"""
    data = request.get_json()
    
    product = Product.query.get_or_404(data.get('product_id'))
    old_stock = product.current_stock
    new_stock = int(data.get('new_stock'))
    difference = new_stock - old_stock
    
    if difference == 0:
        return jsonify({'message': 'لا يوجد تغيير في المخزون'}), 400
    
    try:
        # تحديث المخزون
        product.current_stock = new_stock
        
        # تسجيل حركة المخزون
        movement = StockMovement(
            product_id=product.id,
            movement_type='adjustment',
            quantity=abs(difference),
            reference_type='adjustment',
            notes=data.get('notes', f'تعديل المخزون من {old_stock} إلى {new_stock}'),
            employee_id=data.get('employee_id')
        )
        
        db.session.add(movement)
        db.session.commit()
        
        return jsonify({
            'message': 'تم تعديل المخزون بنجاح',
            'old_stock': old_stock,
            'new_stock': new_stock,
            'difference': difference
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'حدث خطأ أثناء تعديل المخزون: {str(e)}'}), 500

@inventory_bp.route('/inventory/low-stock', methods=['GET'])
def get_low_stock_products():
    """الحصول على الأصناف تحت الحد الأدنى"""
    products = Product.query.filter(
        Product.current_stock <= Product.min_stock,
        Product.is_active == True
    ).all()
    
    low_stock_list = []
    for product in products:
        low_stock_list.append({
            'id': product.id,
            'name': product.name,
            'code': product.code,
            'current_stock': product.current_stock,
            'min_stock': product.min_stock,
            'max_stock': product.max_stock,
            'category_name': product.category.name if product.category else None,
            'shortage': product.min_stock - product.current_stock if product.current_stock < product.min_stock else 0
        })
    
    return jsonify(low_stock_list)

@inventory_bp.route('/inventory/stock-report', methods=['GET'])
def get_stock_report():
    """تقرير المخزون الشامل"""
    products = Product.query.filter_by(is_active=True).all()
    
    total_products = len(products)
    low_stock_count = 0
    out_of_stock_count = 0
    overstock_count = 0
    total_value = 0
    
    products_list = []
    for product in products:
        stock_status = 'normal'
        if product.current_stock == 0:
            stock_status = 'out_of_stock'
            out_of_stock_count += 1
        elif product.current_stock <= product.min_stock:
            stock_status = 'low_stock'
            low_stock_count += 1
        elif product.max_stock and product.current_stock >= product.max_stock:
            stock_status = 'overstock'
            overstock_count += 1
        
        product_value = (product.current_stock * product.purchase_price) if product.purchase_price else 0
        total_value += product_value
        
        products_list.append({
            'id': product.id,
            'name': product.name,
            'code': product.code,
            'current_stock': product.current_stock,
            'min_stock': product.min_stock,
            'max_stock': product.max_stock,
            'purchase_price': float(product.purchase_price) if product.purchase_price else 0,
            'selling_price': float(product.selling_price) if product.selling_price else 0,
            'stock_value': float(product_value),
            'stock_status': stock_status,
            'category_name': product.category.name if product.category else None
        })
    
    return jsonify({
        'summary': {
            'total_products': total_products,
            'low_stock_count': low_stock_count,
            'out_of_stock_count': out_of_stock_count,
            'overstock_count': overstock_count,
            'total_value': float(total_value)
        },
        'products': products_list
    })

@inventory_bp.route('/inventory/movement-summary', methods=['GET'])
def get_movement_summary():
    """ملخص حركات المخزون"""
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    query = db.session.query(
        StockMovement.movement_type,
        func.sum(StockMovement.quantity).label('total_quantity'),
        func.count(StockMovement.id).label('movement_count')
    ).group_by(StockMovement.movement_type)
    
    if start_date:
        query = query.filter(StockMovement.movement_date >= datetime.strptime(start_date, '%Y-%m-%d'))
    if end_date:
        query = query.filter(StockMovement.movement_date <= datetime.strptime(end_date, '%Y-%m-%d'))
    
    results = query.all()
    
    summary = {}
    for result in results:
        summary[result.movement_type] = {
            'total_quantity': result.total_quantity,
            'movement_count': result.movement_count
        }
    
    return jsonify(summary)

@inventory_bp.route('/inventory/valuation', methods=['GET'])
def get_inventory_valuation():
    """تقييم المخزون"""
    method = request.args.get('method', 'purchase_price')  # purchase_price or selling_price
    
    products = Product.query.filter_by(is_active=True).all()
    
    total_value = 0
    categories_value = {}
    products_valuation = []
    
    for product in products:
        if method == 'purchase_price':
            unit_price = product.purchase_price or 0
        else:
            unit_price = product.selling_price or 0
        
        product_value = product.current_stock * unit_price
        total_value += product_value
        
        category_name = product.category.name if product.category else 'غير مصنف'
        if category_name not in categories_value:
            categories_value[category_name] = 0
        categories_value[category_name] += product_value
        
        products_valuation.append({
            'id': product.id,
            'name': product.name,
            'code': product.code,
            'current_stock': product.current_stock,
            'unit_price': float(unit_price),
            'total_value': float(product_value),
            'category_name': category_name
        })
    
    return jsonify({
        'method': method,
        'total_value': float(total_value),
        'categories_value': {k: float(v) for k, v in categories_value.items()},
        'products': products_valuation
    })

@inventory_bp.route('/inventory/reorder-suggestions', methods=['GET'])
def get_reorder_suggestions():
    """اقتراحات إعادة الطلب"""
    products = Product.query.filter(
        Product.current_stock <= Product.min_stock,
        Product.is_active == True
    ).all()
    
    suggestions = []
    for product in products:
        suggested_quantity = (product.max_stock or product.min_stock * 2) - product.current_stock
        
        suggestions.append({
            'product_id': product.id,
            'product_name': product.name,
            'product_code': product.code,
            'current_stock': product.current_stock,
            'min_stock': product.min_stock,
            'max_stock': product.max_stock,
            'suggested_quantity': suggested_quantity,
            'estimated_cost': float((suggested_quantity * product.purchase_price) if product.purchase_price else 0),
            'category_name': product.category.name if product.category else None
        })
    
    return jsonify(suggestions)
