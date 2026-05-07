
document.addEventListener('DOMContentLoaded', function () {
    const username = localStorage.getItem('username');

    if (!username) {
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('profileUsername').textContent = username;

    // Profil bilgilerini çek
    fetch(`http://localhost:8080/api/profile/${username}`)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            document.getElementById('profileScore').textContent = data.totalScore || 0;
            document.getElementById('profileQuizCount').textContent = data.quizCount || 0;
        })
        .catch(function (error) {
            console.error("Profil bilgileri alınamadı:", error);
        });

    // 🆕 Sıralama bilgisini çek
    fetch(`http://localhost:8080/api/leaderboard`)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            let rank = '-';
            for (let i = 0; i < data.length; i++) {
                // Leaderboard dizi formatında: [username, score]
                if (data[i][0] === username) {
                    rank = i +1;
                    break;
                }
            }
            document.getElementById('profileRank').textContent = (rank > 0) ? rank : '-';
        })
        .catch(function (error) {
            console.error("Sıralama bilgisi alınamadı:", error);
        });

    // Çıkış yap
    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn.addEventListener('click', function () {
        localStorage.removeItem('username');
        localStorage.removeItem('selectedCategory');
        window.location.href = 'index.html';
    });

    // Profil sayfasına git
    const profileBtn = document.getElementById('profileBtn');
    profileBtn.addEventListener('click', function () {
        window.location.href = 'profile.html';
    });

    // Sıralama sayfasına git
    const leaderboardBtn = document.getElementById('leaderboardBtn');
    leaderboardBtn.addEventListener('click', function () {
        window.location.href = 'leaderboard.html';
    });

    // Kategori seçimi
    const categoryCards = document.querySelectorAll('.category-card');

    categoryCards.forEach(function (card) {
        card.addEventListener('click', function () {
            const category = card.getAttribute('data-category');
            localStorage.setItem('selectedCategory', category);
            window.location.href = 'level.html';
        });
    });
});