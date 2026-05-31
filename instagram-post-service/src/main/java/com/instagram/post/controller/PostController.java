package com.instagram.post.controller;

import com.instagram.post.dto.CommentRequest;
import com.instagram.post.dto.PostResponse;
import com.instagram.post.entity.Comment;
import com.instagram.post.entity.Post;
import com.instagram.post.entity.PostLike;
import com.instagram.post.repository.CommentRepository;
import com.instagram.post.repository.PostLikeRepository;
import com.instagram.post.repository.PostRepository;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/posts")
@CrossOrigin(origins = "*")
public class PostController {

    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final PostLikeRepository postLikeRepository;
    private final RestTemplate restTemplate;

    public PostController(PostRepository postRepository, CommentRepository commentRepository, PostLikeRepository postLikeRepository, RestTemplate restTemplate) {
        this.postRepository = postRepository;
        this.commentRepository = commentRepository;
        this.postLikeRepository = postLikeRepository;
        this.restTemplate = restTemplate;
    }

    private PostResponse enrichPostResponse(Post post, String requestingUsername) {
        PostResponse response = new PostResponse(post);
        response.setLikesCount((int) postLikeRepository.countByPostId(post.getId()));
        if (requestingUsername != null) {
            response.setLiked(postLikeRepository.findByPostIdAndUsername(post.getId(), requestingUsername).isPresent());
        }
        return response;
    }

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

            Post savedPost = postRepository.save(post);
            return ResponseEntity.status(HttpStatus.CREATED).body(enrichPostResponse(savedPost, authorUsername));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping
    public ResponseEntity<List<PostResponse>> getAllPosts(@RequestParam(required = false) String username) {
        List<PostResponse> posts = postRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(p -> enrichPostResponse(p, username))
                .collect(Collectors.toList());
        return ResponseEntity.ok(posts);
    }

    @GetMapping("/feed")
    public ResponseEntity<List<PostResponse>> getFeed(
            @RequestParam List<String> usernames,
            @RequestParam(required = false) String requestingUsername) {
        // Fetch posts for a list of users (the people the user is following)
        List<PostResponse> feed = new ArrayList<>();
        for (String user : usernames) {
            feed.addAll(postRepository.findByAuthorUsernameOrderByCreatedAtDesc(user)
                    .stream()
                    .map(p -> enrichPostResponse(p, requestingUsername))
                    .collect(Collectors.toList()));
        }
        // Sort the aggregated feed by date descending
        feed.sort((p1, p2) -> p2.getCreatedAt().compareTo(p1.getCreatedAt()));
        return ResponseEntity.ok(feed);
    }

    @GetMapping("/user/{username}")
    public ResponseEntity<List<PostResponse>> getUserPosts(@PathVariable String username, @RequestParam(required = false) String requestingUsername) {
        List<PostResponse> posts = postRepository.findByAuthorUsernameOrderByCreatedAtDesc(username)
                .stream()
                .map(p -> enrichPostResponse(p, requestingUsername))
                .collect(Collectors.toList());
        return ResponseEntity.ok(posts);
    }

    @GetMapping("/{id}/image")
    public ResponseEntity<byte[]> getPostImage(@PathVariable String id) {
        Optional<Post> postOpt = postRepository.findById(id);
        if (postOpt.isPresent() && postOpt.get().getImageBytes() != null) {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.IMAGE_JPEG);
            return new ResponseEntity<>(postOpt.get().getImageBytes(), headers, HttpStatus.OK);
        }
        return ResponseEntity.notFound().build();
    }

    // --- LIKES ---

    @PostMapping("/{postId}/like/{username}")
    public ResponseEntity<?> likePost(@PathVariable String postId, @PathVariable String username) {
        Optional<Post> postOpt = postRepository.findById(postId);
        if (postOpt.isEmpty()) return ResponseEntity.notFound().build();
        
        Optional<PostLike> existing = postLikeRepository.findByPostIdAndUsername(postId, username);
        if (existing.isEmpty()) {
            PostLike like = new PostLike();
            like.setPostId(postId);
            like.setUsername(username);
            postLikeRepository.save(like);

            sendNotification(postOpt.get().getAuthorUsername(), username, "LIKE", postId, username + " liked your post.");
            return ResponseEntity.ok(Map.of("message", "Liked"));
        }
        return ResponseEntity.badRequest().body(Map.of("message", "Already liked"));
    }

    @DeleteMapping("/{postId}/like/{username}")
    public ResponseEntity<?> unlikePost(@PathVariable String postId, @PathVariable String username) {
        Optional<PostLike> existing = postLikeRepository.findByPostIdAndUsername(postId, username);
        if (existing.isPresent()) {
            postLikeRepository.delete(existing.get());
            return ResponseEntity.ok(Map.of("message", "Unliked"));
        }
        return ResponseEntity.badRequest().body(Map.of("message", "Not liked"));
    }

    // --- COMMENTS ---

    @GetMapping("/{postId}/comments")
    public ResponseEntity<List<Comment>> getComments(@PathVariable String postId) {
        return ResponseEntity.ok(commentRepository.findByPostIdOrderByCreatedAtAsc(postId));
    }

    @PostMapping("/{postId}/comments")
    public ResponseEntity<Comment> addComment(@PathVariable String postId, @RequestBody CommentRequest request) {
        Optional<Post> postOpt = postRepository.findById(postId);
        if (postOpt.isEmpty()) return ResponseEntity.notFound().build();

        Comment comment = new Comment();
        comment.setPostId(postId);
        comment.setUsername(request.getUsername());
        comment.setText(request.getText());
        Comment saved = commentRepository.save(comment);

        sendNotification(postOpt.get().getAuthorUsername(), request.getUsername(), "COMMENT", postId, request.getUsername() + " commented on your post.");

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    private void sendNotification(String recipient, String sender, String type, String postId, String message) {
        try {
            Map<String, String> request = new HashMap<>();
            request.put("recipientUsername", recipient);
            request.put("senderUsername", sender);
            request.put("type", type);
            request.put("postId", postId);
            request.put("message", message);
            
            restTemplate.postForEntity("http://localhost:8084/api/notifications", request, String.class);
        } catch (Exception e) {
            System.err.println("Failed to send notification: " + e.getMessage());
        }
    }
}
