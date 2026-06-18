package epg.auction.admin.controller;

import epg.auction.admin.dto.LoginRequest;
import epg.auction.admin.entity.User;
import epg.auction.admin.repository.UserRepository;
import epg.auction.admin.security.JwtUtil;
import epg.auction.admin.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    // Simple in-memory rate limiter: max 10 attempts per IP per 15 minutes
    private final ConcurrentHashMap<String, AtomicInteger> attemptCounts = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, Long> lockoutTimes = new ConcurrentHashMap<>();
    private static final int MAX_ATTEMPTS = 10;
    private static final long LOCKOUT_DURATION_MS = 15 * 60 * 1000;

    public AuthController(UserRepository userRepository, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    private boolean isRateLimited(String ip) {
        Long lockoutTime = lockoutTimes.get(ip);
        if (lockoutTime != null) {
            if (System.currentTimeMillis() - lockoutTime < LOCKOUT_DURATION_MS) {
                return true;
            } else {
                lockoutTimes.remove(ip);
                attemptCounts.remove(ip);
            }
        }
        return false;
    }

    private void recordFailedAttempt(String ip) {
        AtomicInteger attempts = attemptCounts.computeIfAbsent(ip, k -> new AtomicInteger(0));
        if (attempts.incrementAndGet() >= MAX_ATTEMPTS) {
            lockoutTimes.put(ip, System.currentTimeMillis());
        }
    }

    private void clearAttempts(String ip) {
        attemptCounts.remove(ip);
        lockoutTimes.remove(ip);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request,
                                   HttpServletRequest httpRequest) {
        String ip = httpRequest.getRemoteAddr();

        if (isRateLimited(ip)) {
            return ResponseEntity.status(429)
                    .body(Map.of("error", "Too many login attempts. Please try again in 15 minutes."));
        }

        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());

        if (userOpt.isEmpty()) {
            recordFailedAttempt(ip);
            return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
        }

        User user = userOpt.get();
        String hashedInput = UserService.hashPassword(request.getPassword());

        if (!hashedInput.equals(user.getPassword())) {
            recordFailedAttempt(ip);
            return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
        }

        if (user.getActive() == null || !user.getActive()) {
            return ResponseEntity.status(403).body(Map.of("error", "Account is not active"));
        }

        if (Boolean.TRUE.equals(user.getLocked())) {
            return ResponseEntity.status(403).body(Map.of("error", "Account is locked"));
        }

        if (Boolean.TRUE.equals(user.getCancelled())) {
            return ResponseEntity.status(403).body(Map.of("error", "Account is cancelled"));
        }

        clearAttempts(ip);
        user.setLoginDate(new java.util.Date());
        userRepository.save(user);
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());

        return ResponseEntity.ok(Map.of(
                "token", token,
                "email", user.getEmail(),
                "role", user.getRole() != null ? user.getRole() : "",
                "firstName", user.getFirstName() != null ? user.getFirstName() : "",
                "lastName", user.getLastName() != null ? user.getLastName() : ""
        ));
    }
}