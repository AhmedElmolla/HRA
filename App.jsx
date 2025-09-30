import { useState, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import CompanyManagement from './components/CompanyManagement'
import EmployeeManagement from './components/EmployeeManagement'
import ProductManagement from './components/ProductManagement'
import CustomerManagement from './components/CustomerManagement'
import SupplierManagement from './components/SupplierManagement'
import SalesManagement from './components/SalesManagement'
import PurchaseManagement from './components/PurchaseManagement'
import InventoryManagement from './components/InventoryManagement'
import ReportsManagement from './components/ReportsManagement'
import ExpenseManagement from './components/ExpenseManagement'
import ProfitLossAnalysis from './components/ProfitLossAnalysis'
import UserManagement from './components/UserManagement'
import AboutSystem from './components/AboutSystem'
import ContactUs from './components/ContactUs'
import Login from './components/Login'
import Footer from './components/Footer'
import './App.css'

function App() {
  const [activeSection, setActiveSection] = useState('dashboard')
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // التحقق من وجود مستخدم مسجل الدخول
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  // تسجيل الدخول
  const handleLogin = (userData) => {
    setUser(userData)
  }

  // تسجيل الخروج
  const handleLogout = () => {
    localStorage.removeItem('user')
    setUser(null)
    setActiveSection('dashboard')
  }

  // التحقق من صلاحيات المستخدم للوصول إلى القسم
  const checkPermission = (section) => {
    if (!user) return false
    
    // تعيين الصلاحيات حسب الدور
    const permissions = {
      admin: {
        dashboard: true, company: true, employees: true, products: true,
        customers: true, suppliers: true, sales: true, purchases: true,
        inventory: true, expenses: true, reports: true, 'profit-loss': true,
        users: true, about: true, contact: true
      },
      accountant: {
        dashboard: true, company: false, employees: false, products: true,
        customers: true, suppliers: true, sales: true, purchases: true,
        inventory: true, expenses: true, reports: true, 'profit-loss': true,
        users: false, about: true, contact: true
      },
      sales: {
        dashboard: true, company: false, employees: false, products: true,
        customers: true, suppliers: false, sales: true, purchases: false,
        inventory: true, expenses: false, reports: false, 'profit-loss': false,
        users: false, about: true, contact: true
      },
      inventory: {
        dashboard: true, company: false, employees: false, products: true,
        customers: false, suppliers: true, sales: false, purchases: true,
        inventory: true, expenses: false, reports: false, 'profit-loss': false,
        users: false, about: true, contact: true
      }
    }
    
    return permissions[user.role]?.[section] || false
  }

  // تغيير القسم النشط مع التحقق من الصلاحيات
  const handleSectionChange = (section) => {
    if (checkPermission(section)) {
      setActiveSection(section)
    }
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />
      case 'company':
        return <CompanyManagement />
      case 'employees':
        return <EmployeeManagement />
      case 'products':
        return <ProductManagement />
      case 'customers':
        return <CustomerManagement />
      case 'suppliers':
        return <SupplierManagement />
      case 'sales':
        return <SalesManagement />
      case 'purchases':
        return <PurchaseManagement />
      case 'inventory':
        return <InventoryManagement />
      case 'expenses':
        return <ExpenseManagement />
      case 'reports':
        return <ReportsManagement />
      case 'profit-loss':
        return <ProfitLossAnalysis />
      case 'users':
        return <UserManagement />
      case 'about':
        return <AboutSystem />
      case 'contact':
        return <ContactUs />
      default:
        return <Dashboard />
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل النظام...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <>
        <Toaster position="top-center" />
        <Login onLogin={handleLogin} />
      </>
    )
  }

  return (
    <>
      <Toaster position="top-center" />
      <div className="flex flex-col h-screen bg-background" dir="rtl">
        <Sidebar 
          activeSection={activeSection} 
          onSectionChange={handleSectionChange}
          user={user}
          onLogout={handleLogout}
          permissions={{
            dashboard: checkPermission('dashboard'),
            company: checkPermission('company'),
            employees: checkPermission('employees'),
            products: checkPermission('products'),
            customers: checkPermission('customers'),
            suppliers: checkPermission('suppliers'),
            sales: checkPermission('sales'),
            purchases: checkPermission('purchases'),
            inventory: checkPermission('inventory'),
            expenses: checkPermission('expenses'),
            reports: checkPermission('reports'),
            'profit-loss': checkPermission('profit-loss'),
            users: checkPermission('users'),
            about: checkPermission('about'),
            contact: checkPermission('contact')
          }}
        />
        <main className="flex-1 overflow-auto">
          {renderContent()}
        </main>
        <Footer />
      </div>
    </>
  )
}

export default App
