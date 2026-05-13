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
let answeredCurrentQuestion = false;


function safeTopicName(name) {
    return String(name).trim().replace(/\s+/g, "_");
}


function safeTopicName(name) {
    return String(name).trim().replace(/\s+/g, "_");
}

function getVsStateKey() {
    return `vs_state_${currentUser}_${opponent}`;
}

function saveGameState() {
    if (!currentUser || !opponent) return;

    const state = {
        currentQuestionIndex,
        score,
        opponentScore,
        timeLeft,
        answeredCurrentQuestion
    };

    localStorage.setItem(getVsStateKey(), JSON.stringify(state));
    console.log("VS state kaydedildi:", getVsStateKey(), state);
}

function loadGameState() {
    if (!currentUser || !opponent) return false;

    const saved = localStorage.getItem(getVsStateKey());

    console.log("Yüklenecek VS state:", getVsStateKey());
    console.log("VS localStorage içeriği:", saved);

    if (!saved) return false;

    try {
        const state = JSON.parse(saved);

        currentQuestionIndex = Number(state.currentQuestionIndex ?? 0);
        score = Number(state.score ?? 0);
        opponentScore = Number(state.opponentScore ?? 0);
        timeLeft = Number(state.timeLeft ?? 15);
        answeredCurrentQuestion = Boolean(state.answeredCurrentQuestion);

        console.log("VS state başarıyla yüklendi:", state);
        return true;
    } catch (error) {
        console.error("VS state yüklenemedi:", error);
        return false;
    }
}

function clearGameState() {
    if (!currentUser || !opponent) return;
    localStorage.removeItem(getVsStateKey());
}

function updateScoreUI() {
    if (userScoreEl) userScoreEl.textContent = score;
    if (opponentScoreEl) opponentScoreEl.textContent = opponentScore;
}

function trySendPendingScore() {
    if (!pendingScore) return;

    if (stompConnected && stompClient) {
        try {
            console.log("Pending skor gönderiliyor:", pendingScore);
            stompClient.send("/app/match.score.update", {}, JSON.stringify(pendingScore));
            pendingScore = null;
        } catch (e) {
            console.error("Skor gönderilemedi, yeniden deneniyor", e);
        }
    } else {
        setTimeout(trySendPendingScore, 300);
    }
}

function sendScoreReliable(data) {
    if (stompConnected && stompClient) {
        console.log("Skor gönderiliyor:", data);
        stompClient.send("/app/match.score.update", {}, JSON.stringify(data));
    } else {
        pendingScore = data;
        console.log("Skor kuyruğa alındı. WebSocket hazır değil:", data);
        setTimeout(trySendPendingScore, 300);
    }
}

function sendQuestionUpdateReliable() {
    if (!currentUser || !opponent) return;

    const data = {
        username: currentUser,
        opponent: opponent,
        currentQuestionIndex: currentQuestionIndex
    };

    if (stompConnected && stompClient) {
        console.log("Soru güncellemesi gönderiliyor:", data);
        stompClient.send("/app/match.question.update", {}, JSON.stringify(data));
    } else {
        console.warn("WebSocket hazır değil, soru güncellemesi gönderilemedi.");
    }
}

