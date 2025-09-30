import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Users, Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react'

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    phone: '',
    email: '',
    salary: '',
    username: '',
    password: '',
    role: 'employee'
  })

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees')
      if (response.ok) {
        const data = await response.json()
        setEmployees(data)
      }
    } catch (error) {
      console.error('Error fetching employees:', error)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleRoleChange = (value) => {
    setFormData(prev => ({
      ...prev,
      role: value
    }))
  }

  const resetForm = () => {
    setFormData({
      name: '',
      position: '',
      phone: '',
      email: '',
      salary: '',
      username: '',
      password: '',
      role: 'employee'
    })
    setEditingEmployee(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = editingEmployee 
        ? `/api/employees/${editingEmployee.id}` 
        : '/api/employees'
      const method = editingEmployee ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchEmployees()
        setDialogOpen(false)
        resetForm()
      }
    } catch (error) {
      console.error('Error saving employee:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (employee) => {
    setEditingEmployee(employee)
    setFormData({
      name: employee.name || '',
      position: employee.position || '',
      phone: employee.phone || '',
      email: employee.email || '',
      salary: employee.salary || '',
      username: employee.username || '',
      password: '',
      role: employee.role || 'employee'
    })
    setDialogOpen(true)
  }

  const handleDelete = async (employeeId) => {
    if (confirm('هل أنت متأكد من حذف هذا الموظف؟')) {
      try {
        const response = await fetch(`/api/employees/${employeeId}`, {
          method: 'DELETE',
        })
        if (response.ok) {
          await fetchEmployees()
        }
      } catch (error) {
        console.error('Error deleting employee:', error)
      }
    }
  }

  const getRoleLabel = (role) => {
    const roles = {
      admin: 'مدير النظام',
      manager: 'مدير',
      accountant: 'محاسب',
      employee: 'موظف'
    }
    return roles[role] || role
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6" />
          <h1 className="text-2xl font-bold">إدارة الموظفين</h1>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 ml-2" />
              إضافة موظف جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingEmployee ? 'تعديل الموظف' : 'إضافة موظف جديد'}
              </DialogTitle>
              <DialogDescription>
                قم بإدخال بيانات الموظف
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">الاسم *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="أدخل اسم الموظف"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="position">المنصب</Label>
                <Input
                  id="position"
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  placeholder="أدخل منصب الموظف"
                />
              </div>
              
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
              
              <div className="space-y-2">
                <Label htmlFor="salary">الراتب</Label>
                <Input
                  id="salary"
                  name="salary"
                  type="number"
                  value={formData.salary}
                  onChange={handleInputChange}
                  placeholder="أدخل الراتب"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="username">اسم المستخدم</Label>
                <Input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="أدخل اسم المستخدم"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">
                  {editingEmployee ? 'كلمة المرور الجديدة (اتركها فارغة للاحتفاظ بالحالية)' : 'كلمة المرور'}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="أدخل كلمة المرور"
                    required={!editingEmployee}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute left-2 top-1/2 transform -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">الدور</Label>
                <Select value={formData.role} onValueChange={handleRoleChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الدور" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">موظف</SelectItem>
                    <SelectItem value="accountant">محاسب</SelectItem>
                    <SelectItem value="manager">مدير</SelectItem>
                    <SelectItem value="admin">مدير النظام</SelectItem>
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

      <Card>
        <CardHeader>
          <CardTitle>قائمة الموظفين</CardTitle>
          <CardDescription>
            إدارة بيانات الموظفين وصلاحياتهم
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">الاسم</TableHead>
                <TableHead className="text-right">المنصب</TableHead>
                <TableHead className="text-right">الهاتف</TableHead>
                <TableHead className="text-right">البريد الإلكتروني</TableHead>
                <TableHead className="text-right">الراتب</TableHead>
                <TableHead className="text-right">الدور</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">{employee.name}</TableCell>
                  <TableCell>{employee.position}</TableCell>
                  <TableCell>{employee.phone}</TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell>{employee.salary ? `${employee.salary} ج.م` : '-'}</TableCell>
                  <TableCell>{getRoleLabel(employee.role)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(employee)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(employee.id)}
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
