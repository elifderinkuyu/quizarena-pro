let stompClient = null;
let currentUser = null;
let opponent = null;
let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let opponentScore = 0;
let timeLeft = 15;
let timer;
let nextBtn = null;
let answersArea = null;
let timerEl = null;
let questionTextEl = null;
let progressFillEl = null;
let currentQuestionEl = null;
let totalQuestionEl = null;
let userNameEl = null;
let opponentNameEl = null;
let userScoreEl = null;
let opponentScoreEl = null;
let backBtnEl = null;
let stompConnected = false;
let pendingScore = null;

function trySendPendingScore() {
    if (!pendingScore) return;
    if (stompConnected && stompClient) {
        try {
            console.log('Pending skor gönderiliyor:', pendingScore);
            stompClient.send("/app/match.score.update", {}, JSON.stringify(pendingScore));
            pendingScore = null;
        } catch (e) {
            console.error('Skor gönderilemedi, yeniden deneniyor', e);
        }
    } else {
        setTimeout(trySendPendingScore, 300);
    }
}

function sendScoreReliable(data) {
    if (stompConnected && stompClient) {
        console.log('Skor gönderiliyor:', data);
        stompClient.send("/app/match.score.update", {}, JSON.stringify(data));
    } else {
        pendingScore = data;
        console.log('Skor kuyruga alindi (WS hazır değil):', data);
        setTimeout(trySendPendingScore, 300);
    }
}

document.addEventListener('DOMContentLoaded', function () {
    currentUser = localStorage.getItem('username');
    
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }

    // URL'den rakip bilgisini al
    const params = new URLSearchParams(window.location.search);
    opponent = params.get('opponent');
    
    if (!opponent) {
        alert('Rakip bilgisi bulunamadı! Ana sayfaya yönlendiriliyorsunuz.');
        window.location.href = 'home.html';
        return;
    }

    // Elementleri yakala
    userNameEl = document.getElementById('userName');
    opponentNameEl = document.getElementById('opponentName');
    userScoreEl = document.getElementById('userScore');
    opponentScoreEl = document.getElementById('opponentScore');
    questionTextEl = document.getElementById('questionText');
    answersArea = document.getElementById('answersArea');
    nextBtn = document.getElementById('nextBtn');
    timerEl = document.getElementById('timer');
    progressFillEl = document.getElementById('progressFill');
    currentQuestionEl = document.getElementById('currentQuestion');
    totalQuestionEl = document.getElementById('totalQuestion');
    backBtnEl = document.getElementById('backBtn');

    if (userNameEl) userNameEl.textContent = currentUser;
    if (opponentNameEl) opponentNameEl.textContent = opponent;
    if (userScoreEl) userScoreEl.textContent = score;
    if (opponentScoreEl) opponentScoreEl.textContent = opponentScore;
    if (nextBtn) nextBtn.disabled = true;

    if (backBtnEl) {
        backBtnEl.addEventListener('click', function() {
            window.location.href = 'home.html';
        });
    }
    
    // WebSocket bağlantısını kur
    connectWebSocket();
    
    // Soruları yükle
    loadQuestions();
    
    // Next buton dinleyicisini burada ekle (element hazır)
    if (nextBtn) {
        nextBtn.addEventListener("click", function() {
            currentQuestionIndex++;
            if (currentQuestionIndex < questions.length) {
                loadQuestion();
            } else {
                finishGame();
            }
        });
    }

    // Eğer sayfa bfcache/geri-yükle (pageshow) ile geliyorsa taze başlat
    window.addEventListener('pageshow', function(event) {
        if (event.persisted) {
            window.location.reload();
        }
    });
});

function connectWebSocket() {
    const socket = new SockJS(WS_URL);
    stompClient = Stomp.over(socket);
    
    stompClient.connect({}, function(frame) {
        stompConnected = true;
        console.log('VS WebSocket bağlantısı kuruldu: ' + frame);
        
        // Kendi kullanıcı topic'ine abone ol ve rakipten gelen skor güncellemelerini al
        stompClient.subscribe(`/topic/score.update/${currentUser}`, function(scoreData) {
            const data = JSON.parse(scoreData.body);
            console.log('Skor güncellemesi alındı:', data);
            
            // Gelen güncelleme diğer oyuncudan geliyorsa rakip skoru güncelle
            if (data.username && data.username !== currentUser) {
                opponentScore = data.score;
                document.getElementById('opponentScore').textContent = opponentScore;
                console.log('Rakip skoru güncellendi: ' + opponentScore);
            }
        });
        
    }, function(error) {
        stompConnected = false;
        console.error('WebSocket bağlantı hatası:', error);
    });
}

