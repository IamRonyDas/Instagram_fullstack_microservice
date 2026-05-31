package com.instagram.post.dto;

import com.instagram.post.entity.Comment;
import com.instagram.post.entity.Post;
import java.time.LocalDateTime;
import java.util.List;

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
    private String imageUrl;
    private List<Comment> comments;

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
    public List<Comment> getComments() { return comments; }

    // Setters
    public void setId(String id) { this.id = id; }
    public void setAuthorUsername(String authorUsername) { this.authorUsername = authorUsername; }
    public void setCaption(String caption) { this.caption = caption; }
    public void setLocation(String location) { this.location = location; }
    public void setHashtags(String hashtags) { this.hashtags = hashtags; }
    public void setLikesCount(int likesCount) { this.likesCount = likesCount; }
    public void setLikesLast24h(int likesLast24h) { this.likesLast24h = likesLast24h; }
    public void setWithin24h(boolean within24h) { isWithin24h = within24h; }
    public void setLiked(boolean liked) { isLiked = liked; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public void setComments(List<Comment> comments) { this.comments = comments; }
}
