package io.nawa.kobo.mrz;

import android.content.Intent;
import android.net.Uri;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/**
 * Utility class to add or extract fields from an Intent when exchanging data with KoboCollect.
 */
public class IntentUtils {

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
    public final Uri DocumentFaceUri;
    public final String dependentsInfo;
    public final String dateOfIssue;
    public final String documentAdditionalNumber;
    public final String dateOfExpiry;

    public Data(
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
      Uri DocumentFaceUri,
      String dependentsInfo,
      String dateOfIssue,
      String documentAdditionalNumber,
      String dateOfExpiry
    ) {
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
      this.DocumentFaceUri = DocumentFaceUri;
      this.dependentsInfo = dependentsInfo;
      this.dateOfIssue = dateOfIssue;
      this.documentAdditionalNumber = documentAdditionalNumber;
      this.dateOfExpiry = dateOfExpiry;
    }
  }

  public static void addExtras(
    Intent intent,
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
    Uri DocumentFaceUri,
    String dependentsInfo,
    String dateOfIssue,
    String documentAdditionalNumber,
    String dateOfExpiry
  ) {
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

    // Existing "_dep" extras
    intent.putExtra("fullName_dep", fullName);
    intent.putExtra("dateOfBirth_dep", dateOfBirth);
    intent.putExtra("documentNumber_dep", documentNumber);
    intent.putExtra("fathersName_dep", fathersName);
    intent.putExtra("gender_dep", gender);
    intent.putExtra("age_dep", age);
    if (frontImageUri != null) {
      intent.putExtra("frontImageUri_dep", frontImageUri.toString());
    }
    if (backImageUri != null) {
      intent.putExtra("backImageUri_dep", backImageUri.toString());
    }
    if (DocumentFaceUri != null) {
      intent.putExtra("DocumentFaceUri_dep", DocumentFaceUri.toString());
    }

    // Set images
    if (frontImageUri != null) {
      intent.putExtra("frontImageUri", frontImageUri.toString());
    }
    if (backImageUri != null) {
      intent.putExtra("backImageUri", backImageUri.toString());
    }
    if (DocumentFaceUri != null) {
      intent.putExtra("DocumentFaceUri", DocumentFaceUri.toString());
    }

    // Primary extras
    intent.putExtra("dependentsInfo", dependentsInfo);
    intent.putExtra("dateOfIssue", dateOfIssue);
    intent.putExtra("documentAdditionalNumber", documentAdditionalNumber);
    intent.putExtra("dateOfExpiry", dateOfExpiry);

    // Handle dependents: build semicolon-delimited extras
    if (dependentsInfo != null && !dependentsInfo.isEmpty()) {
      try {
        JSONArray dependents = new JSONArray(dependentsInfo);
        int count = dependents.length();
        intent.putExtra("dependentCount", count);

        StringBuilder dobBuilder = new StringBuilder();
        StringBuilder sexBuilder = new StringBuilder();
        StringBuilder docNumBuilder = new StringBuilder();
        StringBuilder fullNameBuilder = new StringBuilder();

        for (int i = 0; i < count; i++) {
          JSONObject dep = dependents.getJSONObject(i);

          String depDOB = "";
          String depSex = "";
          String depDocNum = "";
          String depFullName = "";

          if (dep.has("dateOfBirth")) {
            JSONObject dobObj = dep.getJSONObject("dateOfBirth");
            if (dobObj.has("originalDateStringResult")) {
              JSONObject origDob = dobObj.getJSONObject(
                "originalDateStringResult"
              );
              depDOB = origDob.optString("description", "");
            }
          }
          if (dep.has("sex")) {
            JSONObject sexObj = dep.getJSONObject("sex");
            depSex = sexObj.optString("description", "");
          }
          if (dep.has("documentNumber")) {
            JSONObject docNumObj = dep.getJSONObject("documentNumber");
            depDocNum = docNumObj.optString("description", "");
          }
          if (dep.has("fullName")) {
            JSONObject fullNameObj = dep.getJSONObject("fullName");
            depFullName = fullNameObj.optString("description", "");
          }

          if (i > 0) {
            dobBuilder.append("; ");
            sexBuilder.append("; ");
            docNumBuilder.append("; ");
            fullNameBuilder.append("; ");
          }

          dobBuilder.append(depDOB);
          sexBuilder.append(depSex);
          docNumBuilder.append(depDocNum);
          fullNameBuilder.append(depFullName);
        }

        // Only append a final semicolon if there's at least one dependent
        if (count > 0) {
          dobBuilder.append(";");
          sexBuilder.append(";");
          docNumBuilder.append(";");
          fullNameBuilder.append(";");
        }

        intent.putExtra("dependent_dateOfBirth", dobBuilder.toString());
        intent.putExtra("dependent_sex", sexBuilder.toString());
        intent.putExtra("dependent_documentNumber", docNumBuilder.toString());
        intent.putExtra("dependent_fullName", fullNameBuilder.toString());
      } catch (JSONException ignored) {
        // Handle exception or ignore
      }
    }
  }

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

    Uri frontImageUri = null;
    Uri backImageUri = null;
    Uri DocumentFaceUri = null;
    try {
      String frontImageStr = intent.getStringExtra("frontImageUri");
      String backImageStr = intent.getStringExtra("backImageUri");
      String DocumentFaceStr = intent.getStringExtra("DocumentFaceUri");
      if (frontImageStr != null) {
        frontImageUri = Uri.parse(frontImageStr);
      }
      if (backImageStr != null) {
        backImageUri = Uri.parse(backImageStr);
      }
      if (DocumentFaceStr != null) {
        DocumentFaceUri = Uri.parse(DocumentFaceStr);
      }
    } catch (Exception ignored) {}

    String dependentsInfo = intent.getStringExtra("dependentsInfo");
    String dateOfIssue = intent.getStringExtra("dateOfIssue");
    String documentAdditionalNumber = intent.getStringExtra(
      "documentAdditionalNumber"
    );
    String dateOfExpiry = intent.getStringExtra("dateOfExpiry");

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
      DocumentFaceUri,
      dependentsInfo,
      dateOfIssue,
      documentAdditionalNumber,
      dateOfExpiry
    );
  }
}
