package epg.auction.admin.controller;

import epg.auction.admin.dto.LoginRequest;
import epg.auction.admin.entity.User;
import epg.auction.admin.repository.UserRepository;
import epg.auction.admin.security.JwtUtil;
import epg.auction.admin.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired private UserRepository userRepository;
    @Autowired private JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
        }

        User user = userOpt.get();
        String hashedInput = UserService.hashPassword(request.getPassword());

        if (!hashedInput.equals(user.getPassword())) {
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