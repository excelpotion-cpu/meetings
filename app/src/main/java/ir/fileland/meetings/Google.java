package ir.fileland.meetings;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.util.Base64;

import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.InetAddress;
import java.net.ServerSocket;
import java.net.Socket;
import java.net.URL;
import java.net.URLEncoder;
import java.security.MessageDigest;
import java.security.SecureRandom;

/**
 * ورود با حساب Google (OAuth برای «Desktop app» با ریدایرکت loopback و PKCE)
 * و صدا زدن Google Calendar API. ورود از مرورگر گوشی انجام می‌شود چون Google
 * ورود داخل WebView را نمی‌پذیرد.
 */
final class Google {

    interface Result {
        void done(String json);
    }

    private static final String PREFS = "google";
    private static final String SCOPE =
            "openid email profile https://www.googleapis.com/auth/calendar.events";

    private Google() {}

    // ---------------- ورود ----------------

    static void signIn(final Activity act, final String clientId, final String secret, final Result cb) {
        new Thread(() -> {
            ServerSocket ss = null;
            try {
                ss = new ServerSocket(0, 5, InetAddress.getByName("127.0.0.1"));
                ss.setSoTimeout(240000);
                int port = ss.getLocalPort();
                String verifier = random(64);
                String challenge = b64url(MessageDigest.getInstance("SHA-256").digest(verifier.getBytes("US-ASCII")));
                String state = random(16);
                String redirect = "http://127.0.0.1:" + port;
                final String url = "https://accounts.google.com/o/oauth2/v2/auth"
                        + "?client_id=" + enc(clientId)
                        + "&redirect_uri=" + enc(redirect)
                        + "&response_type=code"
                        + "&scope=" + enc(SCOPE)
                        + "&code_challenge=" + challenge
                        + "&code_challenge_method=S256"
                        + "&state=" + state
                        + "&access_type=offline&prompt=consent";
                act.runOnUiThread(() -> {
                    try {
                        act.startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url)));
                    } catch (Exception ignored) {
                    }
                });

                String code = null, err = null;
                for (int i = 0; i < 6 && code == null && err == null; i++) {
                    Socket s = ss.accept();
                    s.setSoTimeout(5000);
                    String line = null;
                    try {
                        BufferedReader r = new BufferedReader(new InputStreamReader(s.getInputStream(), "UTF-8"));
                        line = r.readLine();
                    } catch (IOException ignored) {
                    }
                    if (line != null && line.startsWith("GET ")) {
                        String[] parts = line.split(" ");
                        Uri u = Uri.parse("http://127.0.0.1" + parts[1]);
                        err = u.getQueryParameter("error");
                        String c = u.getQueryParameter("code");
                        if (c != null && state.equals(u.getQueryParameter("state"))) code = c;
                        if (c != null || err != null) {
                            boolean ok = code != null;
                            reply(s, ok ? "✅ ورود انجام شد" : "❌ ورود انجام نشد",
                                    ok ? "به برنامه «جلسات من» برگردید." : "دوباره تلاش کنید.");
                            continue;
                        }
                    }
                    try {
                        s.close();
                    } catch (IOException ignored) {
                    }
                }
                if (code == null) throw new Exception(err != null ? err : "timeout");

                String form = "code=" + enc(code) + "&client_id=" + enc(clientId)
                        + "&client_secret=" + enc(secret) + "&code_verifier=" + enc(verifier)
                        + "&grant_type=authorization_code&redirect_uri=" + enc(redirect);
                JSONObject tok = new JSONObject(postForm("https://oauth2.googleapis.com/token", form));

                String email = "", name = "";
                String idt = tok.optString("id_token", "");
                String[] seg = idt.split("\\.");
                if (seg.length > 1) {
                    JSONObject pl = new JSONObject(new String(
                            Base64.decode(seg[1], Base64.URL_SAFE | Base64.NO_PADDING | Base64.NO_WRAP), "UTF-8"));
                    email = pl.optString("email", "");
                    name = pl.optString("name", "");
                }
                String refresh = tok.optString("refresh_token", "");
                if (refresh.isEmpty()) throw new Exception("no refresh token");

                SharedPreferences.Editor e = act.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit();
                e.putString("cid", clientId).putString("secret", secret)
                        .putString("refresh", refresh)
                        .putString("access", tok.optString("access_token", ""))
                        .putLong("exp", System.currentTimeMillis() + tok.optLong("expires_in", 3000) * 1000L)
                        .putString("email", email).putString("name", name).apply();
                cb.done(info(act));
            } catch (Exception ex) {
                cb.done(fail(ex.getMessage()));
            } finally {
                try {
                    if (ss != null) ss.close();
                } catch (IOException ignored) {
                }
            }
        }).start();
    }

    static void signOut(Context c) {
        c.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().clear().apply();
    }

    static String info(Context c) {
        SharedPreferences sp = c.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        JSONObject o = new JSONObject();
        try {
            o.put("on", sp.getString("refresh", "").length() > 0);
            o.put("email", sp.getString("email", ""));
            o.put("name", sp.getString("name", ""));
        } catch (Exception ignored) {
        }
        return o.toString();
    }

    private static String fail(String msg) {
        JSONObject o = new JSONObject();
        try {
            o.put("on", false);
            o.put("error", msg == null ? "unknown" : msg);
        } catch (Exception ignored) {
        }
        return o.toString();
    }

    // ---------------- توکن و درخواست‌ها ----------------

    /** توکن معتبر می‌دهد (در صورت نیاز تازه می‌کند)؛ blocking است */
    private static String accessToken(Context c) {
        SharedPreferences sp = c.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        String access = sp.getString("access", "");
        if (!access.isEmpty() && System.currentTimeMillis() < sp.getLong("exp", 0) - 60000) return access;
        String refresh = sp.getString("refresh", "");
        if (refresh.isEmpty()) return null;
        try {
            String form = "client_id=" + enc(sp.getString("cid", "")) + "&client_secret=" + enc(sp.getString("secret", ""))
                    + "&refresh_token=" + enc(refresh) + "&grant_type=refresh_token";
            JSONObject tok = new JSONObject(postForm("https://oauth2.googleapis.com/token", form));
            String a = tok.optString("access_token", "");
            if (a.isEmpty()) return null;
            sp.edit().putString("access", a)
                    .putLong("exp", System.currentTimeMillis() + tok.optLong("expires_in", 3000) * 1000L).apply();
            return a;
        } catch (Exception e) {
            return null;
        }
    }

    /** درخواست به Google API؛ خروجی JSON مثل {"status":200,"body":"..."} */
    static String request(Context c, String method, String url, String body) {
        JSONObject out = new JSONObject();
        try {
            if (!url.startsWith("https://www.googleapis.com/")) throw new IOException("blocked url");
            String tok = accessToken(c);
            if (tok == null) {
                out.put("status", 401);
                out.put("body", "no token");
                return out.toString();
            }
            HttpURLConnection h = (HttpURLConnection) new URL(url).openConnection();
            String m = method.toUpperCase();
            if (m.equals("PATCH")) {
                h.setRequestMethod("POST");
                h.setRequestProperty("X-HTTP-Method-Override", "PATCH");
            } else {
                h.setRequestMethod(m);
            }
            h.setConnectTimeout(15000);
            h.setReadTimeout(25000);
            h.setRequestProperty("Authorization", "Bearer " + tok);
            h.setRequestProperty("Accept", "application/json");
            if (body != null && !body.isEmpty() && !m.equals("GET") && !m.equals("DELETE")) {
                h.setDoOutput(true);
                h.setRequestProperty("Content-Type", "application/json; charset=utf-8");
                OutputStream os = h.getOutputStream();
                os.write(body.getBytes("UTF-8"));
                os.close();
            }
            int code = h.getResponseCode();
            String rb = read(code >= 400 ? h.getErrorStream() : h.getInputStream());
            out.put("status", code);
            out.put("body", rb);
            return out.toString();
        } catch (Exception e) {
            try {
                out.put("status", 0);
                out.put("body", String.valueOf(e.getMessage()));
            } catch (Exception ignored) {
            }
            return out.toString();
        }
    }

    // ---------------- ابزارها ----------------

    private static String postForm(String url, String form) throws IOException {
        HttpURLConnection h = (HttpURLConnection) new URL(url).openConnection();
        h.setRequestMethod("POST");
        h.setDoOutput(true);
        h.setConnectTimeout(15000);
        h.setReadTimeout(20000);
        h.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");
        OutputStream os = h.getOutputStream();
        os.write(form.getBytes("UTF-8"));
        os.close();
        int code = h.getResponseCode();
        String body = read(code >= 400 ? h.getErrorStream() : h.getInputStream());
        if (code >= 400) throw new IOException(body);
        return body;
    }

    private static void reply(Socket s, String title, String text) {
        try {
            String html = "<html dir=\"rtl\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width\"></head>"
                    + "<body style=\"font-family:sans-serif;text-align:center;margin-top:20%\"><h2>" + title + "</h2><p>" + text + "</p></body></html>";
            byte[] hb = html.getBytes("UTF-8");
            OutputStream os = s.getOutputStream();
            os.write(("HTTP/1.1 200 OK\r\nContent-Type: text/html; charset=utf-8\r\nContent-Length: "
                    + hb.length + "\r\nConnection: close\r\n\r\n").getBytes("UTF-8"));
            os.write(hb);
            os.flush();
            s.close();
        } catch (IOException ignored) {
        }
    }

    private static String read(InputStream in) throws IOException {
        if (in == null) return "";
        ByteArrayOutputStream bo = new ByteArrayOutputStream();
        byte[] b = new byte[4096];
        int n;
        while ((n = in.read(b)) > 0) bo.write(b, 0, n);
        in.close();
        return bo.toString("UTF-8");
    }

    private static String enc(String s) {
        try {
            return URLEncoder.encode(s, "UTF-8");
        } catch (Exception e) {
            return s;
        }
    }

    private static String b64url(byte[] b) {
        return Base64.encodeToString(b, Base64.URL_SAFE | Base64.NO_PADDING | Base64.NO_WRAP);
    }

    private static String random(int n) {
        String a = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
        SecureRandom r = new SecureRandom();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < n; i++) sb.append(a.charAt(r.nextInt(a.length())));
        return sb.toString();
    }
}
