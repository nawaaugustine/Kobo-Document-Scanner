import { Injectable, Provider } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  TranslateService,
  TranslateLoader,
  TranslateModule,
  MissingTranslationHandler,
  MissingTranslationHandlerParams,
} from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { Storage } from '@capacitor/storage';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export class CustomMissingTranslationHandler implements MissingTranslationHandler {
  handle(params: MissingTranslationHandlerParams) {
    return params.key; // Fallback to key if translation is missing
  }
}

@Injectable({ providedIn: 'root' })
export class TranslationService {
  constructor(private translate: TranslateService) {}

  async initTranslation(defaultLang: string): Promise<void> {
    const { value } = await Storage.get({ key: 'language' });
    const lang = value || defaultLang;
    this.translate.addLangs(['en', 'da', 'ps']);
    this.translate.setDefaultLang(defaultLang);
    this.translate.use(lang);
  }

  async useLanguage(lang: string): Promise<void> {
    if (this.translate.getLangs().includes(lang)) {
      this.translate.use(lang);
      await Storage.set({ key: 'language', value: lang });
    }
  }

  getCurrentLang(): string {
    return this.translate.currentLang || this.translate.defaultLang;
  }
}

export function provideAppTranslations(): Provider[] {
  return [
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
      missingTranslationHandler: {
        provide: MissingTranslationHandler,
        useClass: CustomMissingTranslationHandler,
      },
    }).providers ?? [],
  ];
}