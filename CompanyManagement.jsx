import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, Save, Upload } from 'lucide-react'

export default function CompanyManagement() {
  const [companyData, setCompanyData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    tax_number: '',
    commercial_register: '',
    logo_path: '',
    manager_signature_path: '',
    accountant_signature_path: ''
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchCompanyData()
  }, [])

  const fetchCompanyData = async () => {
    try {
      const response = await fetch('/api/company')
      if (response.ok) {
        const data = await response.json()
        setCompanyData(data)
      }
    } catch (error) {
      console.error('Error fetching company data:', error)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setCompanyData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/company', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(companyData),
      })

      const result = await response.json()
      if (response.ok) {
        setMessage('تم حفظ بيانات الشركة بنجاح')
      } else {
        setMessage(result.message || 'حدث خطأ أثناء حفظ البيانات')
      }
    } catch (error) {
      setMessage('حدث خطأ في الاتصال')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Building2 className="h-6 w-6" />
        <h1 className="text-2xl font-bold">بيانات الشركة</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>معلومات الشركة الأساسية</CardTitle>
          <CardDescription>
            قم بإدخال وتحديث بيانات الشركة التي ستظهر في الفواتير والتقارير
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">اسم الشركة *</Label>
                <Input
                  id="name"
                  name="name"
                  value={companyData.name}
                  onChange={handleInputChange}
                  placeholder="أدخل اسم الشركة"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">رقم الهاتف</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={companyData.phone}
                  onChange={handleInputChange}
                  placeholder="أدخل رقم الهاتف"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">العنوان</Label>
              <Textarea
                id="address"
                name="address"
                value={companyData.address}
                onChange={handleInputChange}
                placeholder="أدخل عنوان الشركة"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={companyData.email}
                  onChange={handleInputChange}
                  placeholder="أدخل البريد الإلكتروني"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tax_number">الرقم الضريبي</Label>
                <Input
                  id="tax_number"
                  name="tax_number"
                  value={companyData.tax_number}
                  onChange={handleInputChange}
                  placeholder="أدخل الرقم الضريبي"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="commercial_register">رقم السجل التجاري</Label>
              <Input
                id="commercial_register"
                name="commercial_register"
                value={companyData.commercial_register}
                onChange={handleInputChange}
                placeholder="أدخل رقم السجل التجاري"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="logo_path">شعار الشركة</Label>
                <div className="flex gap-2">
                  <Input
                    id="logo_path"
                    name="logo_path"
                    value={companyData.logo_path}
                    onChange={handleInputChange}
                    placeholder="مسار الشعار"
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" size="sm">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="manager_signature_path">توقيع المدير</Label>
                <div className="flex gap-2">
                  <Input
                    id="manager_signature_path"
                    name="manager_signature_path"
                    value={companyData.manager_signature_path}
                    onChange={handleInputChange}
                    placeholder="مسار توقيع المدير"
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" size="sm">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="accountant_signature_path">توقيع المحاسب</Label>
                <div className="flex gap-2">
                  <Input
                    id="accountant_signature_path"
                    name="accountant_signature_path"
                    value={companyData.accountant_signature_path}
                    onChange={handleInputChange}
                    placeholder="مسار توقيع المحاسب"
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" size="sm">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {message && (
              <div className={`p-3 rounded-md text-sm ${
                message.includes('نجاح') 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {message}
              </div>
            )}

            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                <Save className="h-4 w-4 ml-2" />
                {loading ? 'جاري الحفظ...' : 'حفظ البيانات'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
