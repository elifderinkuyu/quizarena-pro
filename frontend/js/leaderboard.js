document.addEventListener('DOMContentLoaded', function () {

    const backBtn = document.getElementById('backBtn');
    const leaderboardList = document.getElementById('leaderboardList');
    const topUsername = document.getElementById('topUsername');

    fetch('http://localhost:8080/api/leaderboard')
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            leaderboardList.innerHTML = "";

            if (data.length === 0) {
                topUsername.textContent = "Henüz skor yok";
                leaderboardList.innerHTML = "<p>Henüz sıralama verisi yok.</p>";
                return;
            }

            topUsername.textContent = data[0][0];

            data.forEach(function (item, index) {
                const username = item[0];
                const totalScore = item[1];

                const row = document.createElement('div');
                row.classList.add('table-row');

                row.innerHTML = `
                    <span class="rank">${index + 1}</span>
                    <span>${username}</span>
                    <span>${calculateLevel(totalScore)}</span>
                    <span class="score">${totalScore}</span>
                `;

                leaderboardList.appendChild(row);
            });
        })
        .catch(function (error) {
            console.error("Leaderboard verisi alınamadı:", error);
            topUsername.textContent = "Hata";
            leaderboardList.innerHTML = "<p>Sıralama verileri alınamadı.</p>";
        });

    function calculateLevel(score) {
        if (score >= 300) return 4;
        if (score >= 200) return 3;
        if (score >= 100) return 2;
        return 1;
    }

    backBtn.addEventListener('click', function () {
        window.location.href = "home.html";
    });

});