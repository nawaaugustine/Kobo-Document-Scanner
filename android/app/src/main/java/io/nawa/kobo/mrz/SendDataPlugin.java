// SendDataPlugin.java
package io.nawa.kobo.mrz;

import android.util.Log;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.JSObject;

@CapacitorPlugin(name = "SendData")
public class SendDataPlugin extends Plugin {
  private static final String TAG = "SendDataPlugin";

  @PluginMethod
  public void sendData(PluginCall call) {
    try {
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
      String dependentsInfo = call.getString("dependentsInfo");
      if(dependentsInfo == null) {
        dependentsInfo = "";
      }

      if (documentNumber == null || fullName == null || fathersName == null || age == null ||
          gender == null || dateOfBirth == null || CoAAddress == null ||
          province == null || district == null || village == null) {
        call.reject("Missing required parameters");
        Log.e(TAG, "Missing required parameters");
        return;
      }

      ((MainActivity) getActivity()).sendData(
          dateOfBirth, CoAAddress, province, district, village,
          documentNumber, fullName, fathersName, age, gender,
          frontImagePath, backImagePath, dependentsInfo
      );

      JSObject result = new JSObject();
      result.put("response", "Data has been sent successfully");
      call.resolve(result);
    } catch (Exception e) {
      Log.e(TAG, "Error processing data", e);
      call.reject("Error processing data", e);
    }
  }
}
