// script.js
document.addEventListener('DOMContentLoaded', function () {
    const loginSection = document.getElementById('loginSection');
    const exploreSection = document.getElementById('exploreSection');
    const songSection = document.getElementById('songSection');
    const loggedInUser = document.getElementById('loggedInUser');
    const usernameInput = document.getElementById('username');
    const loginBtn = document.getElementById('loginBtn');
    const errorMsg = document.getElementById('errorMsg');
    const logoutBtn = document.getElementById('logoutBtn');
    const searchUser = document.getElementById('searchUser');
    const searchBtn = document.getElementById('searchBtn');
    const userPlaylists = document.getElementById('userPlaylists');
    const songForm = document.getElementById('songForm');
    const addSongBtn = document.getElementById('addSongBtn');
    const uploadProgress = document.getElementById('uploadProgress');
    const progressPercent = document.getElementById('progressPercent');
    const progressBar = document.getElementById('progressBar');
    const playlist = document.getElementById('playlist');

    let currentUser = localStorage.getItem('currentUser');
    let users = JSON.parse(localStorage.getItem('users')) || {};

    // تحميل واجهة المستخدم بناءً على حالة التسجيل
    function loadUI() {
        if (currentUser) {
            loginSection.classList.add('hidden');
            exploreSection.classList.remove('hidden');
            songSection.classList.remove('hidden');
            loggedInUser.textContent = currentUser;
            loadPlaylist(currentUser);
        } else {
            loginSection.classList.remove('hidden');
            exploreSection.classList.add('hidden');
            songSection.classList.add('hidden');
        }
    }

    // تسجيل الدخول
    loginBtn.addEventListener('click', function () {
        const username = usernameInput.value.trim();
        if (username) {
            if (users[username]) {
                errorMsg.classList.remove('hidden');
            } else {
                errorMsg.classList.add('hidden');
                currentUser = username;
                localStorage.setItem('currentUser', currentUser);
                users[currentUser] = [];
                localStorage.setItem('users', JSON.stringify(users));
                loadUI();
            }
        }
    });

    // تسجيل الخروج
    logoutBtn.addEventListener('click', function () {
        currentUser = null;
        localStorage.removeItem('currentUser');
        loadUI();
    });

    // بحث عن مستخدم
    searchBtn.addEventListener('click', function () {
        const username = searchUser.value.trim().toLowerCase(); // تحويل النص إلى أحرف صغيرة
        const foundUser = Object.keys(users).find(user => user.toLowerCase() === username); // البحث غير الحساس لحالة الأحرف

        if (foundUser) {
            displayUserPlaylist(foundUser);
        } else {
            userPlaylists.innerHTML = '<p>المستخدم غير موجود!</p>';
        }
    });

    // عرض قائمة تشغيل المستخدم
    function displayUserPlaylist(username) {
        userPlaylists.innerHTML = '';
        const playlistDiv = document.createElement('div');
        playlistDiv.className = 'user-playlist';
        playlistDiv.innerHTML = `<h3>قائمة تشغيل ${username}</h3>`;
        users[username].forEach(song => {
            const songDiv = document.createElement('div');
            songDiv.innerHTML = `
                <p>${song.songName} - ${song.artistName}</p>
                <audio class="audio-player" controls>
                    <source src="${song.file}" type="audio/mp3">
                    متصفحك لا يدعم تشغيل الصوتيات.
                </audio>
            `;
            playlistDiv.appendChild(songDiv);
        });
        userPlaylists.appendChild(playlistDiv);
    }

    // إضافة أغنية
    songForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const songName = document.getElementById('songName').value;
        const artistName = document.getElementById('artistName').value;
        const songFile = document.getElementById('songFile').files[0];

        if (songName && artistName && songFile) {
            addSongBtn.classList.add('hidden');
            uploadProgress.classList.remove('hidden');

            const reader = new FileReader();

            reader.onprogress = function (e) {
                if (e.lengthComputable) {
                    const percentLoaded = Math.round((e.loaded / e.total) * 100);
                    progressPercent.textContent = `${percentLoaded}%`;
                    progressBar.value = percentLoaded;
                }
            };

            reader.onload = function (e) {
                const song = {
                    id: Date.now(),
                    songName,
                    artistName,
                    file: e.target.result,
                    addedBy: currentUser
                };

                users[currentUser].push(song);
                localStorage.setItem('users', JSON.stringify(users));

                addSongToDOM(song);
                songForm.reset();

                addSongBtn.classList.remove('hidden');
                uploadProgress.classList.add('hidden');
                progressPercent.textContent = '0%';
                progressBar.value = 0;
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
            <span>${song.songName} - ${song.artistName}</span>
            <audio class="audio-player" controls>
                <source src="${song.file}" type="audio/mp3">
                متصفحك لا يدعم تشغيل الصوتيات.
            </audio>
            <button class="remove-btn" data-id="${song.id}">إزالة</button>
        `;

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