document.addEventListener("DOMContentLoaded", function () {
    currentUser = localStorage.getItem("username");

    if (!currentUser) {
        window.location.href = "index.html";
        return;
    }

    const params = new URLSearchParams(window.location.search);
    opponent = params.get("opponent");

    if (!opponent) {
        alert("Rakip bilgisi bulunamadı! Ana sayfaya yönlendiriliyorsunuz.");
        window.location.href = "home.html";
        return;
    }

    userNameEl = document.getElementById("userName");
    opponentNameEl = document.getElementById("opponentName");
    userScoreEl = document.getElementById("userScore");
    opponentScoreEl = document.getElementById("opponentScore");
    questionTextEl = document.getElementById("questionText");
    answersArea = document.getElementById("answersArea");
    nextBtn = document.getElementById("nextBtn");
    timerEl = document.getElementById("timer");
    progressFillEl = document.getElementById("progressFill");
    currentQuestionEl = document.getElementById("currentQuestion");
    totalQuestionEl = document.getElementById("totalQuestion");
    backBtnEl = document.getElementById("backBtn");

    loadGameState();

    if (userNameEl) userNameEl.textContent = currentUser;
    if (opponentNameEl) opponentNameEl.textContent = opponent;
    updateScoreUI();

    if (nextBtn) nextBtn.disabled = true;

    if (backBtnEl) {
        backBtnEl.addEventListener("click", function () {
            clearInterval(timer);
            saveGameState();
            window.location.href = "home.html";
        });
    }

    connectWebSocket();
    loadQuestions();

    if (nextBtn) {
        nextBtn.addEventListener("click", function () {
            currentQuestionIndex++;
            timeLeft = 15;
            answeredCurrentQuestion = false;

            saveGameState();
            sendQuestionUpdateReliable();

            console.log("Yeni soru index kaydedildi ve rakibe gönderildi:", currentQuestionIndex);

            if (currentQuestionIndex < questions.length) {
                loadQuestion();
            } else {
                finishGame();
            }
        });
    }

    window.addEventListener("beforeunload", function () {
        saveGameState();
    });
});

function connectWebSocket() {
    const socket = new SockJS(WS_URL);
    stompClient = Stomp.over(socket);

    stompClient.connect({}, function (frame) {
        stompConnected = true;
        console.log("VS WebSocket bağlantısı kuruldu:", frame);

       stompClient.subscribe(`/topic/score.update/${safeTopicName(currentUser)}`, function (scoreData) {
            const data = JSON.parse(scoreData.body);
            console.log("Skor güncellemesi alındı:", data);

            if (data.username && data.username !== currentUser) {
                opponentScore = Number(data.score);

                updateScoreUI();
                saveGameState();

                console.log("Rakip skoru ekrana yazıldı:", opponentScore);
            }
        });

        stompClient.subscribe(`/topic/question.update/${safeTopicName(currentUser)}`, function (questionData) {
            const data = JSON.parse(questionData.body);
            console.log("Rakip soru güncellemesi gönderdi:", data);

            if (data.username && data.username !== currentUser) {
                const newQuestionIndex = Number(data.currentQuestionIndex);

                clearInterval(timer);

                currentQuestionIndex = newQuestionIndex;
                timeLeft = 15;
                answeredCurrentQuestion = false;

                saveGameState();

                console.log("Rakip geçtiği için bu ekran da soruya geçiriliyor:", currentQuestionIndex);

                if (questions.length > 0 && currentQuestionIndex < questions.length) {
                    loadQuestion();
                } else if (questions.length > 0 && currentQuestionIndex >= questions.length) {
                    finishGame();
                }
            }
        });

        trySendPendingScore();

    }, function (error) {
        stompConnected = false;
        console.error("WebSocket bağlantı hatası:", error);
    });
}

function loadQuestions() {
    const selectedCategory = localStorage.getItem("selectedCategory") || "Yazılım";
    const selectedLevel = localStorage.getItem("selectedLevel") || "Kolay";

    fetch(`${BASE_URL}/api/questions?category=${encodeURIComponent(selectedCategory)}&level=${encodeURIComponent(selectedLevel)}`)
        .then(function (response) {
            if (!response.ok) {
                throw new Error("Sorular getirilemedi");
            }
            return response.json();
        })
        .then(function (data) {
            questions = data.map(function (q) {
                return {
                    question: q.questionText,
                    answers: [q.optionA, q.optionB, q.optionC, q.optionD],
                    correct: q.correctOption
                };
            });

            if (questions.length === 0) {
                if (questionTextEl) {
                    questionTextEl.textContent = "Bu kategori ve seviyeye ait soru bulunamadı.";
                }
                return;
            }

            if (currentQuestionIndex >= questions.length) {
                currentQuestionIndex = 0;
                score = 0;
                opponentScore = 0;
                timeLeft = 15;
                answeredCurrentQuestion = false;
                clearGameState();
            }

            if (totalQuestionEl) totalQuestionEl.textContent = questions.length;

            updateScoreUI();
            loadQuestion();
        })
        .catch(function (error) {
            console.error("Soru çekme hatası:", error);

            if (questionTextEl) {
                questionTextEl.textContent = "Sorular yüklenirken hata oluştu.";
            }
        });
}

