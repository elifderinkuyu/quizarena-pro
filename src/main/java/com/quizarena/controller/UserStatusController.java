package com.quizarena.controller;

import com.quizarena.UserStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Controller
public class UserStatusController {

    private final Map<String, String> onlineUsers = new ConcurrentHashMap<>();

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/user.online")
    public void userOnline(@Payload UserStatus status) {
        onlineUsers.put(status.getUsername(), status.getSessionId());
        messagingTemplate.convertAndSend("/topic/online", onlineUsers.keySet());
        System.out.println("Kullanıcı çevrimiçi oldu: " + status.getUsername());
    }

    @MessageMapping("/user.offline")
    public void userOffline(@Payload UserStatus status) {
        onlineUsers.remove(status.getUsername());
        messagingTemplate.convertAndSend("/topic/online", onlineUsers.keySet());
        System.out.println("Kullanıcı çevrimdışı oldu: " + status.getUsername());
    }

    public Map<String, String> getOnlineUsers() {
        return onlineUsers;
    }
}