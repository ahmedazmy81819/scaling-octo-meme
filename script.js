document.addEventListener('DOMContentLoaded', function () {
    const loginSection = document.getElementById('loginSection');
    const exploreSection = document.getElementById('exploreSection');
    const songSection = document.getElementById('songSection');
    const loggedInUser = document.getElementById('loggedInUser');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('loginBtn');
    const createAccountBtn = document.getElementById('createAccountBtn');
    const errorMsg = document.getElementById('errorMsg');
    const logoutBtn = document.getElementById('logoutBtn');
    const deleteAccountBtn = document.getElementById('deleteAccountBtn');
    const searchUser = document.getElementById('searchUser');
    const searchBtn = document.getElementById('searchBtn');
    const userPlaylists = document.getElementById('userPlaylists');
    const songForm = document.getElementById('songForm');
    const addSongBtn = document.getElementById('addSongBtn');
    const uploadProgress = document.getElementById('uploadProgress');
    const progressPercent = document.getElementById('progressPercent');
    const progressBar = document.getElementById('progressBar');
    const playlist = document.getElementById('playlist');
    const recordBtn = document.getElementById('recordBtn');
    const stopRecordBtn = document.getElementById('stopRecordBtn');
    const recordedAudio = document.getElementById('recordedAudio');
    const saveRecordBtn = document.getElementById('saveRecordBtn');
    const profileImage = document.getElementById('profileImage');
    const profileImageUpload = document.getElementById('profileImageUpload');
    const changeProfileImageBtn = document.getElementById('changeProfileImageBtn');

    let currentUser = localStorage.getItem('currentUser');
    let users = JSON.parse(localStorage.getItem('users')) || {};
    let mediaRecorder;
    let audioChunks = [];

    // تحميل واجهة المستخدم بناءً على حالة التسجيل
    function loadUI() {
        if (currentUser) {
            loginSection.classList.add('hidden');
            exploreSection.classList.remove('hidden');
            songSection.classList.remove('hidden');
            loggedInUser.textContent = currentUser;
            loadPlaylist(currentUser);
            loadProfileImage(currentUser);
        } else {
            loginSection.classList.remove('hidden');
            exploreSection.classList.add('hidden');
            songSection.classList.add('hidden');
        }
    }

    // تسجيل الدخول
    loginBtn.addEventListener('click', function () {
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        if (username && password) {
            if (users[username] && users[username].password === password) {
                errorMsg.classList.add('hidden');
                currentUser = username;
                localStorage.setItem('currentUser', currentUser);
                loadUI();
            } else if (users[username]) {
                errorMsg.textContent = 'كلمة السر غير صحيحة!';
                errorMsg.classList.remove('hidden');
            } else {
                errorMsg.textContent = 'اسم المستخدم غير موجود!';
                errorMsg.classList.remove('hidden');
            }
        } else {
            errorMsg.textContent = 'يرجى إدخال اسم المستخدم وكلمة السر!';
            errorMsg.classList.remove('hidden');
        }
    });

    // إنشاء حساب جديد
    createAccountBtn.addEventListener('click', function () {
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        if (username && password) {
            if (users[username]) {
                errorMsg.textContent = 'اسم المستخدم موجود مسبقًا!';
                errorMsg.classList.remove('hidden');
            } else {
                users[username] = {
                    password: password,
                    playlist: [],
                    profileImage: "https://via.placeholder.com/150" // صورة افتراضية
                };
                localStorage.setItem('users', JSON.stringify(users));
                errorMsg.textContent = 'تم إنشاء الحساب بنجاح!';
                errorMsg.style.color = 'green';
                errorMsg.classList.remove('hidden');
            }
        } else {
            errorMsg.textContent = 'يرجى إدخال اسم المستخدم وكلمة السر!';
            errorMsg.classList.remove('hidden');
        }
    });

    // تسجيل الخروج
    logoutBtn.addEventListener('click', function () {
        currentUser = null;
        localStorage.removeItem('currentUser');
        loadUI();
    });

    // حذف الحساب
    deleteAccountBtn.addEventListener('click', function () {
        if (confirm('هل أنت متأكد أنك تريد حذف حسابك نهائيًا؟')) {
            delete users[currentUser];
            localStorage.setItem('users', JSON.stringify(users));
            currentUser = null;
            localStorage.removeItem('currentUser');
            loadUI();
        }
    });

    // تغيير صورة الملف الشخصي
    changeProfileImageBtn.addEventListener('click', function () {
        profileImageUpload.click();
    });

    profileImageUpload.addEventListener('change', function () {
        const file = profileImageUpload.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                profileImage.src = e.target.result;
                users[currentUser].profileImage = e.target.result;
                localStorage.setItem('users', JSON.stringify(users));
            };
            reader.readAsDataURL(file);
        }
    });

    // بحث عن مستخدم
    searchBtn.addEventListener('click', function () {
        const username = searchUser.value.trim().toLowerCase();
        const foundUser = Object.keys(users).find(user => user.toLowerCase() === username);

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
        playlistDiv.innerHTML = `
            <h3>قائمة تشغيل ${username}</h3>
            <img src="${users[username].profileImage || 'https://via.placeholder.com/150'}" alt="صورة الملف الشخصي" class="profile-image">
        `;
        users[username].playlist.forEach(song => {
            const songDiv = document.createElement('div');
            songDiv.innerHTML = `
                <p>${song.songName} - ${song.artistName}</p>
                <audio class="audio-player" controls>
                    <source src="${song.file}" type="audio/mp3">
                    متصفحك لا يدعم تشغيل الصوتيات.
                </audio>
                <button class="share-btn" data-file="${song.file}" data-songname="${song.songName}">مشاركة على واتساب</button>
            `;
            playlistDiv.appendChild(songDiv);
        });
        userPlaylists.appendChild(playlistDiv);

        // إضافة حدث مشاركة على واتساب
        const shareButtons = document.querySelectorAll('.share-btn');
        shareButtons.forEach(button => {
            button.addEventListener('click', function () {
                const fileUrl = button.getAttribute('data-file');
                const songName = button.getAttribute('data-songname');
                shareOnWhatsApp(fileUrl, songName);
            });
        });
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

                users[currentUser].playlist.push(song);
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

    // تسجيل الصوت
    recordBtn.addEventListener('click', async function () {
        audioChunks = [];
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.start();

        recordBtn.classList.add('hidden');
        stopRecordBtn.classList.remove('hidden');

        mediaRecorder.addEventListener('dataavailable', function (e) {
            audioChunks.push(e.data);
        });

        mediaRecorder.addEventListener('stop', function () {
            const audioBlob = new Blob(audioChunks, { type: 'audio/mp3' });
            recordedAudio.src = URL.createObjectURL(audioBlob);
            recordedAudio.classList.remove('hidden');
            saveRecordBtn.classList.remove('hidden');
        });
    });

    stopRecordBtn.addEventListener('click', function () {
        mediaRecorder.stop();
        stopRecordBtn.classList.add('hidden');
    });

    saveRecordBtn.addEventListener('click', function () {
        const songName = prompt('أدخل اسم التسجيل:');
        if (songName) {
            const song = {
                id: Date.now(),
                songName,
                artistName: 'تسجيل صوتي',
                file: recordedAudio.src,
                addedBy: currentUser
            };

            users[currentUser].playlist.push(song);
            localStorage.setItem('users', JSON.stringify(users));

            addSongToDOM(song);
            recordedAudio.classList.add('hidden');
            saveRecordBtn.classList.add('hidden');
            recordBtn.classList.remove('hidden');
        }
    });

    // تحميل قائمة التشغيل
    function loadPlaylist(user) {
        playlist.innerHTML = '';
        users[user].playlist.forEach(song => {
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
            <button class="share-btn" data-file="${song.file}" data-songname="${song.songName}">مشاركة على واتساب</button>
        `;

        const removeBtn = li.querySelector('.remove-btn');
        removeBtn.addEventListener('click', function () {
            removeSong(song.id);
        });

        const shareBtn = li.querySelector('.share-btn');
        shareBtn.addEventListener('click', function () {
            shareOnWhatsApp(song.file, song.songName);
        });

        playlist.appendChild(li);
    }

    // إزالة أغنية
    function removeSong(id) {
        users[currentUser].playlist = users[currentUser].playlist.filter(song => song.id !== id);
        localStorage.setItem('users', JSON.stringify(users));
        loadPlaylist(currentUser);
    }

    // مشاركة على واتساب
    function shareOnWhatsApp(fileUrl, songName) {
        // تنزيل الملف تلقائيًا
        const downloadLink = document.createElement('a');
        downloadLink.href = fileUrl;
        downloadLink.download = `${songName}.mp3`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);

        // فتح واتساب مع رسالة
        const message = `استمع إلى هذا الملف الصوتي: ${songName}.mp3`;
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank');
    }

    // تحميل الواجهة عند فتح الصفحة
    loadUI();
});
