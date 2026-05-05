document.addEventListener('DOMContentLoaded', function () {
    const backBtn = document.getElementById('backBtn');
    const username = localStorage.getItem('username');

    if (!username) {
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('username').textContent = username;

    fetch(`http://localhost:8080/api/profile/${username}`)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            document.getElementById('level').textContent = data.level;
            document.getElementById('totalScore').textContent = data.totalScore;
            document.getElementById('quizCount').textContent = data.quizCount;
            document.getElementById('bestCategory').textContent = data.bestCategory;

            document.getElementById('correctCount').textContent = data.correctCount;
            document.getElementById('wrongCount').textContent = data.wrongCount;
        })
        .catch(function (error) {
            console.error("Profil verisi alınamadı:", error);
        });

    backBtn.addEventListener('click', function () {
        window.location.href = "home.html";
    });
});