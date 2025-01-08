// تهيئة Supabase
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_KEY';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

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

    let currentUser = null;

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

    // إنشاء حساب جديد
    createAccountBtn.addEventListener('click', async function () {
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        if (username && password) {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('username', username);

            if (error) {
                errorMsg.textContent = 'حدث خطأ أثناء إنشاء الحساب!';
                errorMsg.classList.remove('hidden');
            } else if (data.length > 0) {
                errorMsg.textContent = 'اسم المستخدم موجود مسبقًا!';
                errorMsg.classList.remove('hidden');
            } else {
                const { error } = await supabase
                    .from('users')
                    .insert([{ username, password, profileImage: "https://via.placeholder.com/150", playlist: [] }]);

                if (error) {
                    errorMsg.textContent = 'حدث خطأ أثناء إنشاء الحساب!';
                    errorMsg.classList.remove('hidden');
                } else {
                    errorMsg.textContent = 'تم إنشاء الحساب بنجاح!';
                    errorMsg.style.color = 'green';
                    errorMsg.classList.remove('hidden');
                }
            }
        } else {
            errorMsg.textContent = 'يرجى إدخال اسم المستخدم وكلمة السر!';
            errorMsg.classList.remove('hidden');
        }
    });

    // تسجيل الدخول
    loginBtn.addEventListener('click', async function () {
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        if (username && password) {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('username', username);

            if (error) {
                errorMsg.textContent = 'حدث خطأ أثناء تسجيل الدخول!';
                errorMsg.classList.remove('hidden');
            } else if (data.length === 0) {
                errorMsg.textContent = 'اسم المستخدم غير موجود!';
                errorMsg.classList.remove('hidden');
            } else if (data[0].password !== password) {
                errorMsg.textContent = 'كلمة السر غير صحيحة!';
                errorMsg.classList.remove('hidden');
            } else {
                errorMsg.classList.add('hidden');
                currentUser = username;
                loadUI();
            }
        } else {
            errorMsg.textContent = 'يرجى إدخال اسم المستخدم وكلمة السر!';
            errorMsg.classList.remove('hidden');
        }
    });

    // تسجيل الخروج
    logoutBtn.addEventListener('click', function () {
        currentUser = null;
        loadUI();
    });

    // حذف الحساب
    deleteAccountBtn.addEventListener('click', async function () {
        if (confirm('هل أنت متأكد أنك تريد حذف حسابك نهائيًا؟')) {
            const { error } = await supabase
                .from('users')
                .delete()
                .eq('username', currentUser);

            if (error) {
                errorMsg.textContent = 'حدث خطأ أثناء حذف الحساب!';
                errorMsg.classList.remove('hidden');
            } else {
                currentUser = null;
                loadUI();
            }
        }
    });

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

                const { error } = await supabase
                    .from('users')
                    .update({ playlist: [...users[currentUser].playlist, song] })
                    .eq('username', currentUser);

                if (error) {
                    errorMsg.textContent = 'حدث خطأ أثناء إضافة الأغنية!';
                    errorMsg.classList.remove('hidden');
                } else {
                    addSongToDOM(song);
                    songForm.reset();

                    addSongBtn.classList.remove('hidden');
                    uploadProgress.classList.add('hidden');
                    progressPercent.textContent = '0%';
                    progressBar.value = 0;
                }
            };

            reader.readAsDataURL(songFile);
        }
    });

    // تحميل قائمة التشغيل
    async function loadPlaylist(user) {
        const { data, error } = await supabase
            .from('users')
            .select('playlist')
            .eq('username', user);

        if (error) {
            errorMsg.textContent = 'حدث خطأ أثناء تحميل قائمة التشغيل!';
            errorMsg.classList.remove('hidden');
        } else {
            playlist.innerHTML = '';
            if (data[0].playlist) {
                data[0].playlist.forEach(song => {
                    addSongToDOM(song);
                });
            }
        }
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
            <button class="share-btn" data-file="${song.file}">مشاركة على واتساب</button>
        `;

        const removeBtn = li.querySelector('.remove-btn');
        removeBtn.addEventListener('click', function () {
            removeSong(song.id);
        });

        const shareBtn = li.querySelector('.share-btn');
        shareBtn.addEventListener('click', function () {
            shareOnWhatsApp(song.file);
        });

        playlist.appendChild(li);
    }

    // إزالة أغنية
    async function removeSong(id) {
        const { data, error } = await supabase
            .from('users')
            .select('playlist')
            .eq('username', currentUser);

        if (error) {
            errorMsg.textContent = 'حدث خطأ أثناء إزالة الأغنية!';
            errorMsg.classList.remove('hidden');
        } else {
            const updatedSongs = data[0].playlist.filter(song => song.id !== id);
            const { error } = await supabase
                .from('users')
                .update({ playlist: updatedSongs })
                .eq('username', currentUser);

            if (error) {
                errorMsg.textContent = 'حدث خطأ أثناء إزالة الأغنية!';
                errorMsg.classList.remove('hidden');
            } else {
                loadPlaylist(currentUser);
            }
        }
    }

    // مشاركة على واتساب
    function shareOnWhatsApp(fileUrl) {
        const message = `استمع إلى هذا الملف الصوتي: ${fileUrl}`;
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank');
    }

    // تحميل الواجهة عند فتح الصفحة
    loadUI();
});
