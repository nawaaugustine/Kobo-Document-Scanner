/* app.component.ts */

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BlinkIdScanningService, ScanResult } from './services/blink-id-scanning.service';
import { ThemeService } from './services/theme.service';

// IMPORTANT: You must actually import TranslateModule from '@ngx-translate/core'
import { TranslateModule } from '@ngx-translate/core';

import { TranslationService } from './services/translation.service';
import SendData from '../plugins/send-por-data.plugin';

/**
 * Main application component handling theme toggling and document scanning actions.
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatToolbarModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    TranslateModule
  ]
})
export class AppComponent implements OnInit {
  scanResults = '';
  isLoading = false;
  errorMessage = '';
  isDarkTheme = false;
  isInfoOpen = false;

  // Inject needed services
  private blinkIdScanningService = inject(BlinkIdScanningService);
  private themeService = inject(ThemeService);
  private snackBar = inject(MatSnackBar);
  private translationService = inject(TranslationService);

  ngOnInit(): void {
    // Initialize theme
    this.isDarkTheme = this.themeService.isDarkThemeEnabled();

    // Initialize translations (default to English or any saved language)
    this.translationService.initTranslation('en');
  }

  /**
   * Toggles the light/dark theme.
   */
  toggleTheme(): void {
    this.isDarkTheme = !this.isDarkTheme;
    this.themeService.enableDarkTheme(this.isDarkTheme);
  }

  /**
   * Displays information popup.
   */
  showInfo(): void {
    this.isInfoOpen = true;
  }

  /**
   * Closes the information popup.
   */
  closeInfo(): void {
    this.isInfoOpen = false;
  }

  /**
   * Initiates multi-side scanning. Uses local retry mechanism.
   */
  async onScanMultiSideClick(): Promise<void> {
    this.scanResults = '';
    this.errorMessage = '';
    this.isLoading = true;

    try {
      const results = await this.retry(
        () => this.blinkIdScanningService.scanDocumentMultiSide(),
        3,
        500
      );
      this.processScanResults(results);
    } catch (error) {
      this.handleError(error);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Initiates single-side scanning. Uses local retry mechanism.
   */
  async onScanSingleSideClick(): Promise<void> {
    this.scanResults = '';
    this.errorMessage = '';
    this.isLoading = true;

    try {
      const results = await this.retry(
        () => this.blinkIdScanningService.scanDocumentSingleSide(),
        3,
        500
      );
      this.processScanResults(results);
    } catch (error) {
      this.handleError(error);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Processes and formats the scan results, then sends them to KoboCollect if available.
   * @param results Array of ScanResult objects.
   */
  private processScanResults(results: ScanResult[]): void {
    if (results && results.length > 0) {
      this.scanResults = this.formatResults(results);
      this.sendDataToKoboCollect(results[0]);
    } else {
      // Use translated error message from your JSON
      this.translationService.useLanguage(this.translationService.getCurrentLang()); // ensure current language
      this.errorMessage = this.translationService
        .getCurrentLang()
        ? this.translationService['translate'].instant('error.cardNotSupported')
        : 'Card not supported or scanning was canceled'; 
      
      this.snackBar.open(
        this.errorMessage,
        this.translationService['translate'].instant('close'),
        {
          duration: 5000,
          panelClass: 'error-snackbar'
        }
      );
    }
  }

  /**
   * Generates a readable string from the ScanResult array.
   * @param results Array of ScanResult objects.
   */
  private formatResults(results: ScanResult[]): string {
    // You can translate each label from "results" in your JSON
    return results
      .map((result: ScanResult) => {
        const { frontData, backData } = result;

        const labelFullName = this.translationService['translate'].instant('results.fullName');
        const labelDateOfBirth = this.translationService['translate'].instant('results.dateOfBirth');
        const labelDocumentNumber = this.translationService['translate'].instant('results.documentNumber');
        const labelFathersName = this.translationService['translate'].instant('results.fathersName');
        const labelAddress = this.translationService['translate'].instant('results.address');
        const labelSex = this.translationService['translate'].instant('results.sex');
        const labelDateOfIssue = this.translationService['translate'].instant('results.dateOfIssue');
        const labelAdditionalNumber = this.translationService['translate'].instant('results.documentAdditionalNumber');
        const labelDateOfExpiry = this.translationService['translate'].instant('results.dateOfExpiry');

        const formattedFront = `
          ${labelFullName}: ${frontData.fullName}
          ${labelDateOfBirth}: ${frontData.dateOfBirth}
          ${labelDocumentNumber}: ${frontData.documentNumber}
          ${labelFathersName}: ${frontData.fathersName}
          ${labelAddress}: ${frontData.address}
          ${labelSex}: ${frontData.sex}
        `.trim();

        const formattedBack = `
          ${labelDateOfIssue}: ${backData.dateOfIssue}
          ${labelAdditionalNumber}: ${backData.documentAdditionalNumber}
          ${labelDateOfExpiry}: ${backData.dateOfExpiry}
        `.trim();

        return formattedFront + '\n\n' + formattedBack;
      })
      .join('\n\n');
  }

  /**
   * Sends the first ScanResult to the KoboCollect app using the SendData plugin.
   * @param result The first ScanResult from the array.
   */
  private async sendDataToKoboCollect(result: ScanResult): Promise<void> {
    try {
      const frontData = result.frontData;
      const backData = result.backData;
      const dependentsInfo =
        typeof result.dependentsInfo === 'string'
          ? result.dependentsInfo
          : JSON.stringify(result.dependentsInfo || []);

      await this.retry(
        () =>
          SendData.sendData({
            dateOfBirth: frontData.dateOfBirth,
            CoAAddress: frontData.address,
            province: frontData.province,
            district: frontData.district,
            village: frontData.village,
            documentNumber: frontData.documentNumber,
            fullName: frontData.fullName,
            fathersName: frontData.fathersName,
            age: this.calculateAge(frontData.dateOfBirth || '01.01.1970'),
            gender: frontData.sex,
            frontImage: result.frontImage,
            backImage: result.backImage,
            dependentsInfo,
            dateOfIssue: backData.dateOfIssue,
            documentAdditionalNumber: backData.documentAdditionalNumber,
            dateOfExpiry: backData.dateOfExpiry
          }),
        3,
        500
      );
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Calculates approximate age from a DD.MM.YYYY string.
   * @param dateOfBirth Birth date string.
   */
  private calculateAge(dateOfBirth: string): number {
    const [day, month, year] = dateOfBirth.split('.').map(Number);
    if (!day || !month || !year) return 0;
    const birthDate = new Date(year, month - 1, day);
    const diff = Date.now() - birthDate.getTime();
    return Math.abs(new Date(diff).getUTCFullYear() - 1970);
  }

  /**
   * Handles errors by setting a user-friendly message and showing a snackbar alert.
   * @param error Any unknown error.
   */
  private handleError(error: unknown): void {
    // Use translated fallback or the actual error message
    this.errorMessage = this.getErrorMessage(error) 
      || this.translationService['translate'].instant('error.scanFailed');

    this.snackBar.open(
      this.errorMessage,
      this.translationService['translate'].instant('close'),
      {
        duration: 5000,
        panelClass: 'error-snackbar'
      }
    );
  }

  /**
   * Converts an unknown error into a string message.
   * @param error Any unknown error.
   */
  private getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }

  /**
   * A generic retry helper.
   * @param fn Async function to execute.
   * @param retries Max attempts.
   * @param delay Delay between attempts (ms).
   */
  private async retry<T>(fn: () => Promise<T>, retries = 3, delay = 500): Promise<T> {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        if (attempt === retries - 1) throw error;
        await new Promise((res) => setTimeout(res, delay));
      }
    }
    throw new Error('Retry attempts exceeded');
  }
}
