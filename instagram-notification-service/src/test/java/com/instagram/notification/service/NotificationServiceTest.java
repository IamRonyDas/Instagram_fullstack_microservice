package com.instagram.notification.service;

import com.instagram.notification.entity.Notification;
import com.instagram.notification.repository.NotificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock private NotificationRepository notificationRepository;
    private NotificationService notificationService;

    @BeforeEach
    void setUp() { notificationService = new NotificationService(notificationRepository); }

    @Test
    @DisplayName("Create: saves and returns notification")
    void create_success() {
        Notification n = new Notification();
        n.setSenderUsername("alice");
        n.setRecipientUsername("bob");
        when(notificationRepository.save(n)).thenReturn(n);
        assertNotNull(notificationService.createNotification(n));
        verify(notificationRepository).save(n);
    }

    @Test
    @DisplayName("Create: returns null for self-notification")
    void create_selfNotification_returnsNull() {
        Notification n = new Notification();
        n.setSenderUsername("alice");
        n.setRecipientUsername("alice");
        assertNull(notificationService.createNotification(n));
        verify(notificationRepository, never()).save(any());
    }

    @Test
    @DisplayName("Create: null sender is allowed")
    void create_nullSender_saves() {
        Notification n = new Notification();
        n.setSenderUsername(null);
        n.setRecipientUsername("bob");
        when(notificationRepository.save(n)).thenReturn(n);
        assertNotNull(notificationService.createNotification(n));
    }

    @Test
    @DisplayName("Get notifications: returns list for user")
    void getNotifications_returnsList() {
        when(notificationRepository.findByRecipientUsernameOrderByCreatedAtDesc("bob"))
                .thenReturn(List.of(new Notification(), new Notification()));
        assertEquals(2, notificationService.getUserNotifications("bob").size());
    }

    @Test
    @DisplayName("Get notifications: empty when none")
    void getNotifications_empty() {
        when(notificationRepository.findByRecipientUsernameOrderByCreatedAtDesc("nobody"))
                .thenReturn(List.of());
        assertTrue(notificationService.getUserNotifications("nobody").isEmpty());
    }

    @Test
    @DisplayName("MarkAsRead: sets isRead=true and saves")
    void markAsRead_success() {
        Notification n = new Notification();
        n.setRead(false);
        when(notificationRepository.findById(1L)).thenReturn(Optional.of(n));
        notificationService.markAsRead(1L);
        assertTrue(n.isRead());
        verify(notificationRepository).save(n);
    }

    @Test
    @DisplayName("MarkAsRead: no-op when not found")
    void markAsRead_notFound_noOp() {
        when(notificationRepository.findById(99L)).thenReturn(Optional.empty());
        notificationService.markAsRead(99L);
        verify(notificationRepository, never()).save(any());
    }
}
