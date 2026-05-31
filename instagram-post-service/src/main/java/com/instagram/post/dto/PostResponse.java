package com.instagram.post.dto;

import com.instagram.post.entity.Post;
import java.time.LocalDateTime;

public class PostResponse {
    private String id;
    private String authorUsername;
    private String caption;
    private String location;
    private String hashtags;
    private int likesCount;
    private int likesLast24h;
    private boolean isWithin24h;
    private boolean isLiked;
    private LocalDateTime createdAt;
    private String imageUrl; // Generated URL to fetch the image

    public PostResponse(Post post) {
        this.id = post.getId();
        this.authorUsername = post.getAuthorUsername();
        this.caption = post.getCaption();
        this.location = post.getLocation();
        this.hashtags = post.getHashtags();
        this.likesCount = post.getLikesCount();
        this.likesLast24h = post.getLikesLast24h();
        this.isWithin24h = post.isWithin24h();
        this.isLiked = post.isLiked();
        this.createdAt = post.getCreatedAt();
        // The Gateway routes /api/posts/** to this service
        this.imageUrl = "http://localhost:8080/api/posts/" + post.getId() + "/image";
    }

    // Getters
    public String getId() { return id; }
    public String getAuthorUsername() { return authorUsername; }
    public String getCaption() { return caption; }
    public String getLocation() { return location; }
    public String getHashtags() { return hashtags; }
    public int getLikesCount() { return likesCount; }
    public int getLikesLast24h() { return likesLast24h; }
    public boolean isWithin24h() { return isWithin24h; }
    public boolean isLiked() { return isLiked; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public String getImageUrl() { return imageUrl; }
}
