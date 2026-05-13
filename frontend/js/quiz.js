let stompClient = null;
let currentUser = null;

document.addEventListener('DOMContentLoaded', function () {

    const categoryName = document.getElementById('categoryName');
    const questionText = document.getElementById('questionText');
    const answersArea = document.getElementById('answersArea');
    const nextBtn = document.getElementById('nextBtn');
    const scoreText = document.getElementById('score');
    const timerText = document.getElementById('timer');
    const currentQuestionText = document.getElementById('currentQuestion');
    const totalQuestionText = document.getElementById('totalQuestion');
    const progressFill = document.getElementById('progressFill');
    const backBtn = document.getElementById('backBtn');

    const username = localStorage.getItem('username');
    currentUser = username;

    if (!username) {
        window.location.href = 'index.html';
        return;
    }

    if (!stompClient || !stompClient.connected) {
        connectWebSocket(username);
    }

    let selectedCategory = localStorage.getItem('selectedCategory');
    let selectedLevel = localStorage.getItem('selectedLevel');

    if (!selectedCategory) selectedCategory = "Yazılım";
    if (!selectedLevel) selectedLevel = "Kolay";

    categoryName.textContent = selectedCategory + " (" + selectedLevel + ")";

    let questions = [];
    let currentQuestionIndex = 0;
    let score = 0;
    let correctCount = 0;
    let wrongCount = 0;
    let timeLeft = 15;
    let timer;
    let scoreSaved = false;
    let answeredCurrentQuestion = false;

    const QUIZ_STATE_KEY = `quiz_state_${username}_${selectedCategory}_${selectedLevel}`;

    function saveQuizState() {
        const state = {
            currentQuestionIndex,
            score,
            correctCount,
            wrongCount,
            timeLeft,
            answeredCurrentQuestion
        };

        localStorage.setItem(QUIZ_STATE_KEY, JSON.stringify(state));
        console.log("Quiz state kaydedildi:", QUIZ_STATE_KEY, state);
    }

    function loadQuizState() {
        const saved = localStorage.getItem(QUIZ_STATE_KEY);

        console.log("Yüklenecek quiz state key:", QUIZ_STATE_KEY);
        console.log("Quiz localStorage içeriği:", saved);

        if (!saved) return false;

        try {
            const state = JSON.parse(saved);

            currentQuestionIndex = Number(state.currentQuestionIndex ?? 0);
            score = Number(state.score ?? 0);
            correctCount = Number(state.correctCount ?? 0);
            wrongCount = Number(state.wrongCount ?? 0);
            timeLeft = Number(state.timeLeft ?? 15);
            answeredCurrentQuestion = Boolean(state.answeredCurrentQuestion);

            console.log("Quiz state başarıyla yüklendi:", state);
            return true;
        } catch (error) {
            console.error("Quiz state yüklenemedi:", error);
            return false;
        }
    }

    function clearQuizState() {
        localStorage.removeItem(QUIZ_STATE_KEY);
    }

    function getPointByLevel() {
        if (selectedLevel === 'Kolay') return 10;
        if (selectedLevel === 'Orta') return 25;
        if (selectedLevel === 'Zor') return 50;
        return 10;
    }

    nextBtn.disabled = true;
    questionText.textContent = "Sorular yükleniyor...";

    function connectWebSocket(username) {
        const socket = new SockJS(WS_URL);
        stompClient = Stomp.over(socket);

        stompClient.connect({}, function (frame) {
            console.log('Quiz sayfası WebSocket bağlantısı kuruldu: ' + frame);

            let sessionId = sessionStorage.getItem('sessionId');

            if (!sessionId) {
                sessionId = 'session_' + Date.now();
                sessionStorage.setItem('sessionId', sessionId);
            }

            stompClient.send("/app/user.online", {}, JSON.stringify({
                username: username,
                sessionId: sessionId
            }));

        }, function (error) {
            console.error('WebSocket bağlantı hatası:', error);
        });
    }

    function loadQuestionsFromDatabase() {
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
                    questionText.textContent = "Bu kategori ve seviyeye ait soru bulunamadı.";
                    answersArea.innerHTML = "";
                    totalQuestionText.textContent = "0";
                    currentQuestionText.textContent = "0";
                    return;
                }

                loadQuizState();

                if (currentQuestionIndex >= questions.length) {
                    currentQuestionIndex = 0;
                    score = 0;
                    correctCount = 0;
                    wrongCount = 0;
                    timeLeft = 15;
                    answeredCurrentQuestion = false;
                    clearQuizState();
                }

                totalQuestionText.textContent = questions.length;
                scoreText.textContent = score;

                loadQuestion();
            })
            .catch(function (error) {
                console.error("Soru çekme hatası:", error);
                questionText.textContent = "Sorular yüklenirken hata oluştu.";
            });
    }

    function startTimer() {
        clearInterval(timer);

        if (timeLeft === null || timeLeft === undefined || timeLeft <= 0 || timeLeft > 15) {
            timeLeft = 15;
        }

        timerText.textContent = timeLeft;

        timer = setInterval(function () {
            timeLeft--;
            timerText.textContent = timeLeft;

            saveQuizState();

            if (timeLeft <= 0) {
                clearInterval(timer);

                wrongCount++;
                answeredCurrentQuestion = true;

                disableAnswers();
                showCorrectAnswer();

                nextBtn.disabled = false;
                saveQuizState();
            }
        }, 1000);
    }

    function loadQuestion() {
        if (!questions[currentQuestionIndex]) {
            showResultScreen();
            return;
        }

        nextBtn.disabled = true;
        answersArea.innerHTML = "";

        saveQuizState();

        const q = questions[currentQuestionIndex];

        questionText.textContent = q.question;
        currentQuestionText.textContent = currentQuestionIndex + 1;

        const progressPercent = (currentQuestionIndex / questions.length) * 100;
        progressFill.style.width = progressPercent + "%";

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
            nextBtn.disabled = false;
            timerText.textContent = timeLeft;
            clearInterval(timer);
        } else {
            startTimer();
        }

        saveQuizState();
    }

    function selectAnswer(button, index) {
        clearInterval(timer);

        const q = questions[currentQuestionIndex];
        const buttons = document.querySelectorAll('.answer-btn');

        buttons.forEach(btn => btn.disabled = true);

        answeredCurrentQuestion = true;

        if (index === q.correct) {
            button.classList.add("correct");
            score += getPointByLevel();
            correctCount++;
        } else {
            button.classList.add("wrong");

            if (buttons[q.correct]) {
                buttons[q.correct].classList.add("correct");
            }

            wrongCount++;
        }

        scoreText.textContent = score;
        nextBtn.disabled = false;

        saveQuizState();
    }

    function showCorrectAnswer() {
        const q = questions[currentQuestionIndex];

        if (!q) return;

        const buttons = document.querySelectorAll('.answer-btn');

        if (buttons[q.correct]) {
            buttons[q.correct].classList.add("correct");
        }
    }

    function disableAnswers() {
        const buttons = document.querySelectorAll('.answer-btn');
        buttons.forEach(btn => btn.disabled = true);
    }

    function saveScoreToDatabase() {
        if (scoreSaved) return;
        scoreSaved = true;

        fetch(BASE_URL + '/api/score', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                category: selectedCategory,
                level: selectedLevel,
                score: score,
                correctCount: correctCount,
                wrongCount: wrongCount
            })
        })
            .then(function (response) {
                if (!response.ok) {
                    throw new Error("Skor kaydedilemedi");
                }
                return response.text();
            })
            .then(function (data) {
                console.log("Skor başarıyla kaydedildi:", data);
            })
            .catch(function (error) {
                console.error("Skor kaydetme hatası:", error);
                scoreSaved = false;
            });
    }

    function showResultScreen() {
        clearInterval(timer);
        clearQuizState();
        saveScoreToDatabase();

        progressFill.style.width = "100%";
        questionText.textContent = "Quiz Tamamlandı 🎉";
        answersArea.innerHTML = "";

        const resultBox = document.createElement("div");
        resultBox.classList.add("result-box");

        resultBox.innerHTML = `
            <h2>Sonuç</h2>
            <p>Kategori: ${selectedCategory}</p>
            <p>Seviye: ${selectedLevel}</p>
            <p>Doğru Sayısı: ${correctCount}</p>
            <p>Yanlış Sayısı: ${wrongCount}</p>
            <p>Puan: ${score}</p>
        `;

        answersArea.appendChild(resultBox);
        nextBtn.style.display = "none";
    }

    nextBtn.addEventListener("click", function () {
        currentQuestionIndex++;
        timeLeft = 15;
        answeredCurrentQuestion = false;

        saveQuizState();

        if (currentQuestionIndex < questions.length) {
            loadQuestion();
        } else {
            showResultScreen();
        }
    });

    backBtn.addEventListener("click", function () {
        saveQuizState();
        window.location.href = "home.html";
    });

    window.addEventListener("beforeunload", function () {
        saveQuizState();
    });

    loadQuestionsFromDatabase();

});