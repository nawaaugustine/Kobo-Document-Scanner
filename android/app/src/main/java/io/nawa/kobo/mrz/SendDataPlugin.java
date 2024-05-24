package io.nawa.kobo.mrz;

import android.content.ClipData;
import android.content.Intent;
import android.net.Uri;
import androidx.core.content.FileProvider;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.JSObject;
import android.util.Log;
import java.io.File;

// Capacitor plugin class annotated with @CapacitorPlugin
@CapacitorPlugin(name = "SendData")
public class SendDataPlugin extends Plugin {
  private static final String TAG = "SendDataPlugin";

  // Method exposed to JavaScript, called by Capacitor bridge
  @PluginMethod
  public void sendData(PluginCall call) {
    try {
      // Extract data from the call
      String dateOfBirth = call.getString("dateOfBirth");
      String CoAAddress = call.getString("CoAAddress");
      String province = call.getString("province");
      String district = call.getString("district");
      String village = call.getString("village");

      String documentNumber = call.getString("documentNumber");
      String fullName = call.getString("fullName");
      String fathersName = call.getString("fathersName");
      Integer age = call.getInt("age");
      String gender = call.getString("gender");
      String frontImagePath = call.getString("frontImage");
      String backImagePath = call.getString("backImage");

      // Check for missing parameters
      if (documentNumber == null || fullName == null || fathersName == null || age == null || gender == null || dateOfBirth == null|| CoAAddress == null|| province == null|| district == null|| village == null) {
        call.reject("Missing required parameters");
        Log.e(TAG, "Missing required parameters");
        return;
      }

      // Call MainActivity's sendData method to handle the data
      ((MainActivity)getActivity()).sendData(dateOfBirth, CoAAddress, province, district, village, documentNumber, fullName, fathersName, age, gender, frontImagePath, backImagePath);

      // Create a result object to send back to the JavaScript side
      JSObject result = new JSObject();
      result.put("response", "Data has been sent successfully");
      call.resolve(result); // Resolve the call with the result object
    } catch (Exception e) {
      call.reject("Error processing data", e); // Reject the call if any error occurs
      Log.e(TAG, "Error processing data", e); // Log the error
    }
  }
}
