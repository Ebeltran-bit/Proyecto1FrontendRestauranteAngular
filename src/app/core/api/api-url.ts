import { InjectionToken } from '@angular/core';

/**
 * Base URL of the REST API. In development `/api` is forwarded to FastAPI by
 * proxy.conf.json, so the browser never needs CORS. In production the web
 * server that hosts the app should forward `/api` the same way.
 */
export const API_URL = new InjectionToken<string>('API_URL', { factory: () => '/api' });
