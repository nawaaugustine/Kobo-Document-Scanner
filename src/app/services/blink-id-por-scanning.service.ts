// blink-id-por-scanning.service.ts - Usage: Service for handling the scanning of documents using the BlinkID plugin.

import { Injectable } from '@angular/core';
import * as BlinkID from '@microblink/blinkid-capacitor';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BlinkIdScanningService {
  private plugin: BlinkID.BlinkIDPlugin = new BlinkID.BlinkIDPlugin();
  private blinkIdMultisideRecognizer: BlinkID.BlinkIdMultiSideRecognizer = new BlinkID.BlinkIdMultiSideRecognizer();
  private licenseKeys: BlinkID.License = {
    ios: environment.MICROBLINK_LICENSE_KEY,
    android: environment.MICROBLINK_LICENSE_KEY,
    showTrialLicenseWarning: false
  };
  private settings: BlinkID.BlinkIdOverlaySettings = new BlinkID.BlinkIdOverlaySettings();

  constructor() {
    console.log('BlinkIdScanningService initialized');
    this.initializeRecognizer();
  }

  /**
   * Sets recognizer options for capturing images, such as returning full document images and face images.
   */
  private initializeRecognizer(): void {
    this.blinkIdMultisideRecognizer.returnFullDocumentImage = true;
    this.blinkIdMultisideRecognizer.returnFaceImage = true;
  }

  /**
   * Performs the multi-side document scan using the device's camera and handles the scanning process.
   * @param retries - Number of times to retry the scan in case of failure.
   * @returns Promise containing the processed scanning results or an empty array if no valid results were found.
   */
  async scanDocumentMultiSide(retries: number = 3): Promise<any[]> {
    let attempt = 0;
    while (attempt < retries) {
      try {
        const startTime = performance.now();  // Start timing the scan operation
        const scanningResults = await this.plugin.scanWithCamera(
          this.settings,
          new BlinkID.RecognizerCollection([this.blinkIdMultisideRecognizer]),
          this.licenseKeys
        );
        const endTime = performance.now();  // End timing the scan operation
        console.log(`Scanning completed in ${endTime - startTime} milliseconds`);

        return this.processResults(scanningResults);
      } catch (error) {
        attempt++;
        console.error(`Scanning failed (attempt ${attempt}):`, error);
        if (attempt >= retries) {
          throw new Error('Scanning failed after multiple attempts, please try again later.');
        }
      }
    }
    return [];
  }

  /**
   * Processes the results from the scan, filtering and transforming them into a more manageable format.
   * @param results - The raw results array from the scanning operation.
   * @returns Array of processed result objects.
   */
  private processResults(results: any[]): any[] {
    if (!results || results.length === 0) {
      console.log('No scanning results or front visualization results are empty');
      return [];
    }

    const processedResults: any[] = [];
    results.forEach(result => {
      const frontVizResult = result.frontVizResult;
      if (frontVizResult && !frontVizResult.empty) {
        processedResults.push(this.extractResult(result, frontVizResult));
      }
    });

    console.log('Processed Results:', JSON.stringify(processedResults, null, 2));
    return processedResults;
  }

  /**
   * Extracts relevant fields from a scan result object for further use.
   * @param result - The overall result object from a scan.
   * @param frontVizResult - The front visualization result object from a scan.
   * @returns Object containing the extracted information.
   */
  private extractResult(result: any, frontVizResult: any): any {
    const additionalAddress = frontVizResult.additionalAddressInformation?.description || "";
    const [province, district, village] = additionalAddress.split(" ") || ["", "", ""];
    const address = result.address?.description.replace(/\n/g, ' ') || "";


    return {
      dateOfBirth: frontVizResult.dateOfBirth?.originalDateStringResult?.description || "",
      documentNumber: frontVizResult.documentNumber?.description || "",
      fathersName: result.fathersName?.description || "",
      fullName: frontVizResult.fullName?.description || "",
      address: address,
      province: province,
      district: district,
      village: village,
      sex: frontVizResult.sex?.description || "",
      frontImage: result.fullDocumentFrontImage ? `data:image/jpg;base64,${result.fullDocumentFrontImage}` : "", // Front image in Base64
      backImage: result.fullDocumentBackImage ? `data:image/jpg;base64,${result.fullDocumentBackImage}` : ""  // Back image in Base64
    };
  }
}
