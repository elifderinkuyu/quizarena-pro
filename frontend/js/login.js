// Login sayfası JavaScript işlemleri
document.addEventListener('DOMContentLoaded', function() {
    
    // Elementleri yakala
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    
    // Form gönderilince...
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault(); // ⚠️ EN BAŞTA sayfa yenilenmesini engelle!
        
        // ========== 1. ÖNCEKİ HATALARI TEMİZLE ==========
        usernameInput.classList.remove('error');
        passwordInput.classList.remove('error');
        
        const oldErrors = document.querySelectorAll('.error-message');
        oldErrors.forEach(error => {
            error.remove();
        });
        
        // ========== 2. DEĞERLERİ AL ==========
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();
        
        // ========== 3. KONTROLLER ==========
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
        
        // ========== 4. HATA YOKSA BACKEND'E İSTEK AT ==========
        if (!hasError) {
            const loginBtn = document.querySelector('.login-btn');
            
            // Loading durumuna geç
            loginBtn.classList.add('loading');
            loginBtn.textContent = '⏳ Giriş yapılıyor...';
            
            // 🔥 Backend'e POST isteği at
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
            .then(function(response) {
                // Backend'den gelen cevabı text olarak al
                return response.text();
            })
            .then(function(data) {
                // Loading'i kaldır
                loginBtn.classList.remove('loading');
                loginBtn.textContent = 'GİRİŞ YAP';
                
                // Backend'in cevabına göre işlem yap
                if (data === 'Giriş başarılı') {
                    // Başarılı → Ana sayfaya yönlendir
                    window.location.href = 'home.html';
                } else if (data === 'Hatalı kullanıcı adı veya şifre!') {
                    // Şifre yanlış
                    showError(passwordInput, '⚠️ Kullanıcı adı veya şifre hatalı!');
                    showError(usernameInput, '⚠️ Kullanıcı adı veya şifre hatalı!');
                } else {
                    // Beklenmeyen cevap
                    alert('Bir hata oluştu: ' + data);
                }
            })
            .catch(function(error) {
                // Bağlantı hatası (backend çalışmıyor olabilir)
                loginBtn.classList.remove('loading');
                loginBtn.textContent = 'GİRİŞ YAP';
                alert('⚠️ Sunucuya bağlanılamadı! Backend çalışıyor mu?');
                console.error('Hata:', error);
            });
        }
        
    });
    
    // ========== YARDIMCI FONKSİYON: Hata Gösterme ==========
    function showError(inputElement, message) {
        inputElement.classList.add('error');
        
        const errorDiv = document.createElement('div');
        errorDiv.classList.add('error-message');
        errorDiv.textContent = message;
        
        inputElement.parentElement.appendChild(errorDiv);
    }
    
});