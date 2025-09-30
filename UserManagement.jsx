import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const UserManagement = () => {
  // بيانات المستخدمين (في الإنتاج يجب أن تكون من قاعدة البيانات)
  const [users, setUsers] = useState([
    { 
      id: 1, 
      username: 'admin', 
      name: 'مدير النظام', 
      role: 'admin',
      permissions: {
        dashboard: true,
        company: true,
        employees: true,
        products: true,
        customers: true,
        suppliers: true,
        sales: true,
        purchases: true,
        inventory: true,
        expenses: true,
        reports: true,
        profitLoss: true,
        users: true,
        about: true,
        contact: true
      }
    },
    { 
      id: 2, 
      username: 'accountant', 
      name: 'محاسب', 
      role: 'accountant',
      permissions: {
        dashboard: true,
        company: false,
        employees: false,
        products: true,
        customers: true,
        suppliers: true,
        sales: true,
        purchases: true,
        inventory: true,
        expenses: true,
        reports: true,
        profitLoss: true,
        users: false,
        about: true,
        contact: true
      }
    },
    { 
      id: 3, 
      username: 'sales', 
      name: 'مندوب مبيعات', 
      role: 'sales',
      permissions: {
        dashboard: true,
        company: false,
        employees: false,
        products: true,
        customers: true,
        suppliers: false,
        sales: true,
        purchases: false,
        inventory: true,
        expenses: false,
        reports: false,
        profitLoss: false,
        users: false,
        about: true,
        contact: true
      }
    },
    { 
      id: 4, 
      username: 'inventory', 
      name: 'أمين مخزن', 
      role: 'inventory',
      permissions: {
        dashboard: true,
        company: false,
        employees: false,
        products: true,
        customers: false,
        suppliers: true,
        sales: false,
        purchases: true,
        inventory: true,
        expenses: false,
        reports: false,
        profitLoss: false,
        users: false,
        about: true,
        contact: true
      }
    }
  ]);

  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    password: '',
    confirmPassword: '',
    role: 'sales',
    permissions: {
      dashboard: true,
      company: false,
      employees: false,
      products: false,
      customers: false,
      suppliers: false,
      sales: false,
      purchases: false,
      inventory: false,
      expenses: false,
      reports: false,
      profitLoss: false,
      users: false,
      about: true,
      contact: true
    }
  });

  // تحديث نموذج البيانات عند اختيار مستخدم
  useEffect(() => {
    if (selectedUser) {
      setFormData({
        username: selectedUser.username,
        name: selectedUser.name,
        password: '',
        confirmPassword: '',
        role: selectedUser.role,
        permissions: { ...selectedUser.permissions }
      });
    }
  }, [selectedUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePermissionChange = (permission) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: !prev.permissions[permission]
      }
    }));
  };

  const handleRoleChange = (e) => {
    const role = e.target.value;
    let newPermissions = { ...formData.permissions };
    
    // تعيين الصلاحيات حسب الدور
    if (role === 'admin') {
      Object.keys(newPermissions).forEach(key => {
        newPermissions[key] = true;
      });
    } else if (role === 'accountant') {
      Object.keys(newPermissions).forEach(key => {
        newPermissions[key] = ['dashboard', 'products', 'customers', 'suppliers', 'sales', 'purchases', 'inventory', 'expenses', 'reports', 'profitLoss', 'about', 'contact'].includes(key);
      });
    } else if (role === 'sales') {
      Object.keys(newPermissions).forEach(key => {
        newPermissions[key] = ['dashboard', 'products', 'customers', 'sales', 'inventory', 'about', 'contact'].includes(key);
      });
    } else if (role === 'inventory') {
      Object.keys(newPermissions).forEach(key => {
        newPermissions[key] = ['dashboard', 'products', 'suppliers', 'purchases', 'inventory', 'about', 'contact'].includes(key);
      });
    }
    
    setFormData(prev => ({
      ...prev,
      role,
      permissions: newPermissions
    }));
  };

  const openAddModal = () => {
    setIsNewUser(true);
    setSelectedUser(null);
    setFormData({
      username: '',
      name: '',
      password: '',
      confirmPassword: '',
      role: 'sales',
      permissions: {
        dashboard: true,
        company: false,
        employees: false,
        products: false,
        customers: false,
        suppliers: false,
        sales: false,
        purchases: false,
        inventory: false,
        expenses: false,
        reports: false,
        profitLoss: false,
        users: false,
        about: true,
        contact: true
      }
    });
    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    setIsNewUser(false);
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // التحقق من صحة البيانات
    if (isNewUser && formData.password !== formData.confirmPassword) {
      toast.error('كلمات المرور غير متطابقة');
      return;
    }
    
    if (isNewUser && users.some(user => user.username === formData.username)) {
      toast.error('اسم المستخدم موجود بالفعل');
      return;
    }
    
    // إضافة أو تحديث المستخدم
    if (isNewUser) {
      const newUser = {
        id: users.length + 1,
        username: formData.username,
        name: formData.name,
        role: formData.role,
        permissions: formData.permissions
      };
      
      setUsers([...users, newUser]);
      toast.success('تم إضافة المستخدم بنجاح');
    } else {
      const updatedUsers = users.map(user => {
        if (user.id === selectedUser.id) {
          return {
            ...user,
            name: formData.name,
            role: formData.role,
            permissions: formData.permissions
          };
        }
        return user;
      });
      
      setUsers(updatedUsers);
      toast.success('تم تحديث بيانات المستخدم بنجاح');
    }
    
    closeModal();
  };

  const handleDelete = (userId) => {
    if (userId === 1) {
      toast.error('لا يمكن حذف المستخدم الرئيسي');
      return;
    }
    
    if (window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
      const updatedUsers = users.filter(user => user.id !== userId);
      setUsers(updatedUsers);
      toast.success('تم حذف المستخدم بنجاح');
    }
  };

  const permissionLabels = {
    dashboard: 'لوحة التحكم',
    company: 'بيانات الشركة',
    employees: 'الموظفين',
    products: 'الأصناف',
    customers: 'العملاء',
    suppliers: 'الموردين',
    sales: 'المبيعات',
    purchases: 'المشتريات',
    inventory: 'المخزون',
    expenses: 'المصروفات',
    reports: 'التقارير',
    profitLoss: 'الأرباح والخسائر',
    users: 'إدارة المستخدمين',
    about: 'عن البرنامج',
    contact: 'اتصل بنا'
  };

  const roleLabels = {
    admin: 'مدير',
    accountant: 'محاسب',
    sales: 'مندوب مبيعات',
    inventory: 'أمين مخزن'
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-blue-700">إدارة المستخدمين والصلاحيات</h1>
          <button
            onClick={openAddModal}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            إضافة مستخدم
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-3 px-4 border-b text-right">اسم المستخدم</th>
                <th className="py-3 px-4 border-b text-right">الاسم</th>
                <th className="py-3 px-4 border-b text-right">الدور</th>
                <th className="py-3 px-4 border-b text-right">الصلاحيات</th>
                <th className="py-3 px-4 border-b text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 border-b">{user.username}</td>
                  <td className="py-3 px-4 border-b">{user.name}</td>
                  <td className="py-3 px-4 border-b">{roleLabels[user.role]}</td>
                  <td className="py-3 px-4 border-b">
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(user.permissions)
                        .filter(([_, value]) => value)
                        .slice(0, 3)
                        .map(([key]) => (
                          <span key={key} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                            {permissionLabels[key]}
                          </span>
                        ))}
                      {Object.values(user.permissions).filter(Boolean).length > 3 && (
                        <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                          +{Object.values(user.permissions).filter(Boolean).length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 border-b text-center">
                    <button
                      onClick={() => openEditModal(user)}
                      className="bg-blue-100 text-blue-600 hover:bg-blue-200 py-1 px-3 rounded-md ml-2"
                    >
                      تعديل
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="bg-red-100 text-red-600 hover:bg-red-200 py-1 px-3 rounded-md"
                      disabled={user.id === 1}
                    >
                      حذف
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* نافذة إضافة/تعديل مستخدم */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-blue-700">
                {isNewUser ? 'إضافة مستخدم جديد' : 'تعديل بيانات المستخدم'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                    اسم المستخدم
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    disabled={!isNewUser}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${!isNewUser ? 'bg-gray-100' : ''}`}
                  />
                </div>
                
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    الاسم
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                {isNewUser && (
                  <>
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        كلمة المرور
                      </label>
                      <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required={isNewUser}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        تأكيد كلمة المرور
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required={isNewUser}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </>
                )}
                
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                    الدور
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleRoleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="admin">مدير</option>
                    <option value="accountant">محاسب</option>
                    <option value="sales">مندوب مبيعات</option>
                    <option value="inventory">أمين مخزن</option>
                  </select>
                </div>
              </div>
              
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-700 mb-2">الصلاحيات</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(permissionLabels).map(([key, label]) => (
                    <div key={key} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`permission-${key}`}
                        checked={formData.permissions[key] || false}
                        onChange={() => handlePermissionChange(key)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ml-2"
                      />
                      <label htmlFor={`permission-${key}`} className="text-sm text-gray-700">
                        {label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 space-x-reverse">
                <button
                  type="button"
                  onClick={closeModal}
                  className="bg-gray-100 text-gray-700 hover:bg-gray-200 py-2 px-4 rounded-md"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md"
                >
                  {isNewUser ? 'إضافة' : 'حفظ التغييرات'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
