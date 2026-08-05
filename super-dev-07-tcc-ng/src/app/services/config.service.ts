import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private apiUrl = `${environment.api.serverUrl}/api`;

  getApiUrl(): string {
    return this.apiUrl;
  }

  // Optional: method to update URL if needed for different environments
  setApiUrl(url: string): void {
    this.apiUrl = url;
  }
}