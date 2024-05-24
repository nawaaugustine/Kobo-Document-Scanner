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

// MainActivity class that extends BridgeActivity from Capacitor
public class MainActivity extends BridgeActivity {
  private static final String TAG = "MainActivity";

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    Log.d(TAG, "onCreate called"); // Log the creation of the activity
    registerPlugin(SendDataPlugin.class); // Register the SendDataPlugin with the Capacitor bridge
    super.onCreate(savedInstanceState);

    // Check if the app was opened from KoboCollect
    Intent intent = getIntent();
    if (intent != null && intent.getAction() != null && intent.getAction().equals("io.nawa.kobo.mrz")) {
      // App opened from KoboCollect, proceed normally
    } else {
      // App not opened from KoboCollect, show a message
      showLaunchFromKoboCollectMessage();
    }
  }

  private void showLaunchFromKoboCollectMessage() {
    new AlertDialog.Builder(this)
      .setTitle("Launch from KoboCollect")
      .setMessage("Please launch this application from KoboCollect.")
      .setPositiveButton("OK", (dialog, which) -> finish())
      .show();
  }

  /**
   * Sends data back to the calling activity.
   *
   * @param dateOfBirth The date of birth.
   * @param CoAAddress The address in CoA.
   * @param province The province in AFG.
   * @param district The district in AFG.
   * @param village The village in AFG.
   * @param documentNumber The document number.
   * @param fullName The full name.
   * @param fathersName The father's name.
   * @param age The age.
   * @param gender The gender.
   * @param frontImage The base64 encoded front image.
   * @param backImage The base64 encoded back image.
   */
  public void sendData(String dateOfBirth, String CoAAddress, String province, String district, String village, String documentNumber, String fullName, String fathersName, int age, String gender, String frontImage, String backImage) {
    try {
      Intent intent = new Intent();

      // Variables to store URIs
      Uri frontImageUri = null;
      Uri backImageUri = null;

      // Handle front image URI
      if (frontImage != null && !frontImage.isEmpty()) {
        File frontImageFile = FileUtils.base64ToFile(this, frontImage, "frontImage.jpg");
        frontImageUri = FileUtils.getUriForFile(this, frontImageFile);
        intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
      }

      // Handle back image URI
      if (backImage != null && !backImage.isEmpty()) {
        File backImageFile = FileUtils.base64ToFile(this, backImage, "backImage.jpg");
        backImageUri = FileUtils.getUriForFile(this, backImageFile);
        intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
      }

      // Add extras to the intent, including the image URIs
      IntentUtils.addExtras(intent, dateOfBirth, CoAAddress, province, district, village, documentNumber, fullName, fathersName, age, gender, frontImageUri, backImageUri);

      // Set ClipData for the images
      if (frontImageUri != null) {
        ClipData clipData = new ClipData("frontImage", new String[]{"image/jpeg"}, new ClipData.Item(frontImageUri));
        if (backImageUri != null) {
          clipData.addItem(new ClipData.Item(backImageUri));
        }
        intent.setClipData(clipData);
      } else if (backImageUri != null) {
        ClipData clipData = new ClipData("backImage", new String[]{"image/jpeg"}, new ClipData.Item(backImageUri));
        intent.setClipData(clipData);
      }

      // Set result and finish activity
      setResult(RESULT_OK, intent); // Set the result as OK and attach the intent
      finish(); // Finish the activity
    } catch (Exception e) {
      Log.e(TAG, "Error sending data", e); // Log any errors that occur
      showErrorNotification("Failed to send data to KoboCollect. Please try again. If the issue persists, contact the Information Management Unit (IMU) in Kabul for support.\n");
    }
  }

  /**
   * Displays an error notification to the user.
   *
   * @param message The error message to be displayed.
   */
  private void showErrorNotification(String message) {
    Toast.makeText(this, message, Toast.LENGTH_LONG).show();
  }
}
