// script.js
document.getElementById('songForm').addEventListener('submit', function (e) {
    e.preventDefault(); // منع إعادة تحميل الصفحة

    // الحصول على القيم من النموذج
    const songName = document.getElementById('songName').value;
    const artistName = document.getElementById('artistName').value;
    const friendName = document.getElementById('friendName').value;

    // إنشاء عنصر جديد في القائمة
    const li = document.createElement('li');
    li.textContent = `${songName} - ${artistName} (مضافة من ${friendName})`;

    // إضافة العنصر إلى قائمة التشغيل
    document.getElementById('playlist').appendChild(li);

    // مسح الحقول بعد الإضافة
    document.getElementById('songForm').reset();
});
