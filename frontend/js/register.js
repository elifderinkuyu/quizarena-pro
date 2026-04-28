/* 
  ========================================
  REGISTER.JS - Kayıt Ol Sayfası İşlemleri
  ========================================
*/

document.addEventListener('DOMContentLoaded', function() {
    
    const registerForm = document.getElementById('registerForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        clearAllErrors();
        
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();
        const confirmPassword = confirmPasswordInput.value.trim();
        
        let hasError = false;
        
        if (username === '') {
            showError(usernameInput, '⚠️ Kullanıcı adı boş bırakılamaz!');
            hasError = true;
        } else if (username.length < 3) {
            showError(usernameInput, '⚠️ Kullanıcı adı en az 3 karakter olmalı!');
            hasError = true;
        }
        
        if (password === '') {
            showError(passwordInput, '⚠️ Şifre boş bırakılamaz!');
            hasError = true;
        } else if (password.length < 4) {
            showError(passwordInput, '⚠️ Şifre en az 4 karakter olmalı!');
            hasError = true;
        }
        
        if (confirmPassword === '') {
            showError(confirmPasswordInput, '⚠️ Şifre tekrar boş bırakılamaz!');
            hasError = true;
        } else if (password !== confirmPassword) {
            showError(confirmPasswordInput, '⚠️ Şifreler eşleşmiyor!');
            hasError = true;
        }
        
        // ========== 5. HATA YOKSA BACKEND'E KAYIT İSTEĞİ AT ==========
        if (!hasError) {
            const registerBtn = document.querySelector('.register-btn');
            registerBtn.classList.add('loading');
            registerBtn.textContent = '⏳ Kayıt yapılıyor...';
            
            // 🔥 Backend'e POST isteği at (SADECE username ve password gönder)
            fetch('http://localhost:8080/api/register', {
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
                return response.text();
            })
            .then(function(data) {
                registerBtn.classList.remove('loading');
                registerBtn.textContent = 'KAYIT OL';
                
                if (data === 'Kayıt başarılı') {
                    alert('✅ Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz.');
                    window.location.href = 'index.html';
                } else if (data === 'Bu kullanıcı adı zaten alınmış!') {
                    showError(usernameInput, '⚠️ Bu kullanıcı adı zaten alınmış!');
                } else {
                    alert('Bir hata oluştu: ' + data);
                }
            })
            .catch(function(error) {
                registerBtn.classList.remove('loading');
                registerBtn.textContent = 'KAYIT OL';
                alert('⚠️ Sunucuya bağlanılamadı! Backend çalışıyor mu?');
                console.error('Hata:', error);
            });
        }
        
    });
    
    function clearAllErrors() {
        usernameInput.classList.remove('error');
        passwordInput.classList.remove('error');
        confirmPasswordInput.classList.remove('error');
        
        const oldErrors = document.querySelectorAll('.error-message');
        oldErrors.forEach(function(error) {
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