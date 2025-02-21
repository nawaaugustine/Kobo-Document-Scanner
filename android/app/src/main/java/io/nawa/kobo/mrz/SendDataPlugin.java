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

    /**
     * Receives data from the JavaScript layer, validates the parameters,
     * logs the incoming data, and calls MainActivity.sendData to forward the data.
     */
    @PluginMethod
    public void sendData(PluginCall call) {
        try {
            // Extract parameters from the call
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
            if (dependentsInfo == null) {
                dependentsInfo = "";
            }

            // Log all received parameters for debugging purposes.
            Log.d(TAG, "sendData called with parameters: " +
                    "dateOfBirth=" + dateOfBirth +
                    ", CoAAddress=" + CoAAddress +
                    ", province=" + province +
                    ", district=" + district +
                    ", village=" + village +
                    ", documentNumber=" + documentNumber +
                    ", fullName=" + fullName +
                    ", fathersName=" + fathersName +
                    ", age=" + age +
                    ", gender=" + gender +
                    ", frontImagePath=" + frontImagePath +
                    ", backImagePath=" + backImagePath +
                    ", dependentsInfo=" + dependentsInfo);

            // Validate required parameters.
            if (documentNumber == null || fullName == null || fathersName == null || age == null ||
                gender == null || dateOfBirth == null || CoAAddress == null ||
                province == null || district == null || village == null) {
                Log.e(TAG, "Missing required parameters");
                call.reject("Missing required parameters");
                return;
            }

            // Forward data to MainActivity for sending back via intent.
            ((MainActivity) getActivity()).sendData(
                dateOfBirth, CoAAddress, province, district, village,
                documentNumber, fullName, fathersName, age, gender,
                frontImagePath, backImagePath, dependentsInfo
            );
            Log.d(TAG, "Data forwarded to MainActivity.sendData");

            // Respond back to JavaScript.
            JSObject result = new JSObject();
            result.put("response", "Data has been sent successfully");
            call.resolve(result);
        } catch (Exception e) {
            Log.e(TAG, "Error processing data", e);
            call.reject("Error processing data", e);
        }
    }
}
