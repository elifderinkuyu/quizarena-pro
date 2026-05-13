let stompClient = null;
let currentUser = null;

function safeTopicName(name) {
    return String(name).trim().replace(/\s+/g, "_");
}

document.addEventListener('DOMContentLoaded', function () {
    const username = localStorage.getItem('username');
    currentUser = username;

    if (!username) {
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('profileUsername').textContent = username;

    if (!stompClient || !stompClient.connected) {
        connectWebSocket(username);
    }

    fetch(BASE_URL + '/api/profile/' + username)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            document.getElementById('profileScore').textContent = data.totalScore || 0;
            document.getElementById('profileQuizCount').textContent = data.quizCount || 0;
            document.getElementById('profileRank').textContent = data.rank || '-';
            
        })
        .catch(function (error) {
            console.error("Profil bilgileri alınamadı:", error);
        });

    fetch(`${BASE_URL}/api/leaderboard`)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            let rank = '-';

            for (let i = 0; i < data.length; i++) {
                if (data[i][0] === username) {
                    rank = i + 1;
                    break;
                }
            }

            document.getElementById('profileRank').textContent = (rank > 0) ? rank : '-';
        })
        .catch(function (error) {
            console.error("Sıralama bilgisi alınamadı:", error);
        });

    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn.addEventListener('click', function () {
        if (stompClient && stompClient.connected) {
            stompClient.send("/app/user.offline", {}, JSON.stringify({
                username: currentUser,
                sessionId: sessionStorage.getItem('sessionId') || 'session_' + Date.now()
            }));
        }

        localStorage.removeItem('username');
        localStorage.removeItem('selectedCategory');
        localStorage.removeItem('selectedLevel');
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

    const vsModeBtn = document.getElementById('vsModeBtn');
    if (vsModeBtn) {
        vsModeBtn.addEventListener('click', function () {
            startMatchmaking();
        });
    }

    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(function (card) {
        card.addEventListener('click', function () {
            const category = card.getAttribute('data-category');
            localStorage.setItem('selectedCategory', category);
            window.location.href = 'level.html';
        });
    });

    setupCategorySlider();

    function setupCategorySlider() {
        const slider = document.getElementById('categorySlider');
        const prevBtn = document.getElementById('categoryPrevBtn');
        const nextBtn = document.getElementById('categoryNextBtn');

        if (!slider || !prevBtn || !nextBtn) return;

        const scrollAmount = 260;

        prevBtn.addEventListener('click', function () {
            slider.scrollBy({
                left: -scrollAmount,
                behavior: 'smooth'
            });
        });

        nextBtn.addEventListener('click', function () {
            slider.scrollBy({
                left: scrollAmount,
                behavior: 'smooth'
            });
        });
    }

    function connectWebSocket(username) {
        const socket = new SockJS(WS_URL);
        stompClient = Stomp.over(socket);

        stompClient.connect({}, function (frame) {
            console.log('WebSocket bağlantısı kuruldu: ' + frame);

            let sessionId = sessionStorage.getItem('sessionId');

            if (!sessionId) {
                sessionId = 'session_' + Date.now();
                sessionStorage.setItem('sessionId', sessionId);
            }

            stompClient.send("/app/user.online", {}, JSON.stringify({
                username: username,
                sessionId: sessionId
            }));

            stompClient.subscribe('/topic/online', function (users) {
                const onlineUsers = JSON.parse(users.body);
                updateOnlineUsers(onlineUsers);
            });

            stompClient.subscribe(`/topic/match/found/${safeTopicName(username)}`, function (message) {
                const opponentName = message.body;
                alert(`Eşleşme bulundu! Rakip: ${opponentName}`);
                startVSGame(opponentName);
            });

        }, function (error) {
            console.error('WebSocket bağlantı hatası:', error);
        });
    }

    function updateOnlineUsers(users) {
        const onlineCountElement = document.getElementById('onlineCount');

        if (onlineCountElement) {
            onlineCountElement.textContent = users.length;
        }
    }

    function startMatchmaking() {
        if (!stompClient || !stompClient.connected) {
            alert('WebSocket bağlantısı bekleniyor, lütfen tekrar deneyin.');
            return;
        }

        alert('Rakip aranıyor... Lütfen bekleyin.');
        stompClient.send("/app/match.start", {}, currentUser);
    }

    function startVSGame(opponent) {
        window.location.href = `vs.html?opponent=${encodeURIComponent(opponent)}&user=${encodeURIComponent(currentUser)}`;
    }
});