package com.quizarena.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.Map;
import java.util.Queue;

@Controller
public class MatchController {

    private final Queue<String> waitingPlayers = new LinkedList<>();
    private final Map<String, Map<String, Object>> matchData = new HashMap<>();

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/match.start")
    public synchronized void startMatch(@Payload String username) {
        System.out.println("Eşleşme isteği: " + username);
        
        // Null ve boş kontrol
        if (username == null || username.trim().isEmpty()) {
            System.out.println("Geçersiz kullanıcı adı!");
            return;
        }
        
        username = username.trim();
        
        // Eğer bekleyen oyuncu varsa ve o oyuncu kendimiz değilse eşleş
        if (!waitingPlayers.isEmpty()) {
            String firstPlayer = waitingPlayers.peek();
            
            if (firstPlayer != null && !firstPlayer.equals(username)) {
                String opponent = waitingPlayers.poll();
                System.out.println("Eşleşme bulundu: " + username + " vs " + opponent);
                
                // Maç bilgilerini sakla
                Map<String, Object> match = new HashMap<>();
                match.put("player1", opponent);
                match.put("player2", username);
                match.put("score1", 0);
                match.put("score2", 0);
                
                String matchId = opponent + "_" + username;
                matchData.put(matchId, match);
                
                // İki kullanıcıya da eşleşme bildirimi gönder
                // Kullanıcı bazlı destination yerine topic tabanlı user topic kullanalım
                messagingTemplate.convertAndSend("/topic/match/found/" + username, opponent);
                messagingTemplate.convertAndSend("/topic/match/found/" + opponent, username);
                
                System.out.println("Match ID: " + matchId + " - Oyuncu 1: " + opponent + ", Oyuncu 2: " + username);
            } else {
                // Kendisi zaten beklemede, kuyruğa ekleme
                System.out.println("Oyuncu zaten beklemede: " + username);
            }
        } else {
            // Hiç oyuncu beklemede değil, bunu ekle
            waitingPlayers.add(username);
            System.out.println("Bekleme kuyruğuna eklendi: " + username + " (Bekleyen: " + waitingPlayers.size() + ")");
        }
    }

    @MessageMapping("/match.score.update")
    public void updateScore(@Payload Map<String, Object> scoreData) {
        String username = (String) scoreData.get("username");
        Integer score = ((Number) scoreData.get("score")).intValue();
        String opponent = (String) scoreData.get("opponent");
        
        System.out.println("Skor güncellemesi: " + username + " = " + score);
        
        // Rakibe skor güncellemesini topic bazlı olarak gönder
        messagingTemplate.convertAndSend("/topic/score.update/" + opponent, scoreData);
    }
    
    public int getWaitingPlayerCount() {
        return waitingPlayers.size();
    }
    
    public Map<String, Map<String, Object>> getMatchData() {
        return matchData;
    }
}