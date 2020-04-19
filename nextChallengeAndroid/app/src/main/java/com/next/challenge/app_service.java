package com.next.challenge;

import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.graphics.BitmapFactory;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.IBinder;
import android.util.Log;
import android.widget.Toast;

import androidx.annotation.Nullable;
import androidx.annotation.RequiresApi;
import androidx.core.app.NotificationCompat;

import com.google.gson.Gson;
import com.squareup.okhttp.HttpUrl;
import com.squareup.okhttp.OkHttpClient;
import com.squareup.okhttp.Request;
import com.squareup.okhttp.Response;




import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;

import tech.gusavila92.websocketclient.WebSocketClient;


public class app_service extends Service {
    private WebSocketClient webSocketClient;

    public String apiUrl = "http://www.nextchallenge.co.za:93/api/index/";
    public OkHttpClient client = new OkHttpClient();

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        Bundle extras = intent.getExtras();
        if (extras != null)
        {
            Log.d("Service","not null");
            String from = (String) extras.get("logon");
            //Log.d("Service",from);
        }
        Gson gson = new Gson();

        createWebSocketClient();
        Thread thread = new Thread(new Runnable() {

            @Override
            public void run() {
                try {
                    HttpUrl.Builder urlBuilder = HttpUrl.parse(apiUrl + "retrieveservers").newBuilder();
                    urlBuilder.addQueryParameter("role", "WebSocket");
                    String url = urlBuilder.build().toString();

                    Request request = new Request.Builder()
                            .url(url)
                            .get()
                            .build();

                    Response response = client.newCall(request).execute();
                    //Toast toast = Toast.makeText(getApplicationContext(), response.body().string(), Toast.LENGTH_LONG);
                    //toast.show();
                    Log.i("Websocket", response.body().string());

                } catch (Exception e) {
                    Log.i("Websocket", e.getMessage());
                }

            }
        });

        thread.start();


        return START_STICKY;
    }



    @Override
    public void onDestroy() {
        super.onDestroy();
    }

    private void createWebSocketClient() {
        URI uri;
        try {
            // Connect to local host
            uri = new URI("ws://192.168.0.144:8080/_df$socket$/notifications");
        }
        catch (URISyntaxException e) {
            e.printStackTrace();
            return;
        }
        webSocketClient = new WebSocketClient(uri) {
            @Override
            public void onOpen() {
                Log.i("WebSocket", "Session is starting");
                //webSocketClient.send("Hello World!");
                NotificationData notification = new NotificationData();
                notification.setNotificationType("ADD");
                notification.setNotificationFrom("5e96f1cb4842ce12ccdc6a97");
                notification.setNotificationTo("5e96f1cb4842ce12ccdc6a97");
                notification.setData("[]");
                webSocketClient.send(new Gson().toJson(notification));
                try {

                    Thread.sleep(1000);
                    notification.setNotificationType("UPDATE_CHAT_STATUS");
                    notification.setNotificationFrom("5e96f1cb4842ce12ccdc6a97");
                    notification.setNotificationTo("5e96f1cb4842ce12ccdc6a97");
                    notification.setData("available");
                    webSocketClient.send(new Gson().toJson(notification));
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
            @RequiresApi(api = Build.VERSION_CODES.JELLY_BEAN)
            @Override
            public void onTextReceived(String s) {
                Log.i("WebSocket", s);

                NotificationManager notif=(NotificationManager)getSystemService(Context.NOTIFICATION_SERVICE);
                Notification notify=new Notification.Builder
                        (getApplicationContext())
                        .setContentTitle("ssef")
                        .setContentText("se").
                        setContentTitle("")
                        .setSmallIcon(R.drawable.ic_launcher_background)
                        .build();

                notify.flags |= Notification.FLAG_AUTO_CANCEL;
                notif.notify(1, notify);

            }
            @Override
            public void onBinaryReceived(byte[] data) {
            }
            @Override
            public void onPingReceived(byte[] data) {
            }
            @Override
            public void onPongReceived(byte[] data) {
            }
            @Override
            public void onException(Exception e) {
                System.out.println(e.getMessage());
            }
            @Override
            public void onCloseReceived() {
                Log.i("WebSocket", "Closed ");
                System.out.println("onCloseReceived");
            }
        };
        webSocketClient.connect();
    }
}
