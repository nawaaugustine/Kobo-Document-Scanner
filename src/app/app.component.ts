// app.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { InfoDialogComponent } from './info-dialog/info-dialog.component';
import { BlinkIdScanningService } from './services/blink-id-por-scanning.service';
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
    MatDialogModule,
    MatSnackBarModule,
    InfoDialogComponent
  ]
})
export class AppComponent implements OnInit {
  title = 'Kobo Document Scanner';
  scanResults: string = '';
  isLoading = false;
  errorMessage: string = '';
  isDarkTheme = false;
  isInfoDialogOpen = false;

  private blinkIdScanningService = inject(BlinkIdScanningService);
  private themeService = inject(ThemeService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    this.isDarkTheme = this.themeService.isDarkThemeEnabled();
  }

  /**
   * Toggles between dark and light themes.
   */
  toggleTheme(): void {
    this.isDarkTheme = !this.isDarkTheme;
    this.themeService.enableDarkTheme(this.isDarkTheme);
  }

  /**
   * Initiates the document scanning process with retry logic.
   */
  async onScanClick(): Promise<void> {
    this.scanResults = '';
    this.errorMessage = '';
    this.isLoading = true;
    try {
      const startTime = performance.now();
      const results = await this.retry(() => this.blinkIdScanningService.scanDocumentMultiSide(), 3, 500);
      console.log(`Scanning took ${performance.now() - startTime} milliseconds`);
      this.processScanResults(results);
    } catch (error) {
      console.error('Scanning error:', error);
      this.errorMessage = this.getErrorMessage(error);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Processes the scan results by formatting them and sending data to KoboCollect.
   * @param results Array of scan results.
   */
  private processScanResults(results: any[]): void {
    if (Array.isArray(results) && results.length > 0) {
      this.scanResults = this.formatResults(results);
      this.sendDataToKoboCollect(results[0]);
    } else {
      this.errorMessage = 'No results or scanning was canceled';
    }
  }

  /**
   * Extracts the front-side data from the scan result.
   * @param result Scan result object.
   * @returns An object containing front-side fields.
   */
  private extractFrontData(result: any): any {
    const front = result['BlinkIDMultiSideRecognizer::Result']?.frontViz;
    return {
      fullName: front?.fullName?.latin?.value || '',
      dateOfBirth: front?.dateOfBirth?.originalString?.latin?.value || '',
      documentNumber: front?.documentNumber?.latin?.value || '',
      fathersName: front?.fathersName?.latin?.value || '',
      address: front?.address?.latin?.value || '',
      sex: front?.sex?.latin?.value || ''
    };
  }

  /**
   * Extracts the back-side data from the scan result.
   * @param result Scan result object.
   * @returns An object containing back-side fields.
   */
  private extractBackData(result: any): any {
    const back = result['BlinkIDMultiSideRecognizer::Result']?.backViz;
    return {
      dateOfIssue: back?.dateOfIssue?.originalString?.latin?.value || '',
      documentAdditionalNumber: back?.documentAdditionalNumber?.latin?.value || '',
      dateOfExpiry: back?.dateOfExpiry?.originalString?.latin?.value || ''
    };
  }

  /**
   * Formats both front and back data for display.
   * @param results Array of scan results.
   * @returns A formatted string.
   */
  private formatResults(results: any[]): string {
    return results.map(result => {
      const frontData = this.extractFrontData(result);
      const backData = this.extractBackData(result);
      const formattedFront = `
      Full Name: ${frontData.fullName}
      Date of Birth: ${frontData.dateOfBirth}
      Document Number: ${frontData.documentNumber}
      Father's Name: ${frontData.fathersName}
      Address: ${frontData.address}
      Sex: ${frontData.sex}
      `.trim();
      const formattedBack = `
      Back Date of Issue: ${backData.dateOfIssue}
      Back Document Additional Number: ${backData.documentAdditionalNumber}
      Back Date of Expiry: ${backData.dateOfExpiry}
      `.trim();
      return formattedFront + "\n\n" + formattedBack;
    }).join("\n\n");
  }

  /**
   * Sends the scan data (front/back images and dependents info) to KoboCollect.
   * @param result Single scan result object.
   */
  private async sendDataToKoboCollect(result: any): Promise<void> {
    try {
      const fullResult = result['BlinkIDMultiSideRecognizer::Result'];
      const frontData = fullResult?.frontViz;
      const backImage = fullResult?.fullDocumentBackImage?.encodedImage || '';
      const dependentsInfo = JSON.stringify(fullResult?.dependentsInfo || []);
      await this.retry(() => SendData.sendData({
        dateOfBirth: frontData?.dateOfBirth?.originalString?.latin?.value || '',
        CoAAddress: frontData?.address?.latin?.value || '',
        province: '', // Extract as needed
        district: '',
        village: '',
        documentNumber: frontData?.documentNumber?.latin?.value || '',
        fullName: frontData?.fullName?.latin?.value || '',
        fathersName: frontData?.fathersName?.latin?.value || '',
        age: this.calculateAge(frontData?.dateOfBirth?.originalString?.latin?.value || '01.01.1970'),
        gender: frontData?.sex?.latin?.value || '',
        frontImage: fullResult?.fullDocumentFrontImage?.encodedImage || '',
        backImage: backImage,
        dependentsInfo: dependentsInfo
      }), 3, 500);
      console.log('Data sent to KoboCollect successfully');
    } catch (error) {
      console.error('Failed to send data:', error);
      this.errorMessage = this.getErrorMessage(error);
    }
  }

  /**
   * Calculates age from a date string (DD.MM.YYYY).
   * @param dateOfBirth Date string.
   * @returns Calculated age.
   */
  private calculateAge(dateOfBirth: string): number {
    const [day, month, year] = dateOfBirth.split('.').map(Number);
    const birthDate = new Date(year, month - 1, day);
    const ageDifMs = Date.now() - birthDate.getTime();
    return Math.abs(new Date(ageDifMs).getUTCFullYear() - 1970);
  }

  /**
   * Extracts a user-friendly error message.
   * @param error Error object.
   * @returns Error message.
   */
  private getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }

  /**
   * Opens the information dialog.
   */
  showInfo(): void {
    if (this.isInfoDialogOpen) return;
    this.isInfoDialogOpen = true;
    const dialogRef = this.dialog.open(InfoDialogComponent, {
      width: '80vw',
      maxWidth: '600px',
      autoFocus: false,
      disableClose: true,
      position: { top: '0%', left: '10%', bottom: '5%' }
    });
    dialogRef.afterClosed().subscribe(() => {
      this.isInfoDialogOpen = false;
    });
  }

  /**
   * Displays a "Coming Soon" notification.
   */
  comingSoon(): void {
    this.snackBar.open('Coming Soon', 'Close', { duration: 2000 });
  }

  /**
   * Generic retry function for asynchronous operations.
   * @param fn Asynchronous function to retry.
   * @param retries Number of retry attempts.
   * @param delay Delay between retries in milliseconds.
   * @returns The resolved value of the asynchronous function.
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
