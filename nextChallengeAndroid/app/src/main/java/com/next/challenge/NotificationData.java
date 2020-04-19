package com.next.challenge;

public class NotificationData {
    private String NotificationType;
    private String NotificationFrom;
    private String NotificationTo;
    private String Data;
    public String getData() {
        return Data;
    }
    public void setData(String data) {
        Data = data;
    }
    public String getNotificationType() {
        return NotificationType;
    }
    public void setNotificationType(String notificationType) {
        NotificationType = notificationType;
    }
    public String getNotificationFrom() {
        return NotificationFrom;
    }
    public void setNotificationFrom(String notificationFrom) {
        NotificationFrom = notificationFrom;
    }
    public String getNotificationTo() {
        return NotificationTo;
    }
    public void setNotificationTo(String notificationTo) {
        NotificationTo = notificationTo;
    }

}
