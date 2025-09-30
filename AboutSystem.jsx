import React from 'react';

const AboutSystem = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h1 className="text-3xl font-bold text-blue-700 mb-6 text-center">عن البرنامج</h1>
        
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-blue-600 mb-4">نظام إدارة المبيعات والمشتريات</h2>
          <p className="text-gray-700 mb-4">
            نظام متكامل لإدارة المبيعات والمشتريات والمخزون، مصمم خصيصاً للشركات والمؤسسات التجارية بمختلف أحجامها.
            يوفر النظام حلاً شاملاً لإدارة جميع العمليات التجارية من المبيعات والمشتريات إلى إدارة المخزون والتقارير المالية.
          </p>
        </div>
        
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-blue-600 mb-4">المميزات الرئيسية</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-bold text-blue-700 mb-2">إدارة المبيعات</h3>
              <ul className="list-disc list-inside text-gray-700">
                <li>إنشاء فواتير البيع بسهولة</li>
                <li>دعم الفواتير الضريبية والعادية</li>
                <li>إدارة العملاء والتجار</li>
                <li>متابعة المبيعات والإيرادات</li>
              </ul>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-bold text-blue-700 mb-2">إدارة المشتريات</h3>
              <ul className="list-disc list-inside text-gray-700">
                <li>إنشاء طلبات الشراء</li>
                <li>إدارة الموردين</li>
                <li>متابعة المشتريات والتكاليف</li>
                <li>تحديث المخزون تلقائياً</li>
              </ul>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-bold text-blue-700 mb-2">إدارة المخزون</h3>
              <ul className="list-disc list-inside text-gray-700">
                <li>متابعة مستويات المخزون</li>
                <li>تنبيهات المخزون المنخفض</li>
                <li>جرد المخزون وتسوية الفروقات</li>
                <li>تقييم المخزون بطرق مختلفة</li>
              </ul>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-bold text-blue-700 mb-2">التقارير والتحليلات</h3>
              <ul className="list-disc list-inside text-gray-700">
                <li>تقارير المبيعات والمشتريات</li>
                <li>تحليل الأرباح والخسائر</li>
                <li>تقارير المخزون</li>
                <li>رسوم بيانية تفاعلية</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-blue-600 mb-4">المتطلبات الفنية</h2>
          <ul className="list-disc list-inside text-gray-700">
            <li>متصفح ويب حديث (Chrome, Firefox, Safari, Edge)</li>
            <li>اتصال بالإنترنت</li>
            <li>دقة شاشة لا تقل عن 1024x768</li>
          </ul>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-blue-600 mb-4">معلومات المطور</h2>
        
        <div className="flex flex-col md:flex-row items-center md:items-start">
          <div className="w-full md:w-1/3 mb-4 md:mb-0 flex justify-center">
            <div className="bg-blue-50 p-6 rounded-lg text-center w-48">
              <div className="w-24 h-24 rounded-full bg-blue-100 mx-auto mb-4 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="font-bold text-blue-700">م/ أحمد الملا</h3>
              <p className="text-gray-600 text-sm">مطور برمجيات</p>
            </div>
          </div>
          
          <div className="w-full md:w-2/3">
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h3 className="font-bold text-blue-700 mb-2">معلومات الاتصال</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-gray-700">01008388450</span>
                </div>
                
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-700">ramzy.petro@gmail.com</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-bold text-blue-700 mb-2">الخدمات المقدمة</h3>
              <ul className="list-disc list-inside text-gray-700">
                <li>تطوير أنظمة إدارة المبيعات والمشتريات</li>
                <li>تصميم وتطوير تطبيقات الويب</li>
                <li>حلول برمجية مخصصة للشركات</li>
                <li>استشارات تقنية وتدريب</li>
                <li>دعم فني وصيانة</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutSystem;
