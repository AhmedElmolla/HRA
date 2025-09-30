from flask import Blueprint, request, jsonify
from src.models.models import db, Sale, SaleItem, Purchase, PurchaseItem, Product, Customer, Supplier, StockMovement
from datetime import datetime, date
from decimal import Decimal

sales_purchases_bp = Blueprint('sales_purchases', __name__)

# المبيعات
@sales_purchases_bp.route('/sales', methods=['GET'])
def get_sales():
    """الحصول على قائمة المبيعات"""
    sales = Sale.query.order_by(Sale.created_at.desc()).all()
    
    sales_list = []
    for sale in sales:
        sales_list.append({
            'id': sale.id,
            'invoice_number': sale.invoice_number,
            'customer_id': sale.customer_id,
            'customer_name': sale.customer.name if sale.customer else None,
            'employee_id': sale.employee_id,
            'sale_date': sale.sale_date.isoformat() if sale.sale_date else None,
            'total_amount': float(sale.total_amount) if sale.total_amount else 0,
            'tax_amount': float(sale.tax_amount) if sale.tax_amount else 0,
            'discount_amount': float(sale.discount_amount) if sale.discount_amount else 0,
            'net_amount': float(sale.net_amount) if sale.net_amount else 0,
            'invoice_type': sale.invoice_type,
            'status': sale.status,
            'notes': sale.notes,
            'created_at': sale.created_at.isoformat() if sale.created_at else None
        })
    
    return jsonify(sales_list)

@sales_purchases_bp.route('/sales/<int:sale_id>', methods=['GET'])
def get_sale(sale_id):
    """الحصول على بيانات مبيعة محددة مع العناصر"""
    sale = Sale.query.get_or_404(sale_id)
    
    items = []
    for item in sale.items:
        items.append({
            'id': item.id,
            'product_id': item.product_id,
            'product_name': item.product.name if item.product else None,
            'quantity': item.quantity,
            'unit_price': float(item.unit_price),
            'total_price': float(item.total_price)
        })
    
    return jsonify({
        'id': sale.id,
        'invoice_number': sale.invoice_number,
        'customer_id': sale.customer_id,
        'customer_name': sale.customer.name if sale.customer else None,
        'employee_id': sale.employee_id,
        'sale_date': sale.sale_date.isoformat() if sale.sale_date else None,
        'total_amount': float(sale.total_amount) if sale.total_amount else 0,
        'tax_amount': float(sale.tax_amount) if sale.tax_amount else 0,
        'discount_amount': float(sale.discount_amount) if sale.discount_amount else 0,
        'net_amount': float(sale.net_amount) if sale.net_amount else 0,
        'invoice_type': sale.invoice_type,
        'status': sale.status,
        'notes': sale.notes,
        'items': items,
        'created_at': sale.created_at.isoformat() if sale.created_at else None
    })

@sales_purchases_bp.route('/sales', methods=['POST'])
def create_sale():
    """إنشاء مبيعة جديدة"""
    data = request.get_json()
    
    # إنشاء رقم فاتورة تلقائي
    last_sale = Sale.query.order_by(Sale.id.desc()).first()
    invoice_number = f"INV-{(last_sale.id + 1) if last_sale else 1:06d}"
    
    sale = Sale(
        invoice_number=invoice_number,
        customer_id=data.get('customer_id'),
        employee_id=data.get('employee_id'),
        sale_date=datetime.strptime(data.get('sale_date'), '%Y-%m-%d').date() if data.get('sale_date') else date.today(),
        invoice_type=data.get('invoice_type', 'regular'),
        status='pending',
        notes=data.get('notes')
    )
    
    try:
        db.session.add(sale)
        db.session.flush()  # للحصول على ID
        
        total_amount = Decimal('0')
        
        # إضافة عناصر المبيعة
        for item_data in data.get('items', []):
            product = Product.query.get(item_data['product_id'])
            if not product:
                return jsonify({'message': f'المنتج غير موجود: {item_data["product_id"]}'}), 400
            
            quantity = int(item_data['quantity'])
            unit_price = Decimal(str(item_data['unit_price']))
            total_price = quantity * unit_price
            
            # التحقق من توفر المخزون
            if product.current_stock < quantity:
                return jsonify({'message': f'المخزون غير كافي للمنتج: {product.name}'}), 400
            
            sale_item = SaleItem(
                sale_id=sale.id,
                product_id=product.id,
                quantity=quantity,
                unit_price=unit_price,
                total_price=total_price
            )
            
            db.session.add(sale_item)
            total_amount += total_price
            
            # تحديث المخزون
            product.current_stock -= quantity
            
            # تسجيل حركة المخزون
            stock_movement = StockMovement(
                product_id=product.id,
                movement_type='out',
                quantity=quantity,
                reference_type='sale',
                reference_id=sale.id,
                employee_id=data.get('employee_id')
            )
            db.session.add(stock_movement)
        
        # حساب الضريبة والخصم
        discount_amount = Decimal(str(data.get('discount_amount', 0)))
        tax_rate = Decimal('0.14')  # 14% ضريبة القيمة المضافة
        
        amount_after_discount = total_amount - discount_amount
        tax_amount = amount_after_discount * tax_rate if data.get('invoice_type') == 'tax' else Decimal('0')
        net_amount = amount_after_discount + tax_amount
        
        sale.total_amount = total_amount
        sale.discount_amount = discount_amount
        sale.tax_amount = tax_amount
        sale.net_amount = net_amount
        sale.status = 'completed'
        
        db.session.commit()
        return jsonify({'message': 'تم إنشاء المبيعة بنجاح', 'id': sale.id, 'invoice_number': sale.invoice_number}), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'حدث خطأ أثناء إنشاء المبيعة: {str(e)}'}), 500

