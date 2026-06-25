package epg.auction.admin.service;

import epg.auction.admin.entity.User;
import epg.auction.admin.repository.DictionaryItemRepository;
import epg.auction.admin.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.MessageDigest;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final DictionaryItemRepository dictionaryItemRepository;

    public UserService(UserRepository userRepository,
                       DictionaryItemRepository dictionaryItemRepository) {
        this.userRepository = userRepository;
        this.dictionaryItemRepository = dictionaryItemRepository;
    }
    private void validateUser(User user, boolean isNew) {
        java.util.List<String> missing = new java.util.ArrayList<>();
        if (user.getFirstName() == null || user.getFirstName().trim().isEmpty()) missing.add("First Name");
        if (user.getLastName() == null || user.getLastName().trim().isEmpty()) missing.add("Last Name");
        if (user.getEmail() == null || user.getEmail().trim().isEmpty()) missing.add("Email");
        if (isNew && (user.getPassword() == null || user.getPassword().trim().isEmpty())) missing.add("Password");
        if (user.getContactPosition() == null || user.getContactPosition().trim().isEmpty()) missing.add("Contact Position");
        if (user.getContactEmail() == null || user.getContactEmail().trim().isEmpty()) missing.add("Contact Email");
        if (user.getContactPhone() == null || user.getContactPhone().trim().isEmpty()) missing.add("Contact Phone");
        if (user.getContactMobile() == null || user.getContactMobile().trim().isEmpty()) missing.add("Contact Mobile");

        if (!missing.isEmpty()) {
            throw new RuntimeException("Missing required fields: " + String.join(", ", missing));
        }
        String emailRegex = "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$";
        if (!user.getEmail().matches(emailRegex)) {
            throw new RuntimeException("Email is not a valid email address");
        }
        if (!user.getContactEmail().matches(emailRegex)) {
            throw new RuntimeException("Contact Email is not a valid email address");
        }
        if (isNew && user.getPassword().length() < 6) {
            throw new RuntimeException("Password must be at least 6 characters");
        }
    }
    public List<User> getAll() { return userRepository.findAll(); }

    public Optional<User> getById(Integer id) { return userRepository.findById(id); }

    public Page<User> searchUsers(String email, Integer companyId,
                                  Boolean internal, Boolean active, Boolean locked,
                                  int page, int size) {
        return userRepository.searchUsers(email, companyId, internal, active, locked,
                PageRequest.of(page, size));
    }

    @Transactional
    public User createUser(User user, String createdBy) {
        validateUser(user, true);
        user.setRecordKey(UUID.randomUUID().toString());
        user.setRegisterDate(new Date());
        user.setActive(true);
        user.setLocked(false);
        user.setCancelled(false);
        user.setStatus(1);
        user.setCreateUserId(createdBy);
        if (user.getPassword() != null) {
            user.setPassword(hashPassword(user.getPassword()));
        }
        return userRepository.save(user);
    }

    @Transactional
    public User updateUser(Integer id, User user, String modifiedBy) {
        validateUser(user, false);
        User original = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        original.setFirstName(user.getFirstName());
        original.setLastName(user.getLastName());

        original.setRole(user.getRole());
        original.setInternal(user.getInternal());
        original.setExternal(user.getExternal());
        original.setContactEmail(user.getContactEmail());
        original.setContactPhone(user.getContactPhone());
        original.setContactMobile(user.getContactMobile());
        original.setContactPosition(user.getContactPosition());
        original.setModifyDate(new Date());
        original.setModifyUserId(modifiedBy);
        return userRepository.save(original);
    }

    @Transactional
    public void lockUser(Integer id, String modifiedBy) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setLocked(true);
        user.setLockDate(new Date());
        user.setModifyUserId(modifiedBy);
        userRepository.save(user);

    }

    @Transactional
    public void unlockUser(Integer id, String modifiedBy) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setLocked(false);
        user.setLockDate(null);
        user.setModifyUserId(modifiedBy);
        userRepository.save(user);
    }

    @Transactional
    public void cancelUser(Integer id, String modifiedBy) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setCancelled(true);
        user.setActive(false);
        user.setCancelledDate(new Date());
        user.setModifyUserId(modifiedBy);
        userRepository.save(user);
    }

    @Transactional
    public void changePassword(Integer id, String newPassword, String modifiedBy) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setPassword(hashPassword(newPassword));
        user.setModifyUserId(modifiedBy);
        userRepository.save(user);
    }

    public List<User> getMonitoringUsers() {
        return userRepository.findMonitoringUsers();
    }

    @Transactional
    public User createMonitoringUser(User user, String createdBy) {
        user.setRole("ROLE_VIEWER");
        return createUser(user, createdBy);
    }

    public static String hashPassword(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-1");
            byte[] result = md.digest(input.getBytes("UTF-8"));
            StringBuilder sb = new StringBuilder();
            for (byte b : result) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            throw new RuntimeException("SHA1 error", e);
        }
    }
}