package com.quizarena.controller;

import com.quizarena.Score;
import com.quizarena.ScoreRepository;
import com.quizarena.User;
import com.quizarena.UserRepository;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ScoreController {

    private final ScoreRepository scoreRepository;
    private final UserRepository userRepository; // 🆕

    public ScoreController(ScoreRepository scoreRepository, UserRepository userRepository) {
        this.scoreRepository = scoreRepository;
        this.userRepository = userRepository; // 🆕
    }

    @PostMapping("/score")
    public String saveScore(@RequestBody Score score) {
        // 🆕 username'den User'ı bul ve bağla
        User user = userRepository.findByUsername(score.getUsername());
        if (user != null) {
            score.setUser(user);
        }
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
        Integer rank = scoreRepository.getUserRank(username);

        if (totalScore == null) totalScore = 0;
        if (quizCount == null) quizCount = 0L;
        if (totalCorrect == null) totalCorrect = 0;
        if (totalWrong == null) totalWrong = 0;
        if (rank == null) rank = 0;

        String bestCategory = "-";
        if (bestCategoryList != null && !bestCategoryList.isEmpty()) {
            bestCategory = (String) bestCategoryList.get(0)[0];
        }

        int level = 1;
        if (totalScore >= 300) level = 4;
        else if (totalScore >= 200) level = 3;
        else if (totalScore >= 100) level = 2;

        Map<String, Object> profileData = new HashMap<>();
        profileData.put("username", username);
        profileData.put("totalScore", totalScore);
        profileData.put("quizCount", quizCount);
        profileData.put("level", level);
        profileData.put("bestCategory", bestCategory);
        profileData.put("correctCount", totalCorrect);
        profileData.put("wrongCount", totalWrong);
        profileData.put("rank", rank);

        return profileData;
    }
}