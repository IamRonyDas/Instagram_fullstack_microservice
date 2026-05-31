package com.instagram.notification.controller;

import com.instagram.notification.entity.Notification;
import com.instagram.notification.repository.NotificationRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    private final NotificationRepository notificationRepository;

    public NotificationController(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @PostMapping
    public ResponseEntity<Notification> createNotification(@RequestBody Notification notification) {
        // Prevent sending notification to self
        if (notification.getSenderUsername() != null && notification.getSenderUsername().equals(notification.getRecipientUsername())) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.ok(notificationRepository.save(notification));
    }

    @GetMapping("/{username}")
    public ResponseEntity<List<Notification>> getUserNotifications(@PathVariable String username) {
        return ResponseEntity.ok(notificationRepository.findByRecipientUsernameOrderByCreatedAtDesc(username));
    }
    
    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        Optional<Notification> notifOpt = notificationRepository.findById(id);
        if (notifOpt.isPresent()) {
            Notification notif = notifOpt.get();
            notif.setRead(true);
            notificationRepository.save(notif);
        }
        return ResponseEntity.ok().build();
    }
}
