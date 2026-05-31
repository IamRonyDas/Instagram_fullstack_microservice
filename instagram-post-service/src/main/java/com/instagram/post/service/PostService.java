package com.instagram.post.service;

import com.instagram.post.dto.PostResponse;
import com.instagram.post.entity.Comment;
import com.instagram.post.entity.Post;
import com.instagram.post.entity.PostLike;
import com.instagram.post.repository.CommentRepository;
import com.instagram.post.repository.PostLikeRepository;
import com.instagram.post.repository.PostRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class PostService implements PostServiceInterface {

    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final PostLikeRepository postLikeRepository;
    private final RestTemplate restTemplate;

    private static final String NOTIFICATION_SERVICE_URL = "http://localhost:8084/api/notifications";

    public PostService(PostRepository postRepository,
                       CommentRepository commentRepository,
                       PostLikeRepository postLikeRepository,
                       RestTemplate restTemplate) {
        this.postRepository = postRepository;
        this.commentRepository = commentRepository;
        this.postLikeRepository = postLikeRepository;
        this.restTemplate = restTemplate;
    }

    // ─── Enrich ────────────────────────────────────────────────────────────────

    public PostResponse buildResponse(Post post, String requestingUsername) {
        PostResponse response = new PostResponse(post);

        // Real like count from post_likes table
        long count = postLikeRepository.countByPostId(post.getId());
        response.setLikesCount((int) count);

        // Is the requesting user one of the likers?
        if (requestingUsername != null && !requestingUsername.isBlank()) {
            boolean liked = postLikeRepository
                    .findByPostIdAndUsername(post.getId(), requestingUsername)
                    .isPresent();
            response.setLiked(liked);
        }

        // Attach comments
        List<Comment> comments = commentRepository.findByPostIdOrderByCreatedAtAsc(post.getId());
        response.setComments(comments);

        return response;
    }

    // ─── Posts ─────────────────────────────────────────────────────────────────

    public PostResponse savePost(Post post) {
        Post saved = postRepository.save(post);
        return buildResponse(saved, post.getAuthorUsername());
    }

    public List<PostResponse> getAllPosts(String requestingUsername) {
        return postRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(p -> buildResponse(p, requestingUsername))
                .collect(Collectors.toList());
    }

    public List<PostResponse> getFeed(List<String> usernames, String requestingUsername) {
        List<PostResponse> feed = new ArrayList<>();
        for (String user : usernames) {
            feed.addAll(
                postRepository.findByAuthorUsernameOrderByCreatedAtDesc(user)
                    .stream()
                    .map(p -> buildResponse(p, requestingUsername))
                    .collect(Collectors.toList())
            );
        }
        feed.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));
        return feed;
    }

    public List<PostResponse> getPostsByUser(String username, String requestingUsername) {
        return postRepository.findByAuthorUsernameOrderByCreatedAtDesc(username)
                .stream()
                .map(p -> buildResponse(p, requestingUsername))
                .collect(Collectors.toList());
    }

    public Optional<Post> findById(String id) {
        return postRepository.findById(id);
    }

    // ─── Likes ─────────────────────────────────────────────────────────────────

    /**
     * @return true if newly liked, false if already liked (no-op)
     */
    public boolean likePost(String postId, String username) {
        if (postLikeRepository.findByPostIdAndUsername(postId, username).isPresent()) {
            return false; // already liked
        }
        PostLike like = new PostLike();
        like.setPostId(postId);
        like.setUsername(username);
        postLikeRepository.save(like);
        return true;
    }

    public boolean unlikePost(String postId, String username) {
        Optional<PostLike> existing = postLikeRepository.findByPostIdAndUsername(postId, username);
        if (existing.isPresent()) {
            postLikeRepository.delete(existing.get());
            return true;
        }
        return false;
    }

    // ─── Comments ──────────────────────────────────────────────────────────────

    public List<Comment> getComments(String postId) {
        return commentRepository.findByPostIdOrderByCreatedAtAsc(postId);
    }

    public Comment addComment(String postId, String username, String text) {
        Comment comment = new Comment();
        comment.setPostId(postId);
        comment.setUsername(username);
        comment.setText(text);
        return commentRepository.save(comment);
    }

    // ─── Notifications ─────────────────────────────────────────────────────────

    public void sendNotification(String recipient, String sender, String type, String postId, String message) {
        // Don't notify self
        if (recipient == null || recipient.equals(sender)) return;
        try {
            Map<String, String> payload = new HashMap<>();
            payload.put("recipientUsername", recipient);
            payload.put("senderUsername", sender);
            payload.put("type", type);
            payload.put("postId", postId);
            payload.put("message", message);
            restTemplate.postForEntity(NOTIFICATION_SERVICE_URL, payload, String.class);
        } catch (Exception e) {
            System.err.println("Failed to send notification: " + e.getMessage());
        }
    }
}
