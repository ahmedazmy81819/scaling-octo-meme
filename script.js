document.addEventListener('DOMContentLoaded', function () {
    // قيم التهيئة من Firebase Console
    const firebaseConfig = {
        apiKey: "AIzaSyCqrOEEPsF0OeypD_p6xD5cwr16sEo0bLg",
        authDomain: "music-for-us-f78f6.firebaseapp.com",
        databaseURL: "https://music-for-us-f78f6-default-rtdb.firebaseio.com",
        projectId: "music-for-us-f78f6",
        storageBucket: "music-for-us-f78f6.firebasestorage.app",
        messagingSenderId: "963497398495",
        appId: "1:963497398495:web:794b36a129a61d4ea1196a",
        measurementId: "G-F1HV38GFY0"
    };

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);

    // تهيئة الخدمات الإضافية
    const firestore = firebase.firestore(); // لـ Firestore
    const auth = firebase.auth();           // لـ Authentication
    const storage = firebase.storage();     // لـ Storage

    // عناصر DOM
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
    let mediaRecorder;
    let audioChunks = [];

    // تحميل واجهة المستخدم بناءً على حالة التسجيل
    function loadUI() {
        if (currentUser) {
            loggedInUser.textContent = currentUser;
            loadPlaylist(currentUser);
            loadProfileImage(currentUser);
        }
    }

    // تسجيل الدخول
    loginBtn.addEventListener('click', async function () {
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        if (username && password) {
            const userRef = firestore.collection('users').doc(username);
            const doc = await userRef.get();

            if (doc.exists && doc.data().password === password) {
                errorMsg.textContent = 'تم تسجيل الدخول بنجاح!';
                errorMsg.style.color = 'green';
                errorMsg.classList.remove('hidden');
                currentUser = username;
                localStorage.setItem('currentUser', currentUser);
                loadUI();
            } else {
                errorMsg.textContent = 'اسم المستخدم أو كلمة السر غير صحيحة!';
                errorMsg.style.color = 'red';
                errorMsg.classList.remove('hidden');
            }
        } else {
            errorMsg.textContent = 'يرجى إدخال اسم المستخدم وكلمة السر!';
            errorMsg.classList.remove('hidden');
        }
    });

    // إنشاء حساب جديد
    createAccountBtn.addEventListener('click', async function () {
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        if (username && password) {
            const userRef = firestore.collection('users').doc(username);
            const doc = await userRef.get();

            if (doc.exists) {
                errorMsg.textContent = 'اسم المستخدم موجود مسبقًا!';
                errorMsg.classList.remove('hidden');
            } else {
                await userRef.set({
                    username: username,
                    password: password,
                    playlist: [],
                    profileImage: "https://via.placeholder.com/150"
                });
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
    deleteAccountBtn.addEventListener('click', async function () {
        if (confirm('هل أنت متأكد أنك تريد حذف حسابك نهائيًا؟')) {
            const userRef = firestore.collection('users').doc(currentUser);
            await userRef.delete();
            currentUser = null;
            localStorage.removeItem('currentUser');
            loadUI();
        }
    });

    // تغيير صورة الملف الشخصي
    changeProfileImageBtn.addEventListener('click', function () {
        profileImageUpload.click();
    });

    profileImageUpload.addEventListener('change', async function () {
        const file = profileImageUpload.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async function (e) {
                profileImage.src = e.target.result;

                // حفظ الصورة الجديدة في Firestore
                const userRef = firestore.collection('users').doc(currentUser);
                await userRef.update({ profileImage: e.target.result });
            };
            reader.readAsDataURL(file);
        }
    });

    // بحث عن مستخدم
    searchBtn.addEventListener('click', async function () {
        const username = searchUser.value.trim().toLowerCase();
        const userRef = firestore.collection('users').doc(username);
        const doc = await userRef.get();

        if (doc.exists) {
            const userData = doc.data();
            displayUserPlaylist(userData);
        } else {
            userPlaylists.innerHTML = '<p>المستخدم غير موجود!</p>';
        }
    });

    // عرض قائمة تشغيل المستخدم
    function displayUserPlaylist(userData) {
        userPlaylists.innerHTML = '';
        const playlistDiv = document.createElement('div');
        playlistDiv.className = 'user-playlist';
        playlistDiv.innerHTML = `
            <h3>قائمة تشغيل ${userData.username}</h3>
            <img src="${userData.profileImage || 'https://via.placeholder.com/150'}" alt="صورة الملف الشخصي" class="profile-image">
        `;
        userData.playlist.forEach(song => {
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
    songForm.addEventListener('submit', async function (e) {
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

            reader.onload = async function (e) {
                const song = {
                    id: Date.now(),
                    songName,
                    artistName,
                    file: e.target.result,
                    addedBy: currentUser
                };

                // حفظ الأغنية الجديدة في Firestore
                const userRef = firestore.collection('users').doc(currentUser);
                await userRef.update({
                    playlist: firebase.firestore.FieldValue.arrayUnion(song)
                });

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

    saveRecordBtn.addEventListener('click', async function () {
        const songName = prompt('أدخل اسم التسجيل:');
        if (songName) {
            const song = {
                id: Date.now(),
                songName,
                artistName: 'تسجيل صوتي',
                file: recordedAudio.src,
                addedBy: currentUser
            };

            // حفظ التسجيل الصوتي في Firestore
            const userRef = firestore.collection('users').doc(currentUser);
            await userRef.update({
                playlist: firebase.firestore.FieldValue.arrayUnion(song)
            });

            addSongToDOM(song);
            recordedAudio.classList.add('hidden');
            saveRecordBtn.classList.add('hidden');
            recordBtn.classList.remove('hidden');
        }
    });

    // تحميل قائمة التشغيل
    function loadPlaylist(user) {
        const userRef = firestore.collection('users').doc(user);
        userRef.get().then(doc => {
            if (doc.exists) {
                const userData = doc.data();
                playlist.innerHTML = '';
                userData.playlist.forEach(song => {
                    addSongToDOM(song);
                });
            }
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
        const userRef = firestore.collection('users').doc(currentUser);
        userRef.get().then(doc => {
            if (doc.exists) {
                const userData = doc.data();
                const updatedPlaylist = userData.playlist.filter(song => song.id !== id);
                userRef.update({ playlist: updatedPlaylist }).then(() => {
                    loadPlaylist(currentUser);
                });
            }
        });
    }

    // مشاركة على واتساب
    function shareOnWhatsApp(fileUrl, songName) {
        const message = `استمع إلى هذا الملف الصوتي: ${songName}.mp3`;
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank');
    }

    // تحميل الواجهة عند فتح الصفحة
    loadUI();
});
