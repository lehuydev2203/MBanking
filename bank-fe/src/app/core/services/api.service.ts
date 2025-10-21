import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly baseUrl = environment.baseApiUrl;

  constructor(private http: HttpClient) {}

  get<T>(endpoint: string, params?: Record<string, any>): Observable<T> {
    let httpParams = new HttpParams();

    if (params) {
      Object.keys(params).forEach((key) => {
        if (
          params[key] !== null &&
          params[key] !== undefined &&
          params[key] !== ''
        ) {
          httpParams = httpParams.set(key, params[key].toString());
        }
      });
    }

    return this.http
      .get<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, {
        params: httpParams,
      })
      .pipe(
        map((response) => {
          if (response.success) {
            return response.data;
          }
          throw new Error(response.message || 'API request failed');
        }),
      );
  }

  post<T>(endpoint: string, body: any): Observable<T> {
    console.log('🚀 ~ ApiService ~ post ~ body:', body);
    return this.http
      .post<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, body)
      .pipe(
        map((response) => {
          if (response.success) {
            return response.data;
          }
          throw new Error(response.message || 'API request failed');
        }),
      );
  }

  put<T>(endpoint: string, body: any): Observable<T> {
    return this.http
      .put<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, body)
      .pipe(
        map((response) => {
          if (response.success) {
            return response.data;
          }
          throw new Error(response.message || 'API request failed');
        }),
      );
  }

  patch<T>(endpoint: string, body: any): Observable<T> {
    return this.http
      .patch<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, body)
      .pipe(
        map((response) => {
          if (response.success) {
            return response.data;
          }
          throw new Error(response.message || 'API request failed');
        }),
      );
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<ApiResponse<T>>(`${this.baseUrl}${endpoint}`).pipe(
      map((response) => {
        if (response.success) {
          return response.data;
        }
        throw new Error(response.message || 'API request failed');
      }),
    );
  }

  postBlob(endpoint: string, body: any): Observable<Blob> {
    return this.http.post(`${this.baseUrl}${endpoint}`, body, {
      responseType: 'blob',
    });
  }

  getBlob(endpoint: string, params?: Record<string, any>): Observable<Blob> {
    let httpParams = new HttpParams();

    if (params) {
      Object.keys(params).forEach((key) => {
        if (
          params[key] !== null &&
          params[key] !== undefined &&
          params[key] !== ''
        ) {
          httpParams = httpParams.set(key, params[key].toString());
        }
      });
    }

    return this.http.get(`${this.baseUrl}${endpoint}`, {
      params: httpParams,
      responseType: 'blob',
    });
  }
}
