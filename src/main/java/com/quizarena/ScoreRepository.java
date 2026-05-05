

package com.quizarena;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface ScoreRepository extends JpaRepository<Score, Long> {

    @Query("SELECT s.username, SUM(s.score) FROM Score s GROUP BY s.username ORDER BY SUM(s.score) DESC")
    List<Object[]> findLeaderboardByTotalScore();
}