function loadQuestions() {
    const selectedCategory = localStorage.getItem('selectedCategory') || 'Yazılım';
    const selectedLevel = localStorage.getItem('selectedLevel') || 'Kolay';
    
    fetch(`${BASE_URL}/api/questions?category=${encodeURIComponent(selectedCategory)}&level=${encodeURIComponent(selectedLevel)}`)
        .then(function(response) {
            if (!response.ok) {
                throw new Error("Sorular getirilemedi");
            }
            return response.json();
        })
        .then(function(data) {
            questions = data.map(function(q) {
                return {
                    question: q.questionText,
                    answers: [q.optionA, q.optionB, q.optionC, q.optionD],
                    correct: q.correctOption
                };
            });
            
            if (questions.length === 0) {
                document.getElementById('questionText').textContent = "Bu kategori ve seviyeye ait soru bulunamadı.";
                return;
            }
            
            document.getElementById('totalQuestion').textContent = questions.length;
            loadQuestion();
        })
        .catch(function(error) {
            console.error("Soru çekme hatası:", error);
            document.getElementById('questionText').textContent = "Sorular yüklenirken hata oluştu.";
        });
}

function startTimer() {
    clearInterval(timer);
    timeLeft = 15;
    document.getElementById('timer').textContent = timeLeft;
    
    timer = setInterval(function() {
        timeLeft--;
        if (timerEl) timerEl.textContent = timeLeft;
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            disableAnswers();
            showCorrectAnswer();
            if (nextBtn) nextBtn.disabled = false;
        }
    }, 1000);
}

function loadQuestion() {
    if (nextBtn) nextBtn.disabled = true;
    if (answersArea) answersArea.innerHTML = "";
    
    const q = questions[currentQuestionIndex];
    if (questionTextEl) questionTextEl.textContent = q.question;
    if (currentQuestionEl) currentQuestionEl.textContent = currentQuestionIndex + 1;

    const progressPercent = (currentQuestionIndex / questions.length) * 100;
    if (progressFillEl) progressFillEl.style.width = progressPercent + "%";
    
    q.answers.forEach(function(answer, index) {
        const btn = document.createElement("button");
        btn.classList.add("answer-btn");
        btn.textContent = answer;
        
        btn.addEventListener("click", function() {
            selectAnswer(btn, index);
        });
        
        answersArea.appendChild(btn);
    });
    
    startTimer();
}

function selectAnswer(button, index) {
    clearInterval(timer);
    
    const q = questions[currentQuestionIndex];
    const buttons = document.querySelectorAll('.answer-btn');
    
    buttons.forEach(btn => btn.disabled = true);
    
    if (index === q.correct) {
        button.classList.add("correct");
        score += 10;
        if (userScoreEl) userScoreEl.textContent = score;
        
        // Skoru rakibe gönder (güvenli gönderim)
        sendScoreReliable({
            username: currentUser,
            opponent: opponent,
            score: score
        });
    } else {
        button.classList.add("wrong");
        if (buttons[q.correct]) {
            buttons[q.correct].classList.add("correct");
        }
    }
    
    if (nextBtn) nextBtn.disabled = false;
}

function showCorrectAnswer() {
    const q = questions[currentQuestionIndex];
    const buttons = document.querySelectorAll('.answer-btn');
    if (buttons[q.correct]) {
        buttons[q.correct].classList.add("correct");
    }
}

function disableAnswers() {
    const buttons = document.querySelectorAll('.answer-btn');
    buttons.forEach(btn => btn.disabled = true);
}

// nextBtn listener moved into DOMContentLoaded after element lookup

function finishGame() {
    clearInterval(timer);
    
    let resultMessage = '';
    if (score > opponentScore) {
        resultMessage = '🎉 Kazandınız! 🎉';
    } else if (score < opponentScore) {
        resultMessage = '😞 Kaybettiniz! 😞';
    } else {
        resultMessage = '🤝 Berabere! 🤝';
    }
    
    document.getElementById('questionText').innerHTML = `
        <div class="result-box">
            <h2>Oyun Bitti!</h2>
            <p>${resultMessage}</p>
            <p>Senin Skorun: ${score}</p>
            <p>Rakip Skoru: ${opponentScore}</p>
            <button onclick="location.href='home.html'" class="back-home-btn">Ana Sayfaya Dön</button>
        </div>
    `;
    answersArea.innerHTML = "";
    nextBtn.style.display = "none";
}

// Geri butonu
document.getElementById('backBtn').addEventListener('click', function() {
    window.location.href = 'home.html';
});