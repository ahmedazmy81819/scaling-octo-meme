// script.js
document.addEventListener('DOMContentLoaded', function () {
    const loginSection = document.getElementById('loginSection');
    const songSection = document.getElementById('songSection');
    const loggedInUser = document.getElementById('loggedInUser');
    const usernameInput = document.getElementById('username');
    const loginBtn = document.getElementById('loginBtn');
    const songForm = document.getElementById('songForm');
    const playlist = document.getElementById('playlist');

    let currentUser = localStorage.getItem('currentUser');
    let users = JSON.parse(localStorage.getItem('users')) || {};

    // تحميل واجهة المستخدم بناءً على حالة التسجيل
    function loadUI() {
        if (currentUser) {
            loginSection.classList.add('hidden');
            songSection.classList.remove('hidden');
            loggedInUser.textContent = currentUser;
            loadPlaylist(currentUser);
        } else {
            loginSection.classList.remove('hidden');
            songSection.classList.add('hidden');
        }
    }

    // تسجيل الدخول
    loginBtn.addEventListener('click', function () {
        const username = usernameInput.value.trim();
        if (username) {
            currentUser = username;
            localStorage.setItem('currentUser', currentUser);

            if (!users[currentUser]) {
                users[currentUser] = [];
                localStorage.setItem('users', JSON.stringify(users));
            }

            loadUI();
        }
    });

    // إضافة أغنية
    songForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const songName = document.getElementById('songName').value;
        const artistName = document.getElementById('artistName').value;
        const songFile = document.getElementById('songFile').files[0];

        if (songName && artistName && songFile) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const song = {
                    id: Date.now(),
                    songName,
                    artistName,
                    file: e.target.result,
                    addedBy: currentUser
                };

                // إضافة الأغنية إلى قائمة المستخدم
                users[currentUser].push(song);
                localStorage.setItem('users', JSON.stringify(users));

                // إضافة الأغنية إلى DOM
                addSongToDOM(song);
                songForm.reset();
            };
            reader.readAsDataURL(songFile);
        }
    });

    // تحميل قائمة التشغيل
    function loadPlaylist(user) {
        playlist.innerHTML = '';
        users[user].forEach(song => {
            addSongToDOM(song);
        });
    }

    // إضافة أغنية إلى DOM
    function addSongToDOM(song) {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${song.songName} - ${song.artistName} (مضافة من ${song.addedBy})</span>
            <audio class="audio-player" controls>
                <source src="${song.file}" type="audio/mp3">
                متصفحك لا يدعم تشغيل الصوتيات.
            </audio>
            <button class="remove-btn" data-id="${song.id}">إزالة</button>
        `;

        // إضافة حدث إزالة
        const removeBtn = li.querySelector('.remove-btn');
        removeBtn.addEventListener('click', function () {
            removeSong(song.id);
        });

        playlist.appendChild(li);
    }

    // إزالة أغنية
    function removeSong(id) {
        users[currentUser] = users[currentUser].filter(song => song.id !== id);
        localStorage.setItem('users', JSON.stringify(users));
        loadPlaylist(currentUser);
    }

    // تحميل الواجهة عند فتح الصفحة
    loadUI();
});
