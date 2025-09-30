import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Building2, Plus, Edit, Trash2 } from 'lucide-react'

export default function SupplierManagement() {
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    contact_person: '',
    address: '',
    phone: '',
    email: '',
    tax_number: '',
    commercial_register: ''
  })

  useEffect(() => {
    fetchSuppliers()
  }, [])

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

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
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
      commercial_register: ''
    })
    setEditingSupplier(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = editingSupplier 
        ? `/api/suppliers/${editingSupplier.id}` 
        : '/api/suppliers'
      const method = editingSupplier ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchSuppliers()
        setDialogOpen(false)
        resetForm()
      }
    } catch (error) {
      console.error('Error saving supplier:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (supplier) => {
    setEditingSupplier(supplier)
    setFormData({
      name: supplier.name || '',
      contact_person: supplier.contact_person || '',
      address: supplier.address || '',
      phone: supplier.phone || '',
      email: supplier.email || '',
      tax_number: supplier.tax_number || '',
      commercial_register: supplier.commercial_register || ''
    })
    setDialogOpen(true)
  }

  const handleDelete = async (supplierId) => {
    if (confirm('هل أنت متأكد من حذف هذا المورد؟')) {
      try {
        const response = await fetch(`/api/suppliers/${supplierId}`, {
          method: 'DELETE',
        })
        if (response.ok) {
          await fetchSuppliers()
        }
      } catch (error) {
        console.error('Error deleting supplier:', error)
      }
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Building2 className="h-6 w-6" />
          <h1 className="text-2xl font-bold">إدارة الموردين</h1>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 ml-2" />
              إضافة مورد جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingSupplier ? 'تعديل المورد' : 'إضافة مورد جديد'}
              </DialogTitle>
              <DialogDescription>
                قم بإدخال بيانات المورد
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">اسم المورد *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="أدخل اسم المورد"
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
                  placeholder="أدخل عنوان المورد"
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
                  <Label htmlFor="commercial_register">رقم السجل التجاري</Label>
                  <Input
                    id="commercial_register"
                    name="commercial_register"
                    value={formData.commercial_register}
                    onChange={handleInputChange}
                    placeholder="أدخل رقم السجل التجاري"
                  />
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
          <CardTitle>قائمة الموردين</CardTitle>
          <CardDescription>
            إدارة بيانات الموردين
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
                <TableHead className="text-right">السجل التجاري</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suppliers.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell className="font-medium">{supplier.name}</TableCell>
                  <TableCell>{supplier.contact_person}</TableCell>
                  <TableCell>{supplier.phone}</TableCell>
                  <TableCell>{supplier.email}</TableCell>
                  <TableCell>{supplier.tax_number}</TableCell>
                  <TableCell>{supplier.commercial_register}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(supplier)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(supplier.id)}
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
