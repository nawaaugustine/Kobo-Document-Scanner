import { Injectable } from '@angular/core';
import * as BlinkID from '@microblink/blinkid-capacitor';
import { environment } from '../../environments/environment';
import { TranslateService } from '@ngx-translate/core';

/**
 * Interface for final, structured scan results.
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
  dependentsInfo: any;
}

/**
 * Service for scanning documents using Microblink's BlinkID (multi or single side).
 */
@Injectable({
  providedIn: 'root'
})
export class BlinkIdScanningService {
  private plugin: BlinkID.BlinkIDPlugin = new BlinkID.BlinkIDPlugin();
  private blinkIdMultisideRecognizer: BlinkID.BlinkIdMultiSideRecognizer =
    new BlinkID.BlinkIdMultiSideRecognizer();
  private blinkIdSingleSideRecognizer: BlinkID.BlinkIdSingleSideRecognizer =
    new BlinkID.BlinkIdSingleSideRecognizer();

  private licenseKeys: BlinkID.License = {
    ios: environment.MICROBLINK_LICENSE_KEY,
    android: environment.MICROBLINK_LICENSE_KEY,
    showTrialLicenseWarning: false
  };

  private settings: BlinkID.BlinkIdOverlaySettings = new BlinkID.BlinkIdOverlaySettings();

  constructor(private translate: TranslateService) {
    this.initializeRecognizers();
  }

  /**
   * Configures default recognizer settings to return full images.
   */
  private initializeRecognizers(): void {
    this.blinkIdMultisideRecognizer.returnFullDocumentImage = true;
    this.blinkIdMultisideRecognizer.returnFaceImage = true;
    this.blinkIdSingleSideRecognizer.returnFullDocumentImage = true;
    this.blinkIdSingleSideRecognizer.returnFaceImage = true;
  }

  /**
   * Performs multi-side scanning with BlinkID.
   * Retries internally if needed.
   * @param retries Number of retry attempts.
   */
  async scanDocumentMultiSide(retries: number = 3): Promise<ScanResult[]> {
    let attempt = 0;
    while (attempt < retries) {
      try {
        const results = await this.plugin.scanWithCamera(
          this.settings,
          new BlinkID.RecognizerCollection([this.blinkIdMultisideRecognizer]),
          this.licenseKeys
        );
        return this.processResults(results);
      } catch (error) {
        attempt++;
        if (attempt >= retries) {
          throw new Error(this.translate.instant('error.multiSideScanningFailed'));
        }
      }
    }
    return [];
  }

  /**
   * Performs single-side scanning with BlinkID.
   * Retries internally if needed.
   * @param retries Number of retry attempts.
   */
  async scanDocumentSingleSide(retries: number = 3): Promise<ScanResult[]> {
    let attempt = 0;
    while (attempt < retries) {
      try {
        const results = await this.plugin.scanWithCamera(
          this.settings,
          new BlinkID.RecognizerCollection([this.blinkIdSingleSideRecognizer]),
          this.licenseKeys
        );
        return this.processSingleSideResults(results);
      } catch (error) {
        attempt++;
        if (attempt >= retries) {
          throw new Error(this.translate.instant('error.singleSideScanningFailed'));
        }
      }
    }
    return [];
  }

  /**
   * Filters raw multi-side scanning results into an array of ScanResult objects.
   * @param results Raw results from plugin.
   */
  private processResults(results: any[]): ScanResult[] {
    if (!results || !results.length) {
      return [];
    }
    return results
      .map((res) => this.extractResult(res))
      .filter((item) => item !== null) as ScanResult[];
  }

  /**
   * Extracts front/back data and images from a raw multi-side scanning result.
   * @param result Raw single item result from plugin.
   */
  private extractResult(result: any): ScanResult | null {
    const frontVizResult = result.frontVizResult;
    const backVizResult = result.backVizResult;
    if (
      (!frontVizResult || frontVizResult.empty) &&
      (!backVizResult || backVizResult.empty)
    ) {
      return null;
    }

    const additionalAddress = frontVizResult?.additionalAddressInformation?.description || '';
    const [province, district, village] = additionalAddress.split(' ') || ['', '', ''];

    const frontData = {
      fullName:
        frontVizResult.fullName?.description ||
        backVizResult.fullName?.description ||
        '',
      dateOfBirth:
        frontVizResult.dateOfBirth?.originalDateStringResult?.description ||
        backVizResult.dateOfBirth?.originalDateStringResult?.description ||
        '',
      documentNumber:
        frontVizResult.documentNumber?.description ||
        backVizResult.documentNumber?.description ||
        '',
      fathersName: result.fathersName?.description || '',
      address: result.address?.description?.replace(/\n/g, ' ') || '',
      province,
      district,
      village,
      sex:
        frontVizResult.sex?.description ||
        backVizResult.sex?.description ||
        ''
    };

    const backData = {
      dateOfIssue: backVizResult?.dateOfIssue?.originalDateStringResult?.description || '',
      documentAdditionalNumber: backVizResult?.documentAdditionalNumber?.description || '',
      dateOfExpiry: backVizResult?.dateOfExpiry?.originalDateStringResult?.description || ''
    };

    const frontImage = result.fullDocumentFrontImage
      ? `data:image/jpg;base64,${result.fullDocumentFrontImage}`
      : '';
    const backImage = result.fullDocumentBackImage
      ? `data:image/jpg;base64,${result.fullDocumentBackImage}`
      : '';
    const dependentsInfo = result.dependentsInfo || '';

    return { frontData, backData, frontImage, backImage, dependentsInfo };
  }

  /**
   * Filters raw single-side scanning results into an array of ScanResult objects.
   * @param results Raw results from plugin.
   */
  private processSingleSideResults(results: any[]): ScanResult[] {
    if (!results || !results.length) {
      return [];
    }
    return results
      .map((res) => this.extractSingleSideResult(res))
      .filter((item) => item !== null) as ScanResult[];
  }

  /**
   * Extracts front data and image from a raw single-side scanning result.
   * @param result Raw single item result from plugin.
   */
  private extractSingleSideResult(result: any): ScanResult | null {
    const frontVizResult = result.frontVizResult;
    if (!frontVizResult || frontVizResult.empty) {
      return null;
    }

    const additionalAddress = frontVizResult?.additionalAddressInformation?.description || '';
    const [province, district, village] = additionalAddress.split(' ') || ['', '', ''];

    const frontData = {
      fullName: frontVizResult.fullName?.description || '',
      dateOfBirth: frontVizResult.dateOfBirth?.originalDateStringResult?.description || '',
      documentNumber: frontVizResult.documentNumber?.description || '',
      fathersName: result.fathersName?.description || '',
      address: result.address?.description?.replace(/\n/g, ' ') || '',
      province,
      district,
      village,
      sex: frontVizResult.sex?.description || ''
    };

    const backData = {
      dateOfIssue: '',
      documentAdditionalNumber: '',
      dateOfExpiry: ''
    };

    const frontImage = result.fullDocumentImage
      ? `data:image/jpg;base64,${result.fullDocumentImage}`
      : '';
    const backImage = '';
    const dependentsInfo = result.dependentsInfo || '';

    return { frontData, backData, frontImage, backImage, dependentsInfo };
  }
}
