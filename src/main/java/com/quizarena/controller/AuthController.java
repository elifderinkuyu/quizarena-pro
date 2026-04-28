
package com.quizarena.controller;

import org.springframework.web.bind.annotation.*;
import com.quizarena.User;
import com.quizarena.UserRepository;

@RestController
@RequestMapping("/api")
public class AuthController {

    private final UserRepository userRepository;

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // ========== KAYIT OL ==========
    @PostMapping("/register")
    public String register(@RequestBody User user) {
        // Aynı kullanıcı adı var mı kontrol et
        User existingUser = userRepository.findByUsername(user.getUsername());
        if (existingUser != null) {
            return "Bu kullanıcı adı zaten alınmış!";
        }
        
        userRepository.save(user);
        return "Kayıt başarılı";
    }

    // ========== GİRİŞ YAP ==========
    @PostMapping("/login")
    public String login(@RequestBody User loginUser) {
        User user = userRepository.findByUsername(loginUser.getUsername());
        
        if (user != null && user.getPassword().equals(loginUser.getPassword())) {
            return "Giriş başarılı";
        }
        
        return "Hatalı kullanıcı adı veya şifre!";
    }
}