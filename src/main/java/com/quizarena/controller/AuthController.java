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

    @PostMapping("/register")
    public String register(@RequestBody User user) {
        userRepository.save(user);
        return "Kayıt başarılı";
    }
}