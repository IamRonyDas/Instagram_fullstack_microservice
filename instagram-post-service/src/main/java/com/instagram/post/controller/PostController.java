package com.instagram.post.controller;

import com.instagram.post.dto.CommentRequest;
import com.instagram.post.dto.PostResponse;
import com.instagram.post.entity.Comment;
import com.instagram.post.entity.Post;
import com.instagram.post.service.PostService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/posts")
@CrossOrigin(origins = "*")
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    // ─── Create Post ────────────────────────────────────────────────────────────

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PostResponse> createPost(
            @RequestParam("image") MultipartFile image,
            @RequestParam("authorUsername") String authorUsername,
            @RequestParam("caption") String caption,
            @RequestParam(value = "location", required = false) String location,
            @RequestParam(value = "hashtags", required = false) String hashtags) {

        try {
            Post post = new Post();
            post.setAuthorUsername(authorUsername);
            post.setCaption(caption);
            post.setLocation(location);
            post.setHashtags(hashtags);
            post.setImageBytes(image.getBytes());

            PostResponse saved = postService.savePost(post);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ─── Get All Posts (admin / explore) ────────────────────────────────────────

    @GetMapping
    public ResponseEntity<List<PostResponse>> getAllPosts(
            @RequestParam(required = false) String username) {
        return ResponseEntity.ok(postService.getAllPosts(username));
    }

    // ─── Get Feed (posts from followed users) ───────────────────────────────────

    @GetMapping("/feed")
    public ResponseEntity<List<PostResponse>> getFeed(
            @RequestParam List<String> usernames,
            @RequestParam(required = false) String requestingUsername) {
        return ResponseEntity.ok(postService.getFeed(usernames, requestingUsername));
    }

    // ─── Get Posts By User ───────────────────────────────────────────────────────

    @GetMapping("/user/{username}")
    public ResponseEntity<List<PostResponse>> getUserPosts(
            @PathVariable String username,
            @RequestParam(required = false) String requestingUsername) {
        return ResponseEntity.ok(postService.getPostsByUser(username, requestingUsername));
    }

    // ─── Serve Image BLOB ────────────────────────────────────────────────────────

    @GetMapping("/{id}/image")
    public ResponseEntity<byte[]> getPostImage(@PathVariable String id) {
        Optional<Post> postOpt = postService.findById(id);
        if (postOpt.isPresent() && postOpt.get().getImageBytes() != null) {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.IMAGE_JPEG);
            return new ResponseEntity<>(postOpt.get().getImageBytes(), headers, HttpStatus.OK);
        }
        return ResponseEntity.notFound().build();
    }

    // ─── Likes ──────────────────────────────────────────────────────────────────

    @PostMapping("/{postId}/like/{username}")
    public ResponseEntity<?> likePost(
            @PathVariable String postId,
            @PathVariable String username) {

        Optional<Post> postOpt = postService.findById(postId);
        if (postOpt.isEmpty()) return ResponseEntity.notFound().build();

        boolean liked = postService.likePost(postId, username);
        if (liked) {
            postService.sendNotification(
                postOpt.get().getAuthorUsername(), username, "LIKE", postId,
                username + " liked your post."
            );
            return ResponseEntity.ok(Map.of("message", "Liked"));
        }
        return ResponseEntity.badRequest().body(Map.of("message", "Already liked"));
    }

    @DeleteMapping("/{postId}/like/{username}")
    public ResponseEntity<?> unlikePost(
            @PathVariable String postId,
            @PathVariable String username) {

        boolean unliked = postService.unlikePost(postId, username);
        if (unliked) return ResponseEntity.ok(Map.of("message", "Unliked"));
        return ResponseEntity.badRequest().body(Map.of("message", "Not liked"));
    }

    // ─── Comments ───────────────────────────────────────────────────────────────

    @GetMapping("/{postId}/comments")
    public ResponseEntity<List<Comment>> getComments(@PathVariable String postId) {
        return ResponseEntity.ok(postService.getComments(postId));
    }

    @PostMapping("/{postId}/comments")
    public ResponseEntity<Comment> addComment(
            @PathVariable String postId,
            @RequestBody CommentRequest request) {

        Optional<Post> postOpt = postService.findById(postId);
        if (postOpt.isEmpty()) return ResponseEntity.notFound().build();

        Comment saved = postService.addComment(postId, request.getUsername(), request.getText());

        postService.sendNotification(
            postOpt.get().getAuthorUsername(), request.getUsername(), "COMMENT", postId,
            request.getUsername() + " commented on your post."
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
}
