package io.nawa.kobo.mrz;

import android.content.Intent;
import android.net.Uri;
import android.util.Log;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/**
 * Utility class for adding and extracting Intent extras.
 */
public class IntentUtils {
    private static final String TAG = "IntentUtils";

    /**
     * Data class to hold extracted intent extras.
     */
    public static class Data {
        public final String dateOfBirth;
        public final String CoAAddress;
        public final String province;
        public final String district;
        public final String village;
        public final String documentNumber;
        public final String fullName;
        public final String fathersName;
        public final int age;
        public final String gender;
        public final Uri frontImageUri;
        public final Uri backImageUri;
        public final String dependentsInfo;
        public final String dateOfIssue;
        public final String documentAdditionalNumber;
        public final String dateOfExpiry;

        /**
         * Constructor to initialize all fields.
         */
        public Data(String dateOfBirth,
                    String CoAAddress,
                    String province,
                    String district,
                    String village,
                    String documentNumber,
                    String fullName,
                    String fathersName,
                    int age,
                    String gender,
                    Uri frontImageUri,
                    Uri backImageUri,
                    String dependentsInfo,
                    String dateOfIssue,
                    String documentAdditionalNumber,
                    String dateOfExpiry) {
            this.dateOfBirth = dateOfBirth;
            this.CoAAddress = CoAAddress;
            this.province = province;
            this.district = district;
            this.village = village;
            this.documentNumber = documentNumber;
            this.fullName = fullName;
            this.fathersName = fathersName;
            this.age = age;
            this.gender = gender;
            this.frontImageUri = frontImageUri;
            this.backImageUri = backImageUri;
            this.dependentsInfo = dependentsInfo;
            this.dateOfIssue = dateOfIssue;
            this.documentAdditionalNumber = documentAdditionalNumber;
            this.dateOfExpiry = dateOfExpiry;
        }
    }

    /**
     * Adds extras to the intent.
     *
     * Logs each extra being added and also parses dependentsInfo to add dependent extras.
     *
     * @param intent The intent to which extras are added.
     * @param dateOfBirth Standard front-side field.
     * @param CoAAddress  Standard front-side field.
     * @param province    Standard front-side field.
     * @param district    Standard front-side field.
     * @param village     Standard front-side field.
     * @param documentNumber Standard front-side field.
     * @param fullName    Standard front-side field.
     * @param fathersName Standard front-side field.
     * @param age         Standard front-side field.
     * @param gender      Standard front-side field.
     * @param frontImageUri Front image URI.
     * @param backImageUri  Back image URI.
     * @param dependentsInfo Dependent information (JSON array as string).
     * @param dateOfIssue New back-side field.
     * @param documentAdditionalNumber New back-side field.
     * @param dateOfExpiry New back-side field.
     */
    public static void addExtras(Intent intent,
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
                                 Uri frontImageUri,
                                 Uri backImageUri,
                                 String dependentsInfo,
                                 String dateOfIssue,
                                 String documentAdditionalNumber,
                                 String dateOfExpiry) {

        Log.d(TAG, "Adding extras to intent with parameters: " +
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
                ", frontImageUri=" + frontImageUri +
                ", backImageUri=" + backImageUri +
                ", dependentsInfo=" + dependentsInfo +
                ", dateOfIssue=" + dateOfIssue +
                ", documentAdditionalNumber=" + documentAdditionalNumber +
                ", dateOfExpiry=" + dateOfExpiry);

        // Standard fields.
        intent.putExtra("dateOfBirth", dateOfBirth);
        intent.putExtra("CoAAddress", CoAAddress);
        intent.putExtra("province", province);
        intent.putExtra("district", district);
        intent.putExtra("village", village);
        intent.putExtra("documentNumber", documentNumber);
        intent.putExtra("fullName", fullName);
        intent.putExtra("fathersName", fathersName);
        intent.putExtra("age", age);
        intent.putExtra("gender", gender);

        // Duplicate values for dependent repeat groups (if needed).
        intent.putExtra("fullName_dep", fullName);
        intent.putExtra("dateOfBirth_dep", dateOfBirth);
        intent.putExtra("documentNumber_dep", documentNumber);
        intent.putExtra("fathersName_dep", fathersName);
        intent.putExtra("gender_dep", gender);
        intent.putExtra("age_dep", age);
        intent.putExtra("frontImageUri_dep", frontImageUri);
        intent.putExtra("backImageUri_dep", backImageUri);

        // Convert image URIs to strings if not null.
        if (frontImageUri != null) {
            intent.putExtra("frontImageUri", frontImageUri.toString());
        }
        if (backImageUri != null) {
            intent.putExtra("backImageUri", backImageUri.toString());
        }

        // Dependent info as-is.
        intent.putExtra("dependentsInfo", dependentsInfo);
        Log.d("Logging dependentsInfo", dependentsInfo);

        // New fields from back side.
        intent.putExtra("dateOfIssue", dateOfIssue);
        intent.putExtra("documentAdditionalNumber", documentAdditionalNumber);
        intent.putExtra("dateOfExpiry", dateOfExpiry);

        // Parse dependentsInfo and add each dependent's data using automatic labels.
        if (dependentsInfo != null && !dependentsInfo.isEmpty()) {
            try {
                Log.d(TAG, "Parsing dependentsInfo JSON");
                JSONArray dependents = new JSONArray(dependentsInfo);
                int count = dependents.length();
                intent.putExtra("dependentCount", count);
                Log.d(TAG, "Found " + count + " dependents");

                for (int i = 0; i < count; i++) {
                    JSONObject dep = dependents.getJSONObject(i);
                    String index = String.format("%02d", i + 1);

                    String depDOB = "";
                    String depSex = "";
                    String depDocNum = "";
                    String depFullName = "";

                    // dateOfBirth -> originalDateStringResult -> description
                    if (dep.has("dateOfBirth")) {
                        JSONObject dobObj = dep.getJSONObject("dateOfBirth");
                        if (dobObj.has("originalDateStringResult")) {
                            JSONObject origDob = dobObj.getJSONObject("originalDateStringResult");
                            depDOB = origDob.optString("description", "");
                        }
                    }

                    // sex -> description
                    if (dep.has("sex")) {
                        JSONObject sexObj = dep.getJSONObject("sex");
                        depSex = sexObj.optString("description", "");
                    }

                    // documentNumber -> description
                    if (dep.has("documentNumber")) {
                        JSONObject docNumObj = dep.getJSONObject("documentNumber");
                        depDocNum = docNumObj.optString("description", "");
                    }

                    // fullName -> description (or "latin"; your JSON uses both but "description" is the same)
                    if (dep.has("fullName")) {
                        JSONObject fullNameObj = dep.getJSONObject("fullName");
                        depFullName = fullNameObj.optString("description", "");
                    }

                    Log.d(TAG, "Dependent " + index + ": " +
                            "fullName=" + depFullName +
                            ", dateOfBirth=" + depDOB +
                            ", documentNumber=" + depDocNum +
                            ", sex=" + depSex);

                    // Put dependent extras with numeric suffixes (01, 02, etc.).
                    intent.putExtra("dependent" + index + "_dateOfBirth", depDOB);
                    intent.putExtra("dependent" + index + "_sex", depSex);
                    intent.putExtra("dependent" + index + "_documentNumber", depDocNum);
                    intent.putExtra("dependent" + index + "_fullName", depFullName);
                }
            } catch (JSONException e) {
                Log.e(TAG, "Error parsing dependentsInfo JSON", e);
            }
        }
    }

