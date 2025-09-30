from flask import Blueprint, request, jsonify, make_response
from src.models.models import db, Sale, Purchase, Product, Customer, Supplier, StockMovement, Company
from datetime import datetime, date
from sqlalchemy import func, and_, or_
from decimal import Decimal
import json

reports_bp = Blueprint('reports', __name__)

@reports_bp.route('/reports/sales-summary', methods=['GET'])
def get_sales_summary():
    """تقرير ملخص المبيعات"""
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    query = Sale.query.filter_by(status='completed')
    
    if start_date:
        query = query.filter(Sale.sale_date >= datetime.strptime(start_date, '%Y-%m-%d').date())
    if end_date:
        query = query.filter(Sale.sale_date <= datetime.strptime(end_date, '%Y-%m-%d').date())
    
    sales = query.all()
    
    total_sales = len(sales)
    total_amount = sum(sale.total_amount for sale in sales if sale.total_amount)
    total_tax = sum(sale.tax_amount for sale in sales if sale.tax_amount)
    total_discount = sum(sale.discount_amount for sale in sales if sale.discount_amount)
    net_amount = sum(sale.net_amount for sale in sales if sale.net_amount)
    
    # تجميع حسب العميل
    customer_sales = {}
    for sale in sales:
        customer_name = sale.customer.name if sale.customer else 'عميل نقدي'
        if customer_name not in customer_sales:
            customer_sales[customer_name] = {
                'count': 0,
                'total_amount': 0,
                'net_amount': 0
            }
        customer_sales[customer_name]['count'] += 1
        customer_sales[customer_name]['total_amount'] += float(sale.total_amount or 0)
        customer_sales[customer_name]['net_amount'] += float(sale.net_amount or 0)
    
    # تجميع حسب التاريخ
    daily_sales = {}
    for sale in sales:
        date_str = sale.sale_date.strftime('%Y-%m-%d') if sale.sale_date else 'غير محدد'
        if date_str not in daily_sales:
            daily_sales[date_str] = {
                'count': 0,
                'total_amount': 0,
                'net_amount': 0
            }
        daily_sales[date_str]['count'] += 1
        daily_sales[date_str]['total_amount'] += float(sale.total_amount or 0)
        daily_sales[date_str]['net_amount'] += float(sale.net_amount or 0)
    
    return jsonify({
        'summary': {
            'total_sales': total_sales,
            'total_amount': float(total_amount),
            'total_tax': float(total_tax),
            'total_discount': float(total_discount),
            'net_amount': float(net_amount)
        },
        'customer_breakdown': customer_sales,
        'daily_breakdown': daily_sales
    })

@reports_bp.route('/reports/purchases-summary', methods=['GET'])
def get_purchases_summary():
    """تقرير ملخص المشتريات"""
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    query = Purchase.query.filter_by(status='completed')
    
    if start_date:
        query = query.filter(Purchase.purchase_date >= datetime.strptime(start_date, '%Y-%m-%d').date())
    if end_date:
        query = query.filter(Purchase.purchase_date <= datetime.strptime(end_date, '%Y-%m-%d').date())
    
    purchases = query.all()
    
    total_purchases = len(purchases)
    total_amount = sum(purchase.total_amount for purchase in purchases if purchase.total_amount)
    total_tax = sum(purchase.tax_amount for purchase in purchases if purchase.tax_amount)
    total_discount = sum(purchase.discount_amount for purchase in purchases if purchase.discount_amount)
    net_amount = sum(purchase.net_amount for purchase in purchases if purchase.net_amount)
    
    # تجميع حسب المورد
    supplier_purchases = {}
    for purchase in purchases:
        supplier_name = purchase.supplier.name if purchase.supplier else 'مورد غير محدد'
        if supplier_name not in supplier_purchases:
            supplier_purchases[supplier_name] = {
                'count': 0,
                'total_amount': 0,
                'net_amount': 0
            }
        supplier_purchases[supplier_name]['count'] += 1
        supplier_purchases[supplier_name]['total_amount'] += float(purchase.total_amount or 0)
        supplier_purchases[supplier_name]['net_amount'] += float(purchase.net_amount or 0)
    
    return jsonify({
        'summary': {
            'total_purchases': total_purchases,
            'total_amount': float(total_amount),
            'total_tax': float(total_tax),
            'total_discount': float(total_discount),
            'net_amount': float(net_amount)
        },
        'supplier_breakdown': supplier_purchases
    })

