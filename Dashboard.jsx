import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  ShoppingBag, 
  Package, 
  Users, 
  AlertTriangle 
} from 'lucide-react'

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalPurchases: 0,
    totalProducts: 0,
    totalEmployees: 0,
    lowStockProducts: 0,
    monthlyProfit: 0
  })

  useEffect(() => {
    // في التطبيق الحقيقي، ستجلب هذه البيانات من API
    setStats({
      totalSales: 125000,
      totalPurchases: 85000,
      totalProducts: 150,
      totalEmployees: 12,
      lowStockProducts: 8,
      monthlyProfit: 40000
    })
  }, [])

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = "default" }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
            {trend === 'up' ? (
              <TrendingUp className="h-3 w-3 text-green-500" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-500" />
            )}
            <span className={trend === 'up' ? 'text-green-500' : 'text-red-500'}>
              {trendValue}
            </span>
            من الشهر الماضي
          </p>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="h-6 w-6" />
        <h1 className="text-2xl font-bold">لوحة التحكم</h1>
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard
          title="إجمالي المبيعات"
          value={`${stats.totalSales.toLocaleString()} ج.م`}
          icon={ShoppingBag}
          trend="up"
          trendValue="+12%"
        />
        <StatCard
          title="إجمالي المشتريات"
          value={`${stats.totalPurchases.toLocaleString()} ج.م`}
          icon={ShoppingCart}
          trend="up"
          trendValue="+8%"
        />
        <StatCard
          title="صافي الربح الشهري"
          value={`${stats.monthlyProfit.toLocaleString()} ج.م`}
          icon={DollarSign}
          trend="up"
          trendValue="+15%"
        />
        <StatCard
          title="عدد الأصناف"
          value={stats.totalProducts}
          icon={Package}
        />
        <StatCard
          title="عدد الموظفين"
          value={stats.totalEmployees}
          icon={Users}
        />
        <StatCard
          title="أصناف تحت الحد الأدنى"
          value={stats.lowStockProducts}
          icon={AlertTriangle}
          color="destructive"
        />
      </div>

      {/* تنبيهات وإشعارات */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
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
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>لابتوب ديل</span>
                <Badge variant="destructive">5 قطع متبقية</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>طابعة HP</span>
                <Badge variant="destructive">2 قطع متبقية</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>ماوس لاسلكي</span>
                <Badge variant="secondary">8 قطع متبقية</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              أفضل المنتجات مبيعاً
            </CardTitle>
            <CardDescription>
              الأصناف الأكثر مبيعاً هذا الشهر
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>لابتوب ديل</span>
                <Badge>25 قطعة</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>طابعة HP</span>
                <Badge>18 قطعة</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>ماوس لاسلكي</span>
                <Badge>15 قطعة</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ملخص مالي */}
      <Card>
        <CardHeader>
          <CardTitle>الملخص المالي - الشهر الحالي</CardTitle>
          <CardDescription>
            نظرة عامة على الأداء المالي
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {stats.totalSales.toLocaleString()} ج.م
              </div>
              <div className="text-sm text-green-600">إجمالي المبيعات</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {stats.totalPurchases.toLocaleString()} ج.م
              </div>
              <div className="text-sm text-red-600">إجمالي المشتريات</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {(stats.totalSales - stats.totalPurchases).toLocaleString()} ج.م
              </div>
              <div className="text-sm text-blue-600">إجمالي الربح</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {(((stats.totalSales - stats.totalPurchases) / stats.totalSales) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-purple-600">هامش الربح</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
