package io.nawa.kobo.mrz;

import android.app.AlertDialog;
import android.content.ClipData;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;
import android.widget.Toast;
import com.getcapacitor.BridgeActivity;
import java.io.File;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "MainActivity";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        Log.d(TAG, "onCreate called");
        registerPlugin(SendDataPlugin.class);
        super.onCreate(savedInstanceState);

        Intent intent = getIntent();
        if (intent == null || intent.getAction() == null || !intent.getAction().equals("io.nawa.kobo.mrz")) {
            showLaunchFromKoboCollectMessage();
        }
    }

    private void showLaunchFromKoboCollectMessage() {
        new AlertDialog.Builder(this)
            .setTitle("Launch from KoboCollect")
            .setMessage("Please launch this application from KoboCollect.")
            .setPositiveButton("OK", (dialog, which) -> finish())
            .setCancelable(false)
            .create()
            .show();
    }

    /**
     * Sends data back to the calling activity via an intent.
     *
     * Logs each step of the process to help debug where data might be missing.
     */
    public void sendData(String dateOfBirth, String CoAAddress, String province, String district, String village,
                         String documentNumber, String fullName, String fathersName, int age, String gender,
                         String frontImage, String backImage, String dependentsInfo) {
        Log.d(TAG, "sendData called with: dateOfBirth=" + dateOfBirth +
                ", CoAAddress=" + CoAAddress +
                ", province=" + province +
                ", district=" + district +
                ", village=" + village +
                ", documentNumber=" + documentNumber +
                ", fullName=" + fullName +
                ", fathersName=" + fathersName +
                ", age=" + age +
                ", gender=" + gender +
                ", frontImage=" + (frontImage != null ? "[present]" : "null") +
                ", backImage=" + (backImage != null ? "[present]" : "null") +
                ", dependentsInfo=" + dependentsInfo);
        try {
            Intent intent = new Intent();
            Uri frontImageUri = null;
            Uri backImageUri = null;

            // Process front image if available.
            if (frontImage != null && !frontImage.isEmpty()) {
                File frontImageFile = FileUtils.base64ToFile(this, frontImage, "frontImage.jpg");
                if (frontImageFile != null) {
                    Log.d(TAG, "Converted front image to file: " + frontImageFile.getAbsolutePath());
                    frontImageUri = FileUtils.getUriForFile(this, frontImageFile);
                    Log.d(TAG, "Obtained front image URI: " + frontImageUri);
                } else {
                    Log.w(TAG, "Failed to convert front image from base64.");
                }
                intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            }

            // Process back image if available.
            if (backImage != null && !backImage.isEmpty()) {
                File backImageFile = FileUtils.base64ToFile(this, backImage, "backImage.jpg");
                if (backImageFile != null) {
                    Log.d(TAG, "Converted back image to file: " + backImageFile.getAbsolutePath());
                    backImageUri = FileUtils.getUriForFile(this, backImageFile);
                    Log.d(TAG, "Obtained back image URI: " + backImageUri);
                } else {
                    Log.w(TAG, "Failed to convert back image from base64.");
                }
                intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            }

            // Add extras to the intent including dependent information.
            IntentUtils.addExtras(intent, dateOfBirth, CoAAddress, province, district, village,
                    documentNumber, fullName, fathersName, age, gender, frontImageUri, backImageUri, dependentsInfo);
            Log.d(TAG, "Extras added to intent: " + intent.getExtras());

            // Add ClipData for images if available.
            if (frontImageUri != null) {
                ClipData clipData = new ClipData("frontImage", new String[]{"image/jpeg"}, new ClipData.Item(frontImageUri));
                if (backImageUri != null) {
                    clipData.addItem(new ClipData.Item(backImageUri));
                }
                intent.setClipData(clipData);
                Log.d(TAG, "ClipData added for front (and back) image(s).");
            } else if (backImageUri != null) {
                ClipData clipData = new ClipData("backImage", new String[]{"image/jpeg"}, new ClipData.Item(backImageUri));
                intent.setClipData(clipData);
                Log.d(TAG, "ClipData added for back image.");
            } else {
                Log.d(TAG, "No images available to add to ClipData.");
            }

            // Set the result and finish the activity.
            setResult(RESULT_OK, intent);
            Log.d(TAG, "Result set with intent, finishing activity.");
            finish();
        } catch (Exception e) {
            Log.e(TAG, "Error sending data", e);
            showErrorNotification("Failed to send data to KoboCollect. Please try again. If the issue persists, contact support.");
        }
    }

    private void showErrorNotification(String message) {
        Toast.makeText(this, message, Toast.LENGTH_LONG).show();
    }
}
