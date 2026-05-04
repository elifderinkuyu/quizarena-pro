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

    if (!username) {
        window.location.href = 'index.html';
        return;
    }

    let selectedCategory = localStorage.getItem('selectedCategory');

    if (!selectedCategory) {
        selectedCategory = "Yazılım";
    }

    categoryName.textContent = selectedCategory;

    const questions = [
        {
            question: "HTML ne için kullanılır?",
            answers: ["Veritabanı", "Web sayfası", "Sunucu", "Donanım"],
            correct: 1
        },
        {
            question: "CSS ne işe yarar?",
            answers: ["Programlama dili", "Tasarım", "Veritabanı", "Sunucu"],
            correct: 1
        },
        {
            question: "JavaScript ne yapar?",
            answers: ["Tasarım", "Sayfayı hareketlendirir", "Veritabanı", "Donanım"],
            correct: 1
        }
    ];

    let currentQuestionIndex = 0;
    let score = 0;
    let correctCount = 0;
    let wrongCount = 0;
    let timeLeft = 15;
    let timer;

    totalQuestionText.textContent = questions.length;

    function startTimer() {
        clearInterval(timer);
        timeLeft = 15;
        timerText.textContent = timeLeft;

        timer = setInterval(function () {
            timeLeft--;
            timerText.textContent = timeLeft;

            if (timeLeft <= 0) {
                clearInterval(timer);
                wrongCount++;
                disableAnswers();
                showCorrectAnswer();
                nextBtn.disabled = false;
            }
        }, 1000);
    }

    function loadQuestion() {
        nextBtn.disabled = true;
        answersArea.innerHTML = "";

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

        startTimer();
    }

    function selectAnswer(button, index) {
        clearInterval(timer);

        const q = questions[currentQuestionIndex];
        const buttons = document.querySelectorAll('.answer-btn');

        buttons.forEach(function (btn) {
            btn.disabled = true;
        });

        if (index === q.correct) {
            button.classList.add("correct");
            score += 10;
            correctCount++;
        } else {
            button.classList.add("wrong");
            buttons[q.correct].classList.add("correct");
            wrongCount++;
        }

        scoreText.textContent = score;
        nextBtn.disabled = false;
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

        buttons.forEach(function (btn) {
            btn.disabled = true;
        });
    }

    function saveScoreToDatabase() {
        fetch('http://localhost:8080/api/score', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                category: selectedCategory,
                score: score
            })
        })
        .then(function (response) {
            return response.text();
        })
        .then(function (data) {
            console.log("Skor gönderildi:", data);
        })
        .catch(function (error) {
            console.error("Skor gönderilemedi:", error);
        });
    }

    function showResultScreen() {
        clearInterval(timer);

        saveScoreToDatabase();

        progressFill.style.width = "100%";
        questionText.textContent = "Quiz Tamamlandı 🎉";
        answersArea.innerHTML = "";

        const resultBox = document.createElement("div");
        resultBox.classList.add("result-box");

        resultBox.innerHTML = `
            <h2>Sonuç Ekranı</h2>
            <p class="result-category">Kategori: <strong>${selectedCategory}</strong></p>

            <div class="result-stats">
                <div class="result-item">
                    <span>🏆 Toplam Puan</span>
                    <strong>${score}</strong>
                </div>

                <div class="result-item">
                    <span>✅ Doğru</span>
                    <strong>${correctCount}</strong>
                </div>

                <div class="result-item">
                    <span>❌ Yanlış</span>
                    <strong>${wrongCount}</strong>
                </div>
            </div>

            <div class="result-actions">
                <button type="button" id="restartBtn" class="result-btn">🔁 Tekrar Oyna</button>
                <button type="button" id="homeBtn" class="result-btn secondary">🏠 Ana Sayfaya Dön</button>
            </div>
        `;

        answersArea.appendChild(resultBox);
        nextBtn.style.display = "none";

        document.getElementById("restartBtn").addEventListener("click", function () {
            window.location.reload();
        });

        document.getElementById("homeBtn").addEventListener("click", function () {
            window.location.href = "home.html";
        });
    }

    nextBtn.addEventListener("click", function () {
        currentQuestionIndex++;

        if (currentQuestionIndex < questions.length) {
            loadQuestion();
        } else {
            showResultScreen();
        }
    });

    backBtn.addEventListener("click", function () {
        window.location.href = "home.html";
    });

    loadQuestion();

});