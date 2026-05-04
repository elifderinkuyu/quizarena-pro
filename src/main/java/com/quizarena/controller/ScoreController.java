
package com.quizarena.controller;

import com.quizarena.Score;
import com.quizarena.ScoreRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class ScoreController {

    private final ScoreRepository scoreRepository;

    public ScoreController(ScoreRepository scoreRepository) {
        this.scoreRepository = scoreRepository;
    }

    @PostMapping("/score")
    public String saveScore(@RequestBody Score score) {
        scoreRepository.save(score);
        return "Skor kaydedildi";
    }

    @GetMapping("/leaderboard")
    public List<Score> getLeaderboard() {
        return scoreRepository.findTop10ByOrderByScoreDesc();
    }
}