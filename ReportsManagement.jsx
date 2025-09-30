import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  FileText, 
  Download, 
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Users,
  Building2
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'

export default function ReportsManagement() {
  const [salesSummary, setSalesSummary] = useState({ summary: {}, customer_breakdown: {}, daily_breakdown: {} })
  const [purchasesSummary, setPurchasesSummary] = useState({ summary: {}, supplier_breakdown: {} })
  const [profitLoss, setProfitLoss] = useState({ revenue: {}, costs: {}, profit: {} })
  const [topProducts, setTopProducts] = useState([])
  const [financialSummary, setFinancialSummary] = useState({})
  const [dateRange, setDateRange] = useState({
    start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0]
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchAllReports()
  }, [dateRange])

  const fetchAllReports = async () => {
    setLoading(true)
    try {
      await Promise.all([
        fetchSalesSummary(),
        fetchPurchasesSummary(),
        fetchProfitLoss(),
        fetchTopProducts(),
        fetchFinancialSummary()
      ])
    } catch (error) {
      console.error('Error fetching reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSalesSummary = async () => {
    try {
      const params = new URLSearchParams(dateRange)
      const response = await fetch(`/api/reports/sales-summary?${params}`)
      if (response.ok) {
        const data = await response.json()
        setSalesSummary(data)
      }
    } catch (error) {
      console.error('Error fetching sales summary:', error)
    }
  }

  const fetchPurchasesSummary = async () => {
    try {
      const params = new URLSearchParams(dateRange)
      const response = await fetch(`/api/reports/purchases-summary?${params}`)
      if (response.ok) {
        const data = await response.json()
        setPurchasesSummary(data)
      }
    } catch (error) {
      console.error('Error fetching purchases summary:', error)
    }
  }

  const fetchProfitLoss = async () => {
    try {
      const params = new URLSearchParams(dateRange)
      const response = await fetch(`/api/reports/profit-loss?${params}`)
      if (response.ok) {
        const data = await response.json()
        setProfitLoss(data)
      }
    } catch (error) {
      console.error('Error fetching profit loss:', error)
    }
  }

  const fetchTopProducts = async () => {
    try {
      const params = new URLSearchParams({ ...dateRange, limit: '10' })
      const response = await fetch(`/api/reports/top-products?${params}`)
      if (response.ok) {
        const data = await response.json()
        setTopProducts(data)
      }
    } catch (error) {
      console.error('Error fetching top products:', error)
    }
  }

  const fetchFinancialSummary = async () => {
    try {
      const params = new URLSearchParams(dateRange)
      const response = await fetch(`/api/reports/financial-summary?${params}`)
      if (response.ok) {
        const data = await response.json()
        setFinancialSummary(data)
      }
    } catch (error) {
      console.error('Error fetching financial summary:', error)
    }
  }

  const handleDateChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // تحويل بيانات العملاء للرسم البياني
  const customerChartData = Object.entries(salesSummary.customer_breakdown || {}).map(([name, data]) => ({
    name: name.length > 15 ? name.substring(0, 15) + '...' : name,
    amount: data.net_amount
  })).slice(0, 5)

  // تحويل بيانات المبيعات اليومية للرسم البياني
  const dailySalesData = Object.entries(salesSummary.daily_breakdown || {}).map(([date, data]) => ({
    date: new Date(date).toLocaleDateString('ar-EG'),
    amount: data.net_amount,
    count: data.count
  })).slice(-7)

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6" />
          <h1 className="text-2xl font-bold">التقارير</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="start_date">من تاريخ:</Label>
            <Input
              id="start_date"
              type="date"
              value={dateRange.start_date}
              onChange={(e) => handleDateChange('start_date', e.target.value)}
              className="w-auto"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="end_date">إلى تاريخ:</Label>
            <Input
              id="end_date"
              type="date"
              value={dateRange.end_date}
              onChange={(e) => handleDateChange('end_date', e.target.value)}
              className="w-auto"
            />
          </div>
        </div>
      </div>

      {/* ملخص مالي سريع */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المبيعات</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {(salesSummary.summary?.net_amount || 0).toLocaleString()} ج.م
            </div>
            <p className="text-xs text-muted-foreground">
              {salesSummary.summary?.total_sales || 0} فاتورة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المشتريات</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {(purchasesSummary.summary?.net_amount || 0).toLocaleString()} ج.م
            </div>
            <p className="text-xs text-muted-foreground">
              {purchasesSummary.summary?.total_purchases || 0} فاتورة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الربح الإجمالي</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {(profitLoss.profit?.gross_profit || 0).toLocaleString()} ج.م
            </div>
            <p className="text-xs text-muted-foreground">
              هامش {(profitLoss.profit?.profit_margin || 0).toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">قيمة المخزون</CardTitle>
            <Package className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {(financialSummary.inventory?.total_value || 0).toLocaleString()} ج.م
            </div>
            <p className="text-xs text-muted-foreground">
              {financialSummary.inventory?.total_products || 0} صنف
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="sales">تقرير المبيعات</TabsTrigger>
          <TabsTrigger value="purchases">تقرير المشتريات</TabsTrigger>
          <TabsTrigger value="products">أفضل المنتجات</TabsTrigger>
          <TabsTrigger value="profit">الأرباح والخسائر</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>المبيعات اليومية</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dailySalesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="amount" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>أفضل العملاء</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={customerChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="amount"
                    >
                      {customerChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sales">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>ملخص المبيعات</CardTitle>
                <CardDescription>
                  تفاصيل المبيعات للفترة المحددة
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{salesSummary.summary?.total_sales || 0}</div>
                    <div className="text-sm text-muted-foreground">عدد الفواتير</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{(salesSummary.summary?.total_amount || 0).toLocaleString()} ج.م</div>
                    <div className="text-sm text-muted-foreground">إجمالي المبلغ</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{(salesSummary.summary?.total_discount || 0).toLocaleString()} ج.م</div>
                    <div className="text-sm text-muted-foreground">إجمالي الخصم</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{(salesSummary.summary?.total_tax || 0).toLocaleString()} ج.م</div>
                    <div className="text-sm text-muted-foreground">إجمالي الضريبة</div>
                  </div>
                </div>

                <h4 className="font-semibold mb-4">المبيعات حسب العميل</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">العميل</TableHead>
                      <TableHead className="text-right">عدد الفواتير</TableHead>
                      <TableHead className="text-right">إجمالي المبلغ</TableHead>
                      <TableHead className="text-right">صافي المبلغ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(salesSummary.customer_breakdown || {}).map(([customer, data]) => (
                      <TableRow key={customer}>
                        <TableCell className="font-medium">{customer}</TableCell>
                        <TableCell>{data.count}</TableCell>
                        <TableCell>{data.total_amount.toLocaleString()} ج.م</TableCell>
                        <TableCell>{data.net_amount.toLocaleString()} ج.م</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="purchases">
          <Card>
            <CardHeader>
              <CardTitle>ملخص المشتريات</CardTitle>
              <CardDescription>
                تفاصيل المشتريات للفترة المحددة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">{purchasesSummary.summary?.total_purchases || 0}</div>
                  <div className="text-sm text-muted-foreground">عدد الفواتير</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{(purchasesSummary.summary?.total_amount || 0).toLocaleString()} ج.م</div>
                  <div className="text-sm text-muted-foreground">إجمالي المبلغ</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{(purchasesSummary.summary?.total_discount || 0).toLocaleString()} ج.م</div>
                  <div className="text-sm text-muted-foreground">إجمالي الخصم</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{(purchasesSummary.summary?.total_tax || 0).toLocaleString()} ج.م</div>
                  <div className="text-sm text-muted-foreground">إجمالي الضريبة</div>
                </div>
              </div>

              <h4 className="font-semibold mb-4">المشتريات حسب المورد</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">المورد</TableHead>
                    <TableHead className="text-right">عدد الفواتير</TableHead>
                    <TableHead className="text-right">إجمالي المبلغ</TableHead>
                    <TableHead className="text-right">صافي المبلغ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(purchasesSummary.supplier_breakdown || {}).map(([supplier, data]) => (
                    <TableRow key={supplier}>
                      <TableCell className="font-medium">{supplier}</TableCell>
                      <TableCell>{data.count}</TableCell>
                      <TableCell>{data.total_amount.toLocaleString()} ج.م</TableCell>
                      <TableCell>{data.net_amount.toLocaleString()} ج.م</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>أفضل المنتجات مبيعاً</CardTitle>
              <CardDescription>
                أكثر 10 منتجات مبيعاً للفترة المحددة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">الترتيب</TableHead>
                    <TableHead className="text-right">اسم المنتج</TableHead>
                    <TableHead className="text-right">الكود</TableHead>
                    <TableHead className="text-right">الكمية المباعة</TableHead>
                    <TableHead className="text-right">إجمالي الإيرادات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProducts.map((product, index) => (
                    <TableRow key={product.product_id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>{product.product_name}</TableCell>
                      <TableCell>{product.product_code}</TableCell>
                      <TableCell>{product.total_quantity}</TableCell>
                      <TableCell>{product.total_revenue.toLocaleString()} ج.م</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profit">
          <Card>
            <CardHeader>
              <CardTitle>تقرير الأرباح والخسائر</CardTitle>
              <CardDescription>
                تحليل الأرباح والخسائر للفترة المحددة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-4">الإيرادات</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {(profitLoss.revenue?.total_sales || 0).toLocaleString()} ج.م
                      </div>
                      <div className="text-sm text-muted-foreground">إجمالي المبيعات</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {profitLoss.revenue?.sales_count || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">عدد فواتير المبيعات</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-4">التكاليف</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">
                        {(profitLoss.costs?.total_purchases || 0).toLocaleString()} ج.م
                      </div>
                      <div className="text-sm text-muted-foreground">إجمالي المشتريات</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {(profitLoss.costs?.cost_of_goods_sold || 0).toLocaleString()} ج.م
                      </div>
                      <div className="text-sm text-muted-foreground">تكلفة البضاعة المباعة</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {profitLoss.costs?.purchases_count || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">عدد فواتير المشتريات</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-4">الأرباح</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-emerald-50 rounded-lg">
                      <div className="text-2xl font-bold text-emerald-600">
                        {(profitLoss.profit?.gross_profit || 0).toLocaleString()} ج.م
                      </div>
                      <div className="text-sm text-muted-foreground">الربح الإجمالي</div>
                    </div>
                    <div className="text-center p-4 bg-teal-50 rounded-lg">
                      <div className="text-2xl font-bold text-teal-600">
                        {(profitLoss.profit?.net_profit || 0).toLocaleString()} ج.م
                      </div>
                      <div className="text-sm text-muted-foreground">صافي الربح</div>
                    </div>
                    <div className="text-center p-4 bg-cyan-50 rounded-lg">
                      <div className="text-2xl font-bold text-cyan-600">
                        {(profitLoss.profit?.profit_margin || 0).toFixed(1)}%
                      </div>
                      <div className="text-sm text-muted-foreground">هامش الربح</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
