package com.instagram.follow.controller;

import com.instagram.follow.entity.UserFollow;
import com.instagram.follow.repository.FollowRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/follows")
@CrossOrigin(origins = "*")
public class FollowController {

    private final FollowRepository followRepository;
    private final RestTemplate restTemplate;

    public FollowController(FollowRepository followRepository, RestTemplate restTemplate) {
        this.followRepository = followRepository;
        this.restTemplate = restTemplate;
    }

    @PostMapping("/{followerUsername}/{followingUsername}")
    public ResponseEntity<?> followUser(@PathVariable String followerUsername, @PathVariable String followingUsername) {
        Optional<UserFollow> existing = followRepository.findByFollowerUsernameAndFollowingUsername(followerUsername, followingUsername);
        if (existing.isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Already following"));
        }

        UserFollow follow = new UserFollow(followerUsername, followingUsername);
        followRepository.save(follow);

        // Trigger Notification
        try {
            Map<String, String> request = new HashMap<>();
            request.put("recipientUsername", followingUsername);
            request.put("senderUsername", followerUsername);
            request.put("type", "FOLLOW");
            request.put("message", followerUsername + " started following you.");
            
            restTemplate.postForEntity("http://localhost:8084/api/notifications", request, String.class);
        } catch (Exception e) {
            System.err.println("Failed to send notification: " + e.getMessage());
        }

        return ResponseEntity.ok(Map.of("message", "Successfully followed"));
    }

    @DeleteMapping("/{followerUsername}/{followingUsername}")
    public ResponseEntity<?> unfollowUser(@PathVariable String followerUsername, @PathVariable String followingUsername) {
        Optional<UserFollow> existing = followRepository.findByFollowerUsernameAndFollowingUsername(followerUsername, followingUsername);
        if (existing.isPresent()) {
            followRepository.delete(existing.get());
            return ResponseEntity.ok(Map.of("message", "Successfully unfollowed"));
        }
        return ResponseEntity.badRequest().body(Map.of("message", "Not following"));
    }

    @GetMapping("/check/{followerUsername}/{followingUsername}")
    public ResponseEntity<Map<String, Boolean>> isFollowing(@PathVariable String followerUsername, @PathVariable String followingUsername) {
        boolean isFollowing = followRepository.findByFollowerUsernameAndFollowingUsername(followerUsername, followingUsername).isPresent();
        return ResponseEntity.ok(Map.of("isFollowing", isFollowing));
    }

    @GetMapping("/{username}/following")
    public ResponseEntity<List<String>> getFollowingUsernames(@PathVariable String username) {
        List<String> following = followRepository.findByFollowerUsername(username)
                .stream()
                .map(UserFollow::getFollowingUsername)
                .collect(Collectors.toList());
        return ResponseEntity.ok(following);
    }

    @GetMapping("/{username}/stats")
    public ResponseEntity<Map<String, Long>> getStats(@PathVariable String username) {
        long followersCount = followRepository.countByFollowingUsername(username);
        long followingCount = followRepository.countByFollowerUsername(username);
        return ResponseEntity.ok(Map.of("followersCount", followersCount, "followingCount", followingCount));
    }
}