function startTimer() {
    clearInterval(timer);

    if (timeLeft === null || timeLeft === undefined || timeLeft <= 0 || timeLeft > 15) {
        timeLeft = 15;
    }

    if (timerEl) timerEl.textContent = timeLeft;

    timer = setInterval(function () {
        timeLeft--;

        if (timerEl) timerEl.textContent = timeLeft;

        saveGameState();

        if (timeLeft <= 0) {
            clearInterval(timer);
            disableAnswers();
            showCorrectAnswer();

            answeredCurrentQuestion = true;
            saveGameState();

            if (nextBtn) nextBtn.disabled = false;
        }
    }, 1000);
}

function loadQuestion() {
    if (!questions[currentQuestionIndex]) {
        finishGame();
        return;
    }

    if (nextBtn) nextBtn.disabled = true;
    if (answersArea) answersArea.innerHTML = "";

    saveGameState();

    const q = questions[currentQuestionIndex];

    if (questionTextEl) questionTextEl.textContent = q.question;
    if (currentQuestionEl) currentQuestionEl.textContent = currentQuestionIndex + 1;

    const progressPercent = (currentQuestionIndex / questions.length) * 100;
    if (progressFillEl) progressFillEl.style.width = progressPercent + "%";

    q.answers.forEach(function (answer, index) {
        const btn = document.createElement("button");
        btn.classList.add("answer-btn");
        btn.textContent = answer;

        btn.addEventListener("click", function () {
            selectAnswer(btn, index);
        });

        answersArea.appendChild(btn);
    });

    if (answeredCurrentQuestion) {
        disableAnswers();
        showCorrectAnswer();

        if (nextBtn) nextBtn.disabled = false;
        if (timerEl) timerEl.textContent = timeLeft;

        clearInterval(timer);
    } else {
        startTimer();
    }

    updateScoreUI();
    saveGameState();
}

function selectAnswer(button, index) {
    clearInterval(timer);

    const q = questions[currentQuestionIndex];
    const buttons = document.querySelectorAll(".answer-btn");

    buttons.forEach(function (btn) {
        btn.disabled = true;
    });

    answeredCurrentQuestion = true;

    if (index === q.correct) {
        button.classList.add("correct");
        score += 10;

        updateScoreUI();

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

    saveGameState();

    if (nextBtn) nextBtn.disabled = false;
}

function showCorrectAnswer() {
    const q = questions[currentQuestionIndex];

    if (!q) return;

    const buttons = document.querySelectorAll(".answer-btn");

    if (buttons[q.correct]) {
        buttons[q.correct].classList.add("correct");
    }
}

function disableAnswers() {
    const buttons = document.querySelectorAll(".answer-btn");

    buttons.forEach(function (btn) {
        btn.disabled = true;
    });
}

function finishGame() {
    clearInterval(timer);
    clearGameState();

    let resultMessage = "";

    if (score > opponentScore) {
        resultMessage = "🎉 Kazandınız! 🎉";
    } else if (score < opponentScore) {
        resultMessage = "😞 Kaybettiniz! 😞";
    } else {
        resultMessage = "🤝 Berabere! 🤝";
    }

    if (questionTextEl) {
        questionTextEl.innerHTML = `
            <div class="result-box">
                <h2>Oyun Bitti!</h2>
                <p>${resultMessage}</p>
                <p>Senin Skorun: ${score}</p>
                <p>Rakip Skoru: ${opponentScore}</p>
                <button onclick="location.href='home.html'" class="back-home-btn">Ana Sayfaya Dön</button>
            </div>
        `;
    }

    if (answersArea) answersArea.innerHTML = "";
    if (nextBtn) nextBtn.style.display = "none";
    if (progressFillEl) progressFillEl.style.width = "100%";
}