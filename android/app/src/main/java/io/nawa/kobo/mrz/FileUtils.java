package io.nawa.kobo.mrz;

import android.content.Context;
import android.net.Uri;
import androidx.core.content.FileProvider;
import android.util.Base64;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;

public class FileUtils {

  /**
   * Converts a base64 string to a file.
   *
   * @param context The context of the application.
   * @param base64 The base64 encoded string.
   * @param fileName The name of the file to be created.
   * @return The created file.
   * @throws IOException If an error occurs during file creation.
   */
  public static File base64ToFile(Context context, String base64, String fileName) throws IOException {
    // Decode base64 string to byte array
    byte[] decodedString = Base64.decode(base64.split(",")[1], Base64.DEFAULT);
    // Create file in the cache directory
    File file = new File(context.getCacheDir(), fileName);
    // Write the decoded bytes to the file
    try (FileOutputStream fos = new FileOutputStream(file)) {
      fos.write(decodedString);
    }
    return file;
  }

  /**
   * Gets a URI for a file using FileProvider.
   *
   * @param context The context of the application.
   * @param file The file for which the URI is to be generated.
   * @return The URI for the file.
   */
  public static Uri getUriForFile(Context context, File file) {
    return FileProvider.getUriForFile(context, context.getPackageName() + ".fileprovider", file);
  }
}