@reports_bp.route('/reports/profit-loss', methods=['GET'])
def get_profit_loss():
    """تقرير الأرباح والخسائر"""
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    # المبيعات
    sales_query = Sale.query.filter_by(status='completed')
    if start_date:
        sales_query = sales_query.filter(Sale.sale_date >= datetime.strptime(start_date, '%Y-%m-%d').date())
    if end_date:
        sales_query = sales_query.filter(Sale.sale_date <= datetime.strptime(end_date, '%Y-%m-%d').date())
    
    sales = sales_query.all()
    total_sales_revenue = sum(sale.net_amount for sale in sales if sale.net_amount)
    
    # المشتريات
    purchases_query = Purchase.query.filter_by(status='completed')
    if start_date:
        purchases_query = purchases_query.filter(Purchase.purchase_date >= datetime.strptime(start_date, '%Y-%m-%d').date())
    if end_date:
        purchases_query = purchases_query.filter(Purchase.purchase_date <= datetime.strptime(end_date, '%Y-%m-%d').date())
    
    purchases = purchases_query.all()
    total_purchases_cost = sum(purchase.net_amount for purchase in purchases if purchase.net_amount)
    
    # حساب تكلفة البضاعة المباعة
    cost_of_goods_sold = 0
    for sale in sales:
        for item in sale.items:
            if item.product and item.product.purchase_price:
                cost_of_goods_sold += item.quantity * item.product.purchase_price
    
    # الأرباح الإجمالية
    gross_profit = float(total_sales_revenue) - float(cost_of_goods_sold)
    
    # صافي الربح (بدون احتساب المصروفات حالياً)
    net_profit = gross_profit
    
    # هامش الربح
    profit_margin = (gross_profit / float(total_sales_revenue) * 100) if total_sales_revenue > 0 else 0
    
    return jsonify({
        'revenue': {
            'total_sales': float(total_sales_revenue),
            'sales_count': len(sales)
        },
        'costs': {
            'total_purchases': float(total_purchases_cost),
            'cost_of_goods_sold': float(cost_of_goods_sold),
            'purchases_count': len(purchases)
        },
        'profit': {
            'gross_profit': gross_profit,
            'net_profit': net_profit,
            'profit_margin': profit_margin
        }
    })

@reports_bp.route('/reports/top-products', methods=['GET'])
def get_top_products():
    """تقرير أفضل المنتجات مبيعاً"""
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    limit = request.args.get('limit', 10, type=int)
    
    # استعلام للحصول على أفضل المنتجات
    query = db.session.query(
        Product.id,
        Product.name,
        Product.code,
        func.sum(db.session.query(Sale).join(Sale.items).filter(
            Sale.status == 'completed'
        ).subquery().c.quantity).label('total_quantity'),
        func.sum(db.session.query(Sale).join(Sale.items).filter(
            Sale.status == 'completed'
        ).subquery().c.total_price).label('total_revenue')
    ).join(Product.sale_items).join(Sale).filter(Sale.status == 'completed')
    
    if start_date:
        query = query.filter(Sale.sale_date >= datetime.strptime(start_date, '%Y-%m-%d').date())
    if end_date:
        query = query.filter(Sale.sale_date <= datetime.strptime(end_date, '%Y-%m-%d').date())
    
    products = query.group_by(Product.id).order_by(
        func.sum(db.session.query(Sale).join(Sale.items).subquery().c.total_price).desc()
    ).limit(limit).all()
    
    result = []
    for product in products:
        result.append({
            'product_id': product.id,
            'product_name': product.name,
            'product_code': product.code,
            'total_quantity': product.total_quantity or 0,
            'total_revenue': float(product.total_revenue or 0)
        })
    
    return jsonify(result)

