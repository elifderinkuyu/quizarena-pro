package com.quizarena.controller;

import com.quizarena.User;
import com.quizarena.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class AuthController {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/register")
    public String register(@RequestBody User user) {
        User existingUser = userRepository.findByUsername(user.getUsername());

        if (existingUser != null) {
            return "Bu kullanıcı adı zaten alınmış!";
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);

        return "Kayıt başarılı";
    }

    @PostMapping("/login")
    public String login(@RequestBody User loginUser) {
        User user = userRepository.findByUsername(loginUser.getUsername());

        if (user != null && passwordEncoder.matches(loginUser.getPassword(), user.getPassword())) {
            return "Giriş başarılı";
        }

        return "Hatalı kullanıcı adı veya şifre!";
    }
}