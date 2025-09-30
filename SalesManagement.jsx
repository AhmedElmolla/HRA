import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ShoppingBag, Plus, Edit, Trash2, Eye } from 'lucide-react'

export default function SalesManagement() {
  const [sales, setSales] = useState([])
  const [customers, setCustomers] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [selectedSale, setSelectedSale] = useState(null)
  const [formData, setFormData] = useState({
    customer_id: '',
    sale_date: new Date().toISOString().split('T')[0],
    invoice_type: 'regular',
    discount_amount: 0,
    notes: '',
    items: []
  })

  useEffect(() => {
    fetchSales()
    fetchCustomers()
    fetchProducts()
  }, [])

  const fetchSales = async () => {
    try {
      const response = await fetch('/api/sales')
      if (response.ok) {
        const data = await response.json()
        setSales(data)
      }
    } catch (error) {
      console.error('Error fetching sales:', error)
    }
  }

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers')
      if (response.ok) {
        const data = await response.json()
        setCustomers(data)
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      if (response.ok) {
        const data = await response.json()
        setProducts(data)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { product_id: '', quantity: 1, unit_price: 0 }]
    }))
  }

  const removeItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }))
  }

  const updateItem = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }))
  }

  const resetForm = () => {
    setFormData({
      customer_id: '',
      sale_date: new Date().toISOString().split('T')[0],
      invoice_type: 'regular',
      discount_amount: 0,
      notes: '',
      items: []
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchSales()
        setDialogOpen(false)
        resetForm()
      } else {
        const error = await response.json()
        alert(error.message || 'حدث خطأ أثناء إنشاء المبيعة')
      }
    } catch (error) {
      console.error('Error creating sale:', error)
      alert('حدث خطأ في الاتصال')
    } finally {
      setLoading(false)
    }
  }

  const handleView = async (saleId) => {
    try {
      const response = await fetch(`/api/sales/${saleId}`)
      if (response.ok) {
        const data = await response.json()
        setSelectedSale(data)
        setViewDialogOpen(true)
      }
    } catch (error) {
      console.error('Error fetching sale details:', error)
    }
  }

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'secondary',
      completed: 'default',
      cancelled: 'destructive'
    }
    const labels = {
      pending: 'معلق',
      completed: 'مكتمل',
      cancelled: 'ملغي'
    }
    return <Badge variant={variants[status]}>{labels[status]}</Badge>
  }

  const getInvoiceTypeBadge = (type) => {
    return type === 'tax' ? 
      <Badge variant="outline">ضريبية</Badge> : 
      <Badge variant="secondary">عادية</Badge>
  }

  const calculateTotal = () => {
    return formData.items.reduce((total, item) => {
      return total + (item.quantity * item.unit_price)
    }, 0)
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-6 w-6" />
          <h1 className="text-2xl font-bold">إدارة المبيعات</h1>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 ml-2" />
              إنشاء فاتورة مبيعات
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>إنشاء فاتورة مبيعات جديدة</DialogTitle>
              <DialogDescription>
                قم بإدخال بيانات المبيعة والأصناف
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customer_id">العميل *</Label>
                  <Select value={formData.customer_id} onValueChange={(value) => handleSelectChange('customer_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر العميل" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id.toString()}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sale_date">تاريخ المبيعة</Label>
                  <Input
                    id="sale_date"
                    name="sale_date"
                    type="date"
                    value={formData.sale_date}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="invoice_type">نوع الفاتورة</Label>
                  <Select value={formData.invoice_type} onValueChange={(value) => handleSelectChange('invoice_type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر نوع الفاتورة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="regular">عادية</SelectItem>
                      <SelectItem value="tax">ضريبية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">الأصناف</h3>
                  <Button type="button" onClick={addItem} variant="outline" size="sm">
                    <Plus className="h-4 w-4 ml-2" />
                    إضافة صنف
                  </Button>
                </div>
                
                {formData.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-lg">
                    <div className="space-y-2">
                      <Label>الصنف</Label>
                      <Select 
                        value={item.product_id} 
                        onValueChange={(value) => {
                          updateItem(index, 'product_id', value)
                          const product = products.find(p => p.id.toString() === value)
                          if (product) {
                            updateItem(index, 'unit_price', product.selling_price || 0)
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الصنف" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product.id} value={product.id.toString()}>
                              {product.name} (متوفر: {product.current_stock})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>الكمية</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>سعر الوحدة</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>الإجمالي</Label>
                      <Input
                        type="number"
                        value={(item.quantity * item.unit_price).toFixed(2)}
                        readOnly
                        className="bg-gray-50"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>&nbsp;</Label>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="discount_amount">مبلغ الخصم</Label>
                  <Input
                    id="discount_amount"
                    name="discount_amount"
                    type="number"
                    step="0.01"
                    value={formData.discount_amount}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>إجمالي الفاتورة</Label>
                  <Input
                    type="number"
                    value={calculateTotal().toFixed(2)}
                    readOnly
                    className="bg-gray-50 font-bold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">ملاحظات</Label>
                <Input
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="أدخل أي ملاحظات"
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button type="submit" disabled={loading || formData.items.length === 0}>
                  {loading ? 'جاري الحفظ...' : 'حفظ الفاتورة'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>قائمة المبيعات</CardTitle>
          <CardDescription>
            إدارة فواتير المبيعات
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">رقم الفاتورة</TableHead>
                <TableHead className="text-right">العميل</TableHead>
                <TableHead className="text-right">التاريخ</TableHead>
                <TableHead className="text-right">النوع</TableHead>
                <TableHead className="text-right">الإجمالي</TableHead>
                <TableHead className="text-right">صافي المبلغ</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell className="font-medium">{sale.invoice_number}</TableCell>
                  <TableCell>{sale.customer_name}</TableCell>
                  <TableCell>{new Date(sale.sale_date).toLocaleDateString('ar-EG')}</TableCell>
                  <TableCell>{getInvoiceTypeBadge(sale.invoice_type)}</TableCell>
                  <TableCell>{sale.total_amount.toLocaleString()} ج.م</TableCell>
                  <TableCell>{sale.net_amount.toLocaleString()} ج.م</TableCell>
                  <TableCell>{getStatusBadge(sale.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleView(sale.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* مربع حوار عرض تفاصيل المبيعة */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تفاصيل الفاتورة</DialogTitle>
          </DialogHeader>
          {selectedSale && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><strong>رقم الفاتورة:</strong> {selectedSale.invoice_number}</div>
                <div><strong>العميل:</strong> {selectedSale.customer_name}</div>
                <div><strong>التاريخ:</strong> {new Date(selectedSale.sale_date).toLocaleDateString('ar-EG')}</div>
                <div><strong>النوع:</strong> {selectedSale.invoice_type === 'tax' ? 'ضريبية' : 'عادية'}</div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">الأصناف:</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">الصنف</TableHead>
                      <TableHead className="text-right">الكمية</TableHead>
                      <TableHead className="text-right">سعر الوحدة</TableHead>
                      <TableHead className="text-right">الإجمالي</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedSale.items?.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.product_name}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{item.unit_price} ج.م</TableCell>
                        <TableCell>{item.total_price} ج.م</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div><strong>إجمالي المبلغ:</strong> {selectedSale.total_amount} ج.م</div>
                <div><strong>الخصم:</strong> {selectedSale.discount_amount} ج.م</div>
                <div><strong>الضريبة:</strong> {selectedSale.tax_amount} ج.م</div>
                <div><strong>صافي المبلغ:</strong> {selectedSale.net_amount} ج.م</div>
              </div>
              
              {selectedSale.notes && (
                <div><strong>ملاحظات:</strong> {selectedSale.notes}</div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
