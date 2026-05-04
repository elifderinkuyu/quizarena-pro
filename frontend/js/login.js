// Login sayfası JavaScript işlemleri
document.addEventListener('DOMContentLoaded', function () {

    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.querySelector('.login-btn');

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

        loginBtn.classList.add('loading');
        loginBtn.textContent = '⏳ Giriş yapılıyor...';

        fetch('http://localhost:8080/api/login', {
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
                    localStorage.setItem('username', username);
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