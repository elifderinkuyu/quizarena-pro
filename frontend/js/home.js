document.addEventListener('DOMContentLoaded', function () {

    const categoryButtons = document.querySelectorAll('.start-btn');

    categoryButtons.forEach(button => {
        button.addEventListener('click', function () {

            const card = button.closest('.category-card');
            const category = card.getAttribute('data-category');

            // seçilen kategoriyi kaydet
            localStorage.setItem('selectedCategory', category);

            // quiz sayfasına git
            window.location.href = 'quiz.html';
        });
    });
    const profileBtn = document.getElementById('profileBtn');
    const leaderboardBtn = document.getElementById('leaderboardBtn');

    profileBtn.addEventListener('click', function () {
       window.location.href = 'profile.html';
});

    leaderboardBtn.addEventListener('click', function () {
       window.location.href = 'leaderboard.html';
});

});