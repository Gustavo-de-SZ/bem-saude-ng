import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PacienteCriarRequestModel, PacienteEditarRequestModel, PacientePesquisaResponseModel, PacienteResponseModel } from '../models/paciente.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PacienteService {
  private httpClient = inject(HttpClient);

  getAll(): Observable<PacienteResponseModel[]> {
    const url = `${environment.apiUrl}/pacientes`;

    return this.httpClient.get<PacienteResponseModel[]>(url);
  }

  create(form: PacienteCriarRequestModel): Observable<PacienteResponseModel> {
    const url = `${environment.apiUrl}/pacientes`;

    return this.httpClient.put<PacienteResponseModel>(url, form);
  }

  update(id: string, form: PacienteEditarRequestModel): Observable<PacienteResponseModel> {
    const url = `${environment.apiUrl}/pacientes/${id}`;

    return this.httpClient.put<PacienteResponseModel>(url, form);
  }

  getById(id: string): Observable<PacientePesquisaResponseModel> {
    const url = `${environment.apiUrl}/pacientes/${id}`;

    return this.httpClient.get<PacientePesquisaResponseModel>(url);
  }

  delete(id: string): Observable<void> {
    const url = `${environment.apiUrl}/pacientes/${id}`;

    return this.httpClient.delete<void>(url);
  }
}
