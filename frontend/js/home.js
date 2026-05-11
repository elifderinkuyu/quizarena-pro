let stompClient = null;
let currentUser = null;

document.addEventListener('DOMContentLoaded', function () {
    const username = localStorage.getItem('username');
    currentUser = username;

    if (!username) {
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('profileUsername').textContent = username;

    // WebSocket bağlantısını kur (eğer yoksa)
    if (!stompClient || !stompClient.connected) {
        connectWebSocket(username);
    }

    // Profil bilgilerini çek
    fetch(BASE_URL + '/api/login' + `/${username}`)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            document.getElementById('profileScore').textContent = data.totalScore || 0;
            document.getElementById('profileQuizCount').textContent = data.quizCount || 0;
        })
        .catch(function (error) {
            console.error("Profil bilgileri alınamadı:", error);
        });

    // Sıralama bilgisini çek
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

    // Çıkış yap
    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn.addEventListener('click', function () {
        // WebSocket'ten çıkış bildirimi gönder
        if (stompClient && stompClient.connected) {
            stompClient.send("/app/user.offline", {}, JSON.stringify({
                username: currentUser,
                sessionId: sessionStorage.getItem('sessionId') || 'session_' + Date.now()
            }));
        }
        localStorage.removeItem('username');
        localStorage.removeItem('selectedCategory');
        window.location.href = 'index.html';
    });

    // Profil sayfasına git
    const profileBtn = document.getElementById('profileBtn');
    profileBtn.addEventListener('click', function () {
        window.location.href = 'profile.html';
    });

    // Sıralama sayfasına git
    const leaderboardBtn = document.getElementById('leaderboardBtn');
    leaderboardBtn.addEventListener('click', function () {
        window.location.href = 'leaderboard.html';
    });

    // VS Modu sayfasına git (YARIŞMA BAŞLAT)
    const vsModeBtn = document.getElementById('vsModeBtn');
    if (vsModeBtn) {
        vsModeBtn.addEventListener('click', function () {
            startMatchmaking();
        });
    }

    // Kategori seçimi (tek kişilik quiz için)
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(function (card) {
        card.addEventListener('click', function () {
            const category = card.getAttribute('data-category');
            localStorage.setItem('selectedCategory', category);
            window.location.href = 'level.html';
        });
    });

    // ========== WEBSOCKET FONKSİYONLARI ==========
   function connectWebSocket(username) {
    const socket = new SockJS('http://localhost:8080/ws');
    stompClient = Stomp.over(socket);
    
    stompClient.connect({}, function(frame) {
        console.log('WebSocket bağlantısı kuruldu: ' + frame);
        
        stompClient.send("/app/user.online", {}, JSON.stringify({
            username: username,
            sessionId: sessionStorage.getItem('sessionId') || 'session_' + Date.now()
        }));
        
        stompClient.subscribe('/topic/online', function(users) {
            const onlineUsers = JSON.parse(users.body);
            updateOnlineUsers(onlineUsers);
        });

        // topic-per-user bazlı eşleşme bildirimi
        stompClient.subscribe(`/topic/match/found/${username}`, function(message) {
            const opponentName = message.body;
            alert(`Eşleşme bulundu! Rakip: ${opponentName}`);
            startVSGame(opponentName);
        });
        
    }, function(error) {
        console.error('WebSocket bağlantı hatası:', error);
    });
}
    function updateOnlineUsers(users) {
        const onlineCountElement = document.getElementById('onlineCount');
        if (onlineCountElement) {
            onlineCountElement.textContent = users.length;
        }
        
        const onlineListElement = document.getElementById('onlineUsersList');
        if (onlineListElement) {
            onlineListElement.innerHTML = '';
            users.forEach(function(user) {
                const li = document.createElement('li');
                li.textContent = user + (user === currentUser ? ' (Sen)' : '');
                onlineListElement.appendChild(li);
            });
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
        window.location.href = `vs.html?opponent=${opponent}&user=${currentUser}`;
    }
});