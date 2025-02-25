import { Component, OnInit, inject, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { Storage } from '@capacitor/storage';
import { DOCUMENT } from '@angular/common';
import { BlinkIdScanningService, ScanResult } from './services/blink-id-scanning.service';
import { ThemeService } from './services/theme.service';
import { TranslationService } from './services/translation.service';
import SendData from '../plugins/send-por-data.plugin';

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
    MatSelectModule,
    MatFormFieldModule,
    TranslateModule,
  ],
})
export class AppComponent implements OnInit {
  scanResults = '';
  isLoading = false;
  errorMessage = '';
  isDarkTheme = false;
  isInfoOpen = false;

  // Language properties
  selectedLanguage = 'en';
  languages = [
    { code: 'en', name: 'English' },
    { code: 'da', name: 'دری' }, // Dari
    { code: 'ps', name: 'پښتو' }, // Pashto
  ];

  private blinkIdScanningService = inject(BlinkIdScanningService);
  private themeService = inject(ThemeService);
  private snackBar = inject(MatSnackBar);
  private translate = inject(TranslateService);
  private document = inject(DOCUMENT); // For RTL support
  public translationService = inject(TranslationService);

  constructor() {
    this.translate.setDefaultLang('en'); // English as fallback
  }

  async ngOnInit(): Promise<void> {
    // Load saved language or default to English
    const { value } = await Storage.get({ key: 'language' });
    this.selectedLanguage = value || 'en';
    this.translate.use(this.selectedLanguage);
    this.setTextDirection();

    // Initialize theme
    this.isDarkTheme = this.themeService.isDarkThemeEnabled();
  }

  toggleTheme(): void {
    this.isDarkTheme = !this.isDarkTheme;
    this.themeService.enableDarkTheme(this.isDarkTheme);
  }

  showInfo(): void {
    this.isInfoOpen = true;
  }

  closeInfo(): void {
    this.isInfoOpen = false;
  }

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

  private processScanResults(results: ScanResult[]): void {
    if (results && results.length > 0) {
      this.scanResults = this.formatResults(results);
      this.sendDataToKoboCollect(results[0]);
    } else {
      this.errorMessage = this.translate.instant('error.cardNotSupported');
      this.snackBar.open(this.errorMessage, this.translate.instant('close'), {
        duration: 5000,
        panelClass: 'error-snackbar',
      });
    }
  }

  private formatResults(results: ScanResult[]): string {
    return results
      .map((result) => {
        const { frontData, backData } = result;
        return `
          ${this.translate.instant('results.fullName')}: ${frontData.fullName}
          ${this.translate.instant('results.dateOfBirth')}: ${frontData.dateOfBirth}
          ${this.translate.instant('results.documentNumber')}: ${frontData.documentNumber}
          ${this.translate.instant('results.fathersName')}: ${frontData.fathersName}
          ${this.translate.instant('results.address')}: ${frontData.address}
          ${this.translate.instant('results.sex')}: ${frontData.sex}
          ${this.translate.instant('results.dateOfIssue')}: ${backData.dateOfIssue}
          ${this.translate.instant('results.documentAdditionalNumber')}: ${backData.documentAdditionalNumber}
          ${this.translate.instant('results.dateOfExpiry')}: ${backData.dateOfExpiry}
        `.trim();
      })
      .join('\n\n');
  }

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
            dateOfExpiry: backData.dateOfExpiry,
          }),
        3,
        500
      );
    } catch (error) {
      this.handleError(error);
    }
  }

  private calculateAge(dateOfBirth: string): number {
    const [day, month, year] = dateOfBirth.split('.').map(Number);
    if (!day || !month || !year) return 0;
    const birthDate = new Date(year, month - 1, day);
    const diff = Date.now() - birthDate.getTime();
    return Math.abs(new Date(diff).getUTCFullYear() - 1970);
  }

  private handleError(error: unknown): void {
    this.errorMessage = this.translate.instant('error.scanFailed');
    this.snackBar.open(this.errorMessage, this.translate.instant('close'), {
      duration: 5000,
      panelClass: 'error-snackbar',
    });
  }

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

  async onLanguageChange(lang: string): Promise<void> {
    this.selectedLanguage = lang;
    this.translate.use(lang);
    await Storage.set({ key: 'language', value: lang });
    this.setTextDirection();
  }

  private setTextDirection(): void {
    const isRTL = ['da', 'ps'].includes(this.selectedLanguage);
    this.document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  }
}