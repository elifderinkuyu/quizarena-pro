package com.quizarena.controller;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.Map;
import java.util.Queue;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class MatchController {

    private final Queue<String> waitingPlayers = new LinkedList<>();
    private final Map<String, Map<String, Object>> matchData = new HashMap<>();

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/match.start")
    public synchronized void startMatch(@Payload String username) {
        System.out.println("Eşleşme isteği: " + username);

        if (username == null || username.trim().isEmpty()) {
            System.out.println("Geçersiz kullanıcı adı!");
            return;
        }

        username = username.trim();

        if (!waitingPlayers.isEmpty()) {
            String firstPlayer = waitingPlayers.peek();

            if (firstPlayer != null && !firstPlayer.equals(username)) {
                String opponent = waitingPlayers.poll();

                System.out.println("Eşleşme bulundu: " + username + " vs " + opponent);

                Map<String, Object> match = new HashMap<>();
                match.put("player1", opponent);
                match.put("player2", username);
                match.put("score1", 0);
                match.put("score2", 0);

                String matchId = opponent + "_" + username;
                matchData.put(matchId, match);

                messagingTemplate.convertAndSend("/topic/match/found/" + safeTopicName(username), opponent);
                messagingTemplate.convertAndSend("/topic/match/found/" + safeTopicName(opponent), username);

                System.out.println("Match ID: " + matchId + " - Oyuncu 1: " + opponent + ", Oyuncu 2: " + username);
            } else {
                System.out.println("Oyuncu zaten beklemede: " + username);
            }
        } else {
            waitingPlayers.add(username);
            System.out.println("Bekleme kuyruğuna eklendi: " + username + " (Bekleyen: " + waitingPlayers.size() + ")");
        }
    }

    @MessageMapping("/match.score.update")
    public void updateScore(@Payload Map<String, Object> scoreData) {
        String username = (String) scoreData.get("username");
        String opponent = (String) scoreData.get("opponent");

        if (opponent == null || opponent.trim().isEmpty()) {
            System.out.println("Rakip bilgisi yok, skor güncellemesi gönderilemedi.");
            return;
        }

        Integer score = ((Number) scoreData.get("score")).intValue();

        System.out.println("Skor güncellemesi: " + username + " = " + score);

        messagingTemplate.convertAndSend(
                "/topic/score.update/" + safeTopicName(opponent),
                scoreData
        );
    }

    @MessageMapping("/match.question.update")
    public void updateQuestion(@Payload Map<String, Object> questionData) {
        String username = (String) questionData.get("username");
        String opponent = (String) questionData.get("opponent");

        System.out.println("Soru güncellemesi: " + username + " -> " + questionData);

        if (opponent == null || opponent.trim().isEmpty()) {
            System.out.println("Rakip bilgisi yok, soru güncellemesi gönderilemedi.");
            return;
        }

        messagingTemplate.convertAndSend(
                "/topic/question.update/" + safeTopicName(opponent),
                questionData
        );
    }

    private String safeTopicName(String username) {
        return username.trim().replaceAll("\\s+", "_");
    }

    public int getWaitingPlayerCount() {
        return waitingPlayers.size();
    }

    public Map<String, Map<String, Object>> getMatchData() {
        return matchData;
    }
}