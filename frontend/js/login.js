// Login sayfası JavaScript işlemleri
let stompClient = null;
let currentUser = null;

document.addEventListener('DOMContentLoaded', function () {

    // ========== ELEMENTLERİ YAKALA ==========
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.querySelector('.login-btn');
    const togglePasswordBtn = document.getElementById('togglePassword');

    // ========== ŞİFRE GÖSTER/SAKLA ==========
    togglePasswordBtn.addEventListener('click', function () {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        togglePasswordBtn.textContent = type === 'password' ? '👁️' : '🔓';
    });

    // ========== FORM GÖNDERİLİNCE ==========
    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();

        clearErrors();

        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        let hasError = false;

        if (username === '') {
            showError(usernameInput, '⚠️ Kullanıcı adı boş bırakılamaz!');
            hasError = true;
        }

        if (password === '') {
            showError(passwordInput, '⚠️ Şifre boş bırakılamaz!');
            hasError = true;
        }

        if (password !== '' && password.length < 4) {
            showError(passwordInput, '⚠️ Şifre en az 4 karakter olmalı!');
            hasError = true;
        }

        if (hasError) return;

        // ========== BACKEND'E İSTEK AT ==========
        loginBtn.classList.add('loading');
        loginBtn.textContent = '⏳ Giriş yapılıyor...';

        fetch(BASE_URL + '/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        })
            .then(function (response) {
                return response.text();
            })
            .then(function (data) {
                loginBtn.classList.remove('loading');
                loginBtn.textContent = 'GİRİŞ YAP';

                if (data === 'Giriş başarılı') {
                    currentUser = username;
                    localStorage.setItem('username', username);
                    
                    // WebSocket bağlantısını kur
                    connectWebSocket(username);
                    
                    // Ana sayfaya yönlendir
                    window.location.href = 'home.html';
                } else {
                    showError(usernameInput, '⚠️ Kullanıcı adı veya şifre hatalı!');
                    showError(passwordInput, '⚠️ Kullanıcı adı veya şifre hatalı!');
                }
            })
            .catch(function (error) {
                loginBtn.classList.remove('loading');
                loginBtn.textContent = 'GİRİŞ YAP';
                alert('⚠️ Sunucuya bağlanılamadı! Backend çalışıyor mu?');
                console.error('Hata:', error);
            });
    });

    // ========== WEBSOCKET BAĞLANTISI ==========
    function connectWebSocket(username) {
    const socket = new SockJS(WS_URL);
    stompClient = Stomp.over(socket);
    
    stompClient.connect({}, function(frame) {
        console.log('WebSocket bağlantısı kuruldu: ' + frame);
        
        stompClient.send("/app/user.online", {}, JSON.stringify({
            username: username,
            sessionId: sessionStorage.getItem('sessionId') || 'session_' + Date.now()
        }));
    }, function(error) {
        console.error('WebSocket bağlantı hatası:', error);
    });
}
    // ========== YARDIMCI FONKSİYONLAR ==========
    function clearErrors() {
        usernameInput.classList.remove('error');
        passwordInput.classList.remove('error');

        const oldErrors = document.querySelectorAll('.error-message');
        oldErrors.forEach(function (error) {
            error.remove();
        });
    }

    function showError(inputElement, message) {
        inputElement.classList.add('error');

        const errorDiv = document.createElement('div');
        errorDiv.classList.add('error-message');
        errorDiv.textContent = message;

        inputElement.parentElement.appendChild(errorDiv);
    }
});