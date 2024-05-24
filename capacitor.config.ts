import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.nawa.kobo.mrz',
  appName: 'Kobo Document Scanner',
  webDir: 'dist/kobo-document-scanner/browser', // Ensure this matches your Angular build output directory
};

export default config;
