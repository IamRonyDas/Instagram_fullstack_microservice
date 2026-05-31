package com.instagram.post.service;

import com.instagram.post.dto.PostResponse;
import com.instagram.post.entity.Comment;
import com.instagram.post.entity.Post;
import com.instagram.post.entity.PostLike;
import com.instagram.post.repository.CommentRepository;
import com.instagram.post.repository.PostLikeRepository;
import com.instagram.post.repository.PostRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PostServiceTest {

    @Mock private PostRepository postRepository;
    @Mock private CommentRepository commentRepository;
    @Mock private PostLikeRepository postLikeRepository;
    @Mock private RestTemplate restTemplate;

    private PostService postService;

    private Post samplePost() {
        Post p = new Post();
        p.setAuthorUsername("alice");
        p.setCaption("Hello world");
        p.setCreatedAt(LocalDateTime.now());
        return p;
    }

    @BeforeEach
    void setUp() {
        postService = new PostService(postRepository, commentRepository, postLikeRepository, restTemplate);
    }

    // ─── savePost ───────────────────────────────────────────────────────────────

    @Test
    @DisplayName("savePost: persists and returns enriched response")
    void savePost_returnsResponse() {
        Post post = samplePost();
        when(postRepository.save(post)).thenReturn(post);
        when(postLikeRepository.countByPostId(any())).thenReturn(0L);
        when(postLikeRepository.findByPostIdAndUsername(any(), any())).thenReturn(Optional.empty());
        when(commentRepository.findByPostIdOrderByCreatedAtAsc(any())).thenReturn(List.of());

        PostResponse resp = postService.savePost(post);

        assertNotNull(resp);
        assertEquals("alice", resp.getAuthorUsername());
        assertEquals(0, resp.getLikesCount());
        assertFalse(resp.isLiked());
    }

    // ─── getAllPosts ─────────────────────────────────────────────────────────────

    @Test
    @DisplayName("getAllPosts: returns enriched list")
    void getAllPosts_returnsList() {
        when(postRepository.findAllByOrderByCreatedAtDesc()).thenReturn(List.of(samplePost()));
        when(postLikeRepository.countByPostId(any())).thenReturn(2L);
        when(postLikeRepository.findByPostIdAndUsername(any(), anyString())).thenReturn(Optional.empty());
        when(commentRepository.findByPostIdOrderByCreatedAtAsc(any())).thenReturn(List.of());

        List<PostResponse> result = postService.getAllPosts("bob");

        assertEquals(1, result.size());
        assertEquals(2, result.get(0).getLikesCount());
    }

    // ─── getFeed ────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("getFeed: aggregates and sorts posts from multiple users")
    void getFeed_aggregatesAndSorts() {
        Post p1 = samplePost();
        p1.setCreatedAt(LocalDateTime.now().minusHours(1));
        Post p2 = samplePost();
        p2.setAuthorUsername("bob");
        p2.setCreatedAt(LocalDateTime.now());

        when(postRepository.findByAuthorUsernameOrderByCreatedAtDesc("alice")).thenReturn(List.of(p1));
        when(postRepository.findByAuthorUsernameOrderByCreatedAtDesc("bob")).thenReturn(List.of(p2));
        when(postLikeRepository.countByPostId(any())).thenReturn(0L);
        when(postLikeRepository.findByPostIdAndUsername(any(), any())).thenReturn(Optional.empty());
        when(commentRepository.findByPostIdOrderByCreatedAtAsc(any())).thenReturn(List.of());

        List<PostResponse> feed = postService.getFeed(List.of("alice", "bob"), "viewer");

        assertEquals(2, feed.size());
        // bob's newer post should come first
        assertEquals("bob", feed.get(0).getAuthorUsername());
    }

    @Test
    @DisplayName("getFeed: returns empty for empty usernames list")
    void getFeed_emptyUsernames() {
        List<PostResponse> feed = postService.getFeed(List.of(), "viewer");
        assertTrue(feed.isEmpty());
    }

    // ─── getPostsByUser ──────────────────────────────────────────────────────────

    @Test
    @DisplayName("getPostsByUser: returns posts for given user")
    void getPostsByUser_returnsList() {
        when(postRepository.findByAuthorUsernameOrderByCreatedAtDesc("alice")).thenReturn(List.of(samplePost()));
        when(postLikeRepository.countByPostId(any())).thenReturn(0L);
        when(postLikeRepository.findByPostIdAndUsername(any(), any())).thenReturn(Optional.empty());
        when(commentRepository.findByPostIdOrderByCreatedAtAsc(any())).thenReturn(List.of());

        List<PostResponse> result = postService.getPostsByUser("alice", null);
        assertEquals(1, result.size());
    }

    // ─── findById ────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("findById: returns post when found")
    void findById_found() {
        Post p = samplePost();
        when(postRepository.findById("abc")).thenReturn(Optional.of(p));
        assertTrue(postService.findById("abc").isPresent());
    }

    @Test
    @DisplayName("findById: empty when not found")
    void findById_notFound() {
        when(postRepository.findById("xyz")).thenReturn(Optional.empty());
        assertTrue(postService.findById("xyz").isEmpty());
    }

    // ─── likePost ────────────────────────────────────────────────────────────────

    @Test
    @DisplayName("likePost: saves like and returns true when not yet liked")
    void likePost_success() {
        when(postLikeRepository.findByPostIdAndUsername("p1", "alice")).thenReturn(Optional.empty());
        when(postLikeRepository.save(any())).thenReturn(new PostLike());

        assertTrue(postService.likePost("p1", "alice"));
        verify(postLikeRepository).save(any(PostLike.class));
    }

    @Test
    @DisplayName("likePost: returns false when already liked")
    void likePost_alreadyLiked() {
        when(postLikeRepository.findByPostIdAndUsername("p1", "alice"))
                .thenReturn(Optional.of(new PostLike()));

        assertFalse(postService.likePost("p1", "alice"));
        verify(postLikeRepository, never()).save(any());
    }

    // ─── unlikePost ──────────────────────────────────────────────────────────────

    @Test
    @DisplayName("unlikePost: deletes and returns true when liked")
    void unlikePost_success() {
        PostLike like = new PostLike();
        when(postLikeRepository.findByPostIdAndUsername("p1", "alice")).thenReturn(Optional.of(like));

        assertTrue(postService.unlikePost("p1", "alice"));
        verify(postLikeRepository).delete(like);
    }

    @Test
    @DisplayName("unlikePost: returns false when not liked")
    void unlikePost_notLiked() {
        when(postLikeRepository.findByPostIdAndUsername("p1", "alice")).thenReturn(Optional.empty());

        assertFalse(postService.unlikePost("p1", "alice"));
        verify(postLikeRepository, never()).delete(any());
    }

    // ─── getComments ─────────────────────────────────────────────────────────────

    @Test
    @DisplayName("getComments: returns all comments for a post")
    void getComments_returnsList() {
        Comment c = new Comment();
        c.setPostId("p1");
        c.setUsername("alice");
        c.setText("nice!");
        when(commentRepository.findByPostIdOrderByCreatedAtAsc("p1")).thenReturn(List.of(c));

        List<Comment> result = postService.getComments("p1");
        assertEquals(1, result.size());
        assertEquals("alice", result.get(0).getUsername());
    }

    // ─── addComment ──────────────────────────────────────────────────────────────

    @Test
    @DisplayName("addComment: saves and returns new comment")
    void addComment_success() {
        Comment saved = new Comment();
        saved.setPostId("p1");
        saved.setUsername("alice");
        saved.setText("Great post!");
        when(commentRepository.save(any())).thenReturn(saved);

        Comment result = postService.addComment("p1", "alice", "Great post!");
        assertEquals("Great post!", result.getText());
        verify(commentRepository).save(any(Comment.class));
    }

    // ─── sendNotification ────────────────────────────────────────────────────────

    @Test
    @DisplayName("sendNotification: calls RestTemplate for different sender/recipient")
    void sendNotification_callsRestTemplate() {
        when(restTemplate.postForEntity(anyString(), any(), eq(String.class))).thenReturn(null);
        postService.sendNotification("bob", "alice", "LIKE", "p1", "alice liked your post.");
        verify(restTemplate).postForEntity(anyString(), any(), eq(String.class));
    }

    @Test
    @DisplayName("sendNotification: skips when recipient equals sender (self-notification)")
    void sendNotification_selfSkipped() {
        postService.sendNotification("alice", "alice", "LIKE", "p1", "self");
        verify(restTemplate, never()).postForEntity(anyString(), any(), any());
    }

    @Test
    @DisplayName("sendNotification: skips when recipient is null")
    void sendNotification_nullRecipientSkipped() {
        postService.sendNotification(null, "alice", "LIKE", "p1", "msg");
        verify(restTemplate, never()).postForEntity(anyString(), any(), any());
    }

    @Test
    @DisplayName("sendNotification: swallows RestTemplate exception gracefully")
    void sendNotification_exceptionSwallowed() {
        when(restTemplate.postForEntity(anyString(), any(), eq(String.class)))
                .thenThrow(new RuntimeException("network error"));
        assertDoesNotThrow(() ->
                postService.sendNotification("bob", "alice", "LIKE", "p1", "msg"));
    }
}
