// IntentUtils.java
package io.nawa.kobo.mrz;

import android.content.Intent;
import android.net.Uri;
import org.json.JSONArray;
import org.json.JSONObject;
import org.json.JSONException;

public class IntentUtils {

  /**
   * Adds extras to the intent.
   *
   * @param intent The intent to add extras.
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
   * @param frontImageUri URI for the front image.
   * @param backImageUri URI for the back image.
   * @param dependentsInfo JSON string for the dependents info.
   */
  public static void addExtras(Intent intent, String dateOfBirth, String CoAAddress, String province, String district,
                               String village, String documentNumber, String fullName, String fathersName, int age,
                               String gender, Uri frontImageUri, Uri backImageUri, String dependentsInfo) {
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
    // Duplicate values for dependent repeat groups
    intent.putExtra("fullName_dep", fullName);
    intent.putExtra("dateOfBirth_dep", dateOfBirth);
    intent.putExtra("documentNumber_dep", documentNumber);
    intent.putExtra("fathersName_dep", fathersName);
    intent.putExtra("gender_dep", gender);
    intent.putExtra("age_dep", age);
    intent.putExtra("frontImageUri_dep", frontImageUri);
    intent.putExtra("backImageUri_dep", backImageUri);

    if (frontImageUri != null) {
      intent.putExtra("frontImageUri", frontImageUri.toString());
    }
    if (backImageUri != null) {
      intent.putExtra("backImageUri", backImageUri.toString());
    }
    intent.putExtra("dependentsInfo", dependentsInfo);

    // Parse dependentsInfo and add each dependent's fields with automatic labels
    if (dependentsInfo != null && !dependentsInfo.isEmpty()) {
      try {
        JSONArray dependents = new JSONArray(dependentsInfo);
        int count = dependents.length();
        intent.putExtra("dependentCount", count);
        for (int i = 0; i < count; i++) {
          JSONObject dep = dependents.getJSONObject(i);
          // Create two-digit label (e.g., "01", "02", ...)
          String index = String.format("%02d", i + 1);

          String depDOB = "";
          String depSex = "";
          String depDocNum = "";
          String depFullName = "";

          if (dep.has("dateOfBirth")) {
            JSONObject dobObj = dep.getJSONObject("dateOfBirth");
            if (dobObj.has("originalString")) {
              JSONObject orig = dobObj.getJSONObject("originalString");
              if (orig.has("latin")) {
                JSONObject latin = orig.getJSONObject("latin");
                depDOB = latin.optString("value", "");
              }
            }
          }
          if (dep.has("sex")) {
            JSONObject sexObj = dep.getJSONObject("sex");
            if (sexObj.has("latin")) {
              JSONObject latin = sexObj.getJSONObject("latin");
              depSex = latin.optString("value", "");
            }
          }
          if (dep.has("documentNumber")) {
            JSONObject docNumObj = dep.getJSONObject("documentNumber");
            if (docNumObj.has("latin")) {
              JSONObject latin = docNumObj.getJSONObject("latin");
              depDocNum = latin.optString("value", "");
            }
          }
          if (dep.has("fullName")) {
            JSONObject fullNameObj = dep.getJSONObject("fullName");
            if (fullNameObj.has("latin")) {
              JSONObject latin = fullNameObj.getJSONObject("latin");
              depFullName = latin.optString("value", "");
            }
          }
          intent.putExtra("dependent" + index + "_dateOfBirth", depDOB);
          intent.putExtra("dependent" + index + "_sex", depSex);
          intent.putExtra("dependent" + index + "_documentNumber", depDocNum);
          intent.putExtra("dependent" + index + "_fullName", depFullName);
        }
      } catch (JSONException e) {
        e.printStackTrace();
      }
    }
  }

  /**
   * Extracts extras from the intent.
   *
   * @param intent The intent from which extras are extracted.
   * @return A Data object containing the extracted extras.
   */
  public static Data extractExtras(Intent intent) {
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
    Uri frontImageUri = Uri.parse(intent.getStringExtra("frontImageUri"));
    Uri backImageUri = Uri.parse(intent.getStringExtra("backImageUri"));
    String dependentsInfo = intent.getStringExtra("dependentsInfo");

    return new Data(dateOfBirth, CoAAddress, province, district, village, documentNumber, fullName, fathersName, age, gender, frontImageUri, backImageUri, dependentsInfo);
  }

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

    public Data(String dateOfBirth, String CoAAddress, String province, String district, String village,
                String documentNumber, String fullName, String fathersName, int age, String gender,
                Uri frontImageUri, Uri backImageUri, String dependentsInfo) {
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
    }
  }
}
