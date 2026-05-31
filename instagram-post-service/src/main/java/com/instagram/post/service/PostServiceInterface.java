package com.instagram.post.service;

import com.instagram.post.dto.PostResponse;
import com.instagram.post.entity.Comment;
import com.instagram.post.entity.Post;

import java.util.List;
import java.util.Optional;

public interface PostServiceInterface {
    PostResponse savePost(Post post);
    List<PostResponse> getAllPosts(String requestingUsername);
    List<PostResponse> getFeed(List<String> usernames, String requestingUsername);
    List<PostResponse> getPostsByUser(String username, String requestingUsername);
    Optional<Post> findById(String id);
    boolean likePost(String postId, String username);
    boolean unlikePost(String postId, String username);
    List<Comment> getComments(String postId);
    Comment addComment(String postId, String username, String text);
    void sendNotification(String recipient, String sender, String type, String postId, String message);
}
