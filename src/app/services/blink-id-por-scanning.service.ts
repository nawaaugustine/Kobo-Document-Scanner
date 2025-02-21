import { Injectable } from '@angular/core';
import * as BlinkID from '@microblink/blinkid-capacitor';
import { environment } from '../../environments/environment';

/**
 * Structured scan result interface.
 */
export interface ScanResult {
  frontData: {
    fullName: string;
    dateOfBirth: string;
    documentNumber: string;
    fathersName: string;
    address: string;
    province: string;
    district: string;
    village: string;
    sex: string;
  };
  backData: {
    dateOfIssue: string;
    documentAdditionalNumber: string;
    dateOfExpiry: string;
  };
  frontImage: string;
  backImage: string;
  dependentsInfo: any; // could be an array or a JSON string
}

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
   * Configures the recognizer settings to capture full document and face images.
   */
  private initializeRecognizer(): void {
    this.blinkIdMultisideRecognizer.returnFullDocumentImage = true;
    this.blinkIdMultisideRecognizer.returnFaceImage = true;
  }

  /**
   * Initiates a multi-side document scan using retry logic.
   * @param retries Number of retry attempts.
   * @returns Array of processed ScanResult objects.
   */
  async scanDocumentMultiSide(retries: number = 3): Promise<ScanResult[]> {
    let attempt = 0;
    while (attempt < retries) {
      try {
        const startTime = performance.now();
        const scanningResults = await this.plugin.scanWithCamera(
          this.settings,
          new BlinkID.RecognizerCollection([this.blinkIdMultisideRecognizer]),
          this.licenseKeys
        );
        const endTime = performance.now();
        console.log(`Scanning completed in ${endTime - startTime} ms`);
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
   * Processes the raw scanning results by mapping and filtering valid results.
   * @param results Raw results from the scanning plugin.
   * @returns Array of structured ScanResult objects.
   */
  private processResults(results: any[]): ScanResult[] {
    if (!results || results.length === 0) {
      console.log('No scanning results available');
      return [];
    }
    return results
      .map(result => this.extractResult(result))
      .filter(res => res !== null) as ScanResult[];
  }

  /**
   * Extracts both front and back data from a raw scan result.
   * @param result A raw scan result.
   * @returns A structured ScanResult object or null if the front visualization is missing.
   */
/**
 * Extracts both front and back data from a raw scan result.
 * @param result A raw scan result.
 * @returns A structured ScanResult object or null if the front visualization is missing.
 */
private extractResult(result: any): ScanResult | null {
  // Retrieve the main recognizer result object.
  const recognizerResult = result['BlinkIDMultiSideRecognizer::Result'];
  if (!recognizerResult) {
    console.log('Recognizer result is missing');
    return null;
  }

  // Directly access frontViz and backViz.
  const frontVizResult = recognizerResult.frontViz;
  const backVizResult = recognizerResult.backViz;

  // Validate that the front visualization result is present.
  if (!frontVizResult || frontVizResult.empty) {
    console.log('Empty front visualization result');
    return null;
  }

  // Process additionalAddress from frontViz to extract province, district, and village.
  const additionalAddress = frontVizResult.additionalAddressInformation?.description || "";
  const [province, district, village] = additionalAddress.split(" ") || ["", "", ""];

  // Extract front data directly, similar to how fields like fathersName and address are pulled.
  const frontData = {
    fullName: frontVizResult.fullName?.description || "",
    dateOfBirth: frontVizResult.dateOfBirth?.originalDateStringResult?.description || "",
    documentNumber: frontVizResult.documentNumber?.description || "",
    fathersName: recognizerResult.fathersName?.description || "",
    address: recognizerResult.address?.description.replace(/\n/g, ' ') || "",
    province,
    district,
    village,
    sex: frontVizResult.sex?.description || ""
  };

  // Directly extract back data from backViz.
  const backData = {
    dateOfIssue: backVizResult?.dateOfIssue?.originalString?.latin?.value || "",
    documentAdditionalNumber: backVizResult?.documentAdditionalNumber?.latin?.value || "",
    dateOfExpiry: backVizResult?.dateOfExpiry?.originalString?.latin?.value || ""
  };

  // Convert images to Base64 data URIs.
  const frontImage = result.fullDocumentFrontImage
    ? `data:image/jpg;base64,${result.fullDocumentFrontImage}`
    : "";
  const backImage = result.fullDocumentBackImage
    ? `data:image/jpg;base64,${result.fullDocumentBackImage}`
    : "";

  // Optionally capture dependent information directly from the recognizer result.
  const dependentsInfo = recognizerResult.dependentsInfo || "";

  return { frontData, backData, frontImage, backImage, dependentsInfo };
}

}
