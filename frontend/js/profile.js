document.addEventListener('DOMContentLoaded', function () {

    const backBtn = document.getElementById('backBtn');

    // Şimdilik sabit veriler (backend gelince burası değişecek)
    const userData = {
        username: "Semanur",
        level: 1,
        totalScore: 120,
        quizCount: 5,
        correctCount: 12,
        wrongCount: 3,
        bestCategory: "Yazılım"
    };

    // HTML'e yazdır
    document.getElementById('username').textContent = userData.username;
    document.getElementById('level').textContent = userData.level;
    document.getElementById('totalScore').textContent = userData.totalScore;
    document.getElementById('quizCount').textContent = userData.quizCount;
    document.getElementById('correctCount').textContent = userData.correctCount;
    document.getElementById('wrongCount').textContent = userData.wrongCount;
    document.getElementById('bestCategory').textContent = userData.bestCategory;

    // Geri butonu
    backBtn.addEventListener('click', function () {
        window.location.href = "home.html";
    });

});