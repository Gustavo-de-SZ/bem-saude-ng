import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private apiUrl = 'http://localhost:8000/api';

  getApiUrl(): string {
    return this.apiUrl;
  }

  // Optional: method to update URL if needed for different environments
  setApiUrl(url: string): void {
    this.apiUrl = url;
  }
}