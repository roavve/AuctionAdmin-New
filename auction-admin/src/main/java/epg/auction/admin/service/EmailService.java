package epg.auction.admin.service;

import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${app.notifications.enabled:false}")
    private boolean notificationsEnabled;

    public boolean sendEmail(String to, String subject, String htmlContent) {
        if (!notificationsEnabled) {
            System.out.println("[EMAIL DISABLED] Would send to: " + to + " | Subject: " + subject);
            return true;
        }
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom("procurement-noreply@energo-pro.ge");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            mailSender.send(message);
            System.out.println("Email sent to: " + to);
            return true;
        } catch (Exception e) {
            System.err.println("Email failed to: " + to + " - " + e.getMessage());
            return false;
        }
    }
}