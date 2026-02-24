import { BootstrapContext, bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app/app.component';
import { config } from './app/app.config.server';
import { routes } from './app/app.routes'; // your routes file

const bootstrap = (context: BootstrapContext) =>
  bootstrapApplication(AppComponent, {
    ...config,
    providers: [
      ...(config.providers || []),  // keep existing providers
      provideHttpClient(),           // ✅ Add this
      provideRouter(routes)          // ✅ If you use routing
    ]
  }, context);

export default bootstrap;