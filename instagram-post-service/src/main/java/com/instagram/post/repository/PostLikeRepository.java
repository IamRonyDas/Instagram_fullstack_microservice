package com.instagram.post.repository;

import com.instagram.post.entity.PostLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PostLikeRepository extends JpaRepository<PostLike, Long> {
    long countByPostId(String postId);
    Optional<PostLike> findByPostIdAndUsername(String postId, String username);
    List<PostLike> findByPostId(String postId);
}
