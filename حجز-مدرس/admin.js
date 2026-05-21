'use strict';

let API_URL = localStorage.getItem('itqan_api_url') || '';

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('api-url-input').value = API_URL;
  const loader = document.getElementById('loadingScreen');
  if(loader) {
    loader.classList.add('opacity-0');
    setTimeout(() => loader.style.display = 'none', 300);
  }
  if(API_URL) { loadAdminData(); loadBookingsData(); }
});

function switchTab(tabId, el) {
  // إخفاء جميع التبويبات
  ['dash', 'bookings', 'setup'].forEach(id => {
    document.getElementById(`tab-${id}`).classList.add('hidden');
    document.getElementById(`tab-${id}`).classList.remove('block');
  });
  // إظهار التبويب المطلوب
  document.getElementById(`tab-${tabId}`).classList.remove('hidden');
  document.getElementById(`tab-${tabId}`).classList.add('block');
  
  // تفعيل الزر في القائمة الجانبية
  document.querySelectorAll('#navContainer .nav-item').forEach(nav => {
    nav.classList.remove('bg-teal-50', 'text-brandTeal', 'border-r-4', 'border-brandTeal');
    nav.classList.add('text-slate-500');
  });
  if(el) {
    el.classList.remove('text-slate-500');
    el.classList.add('bg-teal-50', 'text-brandTeal', 'border-r-4', 'border-brandTeal');
  }
}

function saveConfiguration() {
  const val = document.getElementById('api-url-input').value.trim();
  if(!val) return;
  localStorage.setItem('itqan_api_url', val);
  API_URL = val;
  showToast('success', 'تم ربط الاتصال', 'تم تحديث رابط قاعدة البيانات والمزامنة بنجاح.');
  loadAdminData(); loadBookingsData();
}

function getDirectImageUrlAdmin(url) {
  if (!url) return '';
  let cleanUrl = url.trim();
  if (cleanUrl.includes('drive.google.com')) {
    const match = cleanUrl.match(/\/d\/([a-zA-Z0-9_-]+)/) || cleanUrl.match(/id=([a-zA-Z0-9_-]+)/);
    if (match && match[1]) return `https://drive.google.com/uc?export=view&id=${match[1]}`;
  }
  return cleanUrl;
}

async function loadAdminData() {
  if(!API_URL) return;
  try {
    const res = await fetch(`${API_URL}?sheet=Teachers`);
    const json = await res.json();
    if(json.status === 'success') {
      const tbody = document.getElementById('adminTeachersRows');
      tbody.innerHTML = json.data.map(t => {
        const fixedPhoto = getDirectImageUrlAdmin(t.photo);
        const imgHTML = fixedPhoto 
          ? `<img src="${fixedPhoto}" class="w-12 h-12 rounded-full object-cover border border-gray-200 shadow-sm" alt="صورة" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
             <div class="hidden w-12 h-12 bg-brandTeal text-white rounded-full items-center justify-center font-bold text-lg">${t.name[0]}</div>`
          : `<div class="w-12 h-12 bg-brandTeal text-white rounded-full flex items-center justify-center font-bold text-lg">${t.name[0]}</div>`;
        
        return `
        <tr class="hover:bg-brandBg/40 transition">
          <td class="p-4">${imgHTML}</td>
          <td class="p-4">
            <div class="font-bold text-brandDark">${t.name}</div>
            <div class="text-xs text-slate-500 font-semibold mt-1">${t.subject} | ${t.price} ج.م/س</div>
          </td>
          <td class="p-4">
            <button class="bg-red-50 text-red-500 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition border border-red-100" onclick="deleteTeacherPro('${t.id}')">حذف</button>
          </td>
        </tr>
      `}).join('');
    }
  } catch(e) {}
}

async function loadBookingsData() {
  if(!API_URL) return;
  try {
    const res = await fetch(`${API_URL}?sheet=Bookings`);
    const json = await res.json();
    if(json.status === 'success') {
      const tbody = document.getElementById('adminBookingsRows');
      tbody.innerHTML = json.data.map(b => `
        <tr class="hover:bg-brandBg/40 transition">
          <td class="p-4 font-bold text-brandDark">${b.studentName}</td>
          <td class="p-4"><a href="https://wa.me/${b.phone}" target="_blank" class="text-brandTeal font-bold hover:underline">${b.phone} 💬</a></td>
          <td class="p-4"><span class="bg-teal-50 text-brandTeal px-3 py-1 rounded-full text-xs font-bold border border-teal-100">${b.teacherName}</span></td>
          <td class="p-4 text-xs font-bold text-slate-600">${b.subject} (${b.sessionType})</td>
          <td class="p-4 text-xs font-bold text-slate-500">${b.grade}</td>
        </tr>
      `).join('');
    }
  } catch(e) {}
}

async function addTeacherPro() {
  const name = document.getElementById('t-name').value.trim();
  const price = document.getElementById('t-price').value.trim();
  const subject = document.getElementById('t-sub').value;
  const photo = document.getElementById('t-photo').value.trim();
  const video = document.getElementById('t-video').value.trim();
  
  if(!name || !price) { showToast('error', 'حقول إلزامية', 'يرجى كتابة اسم المعلم وسعر الحصة لإكمال عملية النشر.'); return; }

  const payload = {
    action: 'add',
    data: {
      name, subject, price,
      experience: document.getElementById('t-exp').value || '2',
      rating: document.getElementById('t-rate').value || '4.9',
      bio: document.getElementById('t-bio').value,
      photo: photo,
      video: video
    }
  };

  const btn = document.getElementById('addTeacherBtn');
  btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> جاري الرفع والنشر...';
  btn.disabled = true;

  try {
    const res = await fetch(API_URL, { method: 'POST', body: JSON.stringify(payload) });
    const json = await res.json();
    if(json.status === 'success') {
      showToast('success', 'تم إطلاق المعلم', 'تم الحفظ والرفع بنجاح وستظهر فوراً للطلاب في الواجهة.');
      loadAdminData();
      document.querySelectorAll('#tab-dash input, #tab-dash textarea').forEach(i => i.value = '');
    }
  } catch(e) { 
    showToast('error', 'خطأ في الرفع', 'تعذر حفظ البيانات بالسيرفر السحابي. تحقق من الصلاحيات والاتصال.'); 
  } finally {
    btn.innerHTML = '<i class="fa-solid fa-rocket text-xs"></i> نشر المعلم وإطلاقه فوراً';
    btn.disabled = false;
  }
}

async function deleteTeacherPro(id) {
  if(!confirm('هل أنت متأكد من حذف هذا المعلم بشكل نهائي؟')) return;
  try {
    const res = await fetch(API_URL, { method: 'POST', body: JSON.stringify({ action: 'delete', id }) });
    const json = await res.json();
    if(json.status === 'success') { showToast('success', 'تم حذف المدرس', 'تمت الإزالة بنجاح.'); loadAdminData(); }
  } catch(e) {}
}

function showToast(type, title, msg) {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<div class="title">${title}</div><div class="desc">${msg}</div>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}