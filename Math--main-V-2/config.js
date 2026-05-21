// assets/js/config.js
// 🔴 تأكد أن الرابط هو الرابط الجديد الذي يعمل معك 🔴
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzXLLdgMVJgkKpzDqXCjfXn94G6MopeggJPK-ERpfxWyquLY0ob7aqtKqbwvFTwAYMvEQ/exec";



// ✅ الدالة الجديدة: تحل مشكلة 0.4 وتجعلها 40%
function formatScore(score) {
    if (score == null || score === "") return "0%"; // لو فارغ
    
    let str = String(score);
    if (str.includes('%')) return str; // لو النسبة موجودة أصلاً

    let num = parseFloat(str);
    
    // إذا كان الرقم عشري (أقل من أو يساوي 1) مثل 0.4 أو 0.55
    if (num <= 1 && num > 0) {
        return Math.round(num * 100) + "%"; 
    }
    
    // إذا كان الرقم عادي مثل 40 أو 90
    return Math.round(num) + "%";
}