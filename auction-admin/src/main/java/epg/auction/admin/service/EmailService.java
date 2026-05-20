package epg.auction.admin.service;

import epg.auction.admin.repository.TextTemplateRepository;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class EmailService {

    private final JavaMailSender mailSender;
    private final TextTemplateRepository templateRepository;
    private final boolean notificationsEnabled;

    public EmailService(JavaMailSender mailSender,
                        TextTemplateRepository templateRepository,
                        @Value("${app.notifications.enabled:false}") boolean notificationsEnabled) {
        this.mailSender = mailSender;
        this.templateRepository = templateRepository;
        this.notificationsEnabled = notificationsEnabled;
    }

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

    public String processTemplate(String templateKey, Map<String, String> vars) {
        return templateRepository.findByTkey(templateKey).map(t -> {
            String body = t.getEmailBody() != null ? t.getEmailBody() : "";
            for (Map.Entry<String, String> entry : vars.entrySet()) {
                body = body.replace("{" + entry.getKey() + "}", entry.getValue() != null ? entry.getValue() : "");
            }
            return body;
        }).orElse("");
    }

    public String processSubject(String templateKey, Map<String, String> vars) {
        return templateRepository.findByTkey(templateKey).map(t -> {
            String subject = t.getSubject() != null ? t.getSubject() : "";
            for (Map.Entry<String, String> entry : vars.entrySet()) {
                subject = subject.replace("{" + entry.getKey() + "}", entry.getValue() != null ? entry.getValue() : "");
            }
            return subject;
        }).orElse("");
    }

    public boolean sendTemplatedEmail(String to, String templateKey, Map<String, String> vars) {
        String subject = processSubject(templateKey, vars);
        String body = processTemplate(templateKey, vars);
        if (subject.isEmpty() && body.isEmpty()) {
            System.err.println("Template not found: " + templateKey);
            return false;
        }
        return sendEmail(to, subject, body);
    }
}