    /**
     * Extracts extras from the intent and logs the extracted values.
     *
     * @param intent The intent from which extras are extracted.
     * @return A Data object containing the extracted extras.
     */
    public static Data extractExtras(Intent intent) {
        Log.d(TAG, "Extracting extras from intent");

        String dateOfBirth = intent.getStringExtra("dateOfBirth");
        String CoAAddress = intent.getStringExtra("CoAAddress");
        String province = intent.getStringExtra("province");
        String district = intent.getStringExtra("district");
        String village = intent.getStringExtra("village");
        String documentNumber = intent.getStringExtra("documentNumber");
        String fullName = intent.getStringExtra("fullName");
        String fathersName = intent.getStringExtra("fathersName");
        int age = intent.getIntExtra("age", -1);
        String gender = intent.getStringExtra("gender");

        Uri frontImageUri = null;
        Uri backImageUri = null;
        try {
            String frontImageStr = intent.getStringExtra("frontImageUri");
            String backImageStr = intent.getStringExtra("backImageUri");
            if (frontImageStr != null) {
                frontImageUri = Uri.parse(frontImageStr);
            }
            if (backImageStr != null) {
                backImageUri = Uri.parse(backImageStr);
            }
        } catch (Exception e) {
            Log.e(TAG, "Error parsing image URIs", e);
        }

        String dependentsInfo = intent.getStringExtra("dependentsInfo");

        // Extract new backData fields.
        String dateOfIssue = intent.getStringExtra("dateOfIssue");
        String documentAdditionalNumber = intent.getStringExtra("documentAdditionalNumber");
        String dateOfExpiry = intent.getStringExtra("dateOfExpiry");

        Log.d(TAG, "Extracted extras: " +
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
                ", frontImageUri=" + frontImageUri +
                ", backImageUri=" + backImageUri +
                ", dependentsInfo=" + dependentsInfo +
                ", dateOfIssue=" + dateOfIssue +
                ", documentAdditionalNumber=" + documentAdditionalNumber +
                ", dateOfExpiry=" + dateOfExpiry);

        return new Data(
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
    }
}
