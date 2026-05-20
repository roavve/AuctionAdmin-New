package epg.auction.admin.controller;

import epg.auction.admin.entity.User;
import epg.auction.admin.service.UserService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public Page<User> search(@RequestParam(required = false) String email,
                             @RequestParam(required = false) Integer companyId,
                             @RequestParam(required = false) Boolean internal,
                             @RequestParam(required = false) Boolean active,
                             @RequestParam(required = false) Boolean locked,
                             @RequestParam(defaultValue = "0") int page,
                             @RequestParam(defaultValue = "20") int size) {
        return userService.searchUsers(email, companyId, internal, active, locked, page, size);
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getById(@PathVariable Integer id) {
        return userService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<User> create(@RequestBody User user, Authentication auth) {
        return ResponseEntity.ok(userService.createUser(user, auth.getName()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> update(@PathVariable Integer id,
                                       @RequestBody User user, Authentication auth) {
        return ResponseEntity.ok(userService.updateUser(id, user, auth.getName()));
    }

    @PostMapping("/{id}/lock")
    public ResponseEntity<?> lock(@PathVariable Integer id, Authentication auth) {
        userService.lockUser(id, auth.getName());
        return ResponseEntity.ok(Map.of("success", true));
    }

    @PostMapping("/{id}/unlock")
    public ResponseEntity<?> unlock(@PathVariable Integer id, Authentication auth) {
        userService.unlockUser(id, auth.getName());
        return ResponseEntity.ok(Map.of("success", true));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<?> cancel(@PathVariable Integer id, Authentication auth) {
        userService.cancelUser(id, auth.getName());
        return ResponseEntity.ok(Map.of("success", true));
    }

    @PostMapping("/{id}/changePassword")
    public ResponseEntity<?> changePassword(@PathVariable Integer id,
                                            @RequestBody Map<String, String> body,
                                            Authentication auth) {
        userService.changePassword(id, body.get("password"), auth.getName());
        return ResponseEntity.ok(Map.of("success", true));
    }

    @GetMapping("/monitoring")
    public List<User> getMonitoringUsers() {
        return userService.getMonitoringUsers();
    }

    @PostMapping("/monitoring")
    public ResponseEntity<User> createMonitoringUser(@RequestBody User user, Authentication auth) {
        return ResponseEntity.ok(userService.createMonitoringUser(user, auth.getName()));
    }
}