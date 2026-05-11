package epg.auction.admin.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.URL;
import java.net.URLEncoder;

@Service
public class SmsService {

    @Value("${sms.service.url}")
    private String serviceUrl;

    @Value("${app.notifications.enabled:false}")
    private boolean notificationsEnabled;

    public boolean sendSms(String phoneNumber, String text) {
        if (!notificationsEnabled) {
            System.out.println("[SMS DISABLED] Would send to: " + phoneNumber + " | Text: " + text);
            return true;
        }
        try {
            String url = serviceUrl
                    + "&to=" + URLEncoder.encode("995" + phoneNumber, "UTF-8")
                    + "&text=" + URLEncoder.encode(text, "UTF-8");

            System.out.println("Sending SMS to: " + phoneNumber);
            BufferedReader br = new BufferedReader(
                    new InputStreamReader(new URL(url).openStream()));
            String result = br.readLine();
            br.close();

            if (result != null && result.contains("0000")) {
                System.out.println("SMS sent OK to: " + phoneNumber);
                return true;
            } else {
                System.out.println("SMS failed to: " + phoneNumber + " result: " + result);
                return false;
            }
        } catch (Exception e) {
            System.err.println("SMS error: " + e.getMessage());
            return false;
        }
    }
}