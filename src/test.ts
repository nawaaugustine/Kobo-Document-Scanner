// This file is the testbed bootstrap used by the Angular CLI's test runner.
import 'zone.js/testing';
declare const require: any;
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';

getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting()
);

// Require all spec files in the current project
const context = (require as any).context('./', true, /\.spec\.ts$/);
context.keys().map(context);
