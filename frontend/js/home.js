document.addEventListener('DOMContentLoaded', function () {
    const username = localStorage.getItem('username');

    if (!username) {
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('profileUsername').textContent = username;

    fetch(`http://localhost:8080/api/profile/${username}`)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            document.getElementById('profileScore').textContent = data.totalScore;
            document.getElementById('profileQuizCount').textContent = data.quizCount;
        })
        .catch(function (error) {
            console.error("Profil bilgileri alınamadı:", error);
        });

    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn.addEventListener('click', function () {
        localStorage.removeItem('username');
        localStorage.removeItem('selectedCategory');
        window.location.href = 'index.html';
    });

    const profileBtn = document.getElementById('profileBtn');
    profileBtn.addEventListener('click', function () {
        window.location.href = 'profile.html';
    });

    const leaderboardBtn = document.getElementById('leaderboardBtn');
    leaderboardBtn.addEventListener('click', function () {
        window.location.href = 'leaderboard.html';
    });

    const categoryCards = document.querySelectorAll('.category-card');

    categoryCards.forEach(function (card) {
    card.addEventListener('click', function () {
        const category = card.getAttribute('data-category');
        localStorage.setItem('selectedCategory', category);
        window.location.href = 'level.html';
    });
});
});