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
    CommonModule, // Import CommonModule
    MatButtonModule,
    MatCardModule,
    MatToolbarModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDialogModule, // Import MatDialogModule
    MatSnackBarModule, // Import MatSnackBarModule
    InfoDialogComponent // Import InfoDialogComponent as a standalone component
  ]
})
export class AppComponent implements OnInit {
  title = 'Kobo Document Scanner'; // Title of the app
  scanResults: string = ''; // Holds the scan results to be displayed
  isLoading = false; // Indicates if the app is in a loading state
  errorMessage: string = ''; // Holds error messages
  isDarkTheme = false; // Indicates if the dark theme is enabled
  isInfoDialogOpen = false; // Flag to prevent multiple dialogs

  // Using inject() to properly inject services in a standalone component
  private blinkIdScanningService = inject(BlinkIdScanningService); // Service for scanning documents
  private themeService = inject(ThemeService); // Service for handling theme changes
  private dialog = inject(MatDialog); // Inject MatDialog service
  private snackBar = inject(MatSnackBar); // Inject MatSnackBar service

  ngOnInit(): void {
    this.isDarkTheme = this.themeService.isDarkThemeEnabled(); // Initialize theme based on user preference
  }

  /**
   * Toggles between dark and light themes.
   */
  toggleTheme(): void {
    this.isDarkTheme = !this.isDarkTheme; // Toggle theme state
    this.themeService.enableDarkTheme(this.isDarkTheme); // Apply the selected theme
  }

  /**
   * Handles the click event to initiate document scanning.
   */
  async onScanClick(): Promise<void> {
    this.scanResults = ''; // Clear previous scan results
    this.errorMessage = ''; // Clear previous error messages
    this.isLoading = true; // Set loading state to true
    try {
      const startTime = performance.now(); // Start timing the scan operation
      const results = await this.blinkIdScanningService.scanDocumentMultiSide(); // Perform the scan
      const endTime = performance.now(); // End timing the scan operation
      console.log(`Scanning took ${endTime - startTime} milliseconds`); // Log the duration of the scan
      this.processScanResults(results); // Process the scan results
    } catch (error) {
      console.error('Scanning error:', error); // Log any errors
      this.errorMessage = this.getErrorMessage(error); // Display a user-friendly error message
    } finally {
      this.isLoading = false; // Reset loading state
    }
  }

  /**
   * Processes scan results, formats them, and initiates data sharing.
   * @param results Array of processed scan results
   */
  private processScanResults(results: any[]): void {
    if (Array.isArray(results) && results.length > 0) {
      this.scanResults = this.formatResults(results); // Format and display scan results
      this.sendDataToKoboCollect(results[0]); // Send the first result to KoboCollect
    } else {
      this.errorMessage = 'No results or scanning was canceled'; // Display a message if no results are found
    }
  }

  /**
   * Formats the scan results for display or sharing.
   * @param results Array of processed scan results
   * @returns Formatted string of results
   */
  private formatResults(results: any[]): string {
    return results.map(result => {
      const formattedResult = `
      Full Name: ${result.fullName}
      Date of Birth: ${result.dateOfBirth}
      Document Number: ${result.documentNumber}
      Father's Name: ${result.fathersName}
      Address: ${result.address}
      Province: ${result.province}
      District: ${result.district}
      Village: ${result.village}
      Sex: ${result.sex}
      `;
      return formattedResult.trim(); // Format each result
    }).join("\n\n"); // Join results with double newlines
  }

  /**
   * Sends the scan results to the KoboCollect app using the native plugin.
   * @param result The processed scan result
   */
  private async sendDataToKoboCollect(result: any): Promise<void> {
    try {
      await SendData.sendData({
        dateOfBirth: result.dateOfBirth,
        CoAAddress: result.address,
        province: result.province,
        district: result.district,
        village: result.village,
        
        documentNumber: result.documentNumber,
        fullName: result.fullName,
        fathersName: result.fathersName,
        age: this.calculateAge(result.dateOfBirth), // Calculate age from date of birth
        gender: result.sex,
        frontImage: result.frontImage,
        backImage: result.backImage
      });
      console.log('Data sent to KoboCollect successfully'); // Log successful data transfer
    } catch (error) {
      console.error('Failed to send data:', error); // Log any errors during data transfer
      this.errorMessage = this.getErrorMessage(error); // Display a user-friendly error message
    }
  }

  /**
   * Calculates age from the date of birth.
   * @param dateOfBirth The date of birth in DD.MM.YYYY format
   * @returns The calculated age
   */
  private calculateAge(dateOfBirth: string): number {
    const [day, month, year] = dateOfBirth.split('.').map(Number); // Split and convert date parts to numbers
    const birthDate = new Date(year, month - 1, day); // Create a Date object
    const ageDifMs = Date.now() - birthDate.getTime(); // Calculate the difference in milliseconds
    const ageDate = new Date(ageDifMs); // Create a Date object from the difference
    return Math.abs(ageDate.getUTCFullYear() - 1970); // Calculate and return the age
  }

  /**
   * Extracts and returns a user-friendly error message from an error of type unknown.
   * @param error The error to extract the message from.
   * @returns The extracted error message.
   */
  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message; // Return the error message if it's an Error object
    }
    return String(error); // Convert and return the error as a string
  }

  /**
   * Opens the information dialog when the info button is clicked.
   */
  showInfo(): void {
    if (this.isInfoDialogOpen) {
      return; // Prevent opening multiple dialogs
    }
  
    this.isInfoDialogOpen = true;
    console.log('showInfo called');
    const dialogRef = this.dialog.open(InfoDialogComponent, {
      width: '80vw', // Adjust the width as necessary
      maxWidth: '600px', // Adjust the max-width as necessary
      autoFocus: false, // Prevent autofocus issues
      disableClose: true, // Prevent closing on backdrop click
      position: {
        top: '0%', // Adjust the top position as necessary
        left: '10%',
        bottom: '5%'
      }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog closed');
      this.isInfoDialogOpen = false; // Reset the flag when dialog is closed
      console.log(result);
    });
  
    dialogRef.afterOpened().subscribe(() => {
      console.log('Dialog opened');
    });
  }

  /**
   * Displays a "Coming Soon" notification.
   */
  comingSoon(): void {
    this.snackBar.open('Coming Soon', 'Close', {
      duration: 2000, // Notification duration in milliseconds
    });
  }
}