package com.instagram.follow.repository;

import com.instagram.follow.entity.UserFollow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FollowRepository extends JpaRepository<UserFollow, Long> {
    List<UserFollow> findByFollowerUsername(String followerUsername);
    List<UserFollow> findByFollowingUsername(String followingUsername);
    Optional<UserFollow> findByFollowerUsernameAndFollowingUsername(String followerUsername, String followingUsername);
    long countByFollowerUsername(String followerUsername);
    long countByFollowingUsername(String followingUsername);
}
