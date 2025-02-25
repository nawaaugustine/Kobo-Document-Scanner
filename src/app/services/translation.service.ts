// File: app/services/translation.service.ts
import { Injectable, Provider } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  TranslateService,
  TranslateLoader,
  TranslateModule,
  MissingTranslationHandler,
  MissingTranslationHandlerParams
} from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

// This factory tells ngx-translate how to load translation JSON files.
export function HttpLoaderFactory(http: HttpClient) {
  // Adjust path if you keep i18n files elsewhere:
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

// In case a translation key is missing:
export class CustomMissingTranslationHandler implements MissingTranslationHandler {
  handle(params: MissingTranslationHandlerParams) {
    // Fallback text or any custom handling:
    return params.key;
  }
}

@Injectable({ providedIn: 'root' })
export class TranslationService {
  constructor(private translate: TranslateService) {}

  /**
   * Call this once in your app initialization to set default & current language
   */
  initTranslation(defaultLang: string) {
    // Optionally, retrieve saved language from localStorage:
    const storedLang = localStorage.getItem('appLanguage') || defaultLang;

    // Supported languages:
    this.translate.addLangs(['en', 'da', 'ps']);
    this.translate.setDefaultLang(defaultLang);

    // Use whichever is stored or default:
    this.useLanguage(storedLang);
  }

  /**
   * Switches current language at runtime
   */
  useLanguage(lang: string) {
    if (this.translate.getLangs().includes(lang)) {
      this.translate.use(lang);
      localStorage.setItem('appLanguage', lang);
    }
  }

  /**
   * Gets current active language
   */
  getCurrentLang(): string {
    return this.translate.currentLang || this.translate.defaultLang;
  }
}

/**
 * This provider is used in the ApplicationConfig so Angular knows how to handle translations
 */
export function provideAppTranslations(): Provider[] {
  return [
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      },
      missingTranslationHandler: {
        provide: MissingTranslationHandler,
        useClass: CustomMissingTranslationHandler
      }
    }).providers ?? []
  ];
}
