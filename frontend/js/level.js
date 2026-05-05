
document.addEventListener('DOMContentLoaded', function () {
    const selectedCategory = localStorage.getItem('selectedCategory');

    if (!selectedCategory) {
        window.location.href = 'home.html';
        return;
    }

    document.getElementById('categoryTitle').textContent =
        selectedCategory + " kategorisi";

    const levelCards = document.querySelectorAll('.level-card');

    levelCards.forEach(function (card) {
        card.addEventListener('click', function () {
            const level = card.getAttribute('data-level');
            localStorage.setItem('selectedLevel', level);
            window.location.href = 'quiz.html';
        });
    });

    document.getElementById('backBtn').addEventListener('click', function () {
        window.location.href = 'home.html';
    });
});