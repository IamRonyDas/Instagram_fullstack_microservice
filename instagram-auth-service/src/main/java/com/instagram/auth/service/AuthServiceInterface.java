package com.instagram.auth.service;

import com.instagram.auth.dto.LoginRequest;
import com.instagram.auth.dto.RegisterRequest;
import com.instagram.auth.entity.User;

public interface AuthServiceInterface {
    User registerUser(RegisterRequest request);
    String loginUser(LoginRequest request);
}