@reports_bp.route('/reports/invoice/<int:sale_id>/print', methods=['GET'])
def print_sale_invoice(sale_id):
    """طباعة فاتورة مبيعات"""
    sale = Sale.query.get_or_404(sale_id)
    company = Company.query.first()
    
    invoice_data = {
        'company': {
            'name': company.name if company else 'اسم الشركة',
            'address': company.address if company else 'عنوان الشركة',
            'phone': company.phone if company else 'رقم الهاتف',
            'email': company.email if company else 'البريد الإلكتروني',
            'tax_number': company.tax_number if company else 'الرقم الضريبي'
        },
        'invoice': {
            'number': sale.invoice_number,
            'date': sale.sale_date.strftime('%Y-%m-%d') if sale.sale_date else '',
            'type': 'فاتورة ضريبية' if sale.invoice_type == 'tax' else 'فاتورة عادية'
        },
        'customer': {
            'name': sale.customer.name if sale.customer else 'عميل نقدي',
            'address': sale.customer.address if sale.customer else '',
            'phone': sale.customer.phone if sale.customer else '',
            'tax_number': sale.customer.tax_number if sale.customer else ''
        },
        'items': [],
        'totals': {
            'subtotal': float(sale.total_amount or 0),
            'discount': float(sale.discount_amount or 0),
            'tax': float(sale.tax_amount or 0),
            'total': float(sale.net_amount or 0)
        },
        'notes': sale.notes or ''
    }
    
    for item in sale.items:
        invoice_data['items'].append({
            'name': item.product.name if item.product else 'منتج محذوف',
            'quantity': item.quantity,
            'unit_price': float(item.unit_price),
            'total_price': float(item.total_price)
        })
    
    return jsonify(invoice_data)

@reports_bp.route('/reports/invoice/<int:purchase_id>/purchase-print', methods=['GET'])
def print_purchase_invoice(purchase_id):
    """طباعة فاتورة مشتريات"""
    purchase = Purchase.query.get_or_404(purchase_id)
    company = Company.query.first()
    
    invoice_data = {
        'company': {
            'name': company.name if company else 'اسم الشركة',
            'address': company.address if company else 'عنوان الشركة',
            'phone': company.phone if company else 'رقم الهاتف',
            'email': company.email if company else 'البريد الإلكتروني',
            'tax_number': company.tax_number if company else 'الرقم الضريبي'
        },
        'invoice': {
            'number': purchase.invoice_number,
            'date': purchase.purchase_date.strftime('%Y-%m-%d') if purchase.purchase_date else '',
            'type': 'فاتورة مشتريات'
        },
        'supplier': {
            'name': purchase.supplier.name if purchase.supplier else 'مورد غير محدد',
            'address': purchase.supplier.address if purchase.supplier else '',
            'phone': purchase.supplier.phone if purchase.supplier else '',
            'tax_number': purchase.supplier.tax_number if purchase.supplier else ''
        },
        'items': [],
        'totals': {
            'subtotal': float(purchase.total_amount or 0),
            'discount': float(purchase.discount_amount or 0),
            'tax': float(purchase.tax_amount or 0),
            'total': float(purchase.net_amount or 0)
        },
        'notes': purchase.notes or ''
    }
    
    for item in purchase.items:
        invoice_data['items'].append({
            'name': item.product.name if item.product else 'منتج محذوف',
            'quantity': item.quantity,
            'unit_price': float(item.unit_price),
            'total_price': float(item.total_price)
        })
    
    return jsonify(invoice_data)

@reports_bp.route('/reports/financial-summary', methods=['GET'])
def get_financial_summary():
    """ملخص مالي شامل"""
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    # المبيعات
    sales_query = Sale.query.filter_by(status='completed')
    if start_date:
        sales_query = sales_query.filter(Sale.sale_date >= datetime.strptime(start_date, '%Y-%m-%d').date())
    if end_date:
        sales_query = sales_query.filter(Sale.sale_date <= datetime.strptime(end_date, '%Y-%m-%d').date())
    
    sales = sales_query.all()
    
    # المشتريات
    purchases_query = Purchase.query.filter_by(status='completed')
    if start_date:
        purchases_query = purchases_query.filter(Purchase.purchase_date >= datetime.strptime(start_date, '%Y-%m-%d').date())
    if end_date:
        purchases_query = purchases_query.filter(Purchase.purchase_date <= datetime.strptime(end_date, '%Y-%m-%d').date())
    
    purchases = purchases_query.all()
    
    # حساب القيم
    total_sales = sum(sale.net_amount for sale in sales if sale.net_amount)
    total_purchases = sum(purchase.net_amount for purchase in purchases if purchase.net_amount)
    
    # قيمة المخزون الحالي
    products = Product.query.filter_by(is_active=True).all()
    inventory_value = sum(
        (product.current_stock * product.purchase_price) 
        for product in products 
        if product.purchase_price
    )
    
    return jsonify({
        'sales': {
            'total_amount': float(total_sales),
            'count': len(sales)
        },
        'purchases': {
            'total_amount': float(total_purchases),
            'count': len(purchases)
        },
        'inventory': {
            'total_value': float(inventory_value),
            'total_products': len(products)
        },
        'net_flow': float(total_sales) - float(total_purchases)
    })
