/* SendDataPlugin.java */

package io.nawa.kobo.mrz;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.JSObject;

/**
 * Capacitor plugin to receive scan data from the JavaScript layer and forward it to MainActivity.
 */
@CapacitorPlugin(name = "SendData")
public class SendDataPlugin extends Plugin {

    /**
     * Receives a call from JavaScript, validates the parameters, and forwards them to MainActivity.
     * Returns a success response on completion or an error if any required parameter is missing.
     */
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
            if (dependentsInfo == null) {
                dependentsInfo = "";
            }

            String dateOfIssue = call.getString("dateOfIssue");
            String documentAdditionalNumber = call.getString("documentAdditionalNumber");
            String dateOfExpiry = call.getString("dateOfExpiry");
            if (dateOfIssue == null) {
                dateOfIssue = "";
            }
            if (documentAdditionalNumber == null) {
                documentAdditionalNumber = "";
            }
            if (dateOfExpiry == null) {
                dateOfExpiry = "";
            }

            if (documentNumber == null || fullName == null || age == null ||
                gender == null || dateOfBirth == null) {
                call.reject("Missing required parameters");
                return;
            }

            ((MainActivity) getActivity()).sendData(
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
                frontImagePath,
                backImagePath,
                dependentsInfo,
                dateOfIssue,
                documentAdditionalNumber,
                dateOfExpiry
            );

            JSObject result = new JSObject();
            result.put("response", "Data has been sent successfully");
            call.resolve(result);
        } catch (Exception e) {
            call.reject("Error processing data", e);
        }
    }
}
