package com.instagram.follow.controller;

import com.instagram.follow.service.FollowServiceInterface;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/follows")
@CrossOrigin(origins = "*")
public class FollowController {

    private final FollowServiceInterface followService;

    public FollowController(FollowServiceInterface followService) {
        this.followService = followService;
    }

    @PostMapping("/{followerUsername}/{followingUsername}")
    public ResponseEntity<?> followUser(
            @PathVariable String followerUsername,
            @PathVariable String followingUsername) {

        Map<String, String> result = followService.followUser(followerUsername, followingUsername);
        if ("already_following".equals(result.get("status"))) {
            return ResponseEntity.badRequest().body(result);
        }
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/{followerUsername}/{followingUsername}")
    public ResponseEntity<?> unfollowUser(
            @PathVariable String followerUsername,
            @PathVariable String followingUsername) {

        Map<String, String> result = followService.unfollowUser(followerUsername, followingUsername);
        if ("not_following".equals(result.get("status"))) {
            return ResponseEntity.badRequest().body(result);
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/check/{followerUsername}/{followingUsername}")
    public ResponseEntity<Map<String, Boolean>> isFollowing(
            @PathVariable String followerUsername,
            @PathVariable String followingUsername) {
        boolean following = followService.isFollowing(followerUsername, followingUsername);
        return ResponseEntity.ok(Map.of("isFollowing", following));
    }

    @GetMapping("/{username}/following")
    public ResponseEntity<List<String>> getFollowingUsernames(@PathVariable String username) {
        return ResponseEntity.ok(followService.getFollowingUsernames(username));
    }

    @GetMapping("/{username}/stats")
    public ResponseEntity<Map<String, Long>> getStats(@PathVariable String username) {
        return ResponseEntity.ok(followService.getStats(username));
    }
}
