package com.instagram.follow.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_follows", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"followerUsername", "followingUsername"})
})
public class UserFollow {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String followerUsername; // The person who clicked follow

    @Column(nullable = false)
    private String followingUsername; // The person being followed

    private LocalDateTime createdAt = LocalDateTime.now();

    public UserFollow() {}

    public UserFollow(String followerUsername, String followingUsername) {
        this.followerUsername = followerUsername;
        this.followingUsername = followingUsername;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getFollowerUsername() { return followerUsername; }
    public void setFollowerUsername(String followerUsername) { this.followerUsername = followerUsername; }
    public String getFollowingUsername() { return followingUsername; }
    public void setFollowingUsername(String followingUsername) { this.followingUsername = followingUsername; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
