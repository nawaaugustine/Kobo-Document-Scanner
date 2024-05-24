package io.nawa.kobo.mrz;

import android.content.Intent;
import android.net.Uri;

// Utility class for handling intents
public class IntentUtils {

  /**
   * Adds extras to the intent.
   *
   * @param intent The intent to which extras are to be added.
   * @param documentNumber The document number.
   * @param fullName The full name.
   * @param fathersName The father's name.
   * @param age The age.
   * @param gender The gender.
   * @param frontImageUri The URI of the front image.
   * @param backImageUri The URI of the back image.
   */
  public static void addExtras(Intent intent, String documentNumber, String fullName, String fathersName, int age, String gender, Uri frontImageUri, Uri backImageUri) {
    intent.putExtra("documentNumber", documentNumber); // Add document number to the intent
    intent.putExtra("fullName", fullName); // Add full name to the intent
    intent.putExtra("fathersName", fathersName); // Add father's name to the intent
    intent.putExtra("age", age); // Add age to the intent
    intent.putExtra("gender", gender); // Add gender to the intent

    if (frontImageUri != null) {
      intent.putExtra("frontImageUri", frontImageUri.toString()); // Add front image URI to the intent
    }

    if (backImageUri != null) {
      intent.putExtra("backImageUri", backImageUri.toString()); // Add back image URI to the intent
    }
  }

  /**
   * Extracts extras from an intent and returns them as a Data object.
   *
   * @param intent The intent from which extras are to be extracted.
   * @return A Data object containing the extracted extras.
   */
  public static Data extractExtras(Intent intent) {
    String documentNumber = intent.getStringExtra("documentNumber"); // Get document number from the intent
    String fullName = intent.getStringExtra("fullName"); // Get full name from the intent
    String fathersName = intent.getStringExtra("fathersName"); // Get father's name from the intent
    int age = intent.getIntExtra("age", -1); // Get age from the intent
    String gender = intent.getStringExtra("gender"); // Get gender from the intent
    Uri frontImageUri = Uri.parse(intent.getStringExtra("frontImageUri"));
    Uri backImageUri = Uri.parse(intent.getStringExtra("backImageUri"));

    return new Data(documentNumber, fullName, fathersName, age, gender, frontImageUri, backImageUri); // Return a new Data object
  }

  /**
   * Data class to hold extracted extras.
   */
  public static class Data {
    public final String documentNumber;
    public final String fullName;
    public final String fathersName;
    public final int age;
    public final String gender;
    public final Uri frontImageUri;
    public final Uri backImageUri;

    public Data(String documentNumber, String fullName, String fathersName, int age, String gender, Uri frontImageUri, Uri backImageUri) {
      this.documentNumber = documentNumber;
      this.fullName = fullName;
      this.fathersName = fathersName;
      this.age = age;
      this.gender = gender;
      this.frontImageUri = frontImageUri;
      this.backImageUri = backImageUri;
    }
  }
}
