package com.quizarena.controller;

import com.quizarena.Score;
import com.quizarena.ScoreRepository;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
    public List<Object[]> getLeaderboard() {
        return scoreRepository.findLeaderboardByTotalScore();
    }

    @GetMapping("/profile/{username}")
    public Map<String, Object> getProfile(@PathVariable String username) {
        Integer totalScore = scoreRepository.getTotalScoreByUsername(username);
        Long quizCount = scoreRepository.getQuizCountByUsername(username);
        List<Object[]> bestCategoryList = scoreRepository.getBestCategoryByUsername(username);

        Integer totalCorrect = scoreRepository.getTotalCorrectByUsername(username);
        Integer totalWrong = scoreRepository.getTotalWrongByUsername(username);

        if (totalScore == null) {
            totalScore = 0;
        }

        if (quizCount == null) {
            quizCount = 0L;
        }

        if (totalCorrect == null) {
            totalCorrect = 0;
        }

        if (totalWrong == null) {
            totalWrong = 0;
        }

        String bestCategory = "-";

        if (bestCategoryList != null && !bestCategoryList.isEmpty()) {
            bestCategory = (String) bestCategoryList.get(0)[0];
        }

        int level = 1;

        if (totalScore >= 300) {
            level = 4;
        } else if (totalScore >= 200) {
            level = 3;
        } else if (totalScore >= 100) {
            level = 2;
        }

        Map<String, Object> profileData = new HashMap<>();
        profileData.put("username", username);
        profileData.put("totalScore", totalScore);
        profileData.put("quizCount", quizCount);
        profileData.put("level", level);
        profileData.put("bestCategory", bestCategory);
        profileData.put("correctCount", totalCorrect);
        profileData.put("wrongCount", totalWrong);

        return profileData;
    }
}