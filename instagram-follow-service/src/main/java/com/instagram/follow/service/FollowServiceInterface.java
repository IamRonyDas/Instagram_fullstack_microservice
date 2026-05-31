package com.instagram.follow.service;

import java.util.List;
import java.util.Map;

public interface FollowServiceInterface {
    Map<String, String> followUser(String followerUsername, String followingUsername);
    Map<String, String> unfollowUser(String followerUsername, String followingUsername);
    boolean isFollowing(String followerUsername, String followingUsername);
    List<String> getFollowingUsernames(String username);
    Map<String, Long> getStats(String username);
}
