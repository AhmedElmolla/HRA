import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { 
  Building2, 
  Users, 
  Package, 
  ShoppingCart, 
  ShoppingBag, 
  Warehouse, 
  FileText, 
  TrendingUp, 
  DollarSign,
  Menu,
  X,
  Info,
  Mail,
  UserCog,
  LogOut
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Sidebar({ activeSection, onSectionChange, user, onLogout, permissions }) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const menuItems = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: TrendingUp },
    { id: 'company', label: 'بيانات الشركة', icon: Building2 },
    { id: 'employees', label: 'الموظفين', icon: Users },
    { id: 'products', label: 'الأصناف', icon: Package },
    { id: 'customers', label: 'العملاء', icon: Users },
    { id: 'suppliers', label: 'الموردين', icon: Building2 },
    { id: 'sales', label: 'المبيعات', icon: ShoppingBag },
    { id: 'purchases', label: 'المشتريات', icon: ShoppingCart },
    { id: 'inventory', label: 'المخزون', icon: Warehouse },
    { id: 'expenses', label: 'المصروفات', icon: DollarSign },
    { id: 'reports', label: 'التقارير', icon: FileText },
    { id: 'profit-loss', label: 'تحليل الأرباح', icon: TrendingUp },
    { id: 'users', label: 'إدارة المستخدمين', icon: UserCog },
    { id: 'about', label: 'عن البرنامج', icon: Info },
    { id: 'contact', label: 'اتصل بنا', icon: Mail },
  ]

  const handleLogout = () => {
    if (window.confirm('هل أنت متأكد من تسجيل الخروج؟')) {
      toast.success('تم تسجيل الخروج بنجاح');
      onLogout();
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin': return 'مدير';
      case 'accountant': return 'محاسب';
      case 'sales': return 'مندوب مبيعات';
      case 'inventory': return 'أمين مخزن';
      default: return role;
    }
  };

  return (
    <div className={`bg-card border-r border-border transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h2 className="text-lg font-semibold text-foreground">نظام الإدارة</h2>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2"
          >
            {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      
      {/* معلومات المستخدم */}
      {user && (
        <div className={`p-3 border-b border-border bg-muted/50 ${isCollapsed ? 'text-center' : ''}`}>
          {!isCollapsed ? (
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center ml-2">
                <Users className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">{user.name}</p>
                <p className="text-xs text-muted-foreground">{getRoleLabel(user.role)}</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mb-1">
                <Users className="h-4 w-4 text-primary" />
              </div>
            </div>
          )}
        </div>
      )}
      
      <nav className="p-2">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            // عرض العناصر التي يملك المستخدم صلاحية الوصول إليها فقط
            if (permissions && permissions[item.id]) {
              const Icon = item.icon
              return (
                <li key={item.id}>
                  <Button
                    variant={activeSection === item.id ? "default" : "ghost"}
                    className={`w-full justify-start text-right ${
                      isCollapsed ? 'px-2' : 'px-3'
                    }`}
                    onClick={() => onSectionChange(item.id)}
                  >
                    <Icon className={`h-4 w-4 ${isCollapsed ? '' : 'ml-2'}`} />
                    {!isCollapsed && <span>{item.label}</span>}
                  </Button>
                </li>
              )
            }
            return null;
          })}
        </ul>
      </nav>
      
      {/* زر تسجيل الخروج */}
      <div className="p-2 mt-auto border-t border-border">
        <Button
          variant="ghost"
          className={`w-full justify-start text-right text-destructive hover:text-destructive hover:bg-destructive/10 ${
            isCollapsed ? 'px-2' : 'px-3'
          }`}
          onClick={handleLogout}
        >
          <LogOut className={`h-4 w-4 ${isCollapsed ? '' : 'ml-2'}`} />
          {!isCollapsed && <span>تسجيل الخروج</span>}
        </Button>
      </div>
    </div>
  )
}
