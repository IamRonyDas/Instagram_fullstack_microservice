package com.instagram.notification.service;

import com.instagram.notification.entity.Notification;
import com.instagram.notification.repository.NotificationRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class NotificationService implements NotificationServiceInterface {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Override
    public Notification createNotification(Notification notification) {
        // Avoid self-notifications
        if (notification.getSenderUsername() != null
                && notification.getSenderUsername().equals(notification.getRecipientUsername())) {
            return null;
        }
        return notificationRepository.save(notification);
    }

    @Override
    public List<Notification> getUserNotifications(String username) {
        return notificationRepository.findByRecipientUsernameOrderByCreatedAtDesc(username);
    }

    @Override
    public void markAsRead(Long id) {
        Optional<Notification> opt = notificationRepository.findById(id);
        opt.ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }
}
