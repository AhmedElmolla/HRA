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
import { Users, Plus, Edit, Trash2 } from 'lucide-react'

export default function CustomerManagement() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    contact_person: '',
    address: '',
    phone: '',
    email: '',
    tax_number: '',
    customer_type: 'customer'
  })

  useEffect(() => {
    fetchCustomers()
  }, [])

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

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleTypeChange = (value) => {
    setFormData(prev => ({
      ...prev,
      customer_type: value
    }))
  }

  const resetForm = () => {
    setFormData({
      name: '',
      contact_person: '',
      address: '',
      phone: '',
      email: '',
      tax_number: '',
      customer_type: 'customer'
    })
    setEditingCustomer(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = editingCustomer 
        ? `/api/customers/${editingCustomer.id}` 
        : '/api/customers'
      const method = editingCustomer ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchCustomers()
        setDialogOpen(false)
        resetForm()
      }
    } catch (error) {
      console.error('Error saving customer:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (customer) => {
    setEditingCustomer(customer)
    setFormData({
      name: customer.name || '',
      contact_person: customer.contact_person || '',
      address: customer.address || '',
      phone: customer.phone || '',
      email: customer.email || '',
      tax_number: customer.tax_number || '',
      customer_type: customer.customer_type || 'customer'
    })
    setDialogOpen(true)
  }

  const handleDelete = async (customerId) => {
    if (confirm('هل أنت متأكد من حذف هذا العميل؟')) {
      try {
        const response = await fetch(`/api/customers/${customerId}`, {
          method: 'DELETE',
        })
        if (response.ok) {
          await fetchCustomers()
        }
      } catch (error) {
        console.error('Error deleting customer:', error)
      }
    }
  }

  const getTypeLabel = (type) => {
    return type === 'dealer' ? 'تاجر' : 'عميل'
  }

  const getTypeBadgeVariant = (type) => {
    return type === 'dealer' ? 'secondary' : 'default'
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6" />
          <h1 className="text-2xl font-bold">إدارة العملاء</h1>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 ml-2" />
              إضافة عميل جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingCustomer ? 'تعديل العميل' : 'إضافة عميل جديد'}
              </DialogTitle>
              <DialogDescription>
                قم بإدخال بيانات العميل
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">اسم العميل *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="أدخل اسم العميل"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contact_person">الشخص المسؤول</Label>
                  <Input
                    id="contact_person"
                    name="contact_person"
                    value={formData.contact_person}
                    onChange={handleInputChange}
                    placeholder="أدخل اسم الشخص المسؤول"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">العنوان</Label>
                <Textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="أدخل عنوان العميل"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">رقم الهاتف</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="أدخل رقم الهاتف"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="أدخل البريد الإلكتروني"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tax_number">الرقم الضريبي</Label>
                  <Input
                    id="tax_number"
                    name="tax_number"
                    value={formData.tax_number}
                    onChange={handleInputChange}
                    placeholder="أدخل الرقم الضريبي"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="customer_type">نوع العميل</Label>
                  <Select value={formData.customer_type} onValueChange={handleTypeChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر نوع العميل" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customer">عميل</SelectItem>
                      <SelectItem value="dealer">تاجر</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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

      <Card>
        <CardHeader>
          <CardTitle>قائمة العملاء</CardTitle>
          <CardDescription>
            إدارة بيانات العملاء والتجار
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">الاسم</TableHead>
                <TableHead className="text-right">الشخص المسؤول</TableHead>
                <TableHead className="text-right">الهاتف</TableHead>
                <TableHead className="text-right">البريد الإلكتروني</TableHead>
                <TableHead className="text-right">الرقم الضريبي</TableHead>
                <TableHead className="text-right">النوع</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>{customer.contact_person}</TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>{customer.tax_number}</TableCell>
                  <TableCell>
                    <Badge variant={getTypeBadgeVariant(customer.customer_type)}>
                      {getTypeLabel(customer.customer_type)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(customer)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(customer.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
