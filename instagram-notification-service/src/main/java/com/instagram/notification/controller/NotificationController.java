package com.instagram.notification.controller;

import com.instagram.notification.entity.Notification;
import com.instagram.notification.service.NotificationServiceInterface;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    private final NotificationServiceInterface notificationService;

    public NotificationController(NotificationServiceInterface notificationService) {
        this.notificationService = notificationService;
    }

    @PostMapping
    public ResponseEntity<Notification> createNotification(@RequestBody Notification notification) {
        Notification saved = notificationService.createNotification(notification);
        if (saved == null) {
            return ResponseEntity.ok().build(); // self-notification — silently ignored
        }
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/{username}")
    public ResponseEntity<List<Notification>> getUserNotifications(@PathVariable String username) {
        return ResponseEntity.ok(notificationService.getUserNotifications(username));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }
}
