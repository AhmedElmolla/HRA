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
import { Receipt, Plus, Edit, Trash2, Calendar, DollarSign } from 'lucide-react'

export default function ExpenseManagement() {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: '',
    expense_date: new Date().toISOString().split('T')[0],
    notes: ''
  })

  // فئات المصروفات
  const expenseCategories = [
    { value: 'rent', label: 'إيجار' },
    { value: 'utilities', label: 'مرافق' },
    { value: 'salaries', label: 'رواتب' },
    { value: 'marketing', label: 'تسويق' },
    { value: 'maintenance', label: 'صيانة' },
    { value: 'transportation', label: 'مواصلات' },
    { value: 'office_supplies', label: 'مستلزمات مكتبية' },
    { value: 'insurance', label: 'تأمين' },
    { value: 'taxes', label: 'ضرائب' },
    { value: 'other', label: 'أخرى' }
  ]

  useEffect(() => {
    // في التطبيق الحقيقي، سيتم جلب البيانات من API
    // fetchExpenses()
    
    // بيانات تجريبية
    setExpenses([
      {
        id: 1,
        description: 'إيجار المكتب - شهر ديسمبر',
        amount: 5000,
        category: 'rent',
        expense_date: '2024-12-01',
        notes: 'إيجار شهري',
        created_at: '2024-12-01T10:00:00'
      },
      {
        id: 2,
        description: 'فاتورة كهرباء',
        amount: 800,
        category: 'utilities',
        expense_date: '2024-12-05',
        notes: 'فاتورة شهر نوفمبر',
        created_at: '2024-12-05T14:30:00'
      },
      {
        id: 3,
        description: 'راتب موظف المبيعات',
        amount: 3500,
        category: 'salaries',
        expense_date: '2024-12-01',
        notes: 'راتب شهر ديسمبر',
        created_at: '2024-12-01T09:00:00'
      }
    ])
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSelectChange = (value) => {
    setFormData(prev => ({
      ...prev,
      category: value
    }))
  }

  const resetForm = () => {
    setFormData({
      description: '',
      amount: '',
      category: '',
      expense_date: new Date().toISOString().split('T')[0],
      notes: ''
    })
    setEditingExpense(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // في التطبيق الحقيقي، سيتم إرسال البيانات إلى API
      const newExpense = {
        id: editingExpense ? editingExpense.id : Date.now(),
        ...formData,
        amount: parseFloat(formData.amount),
        created_at: editingExpense ? editingExpense.created_at : new Date().toISOString()
      }

      if (editingExpense) {
        setExpenses(prev => prev.map(exp => 
          exp.id === editingExpense.id ? newExpense : exp
        ))
      } else {
        setExpenses(prev => [newExpense, ...prev])
      }

      setDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error('Error saving expense:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (expense) => {
    setEditingExpense(expense)
    setFormData({
      description: expense.description || '',
      amount: expense.amount.toString() || '',
      category: expense.category || '',
      expense_date: expense.expense_date || '',
      notes: expense.notes || ''
    })
    setDialogOpen(true)
  }

  const handleDelete = async (expenseId) => {
    if (confirm('هل أنت متأكد من حذف هذا المصروف؟')) {
      try {
        // في التطبيق الحقيقي، سيتم حذف البيانات من API
        setExpenses(prev => prev.filter(exp => exp.id !== expenseId))
      } catch (error) {
        console.error('Error deleting expense:', error)
      }
    }
  }

  const getCategoryLabel = (category) => {
    const cat = expenseCategories.find(c => c.value === category)
    return cat ? cat.label : category
  }

  const getCategoryBadgeVariant = (category) => {
    const variants = {
      rent: 'default',
      utilities: 'secondary',
      salaries: 'outline',
      marketing: 'destructive',
      maintenance: 'default',
      transportation: 'secondary',
      office_supplies: 'outline',
      insurance: 'default',
      taxes: 'destructive',
      other: 'secondary'
    }
    return variants[category] || 'default'
  }

  // حساب إجمالي المصروفات
  const totalExpenses = expenses.reduce((total, expense) => total + expense.amount, 0)
  const currentMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.expense_date)
    const currentDate = new Date()
    return expenseDate.getMonth() === currentDate.getMonth() && 
           expenseDate.getFullYear() === currentDate.getFullYear()
  }).reduce((total, expense) => total + expense.amount, 0)

  // تجميع المصروفات حسب الفئة
  const expensesByCategory = expenses.reduce((acc, expense) => {
    const category = expense.category
    if (!acc[category]) {
      acc[category] = 0
    }
    acc[category] += expense.amount
    return acc
  }, {})

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Receipt className="h-6 w-6" />
          <h1 className="text-2xl font-bold">إدارة المصروفات</h1>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 ml-2" />
              إضافة مصروف جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingExpense ? 'تعديل المصروف' : 'إضافة مصروف جديد'}
              </DialogTitle>
              <DialogDescription>
                قم بإدخال تفاصيل المصروف
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">وصف المصروف *</Label>
                <Input
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="أدخل وصف المصروف"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">المبلغ *</Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={handleInputChange}
                    placeholder="أدخل المبلغ"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">الفئة *</Label>
                  <Select value={formData.category} onValueChange={handleSelectChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر فئة المصروف" />
                    </SelectTrigger>
                    <SelectContent>
                      {expenseCategories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="expense_date">تاريخ المصروف</Label>
                <Input
                  id="expense_date"
                  name="expense_date"
                  type="date"
                  value={formData.expense_date}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">ملاحظات</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="أدخل أي ملاحظات إضافية"
                  rows={3}
                />
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

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المصروفات</CardTitle>
            <DollarSign className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {totalExpenses.toLocaleString()} ج.م
            </div>
            <p className="text-xs text-muted-foreground">
              {expenses.length} مصروف
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">مصروفات الشهر الحالي</CardTitle>
            <Calendar className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {currentMonthExpenses.toLocaleString()} ج.م
            </div>
            <p className="text-xs text-muted-foreground">
              {new Date().toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">أكبر فئة مصروفات</CardTitle>
            <Receipt className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {Object.keys(expensesByCategory).length > 0 ? 
                getCategoryLabel(Object.keys(expensesByCategory).reduce((a, b) => 
                  expensesByCategory[a] > expensesByCategory[b] ? a : b
                )) : 'لا يوجد'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              {Object.keys(expensesByCategory).length > 0 ? 
                Math.max(...Object.values(expensesByCategory)).toLocaleString() + ' ج.م' : 
                '0 ج.م'
              }
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>قائمة المصروفات</CardTitle>
          <CardDescription>
            إدارة وتتبع جميع المصروفات
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">الوصف</TableHead>
                <TableHead className="text-right">المبلغ</TableHead>
                <TableHead className="text-right">الفئة</TableHead>
                <TableHead className="text-right">التاريخ</TableHead>
                <TableHead className="text-right">ملاحظات</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className="font-medium">{expense.description}</TableCell>
                  <TableCell className="text-red-600 font-semibold">
                    {expense.amount.toLocaleString()} ج.م
                  </TableCell>
                  <TableCell>
                    <Badge variant={getCategoryBadgeVariant(expense.category)}>
                      {getCategoryLabel(expense.category)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(expense.expense_date).toLocaleDateString('ar-EG')}
                  </TableCell>
                  <TableCell>{expense.notes}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(expense)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(expense.id)}
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

      {/* تجميع المصروفات حسب الفئة */}
      {Object.keys(expensesByCategory).length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>المصروفات حسب الفئة</CardTitle>
            <CardDescription>
              تجميع المصروفات حسب الفئات المختلفة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(expensesByCategory).map(([category, amount]) => (
                <div key={category} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <Badge variant={getCategoryBadgeVariant(category)}>
                      {getCategoryLabel(category)}
                    </Badge>
                    <span className="font-bold text-lg">
                      {amount.toLocaleString()} ج.م
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">
                    {((amount / totalExpenses) * 100).toFixed(1)}% من إجمالي المصروفات
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
