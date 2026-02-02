import { inject, Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { RecepcionistaCriarRequestModel, RecepcionistaEditarRequestModel, RecepcionistaPesquisaResponseModel, RecepcionistaResponseModel } from '../models/recepcionista.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class RecepcionistaService {

  private httpClient = inject(HttpClient);

  getAll(): Observable<RecepcionistaResponseModel[]>{
    const url = `${environment.apiUrl}/recepcionistas`;

    return this.httpClient.get<RecepcionistaResponseModel[]>(url);
  }

  create(form: RecepcionistaCriarRequestModel): Observable<RecepcionistaResponseModel>{
    const url = `${environment.apiUrl}/recepcionistas`;

    return this.httpClient.post<RecepcionistaResponseModel>(url, form);
  }

  update(id: string, form: RecepcionistaEditarRequestModel): Observable<RecepcionistaResponseModel>{
    const url = `${environment.apiUrl}/recepcionistas/${id}`;

    return this.httpClient.put<RecepcionistaResponseModel>(url, form);
  }

  getById(id: string): Observable<RecepcionistaPesquisaResponseModel> {
    const url = `${environment.apiUrl}/recepcionistas/${id}`;

    return this.httpClient.get<RecepcionistaPesquisaResponseModel>(url);
  }

  delete(id: string): Observable<void> {
    const url = `${environment.apiUrl}/recepcionistas/${id}`;

    return this.httpClient.delete<void>(url);
  }
}
