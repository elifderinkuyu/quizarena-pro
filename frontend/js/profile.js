
document.addEventListener('DOMContentLoaded', function () {
    const backBtn = document.getElementById('backBtn');
    const username = localStorage.getItem('username');

    if (!username) {
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('username').textContent = username;

    // Profil bilgilerini çek
    fetch(`http://localhost:8080/api/profile/${username}`)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            document.getElementById('totalScore').textContent = data.totalScore || 0;
            document.getElementById('quizCount').textContent = data.quizCount || 0;
            document.getElementById('bestCategory').textContent = data.bestCategory || '-';
            document.getElementById('correctCount').textContent = data.correctCount || 0;
            document.getElementById('wrongCount').textContent = data.wrongCount || 0;
            // 🆕 Sıralama direkt profil verisinden geliyor
            document.getElementById('rank').textContent = (data.rank > 0) ? data.rank : '-';
        })
        .catch(function (error) {
            console.error("Profil verisi alınamadı:", error);
        });

    backBtn.addEventListener('click', function () {
        window.location.href = "home.html";
    });
});