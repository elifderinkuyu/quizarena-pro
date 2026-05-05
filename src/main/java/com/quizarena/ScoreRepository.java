
package com.quizarena;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ScoreRepository extends JpaRepository<Score, Long> {

    @Query("SELECT s.username, SUM(s.score) FROM Score s GROUP BY s.username ORDER BY SUM(s.score) DESC")
    List<Object[]> findLeaderboardByTotalScore();

    @Query("SELECT SUM(s.score) FROM Score s WHERE s.username = :username")
    Integer getTotalScoreByUsername(@Param("username") String username);

    @Query("SELECT COUNT(s) FROM Score s WHERE s.username = :username")
    Long getQuizCountByUsername(@Param("username") String username);

    @Query("SELECT s.category, SUM(s.score) FROM Score s WHERE s.username = :username GROUP BY s.category ORDER BY SUM(s.score) DESC")
    List<Object[]> getBestCategoryByUsername(@Param("username") String username);

    @Query("SELECT SUM(s.correctCount) FROM Score s WHERE s.username = :username")
    Integer getTotalCorrectByUsername(@Param("username") String username);

    @Query("SELECT SUM(s.wrongCount) FROM Score s WHERE s.username = :username")
    Integer getTotalWrongByUsername(@Param("username") String username);
}