import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { BlinkIdScanningService, ScanResult } from './services/blink-id-por-scanning.service';
import { ThemeService } from './services/theme.service';
import SendData from '../plugins/send-por-data.plugin';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatToolbarModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ]
})
export class AppComponent implements OnInit {
  title = 'Kobo Document Scanner';
  scanResults: string = '';
  isLoading = false;
  errorMessage: string = '';
  isDarkTheme = false;
  isInfoOpen = false;

  private blinkIdScanningService = inject(BlinkIdScanningService);
  private themeService = inject(ThemeService);
  private snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    this.isDarkTheme = this.themeService.isDarkThemeEnabled();
  }

  /**
   * Toggles the theme between dark and light.
   */
  toggleTheme(): void {
    this.isDarkTheme = !this.isDarkTheme;
    this.themeService.enableDarkTheme(this.isDarkTheme);
  }

  /**
   * Opens the help/information popup.
   */
  showInfo(): void {
    this.isInfoOpen = true;
  }

  /**
   * Closes the help/information popup.
   */
  closeInfo(): void {
    this.isInfoOpen = false;
  }

  /**
   * Initiates the scanning process with retries.
   */
  async onScanClick(): Promise<void> {
    this.scanResults = '';
    this.errorMessage = '';
    this.isLoading = true;
    try {
      const startTime = performance.now();
      const results: ScanResult[] = await this.retry(
        () => this.blinkIdScanningService.scanDocumentMultiSide(),
        3,
        500
      );
      console.log(`Scanning took ${performance.now() - startTime} ms`);
      this.processScanResults(results);
    } catch (error) {
      console.error('Scanning error:', error);
      this.errorMessage = this.getErrorMessage(error);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Processes the scan results by formatting them for display
   * and sending the first result to the SendData plugin.
   * @param results Array of ScanResult objects.
   */
  private processScanResults(results: ScanResult[]): void {
    if (results && results.length > 0) {
      this.scanResults = this.formatResults(results);
      // Send the first scan result (adjust if you need a different selection)
      this.sendDataToKoboCollect(results[0]);
    } else {
      this.errorMessage = 'No results or scanning was canceled';
    }
  }

  /**
   * Formats scan results into a display string.
   * @param results Array of ScanResult objects.
   * @returns A formatted string.
   */
  private formatResults(results: ScanResult[]): string {
    return results.map(result => {
      const { frontData, backData } = result;
      const formattedFront = `
        Full Name: ${frontData.fullName}
        Date of Birth: ${frontData.dateOfBirth}
        Document Number: ${frontData.documentNumber}
        Father's Name: ${frontData.fathersName}
        Address: ${frontData.address}
        Sex: ${frontData.sex}
      `.trim();

      const formattedBack = `
        Date of Issue: ${backData.dateOfIssue}
        Document Additional Number: ${backData.documentAdditionalNumber}
        Date of Expiry: ${backData.dateOfExpiry}
      `.trim();

      return formattedFront + '\n\n' + formattedBack;
    }).join('\n\n');
  }

  /**
   * Sends scan data to KoboCollect via the SendData plugin.
   * @param result A structured ScanResult object.
   */
  private async sendDataToKoboCollect(result: ScanResult): Promise<void> {
    try {
      const frontData = result.frontData;
      const backData = result.backData;
      const dependentsInfo =
        typeof result.dependentsInfo === 'string'
          ? result.dependentsInfo
          : JSON.stringify(result.dependentsInfo || []);
      
      // Call the SendData plugin with all required fields.
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
            dependentsInfo: dependentsInfo,
            // New backData fields:
            dateOfIssue: backData.dateOfIssue,
            documentAdditionalNumber: backData.documentAdditionalNumber,
            dateOfExpiry: backData.dateOfExpiry
          }),
        3,
        500
      );
      console.log('Data sent to KoboCollect successfully');
    } catch (error) {
      console.error('Failed to send data:', error);
      this.errorMessage = this.getErrorMessage(error);
    }
  }

  /**
   * Calculates age given a birth date string in format DD.MM.YYYY.
   * @param dateOfBirth Birth date as string.
   * @returns Calculated age as a number.
   */
  private calculateAge(dateOfBirth: string): number {
    const [day, month, year] = dateOfBirth.split('.').map(Number);
    const birthDate = new Date(year, month - 1, day);
    const ageDifMs = Date.now() - birthDate.getTime();
    return Math.abs(new Date(ageDifMs).getUTCFullYear() - 1970);
  }

  /**
   * Converts an error object into a user-friendly message.
   * @param error The error encountered.
   * @returns Error message string.
   */
  private getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }

  /**
   * Generic retry helper for async functions.
   * @param fn Function to retry.
   * @param retries Number of attempts.
   * @param delay Delay between attempts in milliseconds.
   * @returns The resolved value of the function.
   */
  private async retry<T>(fn: () => Promise<T>, retries = 3, delay = 500): Promise<T> {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        if (attempt === retries - 1) throw error;
        await new Promise(res => setTimeout(res, delay));
      }
    }
    throw new Error('Retry attempts exceeded');
  }
}
