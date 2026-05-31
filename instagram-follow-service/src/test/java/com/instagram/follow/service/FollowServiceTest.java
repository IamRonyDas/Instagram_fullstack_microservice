package com.instagram.follow.service;

import com.instagram.follow.entity.UserFollow;
import com.instagram.follow.repository.FollowRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FollowServiceTest {

    @Mock private FollowRepository followRepository;
    @Mock private RestTemplate restTemplate;

    private FollowService followService;

    @BeforeEach
    void setUp() {
        followService = new FollowService(followRepository, restTemplate);
    }

    // ─── followUser ─────────────────────────────────────────────────────────────

    @Test
    @DisplayName("Follow: success — saves new follow and sends notification")
    void follow_success() {
        when(followRepository.findByFollowerUsernameAndFollowingUsername("alice", "bob"))
                .thenReturn(Optional.empty());
        when(followRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(restTemplate.postForEntity(anyString(), any(), eq(String.class))).thenReturn(null);

        Map<String, String> result = followService.followUser("alice", "bob");

        assertEquals("ok", result.get("status"));
        verify(followRepository).save(any(UserFollow.class));
    }

    @Test
    @DisplayName("Follow: already following — returns error status")
    void follow_alreadyFollowing() {
        when(followRepository.findByFollowerUsernameAndFollowingUsername("alice", "bob"))
                .thenReturn(Optional.of(new UserFollow("alice", "bob")));

        Map<String, String> result = followService.followUser("alice", "bob");

        assertEquals("already_following", result.get("status"));
        verify(followRepository, never()).save(any());
    }

    // ─── unfollowUser ───────────────────────────────────────────────────────────

    @Test
    @DisplayName("Unfollow: success — deletes existing follow")
    void unfollow_success() {
        UserFollow uf = new UserFollow("alice", "bob");
        when(followRepository.findByFollowerUsernameAndFollowingUsername("alice", "bob"))
                .thenReturn(Optional.of(uf));

        Map<String, String> result = followService.unfollowUser("alice", "bob");

        assertEquals("ok", result.get("status"));
        verify(followRepository).delete(uf);
    }

    @Test
    @DisplayName("Unfollow: not following — returns error status")
    void unfollow_notFollowing() {
        when(followRepository.findByFollowerUsernameAndFollowingUsername("alice", "bob"))
                .thenReturn(Optional.empty());

        Map<String, String> result = followService.unfollowUser("alice", "bob");

        assertEquals("not_following", result.get("status"));
        verify(followRepository, never()).delete(any());
    }

    // ─── isFollowing ────────────────────────────────────────────────────────────

    @Test
    @DisplayName("isFollowing: true when follow record exists")
    void isFollowing_true() {
        when(followRepository.findByFollowerUsernameAndFollowingUsername("alice", "bob"))
                .thenReturn(Optional.of(new UserFollow("alice", "bob")));
        assertTrue(followService.isFollowing("alice", "bob"));
    }

    @Test
    @DisplayName("isFollowing: false when no record")
    void isFollowing_false() {
        when(followRepository.findByFollowerUsernameAndFollowingUsername("alice", "bob"))
                .thenReturn(Optional.empty());
        assertFalse(followService.isFollowing("alice", "bob"));
    }

    // ─── getFollowingUsernames ───────────────────────────────────────────────────

    @Test
    @DisplayName("getFollowingUsernames: returns list of usernames")
    void getFollowingUsernames_returnsList() {
        when(followRepository.findByFollowerUsername("alice"))
                .thenReturn(List.of(new UserFollow("alice", "bob"), new UserFollow("alice", "carol")));

        List<String> result = followService.getFollowingUsernames("alice");
        assertEquals(List.of("bob", "carol"), result);
    }

    @Test
    @DisplayName("getFollowingUsernames: empty when user follows no one")
    void getFollowingUsernames_empty() {
        when(followRepository.findByFollowerUsername("alice")).thenReturn(List.of());
        assertTrue(followService.getFollowingUsernames("alice").isEmpty());
    }

    // ─── getStats ────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("getStats: returns correct follower and following counts")
    void getStats_correctCounts() {
        doReturn(10L).when(followRepository).countByFollowingUsername("alice");
        doReturn(5L).when(followRepository).countByFollowerUsername("alice");

        Map<String, Long> stats = followService.getStats("alice");
        assertEquals(10L, (long) stats.get("followersCount"));
        assertEquals(5L, (long) stats.get("followingCount"));
    }
}
