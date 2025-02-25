/* MainActivity.java */

package io.nawa.kobo.mrz;

import android.app.AlertDialog;
import android.content.ClipData;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.widget.Toast;
import com.getcapacitor.BridgeActivity;
import java.io.File;

/**
 * MainActivity acts as the bridge for sending data back to KoboCollect via Intents.
 */
public class MainActivity extends BridgeActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registerPlugin(SendDataPlugin.class);
        super.onCreate(savedInstanceState);

        Intent intent = getIntent();
        if (intent == null || intent.getAction() == null || !intent.getAction().equals("io.nawa.kobo.mrz")) {
            showLaunchFromKoboCollectMessage();
        }
    }

    /**
     * Shows a prompt for users who did not launch this app via KoboCollect.
     */
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
     * Sends data back to KoboCollect using the standard Android result mechanism.
     * @param dateOfBirth Date of birth from front side data.
     * @param CoAAddress Address from front side data.
     * @param province Province from front side data.
     * @param district District from front side data.
     * @param village Village from front side data.
     * @param documentNumber ID number.
     * @param fullName Person's full name.
     * @param fathersName Father's name if applicable.
     * @param age Computed age.
     * @param gender Gender field.
     * @param frontImage Base64 front image data.
     * @param backImage Base64 back image data.
     * @param dependentsInfo JSON or string with dependents.
     * @param dateOfIssue Back side info.
     * @param documentAdditionalNumber Back side info.
     * @param dateOfExpiry Back side info.
     */
    public void sendData(
        String dateOfBirth,
        String CoAAddress,
        String province,
        String district,
        String village,
        String documentNumber,
        String fullName,
        String fathersName,
        int age,
        String gender,
        String frontImage,
        String backImage,
        String dependentsInfo,
        String dateOfIssue,
        String documentAdditionalNumber,
        String dateOfExpiry
    ) {
        try {
            Intent intent = new Intent();
            Uri frontImageUri = null;
            Uri backImageUri = null;

            // Convert front image from Base64 to file if provided
            if (frontImage != null && !frontImage.isEmpty()) {
                File frontImageFile = FileUtils.base64ToFile(this, frontImage, "frontImage.jpg");
                if (frontImageFile != null) {
                    frontImageUri = FileUtils.getUriForFile(this, frontImageFile);
                }
                intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            }

            // Convert back image from Base64 to file if provided
            if (backImage != null && !backImage.isEmpty()) {
                File backImageFile = FileUtils.base64ToFile(this, backImage, "backImage.jpg");
                if (backImageFile != null) {
                    backImageUri = FileUtils.getUriForFile(this, backImageFile);
                }
                intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            }

            // Attach extras
            IntentUtils.addExtras(
                intent,
                dateOfBirth,
                CoAAddress,
                province,
                district,
                village,
                documentNumber,
                fullName,
                fathersName,
                age,
                gender,
                frontImageUri,
                backImageUri,
                dependentsInfo,
                dateOfIssue,
                documentAdditionalNumber,
                dateOfExpiry
            );

            // Attach clip data for images if any
            if (frontImageUri != null) {
                ClipData clipData = new ClipData(
                    "frontImage",
                    new String[]{"image/jpeg"},
                    new ClipData.Item(frontImageUri)
                );
                if (backImageUri != null) {
                    clipData.addItem(new ClipData.Item(backImageUri));
                }
                intent.setClipData(clipData);
            } else if (backImageUri != null) {
                ClipData clipData = new ClipData(
                    "backImage",
                    new String[]{"image/jpeg"},
                    new ClipData.Item(backImageUri)
                );
                intent.setClipData(clipData);
            }

            // Return to KoboCollect
            setResult(RESULT_OK, intent);
            finish();
        } catch (Exception e) {
            showErrorNotification("Failed to send data to KoboCollect. Please try again. If the issue persists, contact support.");
        }
    }

    private void showErrorNotification(String message) {
        Toast.makeText(this, message, Toast.LENGTH_LONG).show();
    }
}
