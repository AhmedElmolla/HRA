import { useState } from 'react';
import { toast } from 'react-hot-toast';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // في بيئة الإنتاج، يجب استبدال هذا بطلب API حقيقي
  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);

    // محاكاة طلب تسجيل الدخول
    setTimeout(() => {
      // بيانات المستخدمين المسموح لهم (في الإنتاج يجب أن تكون في قاعدة البيانات)
      const users = [
        { username: 'admin', password: 'admin123', role: 'admin', name: 'مدير النظام' },
        { username: 'accountant', password: 'acc123', role: 'accountant', name: 'محاسب' },
        { username: 'sales', password: 'sales123', role: 'sales', name: 'مندوب مبيعات' },
        { username: 'inventory', password: 'inv123', role: 'inventory', name: 'أمين مخزن' }
      ];

      const user = users.find(
        (user) => user.username === username && user.password === password
      );

      if (user) {
        // تخزين بيانات المستخدم في التخزين المحلي
        localStorage.setItem('user', JSON.stringify({
          username: user.username,
          role: user.role,
          name: user.name
        }));
        
        toast.success(`مرحباً بك ${user.name}`);
        onLogin(user);
      } else {
        toast.error('اسم المستخدم أو كلمة المرور غير صحيحة');
      }
      
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            نظام إدارة المبيعات والمشتريات
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            الرجاء تسجيل الدخول للوصول إلى النظام
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">
                اسم المستخدم
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="اسم المستخدم"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                كلمة المرور
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="كلمة المرور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  جاري تسجيل الدخول...
                </span>
              ) : (
                'تسجيل الدخول'
              )}
            </button>
          </div>
        </form>
        
        <div className="mt-6">
          <div className="text-sm text-center">
            <p className="font-medium text-gray-500">
              بيانات تسجيل الدخول للتجربة:
            </p>
            <p className="mt-1 text-xs text-gray-500">
              مدير: admin / admin123 | محاسب: accountant / acc123
            </p>
            <p className="text-xs text-gray-500">
              مبيعات: sales / sales123 | مخزن: inventory / inv123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
