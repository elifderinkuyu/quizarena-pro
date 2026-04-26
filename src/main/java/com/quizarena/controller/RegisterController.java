package com.quizarena.controller;

import com.quizarena.User;
import com.quizarena.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@Controller
public class RegisterController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/register")
    public String registerPage() {
        return "register";
    }

    @PostMapping("/register")
    public String register(@RequestParam String username,
                           @RequestParam String password) {

        User user = new User();
        user.setUsername(username);
        user.setPassword(password);

        userRepository.save(user);

        return "redirect:/";
    }
}