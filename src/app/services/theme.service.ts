import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private darkThemeClass = 'dark-theme';
  private lightThemeClass = 'light-theme';
  private renderer: Renderer2;

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
    // Initialize the theme based on user preference or default to light
    const isDarkTheme = this.isDarkThemeEnabled();
    this.enableDarkTheme(isDarkTheme);
  }

  enableDarkTheme(isDark: boolean): void {
    const themeClass = isDark ? this.darkThemeClass : this.lightThemeClass;
    this.renderer.addClass(document.body, themeClass);

    const removeClass = isDark ? this.lightThemeClass : this.darkThemeClass;
    this.renderer.removeClass(document.body, removeClass);

    // Store the preference in localStorage or use any other storage
    localStorage.setItem('isDarkTheme', JSON.stringify(isDark));
  }

  isDarkThemeEnabled(): boolean {
    return JSON.parse(localStorage.getItem('isDarkTheme') || 'false');
  }
}