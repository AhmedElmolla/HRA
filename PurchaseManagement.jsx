import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { ShoppingCart, Plus, Edit, Trash2, Eye } from 'lucide-react'

export default function PurchaseManagement() {
  const [purchases, setPurchases] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [selectedPurchase, setSelectedPurchase] = useState(null)
  const [formData, setFormData] = useState({
    supplier_id: '',
    purchase_date: new Date().toISOString().split('T')[0],
    discount_amount: 0,
    tax_amount: 0,
    notes: '',
    items: []
  })

  useEffect(() => {
    fetchPurchases()
    fetchSuppliers()
    fetchProducts()
  }, [])

  const fetchPurchases = async () => {
    try {
      const response = await fetch('/api/purchases')
      if (response.ok) {
        const data = await response.json()
        setPurchases(data)
      }
    } catch (error) {
      console.error('Error fetching purchases:', error)
    }
  }

  const fetchSuppliers = async () => {
    try {
      const response = await fetch('/api/suppliers')
      if (response.ok) {
        const data = await response.json()
        setSuppliers(data)
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error)
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
      supplier_id: '',
      purchase_date: new Date().toISOString().split('T')[0],
      discount_amount: 0,
      tax_amount: 0,
      notes: '',
      items: []
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/purchases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchPurchases()
        setDialogOpen(false)
        resetForm()
      } else {
        const error = await response.json()
        alert(error.message || 'حدث خطأ أثناء إنشاء المشترى')
      }
    } catch (error) {
      console.error('Error creating purchase:', error)
      alert('حدث خطأ في الاتصال')
    } finally {
      setLoading(false)
    }
  }

  const handleView = async (purchaseId) => {
    try {
      const response = await fetch(`/api/purchases/${purchaseId}`)
      if (response.ok) {
        const data = await response.json()
        setSelectedPurchase(data)
        setViewDialogOpen(true)
      }
    } catch (error) {
      console.error('Error fetching purchase details:', error)
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

  const calculateTotal = () => {
    return formData.items.reduce((total, item) => {
      return total + (item.quantity * item.unit_price)
    }, 0)
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-6 w-6" />
          <h1 className="text-2xl font-bold">إدارة المشتريات</h1>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 ml-2" />
              إنشاء فاتورة مشتريات
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>إنشاء فاتورة مشتريات جديدة</DialogTitle>
              <DialogDescription>
                قم بإدخال بيانات المشترى والأصناف
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="supplier_id">المورد *</Label>
                  <Select value={formData.supplier_id} onValueChange={(value) => handleSelectChange('supplier_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المورد" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id.toString()}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="purchase_date">تاريخ المشترى</Label>
                  <Input
                    id="purchase_date"
                    name="purchase_date"
                    type="date"
                    value={formData.purchase_date}
                    onChange={handleInputChange}
                  />
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
                            updateItem(index, 'unit_price', product.purchase_price || 0)
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الصنف" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product.id} value={product.id.toString()}>
                              {product.name}
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <Label htmlFor="tax_amount">مبلغ الضريبة</Label>
                  <Input
                    id="tax_amount"
                    name="tax_amount"
                    type="number"
                    step="0.01"
                    value={formData.tax_amount}
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
          <CardTitle>قائمة المشتريات</CardTitle>
          <CardDescription>
            إدارة فواتير المشتريات
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">رقم الفاتورة</TableHead>
                <TableHead className="text-right">المورد</TableHead>
                <TableHead className="text-right">التاريخ</TableHead>
                <TableHead className="text-right">الإجمالي</TableHead>
                <TableHead className="text-right">الخصم</TableHead>
                <TableHead className="text-right">الضريبة</TableHead>
                <TableHead className="text-right">صافي المبلغ</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchases.map((purchase) => (
                <TableRow key={purchase.id}>
                  <TableCell className="font-medium">{purchase.invoice_number}</TableCell>
                  <TableCell>{purchase.supplier_name}</TableCell>
                  <TableCell>{new Date(purchase.purchase_date).toLocaleDateString('ar-EG')}</TableCell>
                  <TableCell>{purchase.total_amount.toLocaleString()} ج.م</TableCell>
                  <TableCell>{purchase.discount_amount.toLocaleString()} ج.م</TableCell>
                  <TableCell>{purchase.tax_amount.toLocaleString()} ج.م</TableCell>
                  <TableCell>{purchase.net_amount.toLocaleString()} ج.م</TableCell>
                  <TableCell>{getStatusBadge(purchase.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleView(purchase.id)}
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

      {/* مربع حوار عرض تفاصيل المشترى */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تفاصيل فاتورة المشتريات</DialogTitle>
          </DialogHeader>
          {selectedPurchase && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><strong>رقم الفاتورة:</strong> {selectedPurchase.invoice_number}</div>
                <div><strong>المورد:</strong> {selectedPurchase.supplier_name}</div>
                <div><strong>التاريخ:</strong> {new Date(selectedPurchase.purchase_date).toLocaleDateString('ar-EG')}</div>
                <div><strong>الحالة:</strong> {getStatusBadge(selectedPurchase.status)}</div>
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
                    {selectedPurchase.items?.map((item) => (
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
                <div><strong>إجمالي المبلغ:</strong> {selectedPurchase.total_amount} ج.م</div>
                <div><strong>الخصم:</strong> {selectedPurchase.discount_amount} ج.م</div>
                <div><strong>الضريبة:</strong> {selectedPurchase.tax_amount} ج.م</div>
                <div><strong>صافي المبلغ:</strong> {selectedPurchase.net_amount} ج.م</div>
              </div>
              
              {selectedPurchase.notes && (
                <div><strong>ملاحظات:</strong> {selectedPurchase.notes}</div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
