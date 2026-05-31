package com.instagram.post.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "posts")
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String authorUsername;

    private String caption;
    private String location;
    private String hashtags; // Comma separated

    private int likesCount = 0;
    private int likesLast24h = 0;
    
    private boolean isWithin24h = true;
    private boolean isLiked = false;

    private LocalDateTime createdAt = LocalDateTime.now();

    @Lob
    @Column(columnDefinition="LONGBLOB")
    private byte[] imageBytes;

    public Post() {}

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getAuthorUsername() {
        return authorUsername;
    }

    public void setAuthorUsername(String authorUsername) {
        this.authorUsername = authorUsername;
    }

    public String getCaption() {
        return caption;
    }

    public void setCaption(String caption) {
        this.caption = caption;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getHashtags() {
        return hashtags;
    }

    public void setHashtags(String hashtags) {
        this.hashtags = hashtags;
    }

    public int getLikesCount() {
        return likesCount;
    }

    public void setLikesCount(int likesCount) {
        this.likesCount = likesCount;
    }

    public int getLikesLast24h() {
        return likesLast24h;
    }

    public void setLikesLast24h(int likesLast24h) {
        this.likesLast24h = likesLast24h;
    }

    public boolean isWithin24h() {
        return isWithin24h;
    }

    public void setWithin24h(boolean within24h) {
        isWithin24h = within24h;
    }

    public boolean isLiked() {
        return isLiked;
    }

    public void setLiked(boolean liked) {
        isLiked = liked;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public byte[] getImageBytes() {
        return imageBytes;
    }

    public void setImageBytes(byte[] imageBytes) {
        this.imageBytes = imageBytes;
    }
}
