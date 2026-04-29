document.addEventListener('DOMContentLoaded', function () {

    const backBtn = document.getElementById('backBtn');
    const leaderboardList = document.getElementById('leaderboardList');
    const topUsername = document.getElementById('topUsername');

    // Şimdilik örnek veriler
    const users = [
        { rank: 1, username: "Semanur", level: 3, score: 320 },
        { rank: 2, username: "Yasemin", level: 2, score: 280 },
        { rank: 3, username: "Elif", level: 2, score: 240 },
        { rank: 4, username: "Hazne Nur", level: 1, score: 190 },
        { rank: 5, username: "Misafir", level: 1, score: 120 }
    ];

    topUsername.textContent = users[0].username;

    users.forEach(function (user) {
        const row = document.createElement('div');
        row.classList.add('table-row');

        row.innerHTML = `
            <span class="rank">${user.rank}</span>
            <span>${user.username}</span>
            <span>${user.level}</span>
            <span class="score">${user.score}</span>
        `;

        leaderboardList.appendChild(row);
    });

    backBtn.addEventListener('click', function () {
        window.location.href = "home.html";
    });

});