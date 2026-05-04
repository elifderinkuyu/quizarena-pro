document.addEventListener('DOMContentLoaded', function () {
    const username = localStorage.getItem('username');

    if (!username) {
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('profileUsername').textContent = username;

    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn.addEventListener('click', function () {
        localStorage.removeItem('username');
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
            window.location.href = 'quiz.html';
        });
    });
});