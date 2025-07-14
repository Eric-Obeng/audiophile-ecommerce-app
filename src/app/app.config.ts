import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import {
  provideRouter,
  withRouterConfig,
  withViewTransitions,
  withInMemoryScrolling,
} from '@angular/router';

import { routes } from './app.routes';
import { provideHotToastConfig } from '@ngxpert/hot-toast';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withViewTransitions(),
      withInMemoryScrolling({
        scrollPositionRestoration: 'top',
      }),
      withRouterConfig({
        paramsInheritanceStrategy: 'always',
      })
    ), provideHotToastConfig(),
  ],
};
