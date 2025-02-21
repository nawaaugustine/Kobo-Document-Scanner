// MainActivity.java
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
   * Sends data back to the calling activity via intent.
   *
   * @param dateOfBirth The date of birth.
   * @param CoAAddress The address.
   * @param province The province.
   * @param district The district.
   * @param village The village.
   * @param documentNumber The document number.
   * @param fullName The full name.
   * @param fathersName The father's name.
   * @param age The age.
   * @param gender The gender.
   * @param frontImage The base64 encoded front image.
   * @param backImage The base64 encoded back image.
   * @param dependentsInfo JSON string of dependents information.
   */
  public void sendData(String dateOfBirth, String CoAAddress, String province, String district, String village,
                       String documentNumber, String fullName, String fathersName, int age, String gender,
                       String frontImage, String backImage, String dependentsInfo) {
    try {
      Intent intent = new Intent();
      Uri frontImageUri = null;
      Uri backImageUri = null;

      if (frontImage != null && !frontImage.isEmpty()) {
        File frontImageFile = FileUtils.base64ToFile(this, frontImage, "frontImage.jpg");
        frontImageUri = FileUtils.getUriForFile(this, frontImageFile);
        intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
      }

      if (backImage != null && !backImage.isEmpty()) {
        File backImageFile = FileUtils.base64ToFile(this, backImage, "backImage.jpg");
        backImageUri = FileUtils.getUriForFile(this, backImageFile);
        intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
      }

      IntentUtils.addExtras(intent, dateOfBirth, CoAAddress, province, district, village,
          documentNumber, fullName, fathersName, age, gender, frontImageUri, backImageUri, dependentsInfo);

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

      setResult(RESULT_OK, intent);
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
