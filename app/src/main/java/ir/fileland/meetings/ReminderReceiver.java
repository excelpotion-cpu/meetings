package ir.fileland.meetings;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

public class ReminderReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        String title = intent.getStringExtra("title");
        String body = intent.getStringExtra("body");
        Reminders.notifyUser(context,
                title == null || title.isEmpty() ? "یادآوری جلسه" : title,
                body == null ? "" : body);
    }
}
