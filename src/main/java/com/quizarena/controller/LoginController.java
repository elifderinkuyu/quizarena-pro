package com.quizarena.controller;

import com.quizarena.User;
import com.quizarena.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@Controller
public class LoginController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/login")
    public String loginPage() {
        return "login";
    }

    @PostMapping("/login")
    public String login(@RequestParam String username,
                        @RequestParam String password) {

        User user = userRepository.findByUsername(username);

        if (user != null && user.getPassword().equals(password)) {
            return "redirect:/";
        }

        return "redirect:/login";
    }
}