# المشتريات
@sales_purchases_bp.route('/purchases', methods=['GET'])
def get_purchases():
    """الحصول على قائمة المشتريات"""
    purchases = Purchase.query.order_by(Purchase.created_at.desc()).all()
    
    purchases_list = []
    for purchase in purchases:
        purchases_list.append({
            'id': purchase.id,
            'invoice_number': purchase.invoice_number,
            'supplier_id': purchase.supplier_id,
            'supplier_name': purchase.supplier.name if purchase.supplier else None,
            'employee_id': purchase.employee_id,
            'purchase_date': purchase.purchase_date.isoformat() if purchase.purchase_date else None,
            'total_amount': float(purchase.total_amount) if purchase.total_amount else 0,
            'tax_amount': float(purchase.tax_amount) if purchase.tax_amount else 0,
            'discount_amount': float(purchase.discount_amount) if purchase.discount_amount else 0,
            'net_amount': float(purchase.net_amount) if purchase.net_amount else 0,
            'status': purchase.status,
            'notes': purchase.notes,
            'created_at': purchase.created_at.isoformat() if purchase.created_at else None
        })
    
    return jsonify(purchases_list)

@sales_purchases_bp.route('/purchases/<int:purchase_id>', methods=['GET'])
def get_purchase(purchase_id):
    """الحصول على بيانات مشترى محدد مع العناصر"""
    purchase = Purchase.query.get_or_404(purchase_id)
    
    items = []
    for item in purchase.items:
        items.append({
            'id': item.id,
            'product_id': item.product_id,
            'product_name': item.product.name if item.product else None,
            'quantity': item.quantity,
            'unit_price': float(item.unit_price),
            'total_price': float(item.total_price)
        })
    
    return jsonify({
        'id': purchase.id,
        'invoice_number': purchase.invoice_number,
        'supplier_id': purchase.supplier_id,
        'supplier_name': purchase.supplier.name if purchase.supplier else None,
        'employee_id': purchase.employee_id,
        'purchase_date': purchase.purchase_date.isoformat() if purchase.purchase_date else None,
        'total_amount': float(purchase.total_amount) if purchase.total_amount else 0,
        'tax_amount': float(purchase.tax_amount) if purchase.tax_amount else 0,
        'discount_amount': float(purchase.discount_amount) if purchase.discount_amount else 0,
        'net_amount': float(purchase.net_amount) if purchase.net_amount else 0,
        'status': purchase.status,
        'notes': purchase.notes,
        'items': items,
        'created_at': purchase.created_at.isoformat() if purchase.created_at else None
    })

@sales_purchases_bp.route('/purchases', methods=['POST'])
def create_purchase():
    """إنشاء مشترى جديد"""
    data = request.get_json()
    
    # إنشاء رقم فاتورة تلقائي
    last_purchase = Purchase.query.order_by(Purchase.id.desc()).first()
    invoice_number = f"PUR-{(last_purchase.id + 1) if last_purchase else 1:06d}"
    
    purchase = Purchase(
        invoice_number=invoice_number,
        supplier_id=data.get('supplier_id'),
        employee_id=data.get('employee_id'),
        purchase_date=datetime.strptime(data.get('purchase_date'), '%Y-%m-%d').date() if data.get('purchase_date') else date.today(),
        status='pending',
        notes=data.get('notes')
    )
    
    try:
        db.session.add(purchase)
        db.session.flush()  # للحصول على ID
        
        total_amount = Decimal('0')
        
        # إضافة عناصر المشترى
        for item_data in data.get('items', []):
            product = Product.query.get(item_data['product_id'])
            if not product:
                return jsonify({'message': f'المنتج غير موجود: {item_data["product_id"]}'}), 400
            
            quantity = int(item_data['quantity'])
            unit_price = Decimal(str(item_data['unit_price']))
            total_price = quantity * unit_price
            
            purchase_item = PurchaseItem(
                purchase_id=purchase.id,
                product_id=product.id,
                quantity=quantity,
                unit_price=unit_price,
                total_price=total_price
            )
            
            db.session.add(purchase_item)
            total_amount += total_price
            
            # تحديث المخزون
            product.current_stock += quantity
            
            # تسجيل حركة المخزون
            stock_movement = StockMovement(
                product_id=product.id,
                movement_type='in',
                quantity=quantity,
                reference_type='purchase',
                reference_id=purchase.id,
                employee_id=data.get('employee_id')
            )
            db.session.add(stock_movement)
        
        # حساب الضريبة والخصم
        discount_amount = Decimal(str(data.get('discount_amount', 0)))
        tax_amount = Decimal(str(data.get('tax_amount', 0)))
        
        net_amount = total_amount - discount_amount + tax_amount
        
        purchase.total_amount = total_amount
        purchase.discount_amount = discount_amount
        purchase.tax_amount = tax_amount
        purchase.net_amount = net_amount
        purchase.status = 'completed'
        
        db.session.commit()
        return jsonify({'message': 'تم إنشاء المشترى بنجاح', 'id': purchase.id, 'invoice_number': purchase.invoice_number}), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'حدث خطأ أثناء إنشاء المشترى: {str(e)}'}), 500
