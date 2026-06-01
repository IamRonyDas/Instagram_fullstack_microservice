# Instagram Clone (Full-Stack Microservices Architecture)

A fully functional, highly scalable Instagram clone built with a **Java Spring Boot Microservices** backend and a **React + TypeScript** frontend.

## 🚀 Features

- **User Authentication**: Secure registration and login using JWT (JSON Web Tokens).
- **Social Graph**: Follow and unfollow users to curate a personalized social experience.
- **Dynamic Feeds**: A personalized feed that aggregates posts from followed users, sorted chronologically.
- **Post & Media Management**: Upload posts with captions, locations, and multiple media items (images and videos).
- **Interactive Engagement**: Like posts and leave comments in real-time.
- **Trending & Discovery**: Discover trending posts dynamically sorted and filtered by recent likes (last 24 hours), hashtags, and locations.
- **Real-Time Notifications**: Asynchronous alerts for new followers, likes, and comments.
- **Premium UI/UX**: Built with modern web design principles (glassmorphism, micro-animations, and smooth mobile overscroll handling).

## 🏗️ Architecture

This project is broken down into distinct microservices to ensure loose coupling, high cohesion, and independent scalability:

1. **API Gateway (`instagram-gateway`)**: The single entry point for the React frontend. Routes traffic to appropriate backend services on different ports.
2. **Auth Service (`instagram-auth-service`)**: Handles user identities, registration, and JWT issuance.
3. **Post Service (`instagram-post-service`)**: The core engine. Manages posts, comments, likes, media references, and feed generation logic.
4. **Follow Service (`instagram-follow-service`)**: Manages the follower/following relationships between users.
5. **Notification Service (`instagram-notification-service`)**: An asynchronous receiver that logs and dispatches alerts when notable actions (like, comment, follow) occur.

## 🛠️ Technology Stack

### Backend
- **Java 21**
- **Spring Boot 3**
- **Spring Cloud Gateway**
- **Spring Data JPA**
- **JUnit 5 & Mockito** (Unit Testing)
- **Maven** (Build Tool)

### Frontend
- **React 18**
- **TypeScript**
- **Vanilla CSS** (Custom Design System, Instagram Branding)
- **Webpack** (via Create React App)

---

## 💻 Getting Started (Local Development)

### Prerequisites
- **Java 21**
- **Maven 3.8+**
- **Node.js 18+** & **npm**

### 1. Start the Microservices
Each backend service needs to be started individually. Open five separate terminal tabs and run the following commands:

```bash
# Terminal 1: Gateway (Runs on port 8080)
cd instagram-gateway && mvn spring-boot:run

# Terminal 2: Auth Service (Runs on port 8081)
cd instagram-auth-service && mvn spring-boot:run

# Terminal 3: Follow Service (Runs on port 8082)
cd instagram-follow-service && mvn spring-boot:run

# Terminal 4: Post Service (Runs on port 8083)
cd instagram-post-service && mvn spring-boot:run

# Terminal 5: Notification Service (Runs on port 8084)
cd instagram-notification-service && mvn spring-boot:run
```

### 2. Start the React Frontend
Open a new terminal tab at the root of the project:

```bash
# Install dependencies
npm install

# Start the development server
npm start
```
Your browser will automatically open to `http://localhost:3000`.

---

## 🧪 Testing

The backend relies heavily on `JUnit 5` and `Mockito` for testing business logic in the service layers.

To run tests for a specific microservice:
```bash
cd instagram-<service-name>
mvn test
```

To run frontend tests:
```bash
npm test
```

## 📜 License
This project is open-source and available under the MIT License.
