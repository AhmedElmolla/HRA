import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Package, Plus, Edit, Trash2, AlertTriangle } from 'lucide-react'

export default function ProductManagement() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    unit: '',
    purchase_price: '',
    selling_price: '',
    min_stock: '',
    max_stock: '',
    current_stock: '',
    category_id: ''
  })
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: ''
  })

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

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

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleCategoryInputChange = (e) => {
    const { name, value } = e.target
    setCategoryFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleCategoryChange = (value) => {
    setFormData(prev => ({
      ...prev,
      category_id: value
    }))
  }

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      unit: '',
      purchase_price: '',
      selling_price: '',
      min_stock: '',
      max_stock: '',
      current_stock: '',
      category_id: ''
    })
    setEditingProduct(null)
  }

  const resetCategoryForm = () => {
    setCategoryFormData({
      name: '',
      description: ''
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = editingProduct 
        ? `/api/products/${editingProduct.id}` 
        : '/api/products'
      const method = editingProduct ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchProducts()
        setDialogOpen(false)
        resetForm()
      }
    } catch (error) {
      console.error('Error saving product:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCategorySubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoryFormData),
      })

      if (response.ok) {
        await fetchCategories()
        setCategoryDialogOpen(false)
        resetCategoryForm()
      }
    } catch (error) {
      console.error('Error saving category:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name || '',
      code: product.code || '',
      description: product.description || '',
      unit: product.unit || '',
      purchase_price: product.purchase_price || '',
      selling_price: product.selling_price || '',
      min_stock: product.min_stock || '',
      max_stock: product.max_stock || '',
      current_stock: product.current_stock || '',
      category_id: product.category_id || ''
    })
    setDialogOpen(true)
  }

  const handleDelete = async (productId) => {
    if (confirm('هل أنت متأكد من حذف هذا الصنف؟')) {
      try {
        const response = await fetch(`/api/products/${productId}`, {
          method: 'DELETE',
        })
        if (response.ok) {
          await fetchProducts()
        }
      } catch (error) {
        console.error('Error deleting product:', error)
      }
    }
  }

  const getStockStatus = (product) => {
    if (product.current_stock <= product.min_stock) {
      return { status: 'low', label: 'مخزون منخفض', color: 'destructive' }
    } else if (product.current_stock >= product.max_stock) {
      return { status: 'high', label: 'مخزون مرتفع', color: 'secondary' }
    } else {
      return { status: 'normal', label: 'مخزون طبيعي', color: 'default' }
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Package className="h-6 w-6" />
          <h1 className="text-2xl font-bold">إدارة الأصناف</h1>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={resetCategoryForm}>
                <Plus className="h-4 w-4 ml-2" />
                إضافة فئة
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>إضافة فئة جديدة</DialogTitle>
                <DialogDescription>
                  قم بإدخال بيانات الفئة الجديدة
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleCategorySubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category_name">اسم الفئة *</Label>
                  <Input
                    id="category_name"
                    name="name"
                    value={categoryFormData.name}
                    onChange={handleCategoryInputChange}
                    placeholder="أدخل اسم الفئة"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category_description">الوصف</Label>
                  <Textarea
                    id="category_description"
                    name="description"
                    value={categoryFormData.description}
                    onChange={handleCategoryInputChange}
                    placeholder="أدخل وصف الفئة"
                    rows={3}
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setCategoryDialogOpen(false)}>
                    إلغاء
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'جاري الحفظ...' : 'حفظ'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 ml-2" />
                إضافة صنف جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? 'تعديل الصنف' : 'إضافة صنف جديد'}
                </DialogTitle>
                <DialogDescription>
                  قم بإدخال بيانات الصنف
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">اسم الصنف *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="أدخل اسم الصنف"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="code">كود الصنف</Label>
                    <Input
                      id="code"
                      name="code"
                      value={formData.code}
                      onChange={handleInputChange}
                      placeholder="أدخل كود الصنف"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">الوصف</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="أدخل وصف الصنف"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="unit">الوحدة</Label>
                    <Input
                      id="unit"
                      name="unit"
                      value={formData.unit}
                      onChange={handleInputChange}
                      placeholder="قطعة، كيلو، متر..."
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="purchase_price">سعر الشراء</Label>
                    <Input
                      id="purchase_price"
                      name="purchase_price"
                      type="number"
                      step="0.01"
                      value={formData.purchase_price}
                      onChange={handleInputChange}
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="selling_price">سعر البيع</Label>
                    <Input
                      id="selling_price"
                      name="selling_price"
                      type="number"
                      step="0.01"
                      value={formData.selling_price}
                      onChange={handleInputChange}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="min_stock">الحد الأدنى للمخزون</Label>
                    <Input
                      id="min_stock"
                      name="min_stock"
                      type="number"
                      value={formData.min_stock}
                      onChange={handleInputChange}
                      placeholder="0"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="max_stock">الحد الأقصى للمخزون</Label>
                    <Input
                      id="max_stock"
                      name="max_stock"
                      type="number"
                      value={formData.max_stock}
                      onChange={handleInputChange}
                      placeholder="0"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="current_stock">المخزون الحالي</Label>
                    <Input
                      id="current_stock"
                      name="current_stock"
                      type="number"
                      value={formData.current_stock}
                      onChange={handleInputChange}
                      placeholder="0"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category_id">الفئة</Label>
                  <Select value={formData.category_id} onValueChange={handleCategoryChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الفئة" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    إلغاء
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'جاري الحفظ...' : 'حفظ'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>قائمة الأصناف</CardTitle>
          <CardDescription>
            إدارة الأصناف والمنتجات
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">الاسم</TableHead>
                <TableHead className="text-right">الكود</TableHead>
                <TableHead className="text-right">الفئة</TableHead>
                <TableHead className="text-right">الوحدة</TableHead>
                <TableHead className="text-right">سعر الشراء</TableHead>
                <TableHead className="text-right">سعر البيع</TableHead>
                <TableHead className="text-right">المخزون</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => {
                const stockStatus = getStockStatus(product)
                return (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.code}</TableCell>
                    <TableCell>{product.category_name}</TableCell>
                    <TableCell>{product.unit}</TableCell>
                    <TableCell>{product.purchase_price ? `${product.purchase_price} ج.م` : '-'}</TableCell>
                    <TableCell>{product.selling_price ? `${product.selling_price} ج.م` : '-'}</TableCell>
                    <TableCell>{product.current_stock}</TableCell>
                    <TableCell>
                      <Badge variant={stockStatus.color} className="flex items-center gap-1">
                        {stockStatus.status === 'low' && <AlertTriangle className="h-3 w-3" />}
                        {stockStatus.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
