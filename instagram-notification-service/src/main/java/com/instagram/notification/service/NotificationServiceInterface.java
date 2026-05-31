package com.instagram.notification.service;

import com.instagram.notification.entity.Notification;
import java.util.List;

public interface NotificationServiceInterface {
    Notification createNotification(Notification notification);
    List<Notification> getUserNotifications(String username);
    void markAsRead(Long id);
}
