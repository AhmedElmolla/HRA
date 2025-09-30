import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Warehouse, 
  Plus, 
  Edit, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Package,
  DollarSign,
  RefreshCw
} from 'lucide-react'

export default function InventoryManagement() {
  const [stockReport, setStockReport] = useState({ summary: {}, products: [] })
  const [lowStockProducts, setLowStockProducts] = useState([])
  const [stockMovements, setStockMovements] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [adjustmentDialogOpen, setAdjustmentDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [adjustmentData, setAdjustmentData] = useState({
    new_stock: '',
    notes: ''
  })

  useEffect(() => {
    fetchStockReport()
    fetchLowStockProducts()
    fetchStockMovements()
    fetchProducts()
  }, [])

  const fetchStockReport = async () => {
    try {
      const response = await fetch('/api/inventory/stock-report')
      if (response.ok) {
        const data = await response.json()
        setStockReport(data)
      }
    } catch (error) {
      console.error('Error fetching stock report:', error)
    }
  }

  const fetchLowStockProducts = async () => {
    try {
      const response = await fetch('/api/inventory/low-stock')
      if (response.ok) {
        const data = await response.json()
        setLowStockProducts(data)
      }
    } catch (error) {
      console.error('Error fetching low stock products:', error)
    }
  }

  const fetchStockMovements = async () => {
    try {
      const response = await fetch('/api/inventory/stock-movements?per_page=20')
      if (response.ok) {
        const data = await response.json()
        setStockMovements(data.movements || [])
      }
    } catch (error) {
      console.error('Error fetching stock movements:', error)
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

  const handleAdjustment = (product) => {
    setSelectedProduct(product)
    setAdjustmentData({
      new_stock: product.current_stock.toString(),
      notes: ''
    })
    setAdjustmentDialogOpen(true)
  }

  const handleAdjustmentSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/inventory/stock-adjustment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: selectedProduct.id,
          new_stock: parseInt(adjustmentData.new_stock),
          notes: adjustmentData.notes
        }),
      })

      if (response.ok) {
        await fetchStockReport()
        await fetchLowStockProducts()
        await fetchStockMovements()
        setAdjustmentDialogOpen(false)
        setSelectedProduct(null)
        setAdjustmentData({ new_stock: '', notes: '' })
      } else {
        const error = await response.json()
        alert(error.message || 'حدث خطأ أثناء تعديل المخزون')
      }
    } catch (error) {
      console.error('Error adjusting stock:', error)
      alert('حدث خطأ في الاتصال')
    } finally {
      setLoading(false)
    }
  }

  const getStockStatusBadge = (status) => {
    const variants = {
      normal: 'default',
      low_stock: 'secondary',
      out_of_stock: 'destructive',
      overstock: 'outline'
    }
    const labels = {
      normal: 'طبيعي',
      low_stock: 'منخفض',
      out_of_stock: 'نفد',
      overstock: 'مرتفع'
    }
    return <Badge variant={variants[status]}>{labels[status]}</Badge>
  }

  const getMovementTypeBadge = (type) => {
    const variants = {
      in: 'default',
      out: 'secondary',
      adjustment: 'outline'
    }
    const labels = {
      in: 'دخول',
      out: 'خروج',
      adjustment: 'تعديل'
    }
    const icons = {
      in: <TrendingUp className="h-3 w-3" />,
      out: <TrendingDown className="h-3 w-3" />,
      adjustment: <RefreshCw className="h-3 w-3" />
    }
    return (
      <Badge variant={variants[type]} className="flex items-center gap-1">
        {icons[type]}
        {labels[type]}
      </Badge>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Warehouse className="h-6 w-6" />
          <h1 className="text-2xl font-bold">إدارة المخزون</h1>
        </div>
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الأصناف</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stockReport.summary.total_products || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">أصناف منخفضة</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stockReport.summary.low_stock_count || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">أصناف نفدت</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stockReport.summary.out_of_stock_count || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">قيمة المخزون</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {(stockReport.summary.total_value || 0).toLocaleString()} ج.م
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="movements">حركات المخزون</TabsTrigger>
          <TabsTrigger value="alerts">التنبيهات</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>تقرير المخزون الشامل</CardTitle>
              <CardDescription>
                حالة جميع الأصناف في المخزون
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">الصنف</TableHead>
                    <TableHead className="text-right">الكود</TableHead>
                    <TableHead className="text-right">الفئة</TableHead>
                    <TableHead className="text-right">المخزون الحالي</TableHead>
                    <TableHead className="text-right">الحد الأدنى</TableHead>
                    <TableHead className="text-right">الحد الأقصى</TableHead>
                    <TableHead className="text-right">قيمة المخزون</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stockReport.products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.code}</TableCell>
                      <TableCell>{product.category_name}</TableCell>
                      <TableCell>{product.current_stock}</TableCell>
                      <TableCell>{product.min_stock}</TableCell>
                      <TableCell>{product.max_stock || '-'}</TableCell>
                      <TableCell>{product.stock_value.toLocaleString()} ج.م</TableCell>
                      <TableCell>{getStockStatusBadge(product.stock_status)}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAdjustment(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movements">
          <Card>
            <CardHeader>
              <CardTitle>حركات المخزون الأخيرة</CardTitle>
              <CardDescription>
                آخر 20 حركة في المخزون
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">الصنف</TableHead>
                    <TableHead className="text-right">نوع الحركة</TableHead>
                    <TableHead className="text-right">الكمية</TableHead>
                    <TableHead className="text-right">المرجع</TableHead>
                    <TableHead className="text-right">التاريخ</TableHead>
                    <TableHead className="text-right">الموظف</TableHead>
                    <TableHead className="text-right">ملاحظات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stockMovements.map((movement) => (
                    <TableRow key={movement.id}>
                      <TableCell className="font-medium">{movement.product_name}</TableCell>
                      <TableCell>{getMovementTypeBadge(movement.movement_type)}</TableCell>
                      <TableCell>{movement.quantity}</TableCell>
                      <TableCell>{movement.reference_type}</TableCell>
                      <TableCell>
                        {new Date(movement.movement_date).toLocaleDateString('ar-EG')}
                      </TableCell>
                      <TableCell>{movement.employee_name}</TableCell>
                      <TableCell>{movement.notes}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                تنبيهات المخزون
              </CardTitle>
              <CardDescription>
                الأصناف التي تحتاج إلى إعادة تموين
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">الصنف</TableHead>
                    <TableHead className="text-right">الكود</TableHead>
                    <TableHead className="text-right">الفئة</TableHead>
                    <TableHead className="text-right">المخزون الحالي</TableHead>
                    <TableHead className="text-right">الحد الأدنى</TableHead>
                    <TableHead className="text-right">النقص</TableHead>
                    <TableHead className="text-right">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowStockProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.code}</TableCell>
                      <TableCell>{product.category_name}</TableCell>
                      <TableCell>
                        <Badge variant="destructive">{product.current_stock}</Badge>
                      </TableCell>
                      <TableCell>{product.min_stock}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.shortage}</Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAdjustment(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* مربع حوار تعديل المخزون */}
      <Dialog open={adjustmentDialogOpen} onOpenChange={setAdjustmentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>تعديل المخزون</DialogTitle>
            <DialogDescription>
              تعديل كمية المخزون للصنف: {selectedProduct?.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedProduct && (
            <form onSubmit={handleAdjustmentSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>المخزون الحالي</Label>
                <Input
                  value={selectedProduct.current_stock}
                  readOnly
                  className="bg-gray-50"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="new_stock">المخزون الجديد *</Label>
                <Input
                  id="new_stock"
                  type="number"
                  min="0"
                  value={adjustmentData.new_stock}
                  onChange={(e) => setAdjustmentData(prev => ({
                    ...prev,
                    new_stock: e.target.value
                  }))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">ملاحظات</Label>
                <Input
                  id="notes"
                  value={adjustmentData.notes}
                  onChange={(e) => setAdjustmentData(prev => ({
                    ...prev,
                    notes: e.target.value
                  }))}
                  placeholder="سبب التعديل"
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setAdjustmentDialogOpen(false)}
                >
                  إلغاء
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'جاري الحفظ...' : 'حفظ التعديل'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
