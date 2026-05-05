
package com.quizarena.controller;

import com.quizarena.Question;
import com.quizarena.QuestionRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/questions")
public class QuestionController {

    private final QuestionRepository questionRepository;

    public QuestionController(QuestionRepository questionRepository) {
        this.questionRepository = questionRepository;
    }

    @GetMapping
    public List<Question> getQuestions(
            @RequestParam String category,
            @RequestParam String level
    ) {
        return questionRepository.findByCategoryAndLevel(category, level);
    }
}