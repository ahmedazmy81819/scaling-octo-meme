// script.js
document.addEventListener('DOMContentLoaded', function () {
    // تحميل القائمة من localStorage عند فتح الصفحة
    loadPlaylist();

    // إضافة أغنية جديدة
    document.getElementById('songForm').addEventListener('submit', function (e) {
        e.preventDefault();

        const songName = document.getElementById('songName').value;
        const artistName = document.getElementById('artistName').value;
        const friendName = document.getElementById('friendName').value;

        if (songName && artistName && friendName) {
            addSongToPlaylist(songName, artistName, friendName);
            document.getElementById('songForm').reset();
        }
    });

    // تحميل القائمة من localStorage
    function loadPlaylist() {
        const playlist = JSON.parse(localStorage.getItem('playlist')) || [];
        playlist.forEach(song => {
            addSongToDOM(song);
        });
    }

    // إضافة أغنية إلى القائمة وعرضها
    function addSongToPlaylist(songName, artistName, friendName) {
        const song = {
            id: Date.now(),
            songName,
            artistName,
            friendName,
            likes: 0
        };

        // إضافة الأغنية إلى localStorage
        const playlist = JSON.parse(localStorage.getItem('playlist')) || [];
        playlist.push(song);
        localStorage.setItem('playlist', JSON.stringify(playlist));

        // إضافة الأغنية إلى DOM
        addSongToDOM(song);
    }

    // إضافة أغنية إلى DOM
    function addSongToDOM(song) {
        const li = document.createElement('li');
        li.setAttribute('data-id', song.id);

        li.innerHTML = `
            <span>${song.songName} - ${song.artistName} (مضافة من ${song.friendName})</span>
            <div>
                <button class="like-btn">إعجاب (${song.likes})</button>
                <button class="remove-btn">إزالة</button>
            </div>
        `;

        // إضافة حدث إعجاب
        const likeBtn = li.querySelector('.like-btn');
        likeBtn.addEventListener('click', function () {
            likeSong(song.id);
        });

        // إضافة حدث إزالة
        const removeBtn = li.querySelector('.remove-btn');
        removeBtn.addEventListener('click', function () {
            removeSong(song.id);
        });

        document.getElementById('playlist').appendChild(li);
    }

    // زيادة عدد الإعجابات
    function likeSong(id) {
        const playlist = JSON.parse(localStorage.getItem('playlist')) || [];
        const song = playlist.find(song => song.id === id);
        if (song) {
            song.likes += 1;
            localStorage.setItem('playlist', JSON.stringify(playlist));
            updateLikesInDOM(id, song.likes);
        }
    }

    // تحديث عدد الإعجابات في DOM
    function updateLikesInDOM(id, likes) {
        const li = document.querySelector(`li[data-id="${id}"]`);
        if (li) {
            const likeBtn = li.querySelector('.like-btn');
            likeBtn.textContent = `إعجاب (${likes})`;
        }
    }

    // إزالة أغنية من القائمة
    function removeSong(id) {
        let playlist = JSON.parse(localStorage.getItem('playlist')) || [];
        playlist = playlist.filter(song => song.id !== id);
        localStorage.setItem('playlist', JSON.stringify(playlist));

        const li = document.querySelector(`li[data-id="${id}"]`);
        if (li) {
            li.remove();
        }
    }
});
