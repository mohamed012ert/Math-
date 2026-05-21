'use strict';

const API_URL = localStorage.getItem('itqan_api_url') || '';
let localTeachers = [];
let selectedTeacher = null;

document.addEventListener('DOMContentLoaded', () => { fetchData(); });

async function fetchData() {
  if (!API_URL) {
    showToast('warning', 'وضع المعاينة الفورية', 'يرجى ضبط رابط السكربت Web App في إعدادات لوحة التحكم للتشغيل الحقيقي.');
    document.getElementById('loadingScreen').style.display = 'none';
    return;
  }
  try {
    const res = await fetch(`${API_URL}?sheet=Teachers`);
    const json = await res.json();
    if(json.status === 'success') {
      localTeachers = json.data;
      renderTeachers(localTeachers);
    }
  } catch (e) {
    showToast('error', 'خطأ في جلب البيانات', 'تعذر الاتصال بقاعدة بيانات السيرفر السحابي حالياً.');
  } finally {
    document.getElementById('loadingScreen').style.display = 'none';
  }
}

function getDirectImageUrl(url) {
  if (!url) return '';
  let cleanUrl = url.trim();
  if (cleanUrl.includes('drive.google.com')) {
    const match = cleanUrl.match(/\/d\/([a-zA-Z0-9_-]+)/) || cleanUrl.match(/id=([a-zA-Z0-9_-]+)/);
    if (match && match[1]) return `https://drive.google.com/uc?export=view&id=${match[1]}`;
  }
  return cleanUrl;
}

function getYoutubeId(url) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

function renderTeachers(arr) {
  const grid = document.getElementById('teachersGrid');
  grid.innerHTML = arr.map(t => {
    const directPhoto = getDirectImageUrl(t.photo);
    const avatarHTML = directPhoto 
      ? `<img src="${directPhoto}" class="w-full h-full object-cover rounded-full" alt="${t.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
         <div class="hidden w-full h-full bg-brandTeal text-white items-center justify-center font-bold text-2xl rounded-full">${t.name[0]}</div>`
      : `<div class="w-full h-full bg-brandTeal text-white flex items-center justify-center font-bold text-2xl rounded-full">${t.name[0]}</div>`;

    const ytId = getYoutubeId(t.video);
    let videoHTML = '';
    if (ytId) {
      videoHTML = `
        <a href="${t.video}" target="_blank" class="block w-full h-36 rounded-xl overflow-hidden relative mb-4 group bg-black shadow-sm">
          <img src="https://img.youtube.com/vi/${ytId}/hqdefault.jpg" class="w-full h-full object-cover opacity-80 group-hover:scale-105 group-hover:opacity-100 transition-all duration-300" alt="فيديو المدرس">
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="w-12 h-12 bg-white/30 backdrop-blur-sm border-2 border-white rounded-full flex items-center justify-center group-hover:bg-brandTeal group-hover:border-brandTeal group-hover:scale-110 shadow-lg transition-all">
              <i class="fa-solid fa-play text-white ml-1"></i>
            </div>
          </div>
        </a>
      `;
    }

    return `
    <div class="bg-white border border-orange-100/40 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-brandTeal hover:-translate-y-1 transition-all flex flex-col h-full">
      <div class="flex items-center gap-4 mb-4">
        <div class="w-16 h-16 shrink-0 rounded-full border-2 border-brandTeal p-0.5 bg-brandBg shadow-sm">
          ${avatarHTML}
        </div>
        <div>
          <h3 class="text-lg font-bold text-brandDark">${t.name}</h3>
          <span class="inline-block mt-1 bg-orange-50 text-brandOrange border border-orange-100 px-3 py-0.5 rounded-full text-xs font-bold">${t.subject}</span>
        </div>
      </div>
      <p class="text-sm text-slate-500 mb-4 line-clamp-2 min-h-[40px]">${t.bio || 'لم يقم المدرس بإضافة نبذة تعريفية حتي الآن.'}</p>
      ${videoHTML}
      <div class="mt-auto bg-brandBg/60 border border-gray-100 rounded-xl p-3 mb-4 flex justify-between items-center text-xs font-bold text-slate-600">
        <span class="text-amber-500"><i class="fa-solid fa-star"></i> ${t.rating || '4.9'}</span>
        <span>💼 خبرة ${t.experience || '2'} سنة</span>
        <span class="text-brandTeal text-sm font-black">${t.price} ج.م/س</span>
      </div>
      <button class="w-full bg-brandTeal hover:bg-brandOrange text-white py-3 rounded-xl font-bold transition shadow-md flex items-center justify-center gap-2" onclick="openBookingModal(${JSON.stringify(t).replace(/"/g, '&quot;')})">
        <i class="fa-regular fa-calendar-check"></i> احجز حصتك الفورية
      </button>
    </div>
    `;
  }).join('');
}

function filterSubject(sub, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => {
    b.classList.remove('bg-brandOrange', 'text-white', 'border-brandOrange');
    b.classList.add('bg-white', 'text-slate-500', 'border-gray-200');
  });
  btn.classList.remove('bg-white', 'text-slate-500', 'border-gray-200');
  btn.classList.add('bg-brandOrange', 'text-white', 'border-brandOrange');
  
  if(sub === 'all') renderTeachers(localTeachers);
  else renderTeachers(localTeachers.filter(t => t.subject === sub));
}

function openBookingModal(teacher) {
  selectedTeacher = teacher;
  document.getElementById('modalTeacherName').textContent = teacher.name;
  document.getElementById('bookingModal').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('bookingModal').classList.add('hidden');
}

async function confirmBooking() {
  const name = document.getElementById('stu-name').value.trim();
  const phone = document.getElementById('stu-phone').value.trim();
  if(!name || !phone) { showToast('error', 'بيانات ناقصة', 'يرجى ملء الاسم ورقم الهاتف لإتمام الحجز.'); return; }
  
  const payload = {
    action: 'addBooking',
    data: {
      teacherId: selectedTeacher.id,
      teacherName: selectedTeacher.name,
      subject: selectedTeacher.subject,
      sessionType: document.getElementById('stu-type').value,
      studentName: name,
      phone: phone,
      grade: document.getElementById('stu-grade').value
    }
  };

  const btn = document.getElementById('confirmBtn');
  btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> جاري الإرسال والتأكيد...';
  btn.disabled = true;

  try {
    const res = await fetch(API_URL, { method: 'POST', body: JSON.stringify(payload) });
    const json = await res.json();
    if(json.status === 'success') {
      showToast('success', 'تم الحجز بنجاح', 'تم استلام طلبك وسيتواصل معك الدعم الفني فوراً.');
      closeModal();
      document.getElementById('stu-name').value = '';
      document.getElementById('stu-phone').value = '';
    }
  } catch(e) { 
    showToast('error', 'فشل الحجز', 'حدثت مشكلة أثناء محاولة حفظ البيانات بالسيرفر.'); 
  } finally {
    btn.innerHTML = '<i class="fa-solid fa-paper-plane text-xs"></i> إرسال طلب الحجز الآن';
    btn.disabled = false;
  }
}

function showToast(type, title, msg) {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<div class="title">${title}</div><div class="desc">${msg}</div>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}