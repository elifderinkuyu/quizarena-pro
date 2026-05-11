package com.quizarena;

public class UserStatus {
    private String username;
    private String sessionId;
    private boolean online;

    public UserStatus() {
    }

    public UserStatus(String username, String sessionId, boolean online) {
        this.username = username;
        this.sessionId = sessionId;
        this.online = online;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public boolean isOnline() {
        return online;
    }

    public void setOnline(boolean online) {
        this.online = online;
    }
}