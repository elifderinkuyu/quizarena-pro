package com.quizarena.controller;

import com.quizarena.ScoreRepository;
import com.quizarena.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ProfileController {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private ScoreRepository scoreRepository;

    @GetMapping("/login/{username}")
    public Map<String, Object> getUserProfile(@PathVariable String username) {
        Map<String, Object> profile = new HashMap<>();
        
        // Kullanıcı var mı kontrol et
        if (userRepository.findByUsername(username) == null) {
            profile.put("totalScore", 0);
            profile.put("quizCount", 0);
            profile.put("bestCategory", "-");
            profile.put("correctCount", 0);
            profile.put("wrongCount", 0);
            profile.put("rank", "-");
            return profile;
        }
        
        // Toplam puan
        Integer totalScore = scoreRepository.getTotalScoreByUsername(username);
        profile.put("totalScore", totalScore != null ? totalScore : 0);
        
        // Quiz sayısı
        Long quizCount = scoreRepository.getQuizCountByUsername(username);
        profile.put("quizCount", quizCount != null ? quizCount : 0);
        
        // En iyi kategori
        Object[] bestCategoryResult = scoreRepository.getBestCategoryByUsername(username).isEmpty() ? null : scoreRepository.getBestCategoryByUsername(username).get(0);
        profile.put("bestCategory", bestCategoryResult != null ? bestCategoryResult[0] : "-");
        
        // Doğru sayısı
        Integer correctCount = scoreRepository.getTotalCorrectByUsername(username);
        profile.put("correctCount", correctCount != null ? correctCount : 0);
        
        // Yanlış sayısı
        Integer wrongCount = scoreRepository.getTotalWrongByUsername(username);
        profile.put("wrongCount", wrongCount != null ? wrongCount : 0);
        
        // Sıralama
        Integer rank = scoreRepository.getUserRank(username);
        profile.put("rank", rank != null && rank > 0 ? rank : "-");
        
        return profile;
    }
}