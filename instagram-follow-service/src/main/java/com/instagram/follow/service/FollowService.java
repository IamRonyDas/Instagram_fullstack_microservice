package com.instagram.follow.service;

import com.instagram.follow.entity.UserFollow;
import com.instagram.follow.repository.FollowRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class FollowService implements FollowServiceInterface {

    private final FollowRepository followRepository;
    private final RestTemplate restTemplate;

    private static final String NOTIFICATION_URL = "http://localhost:8084/api/notifications";

    public FollowService(FollowRepository followRepository, RestTemplate restTemplate) {
        this.followRepository = followRepository;
        this.restTemplate = restTemplate;
    }

    @Override
    public Map<String, String> followUser(String followerUsername, String followingUsername) {
        if (followRepository.findByFollowerUsernameAndFollowingUsername(followerUsername, followingUsername).isPresent()) {
            return Map.of("status", "already_following", "message", "Already following");
        }
        followRepository.save(new UserFollow(followerUsername, followingUsername));
        sendNotification(followingUsername, followerUsername,
                followerUsername + " started following you.");
        return Map.of("status", "ok", "message", "Successfully followed");
    }

    @Override
    public Map<String, String> unfollowUser(String followerUsername, String followingUsername) {
        Optional<UserFollow> existing = followRepository
                .findByFollowerUsernameAndFollowingUsername(followerUsername, followingUsername);
        if (existing.isPresent()) {
            followRepository.delete(existing.get());
            return Map.of("status", "ok", "message", "Successfully unfollowed");
        }
        return Map.of("status", "not_following", "message", "Not following");
    }

    @Override
    public boolean isFollowing(String followerUsername, String followingUsername) {
        return followRepository
                .findByFollowerUsernameAndFollowingUsername(followerUsername, followingUsername)
                .isPresent();
    }

    @Override
    public List<String> getFollowingUsernames(String username) {
        return followRepository.findByFollowerUsername(username)
                .stream()
                .map(UserFollow::getFollowingUsername)
                .collect(Collectors.toList());
    }

    @Override
    public Map<String, Long> getStats(String username) {
        long followersCount = followRepository.countByFollowingUsername(username);
        long followingCount = followRepository.countByFollowerUsername(username);
        return Map.of("followersCount", followersCount, "followingCount", followingCount);
    }

    private void sendNotification(String recipient, String sender, String message) {
        try {
            Map<String, String> payload = new HashMap<>();
            payload.put("recipientUsername", recipient);
            payload.put("senderUsername", sender);
            payload.put("type", "FOLLOW");
            payload.put("message", message);
            restTemplate.postForEntity(NOTIFICATION_URL, payload, String.class);
        } catch (Exception e) {
            System.err.println("Failed to send follow notification: " + e.getMessage());
        }
    }
}
