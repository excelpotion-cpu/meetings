package ir.fileland.meetings;

import android.app.AlarmManager;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;

import org.json.JSONArray;
import org.json.JSONObject;

/** زمان‌بندی یادآوری جلسات و ساخت اعلان */
final class Reminders {

    private static final String PREFS = "rem";
    private static final String CHANNEL = "meetings";

    private Reminders() {}

    /** لیست یادآوری‌ها را ذخیره و زمان‌بندی می‌کند. json: [{id,t,title,body}] */
    static void apply(Context c, String json) {
        c.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().putString("list", json).apply();
        schedule(c, json);
    }

    static void rescheduleSaved(Context c) {
        schedule(c, c.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString("list", "[]"));
    }

    private static void schedule(Context c, String json) {
        AlarmManager am = (AlarmManager) c.getSystemService(Context.ALARM_SERVICE);
        if (am == null) return;
        SharedPreferences sp = c.getSharedPreferences(PREFS, Context.MODE_PRIVATE);

        // لغو یادآوری‌های قبلی
        String old = sp.getString("codes", "");
        for (String s : old.split(",")) {
            if (s.isEmpty()) continue;
            try {
                am.cancel(pending(c, Integer.parseInt(s), "", ""));
            } catch (Exception ignored) {
            }
        }

        StringBuilder codes = new StringBuilder();
        try {
            JSONArray a = new JSONArray(json);
            long now = System.currentTimeMillis();
            for (int i = 0; i < a.length(); i++) {
                JSONObject o = a.getJSONObject(i);
                long t = o.getLong("t");
                if (t <= now) continue;
                int code = o.getString("id").hashCode();
                PendingIntent p = pending(c, code, o.optString("title"), o.optString("body"));
                if (Build.VERSION.SDK_INT >= 23) {
                    am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, t, p);
                } else {
                    am.set(AlarmManager.RTC_WAKEUP, t, p);
                }
                codes.append(code).append(",");
            }
        } catch (Exception ignored) {
        }
        sp.edit().putString("codes", codes.toString()).apply();
    }

    private static PendingIntent pending(Context c, int code, String title, String body) {
        Intent i = new Intent(c, ReminderReceiver.class);
        i.setAction("ir.fileland.meetings.REMIND");
        i.putExtra("title", title);
        i.putExtra("body", body);
        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= 23) flags |= PendingIntent.FLAG_IMMUTABLE;
        return PendingIntent.getBroadcast(c, code, i, flags);
    }

    /** نمایش اعلان؛ با لمس آن برنامه باز می‌شود */
    static void notifyUser(Context c, String title, String body) {
        NotificationManager nm = (NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm == null) return;
        if (Build.VERSION.SDK_INT >= 26) {
            nm.createNotificationChannel(new NotificationChannel(
                    CHANNEL, "جلسات", NotificationManager.IMPORTANCE_HIGH));
        }
        Intent open = c.getPackageManager().getLaunchIntentForPackage(c.getPackageName());
        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= 23) flags |= PendingIntent.FLAG_IMMUTABLE;
        PendingIntent content = PendingIntent.getActivity(c, 0, open, flags);

        Notification.Builder b = Build.VERSION.SDK_INT >= 26
                ? new Notification.Builder(c, CHANNEL)
                : new Notification.Builder(c);
        b.setSmallIcon(R.mipmap.ic_launcher)
                .setContentTitle(title)
                .setContentText(body)
                .setStyle(new Notification.BigTextStyle().bigText(body))
                .setContentIntent(content)
                .setAutoCancel(true);
        if (Build.VERSION.SDK_INT < 26) b.setPriority(Notification.PRIORITY_HIGH);
        nm.notify((int) (System.currentTimeMillis() % Integer.MAX_VALUE), b.build());
    }
}
