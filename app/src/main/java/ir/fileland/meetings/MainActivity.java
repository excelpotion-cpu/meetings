package ir.fileland.meetings;

import android.Manifest;
import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.ContentValues;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.media.MediaScannerConnection;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.CalendarContract;
import android.provider.MediaStore;
import android.util.Base64;
import android.view.ViewGroup;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.Toast;

import org.json.JSONObject;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;

public class MainActivity extends Activity {

    private static final String START_URL = "file:///android_asset/index.html";
    private static final int REQ_FILE = 1001;
    private static final int REQ_STORAGE = 1002;
    private static final int REQ_NOTIF = 2001;

    private WebView webView;
    private ValueCallback<Uri[]> filePathCallback;
    private boolean pageReady = false;
    private String sharedText = null;
    private String sharedIcs = null;

    private String pendingB64, pendingName, pendingMime;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        FrameLayout root = new FrameLayout(this);
        webView = new WebView(this);
        root.addView(webView, new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        setContentView(root);

        setupWebView();
        readIntent(getIntent());

        if (savedInstanceState != null) {
            webView.restoreState(savedInstanceState);
        } else {
            webView.loadUrl(START_URL);
        }

        // اجازه‌ی اعلان (اندروید ۱۳ به بالا) برای یادآوری جلسات
        if (Build.VERSION.SDK_INT >= 33
                && checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS)
                != PackageManager.PERMISSION_GRANTED) {
            requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS}, REQ_NOTIF);
        }
    }

    private void setupWebView() {
        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setAllowFileAccess(true);
        s.setAllowContentAccess(true);
        s.setSupportZoom(true);
        s.setBuiltInZoomControls(true);
        s.setDisplayZoomControls(false);

        webView.addJavascriptInterface(new Bridge(), "AndroidBridge");

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
                pageReady = true;
                deliverShared();
            }

            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                String scheme = uri.getScheme();
                if (scheme == null || scheme.equals("file") || scheme.equals("about")
                        || scheme.equals("javascript") || scheme.equals("blob") || scheme.equals("data")) {
                    return false;
                }
                try {
                    startActivity(new Intent(Intent.ACTION_VIEW, uri));
                } catch (Exception e) {
                    toast("برنامه‌ای برای باز کردن این لینک پیدا نشد");
                }
                return true;
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback,
                                             FileChooserParams params) {
                if (filePathCallback != null) filePathCallback.onReceiveValue(null);
                filePathCallback = callback;
                try {
                    startActivityForResult(params.createIntent(), REQ_FILE);
                } catch (Exception e) {
                    filePathCallback = null;
                    toast("امکان انتخاب فایل نیست");
                    return false;
                }
                return true;
            }
        });
    }

    private void toast(String msg) {
        Toast.makeText(this, msg, Toast.LENGTH_LONG).show();
    }

    // ---------------- دریافت متن اشتراکی (Share / انتخاب متن) ----------------

    private void readIntent(Intent i) {
        if (i == null) return;
        String action = i.getAction();
        if (Intent.ACTION_VIEW.equals(action) && i.getData() != null) {
            sharedIcs = readUri(i.getData());
        } else if (Intent.ACTION_SEND.equals(action)) {
            Uri stream = i.getParcelableExtra(Intent.EXTRA_STREAM);
            String t = i.getStringExtra(Intent.EXTRA_TEXT);
            if (stream != null) sharedIcs = readUri(stream);
            else if (t != null && !t.isEmpty()) sharedText = t;
        } else if (Build.VERSION.SDK_INT >= 23 && Intent.ACTION_PROCESS_TEXT.equals(action)) {
            CharSequence t = i.getCharSequenceExtra(Intent.EXTRA_PROCESS_TEXT);
            if (t != null && t.length() > 0) sharedText = t.toString();
        }
    }

    private String readUri(Uri u) {
        try {
            java.io.InputStream in = getContentResolver().openInputStream(u);
            if (in == null) return null;
            java.io.ByteArrayOutputStream bo = new java.io.ByteArrayOutputStream();
            byte[] buf = new byte[4096];
            int n, total = 0;
            while ((n = in.read(buf)) > 0 && total < 300000) {
                bo.write(buf, 0, n);
                total += n;
            }
            in.close();
            return bo.toString("UTF-8");
        } catch (Exception e) {
            return null;
        }
    }

    private void deliverShared() {
        if (!pageReady) return;
        if (sharedText != null) {
            String t = sharedText;
            sharedText = null;
            webView.evaluateJavascript(
                    "window.__incoming&&window.__incoming(" + JSONObject.quote(t) + ",true)", null);
        }
        if (sharedIcs != null) {
            String t = sharedIcs;
            sharedIcs = null;
            webView.evaluateJavascript(
                    "window.__incomingIcs&&window.__incomingIcs(" + JSONObject.quote(t) + ")", null);
        }
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        readIntent(intent);
        deliverShared();
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus && pageReady) {
            webView.evaluateJavascript("window.__resume&&window.__resume()", null);
        }
    }

    // ---------------- پل جاوااسکریپت ↔ اندروید ----------------

    private class Bridge {

        /** شماره نسخه از build.gradle (تنها منبع شماره نسخه در اندروید) */
        @JavascriptInterface
        public String appVersion() {
            try {
                return getPackageManager().getPackageInfo(getPackageName(), 0).versionName;
            } catch (Exception e) {
                return "1.0.0";
            }
        }

        @JavascriptInterface
        public void saveFile(String b64, String name, String mime) {
            handleFile(b64, name, mime);
        }

        /** ارسال متن با برنامه‌ی انتخابی: sms | email | telegram | eitaa | other */
        @JavascriptInterface
        public void shareText(final String ch, final String to, final String subject, final String text) {
            runOnUiThread(() -> doShare(ch, to, subject, text));
        }

        @JavascriptInterface
        public void addToCalendar(final String title, final String loc, final String desc,
                                  final long start, final long end) {
            runOnUiThread(() -> {
                try {
                    Intent i = new Intent(Intent.ACTION_INSERT)
                            .setData(CalendarContract.Events.CONTENT_URI)
                            .putExtra(CalendarContract.Events.TITLE, title)
                            .putExtra(CalendarContract.Events.EVENT_LOCATION, loc)
                            .putExtra(CalendarContract.Events.DESCRIPTION, desc)
                            .putExtra(CalendarContract.EXTRA_EVENT_BEGIN_TIME, start)
                            .putExtra(CalendarContract.EXTRA_EVENT_END_TIME, end);
                    startActivity(i);
                } catch (Exception e) {
                    toast("برنامه‌ی تقویم پیدا نشد");
                }
            });
        }

        @JavascriptInterface
        public void copyText(final String text) {
            runOnUiThread(() -> {
                ClipboardManager cm = (ClipboardManager) getSystemService(Context.CLIPBOARD_SERVICE);
                if (cm != null) cm.setPrimaryClip(ClipData.newPlainText("meeting", text));
            });
        }

        @JavascriptInterface
        public String readClipboard() {
            try {
                ClipboardManager cm = (ClipboardManager) getSystemService(Context.CLIPBOARD_SERVICE);
                if (cm == null || !cm.hasPrimaryClip()) return "";
                ClipData d = cm.getPrimaryClip();
                if (d == null || d.getItemCount() == 0) return "";
                CharSequence t = d.getItemAt(0).coerceToText(MainActivity.this);
                return t == null ? "" : t.toString();
            } catch (Exception e) {
                return "";
            }
        }

        /** ورود با Google از طریق مرورگر؛ نتیجه با window.__googleState به صفحه می‌رسد */
        @JavascriptInterface
        public void googleSignIn(final String clientId, final String secret) {
            Google.signIn(MainActivity.this, clientId, secret, json -> runOnUiThread(() ->
                    webView.evaluateJavascript("window.__googleState&&window.__googleState("
                            + JSONObject.quote(json) + ")", null)));
        }

        @JavascriptInterface
        public String googleInfo() {
            return Google.info(MainActivity.this);
        }

        @JavascriptInterface
        public void googleSignOut() {
            Google.signOut(MainActivity.this);
        }

        /** درخواست به Google API؛ پاسخ با window.__http(id, json) برمی‌گردد */
        @JavascriptInterface
        public void http(final String id, final String method, final String url, final String body) {
            new Thread(() -> {
                final String res = Google.request(MainActivity.this, method, url, body);
                runOnUiThread(() -> webView.evaluateJavascript("window.__http&&window.__http("
                        + JSONObject.quote(id) + "," + JSONObject.quote(res) + ")", null));
            }).start();
        }

        @JavascriptInterface
        public void setReminders(final String json) {
            new Thread(() -> Reminders.apply(MainActivity.this, json)).start();
        }

        /** ایمیل با پیوست فایل تقویم (.ics)؛ اول Gmail، اگر نبود فهرست برنامه‌ها */
        @JavascriptInterface
        public void shareIcs(final String to, final String subject, final String text,
                             final String ics, final String name) {
            runOnUiThread(() -> {
                try {
                    File dir = new File(getCacheDir(), "share");
                    dir.mkdirs();
                    String safe = name.replaceAll("[^A-Za-z0-9._-]", "_");
                    FileOutputStream fo = new FileOutputStream(new File(dir, safe));
                    fo.write(ics.getBytes("UTF-8"));
                    fo.close();
                    Uri uri = Uri.parse("content://ir.fileland.meetings.share/" + safe);
                    Intent i = new Intent(Intent.ACTION_SEND);
                    i.setType("text/calendar");
                    i.putExtra(Intent.EXTRA_STREAM, uri);
                    i.putExtra(Intent.EXTRA_SUBJECT, subject);
                    i.putExtra(Intent.EXTRA_TEXT, text);
                    if (to != null && !to.isEmpty()) i.putExtra(Intent.EXTRA_EMAIL, to.split(","));
                    i.setClipData(ClipData.newRawUri("", uri));
                    i.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                    try {
                        Intent gm = new Intent(i);
                        gm.setPackage("com.google.android.gm");
                        startActivity(gm);
                    } catch (ActivityNotFoundException e) {
                        startActivity(Intent.createChooser(i, "ارسال ایمیل"));
                    }
                } catch (Exception e) {
                    toast("ارسال فایل انجام نشد");
                }
            });
        }
    }

    private boolean granted(String perm) {
        return Build.VERSION.SDK_INT < 23
                || checkSelfPermission(perm) == PackageManager.PERMISSION_GRANTED;
    }

    private void doShare(String ch, String to, String subject, String text) {
        Intent i;
        if (ch.equals("sms")) {
            i = new Intent(Intent.ACTION_SENDTO, Uri.parse("smsto:" + to));
            i.putExtra("sms_body", text);
        } else if (ch.equals("email")) {
            i = new Intent(Intent.ACTION_SENDTO, Uri.parse("mailto:" + to));
            i.putExtra(Intent.EXTRA_SUBJECT, subject);
            i.putExtra(Intent.EXTRA_TEXT, text);
        } else {
            i = new Intent(Intent.ACTION_SEND);
            i.setType("text/plain");
            i.putExtra(Intent.EXTRA_TEXT, text);
            if (ch.equals("telegram")) i.setPackage("org.telegram.messenger");
            else if (ch.equals("eitaa")) i.setPackage("ir.eitaa.messenger");
        }
        try {
            if (ch.equals("other")) {
                startActivity(Intent.createChooser(i, "ارسال"));
            } else {
                startActivity(i);
            }
        } catch (ActivityNotFoundException e) {
            if (ch.equals("telegram") || ch.equals("eitaa")) {
                // برنامه‌ی مورد نظر نصب نیست؛ فهرست همه‌ی برنامه‌ها
                i.setPackage(null);
                try {
                    startActivity(Intent.createChooser(i, "ارسال"));
                    toast("این برنامه نصب نیست؛ برنامه‌ی دیگری انتخاب کنید");
                } catch (Exception e2) {
                    toast("برنامه‌ای برای ارسال پیدا نشد");
                }
            } else {
                toast("برنامه‌ای برای ارسال پیدا نشد");
            }
        }
    }

    // ---------------- ذخیره فایل پشتیبان ----------------

    private void handleFile(final String b64, final String name, final String mime) {
        runOnUiThread(() -> {
            boolean need = Build.VERSION.SDK_INT >= Build.VERSION_CODES.M
                    && Build.VERSION.SDK_INT < Build.VERSION_CODES.Q
                    && checkSelfPermission(Manifest.permission.WRITE_EXTERNAL_STORAGE)
                    != PackageManager.PERMISSION_GRANTED;
            if (need) {
                pendingB64 = b64;
                pendingName = name;
                pendingMime = mime;
                requestPermissions(new String[]{Manifest.permission.WRITE_EXTERNAL_STORAGE}, REQ_STORAGE);
                return;
            }
            new Thread(() -> writeFile(b64, name, mime)).start();
        });
    }

    private void writeFile(String b64, String name, String mime) {
        try {
            byte[] data = Base64.decode(b64, Base64.DEFAULT);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                ContentValues v = new ContentValues();
                v.put(MediaStore.MediaColumns.DISPLAY_NAME, name);
                v.put(MediaStore.MediaColumns.MIME_TYPE, mime);
                v.put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS);
                Uri uri = getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, v);
                if (uri == null) throw new Exception("insert failed");
                OutputStream os = getContentResolver().openOutputStream(uri);
                os.write(data);
                os.close();
            } else {
                File dir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS);
                dir.mkdirs();
                File f = new File(dir, name);
                int n = 1;
                while (f.exists()) {
                    int dot = name.lastIndexOf('.');
                    String base = dot > 0 ? name.substring(0, dot) : name;
                    String ext = dot > 0 ? name.substring(dot) : "";
                    f = new File(dir, base + " (" + (n++) + ")" + ext);
                }
                FileOutputStream fo = new FileOutputStream(f);
                fo.write(data);
                fo.close();
                MediaScannerConnection.scanFile(this, new String[]{f.getAbsolutePath()}, new String[]{mime}, null);
            }
            runOnUiThread(() -> toast("ذخیره شد در پوشه Downloads"));
        } catch (Exception e) {
            runOnUiThread(() -> toast("ذخیره فایل انجام نشد"));
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == REQ_STORAGE) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED
                    && pendingB64 != null) {
                final String b = pendingB64, n = pendingName, m = pendingMime;
                pendingB64 = null;
                new Thread(() -> writeFile(b, n, m)).start();
            } else {
                pendingB64 = null;
                toast("بدون اجازه‌ی حافظه امکان ذخیره فایل نیست");
            }
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode == REQ_FILE && filePathCallback != null) {
            Uri[] result = null;
            if (resultCode == RESULT_OK && data != null) {
                result = WebChromeClient.FileChooserParams.parseResult(resultCode, data);
            }
            filePathCallback.onReceiveValue(result);
            filePathCallback = null;
            return;
        }
        super.onActivityResult(requestCode, resultCode, data);
    }

    @Override
    public void onBackPressed() {
        webView.evaluateJavascript("(window.__back&&window.__back())?'1':'0'", value -> {
            if (value == null || !value.contains("1")) finish();
        });
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        webView.saveState(outState);
    }

    @Override
    protected void onPause() {
        super.onPause();
        webView.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        webView.onResume();
    }

    @Override
    protected void onDestroy() {
        if (webView != null) webView.destroy();
        super.onDestroy();
    }
}
