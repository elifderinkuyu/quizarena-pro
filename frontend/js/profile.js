document.addEventListener('DOMContentLoaded', function () {
    const backBtn = document.getElementById('backBtn');
    const username = localStorage.getItem('username');

    if (!username) {
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('username').textContent = username;

    fetch(`${BASE_URL}/api/profile/${username}`)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            const totalScore = Number(data.totalScore || 0);
            const quizCount = Number(data.quizCount || 0);
            const correctCount = Number(data.correctCount || 0);
            const wrongCount = Number(data.wrongCount || 0);
            const rank = Number(data.rank || 0);

            document.getElementById('totalScore').textContent = totalScore;
            document.getElementById('quizCount').textContent = quizCount;
            document.getElementById('bestCategory').textContent = data.bestCategory || '-';
            document.getElementById('correctCount').textContent = correctCount;
            document.getElementById('wrongCount').textContent = wrongCount;
            document.getElementById('rank').textContent = (rank > 0) ? rank : '-';

            updateBadges(totalScore, quizCount, correctCount);
        })
        .catch(function (error) {
            console.error("Profil verisi alınamadı:", error);
        });

    backBtn.addEventListener('click', function () {
        window.location.href = "home.html";
    });
});

function updateBadges(totalScore, quizCount, correctCount) {
    const badgeCards = document.querySelectorAll('.badge-card');

    badgeCards.forEach(function (badge) {
        badge.classList.remove('active');
    });

    let activeBadgeIndex = 0;

    if (totalScore >= 300 || quizCount >= 10 || correctCount >= 30) {
        activeBadgeIndex = 3; // Seri Başarı
    } else if (totalScore >= 200 || quizCount >= 6 || correctCount >= 20) {
        activeBadgeIndex = 2; // Quiz Ustası
    } else if (totalScore >= 100 || quizCount >= 3 || correctCount >= 10) {
        activeBadgeIndex = 1; // Gelişen Oyuncu
    } else {
        activeBadgeIndex = 0; // Başlangıç
    }

    if (badgeCards[activeBadgeIndex]) {
        badgeCards[activeBadgeIndex].classList.add('active');
    }
}