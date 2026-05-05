
package com.quizarena;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "scores")
public class Score {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;
    private String category;

    @Column(name = "level")
    private String level; // 🔥 EKLEDİK

    private int score;

    @Column(name = "correct_count")
    private int correctCount;

    @Column(name = "wrong_count")
    private int wrongCount;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public Score() {
    }

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // GETTER - SETTER

    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getLevel() { // 🔥 EKLEDİK
        return level;
    }

    public void setLevel(String level) { // 🔥 EKLEDİK
        this.level = level;
    }

    public int getScore() {
        return score;
    }

    public void setScore(int score) {
        this.score = score;
    }

    public int getCorrectCount() {
        return correctCount;
    }

    public void setCorrectCount(int correctCount) {
        this.correctCount = correctCount;
    }

    public int getWrongCount() {
        return wrongCount;
    }

    public void setWrongCount(int wrongCount) {
        this.wrongCount = wrongCount;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}