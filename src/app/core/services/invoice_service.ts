// services/invoice.service.ts

import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { ApiResponse, InvoiceDTO, CreateInvoiceDTO, UpdateInvoiceDTO } from '../models/invoice_models';
import { ApiService } from './api_service';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private endpoint = 'api/Invoice'; 

  constructor(private api: ApiService) {}

  getAllInvoices(pageNumber: number = 1, pageSize: number = 10): Observable<ApiResponse<InvoiceDTO[]>> {
    return this.api.get<ApiResponse<InvoiceDTO[]>>(`${this.endpoint}/all?pageNumber=${pageNumber}&pageSize=${pageSize}`).pipe(
      catchError(this.handleError)
    );
  }

  getInvoiceById(id: number): Observable<InvoiceDTO> {
    return this.api.get<InvoiceDTO>(`${this.endpoint}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  getInvoiceByNumber(invoiceNumber: string): Observable<InvoiceDTO> {
    return this.api.get<InvoiceDTO>(`${this.endpoint}/by-number/${invoiceNumber}`).pipe(
      catchError(this.handleError)
    );
  }

  createInvoice(invoice: CreateInvoiceDTO): Observable<InvoiceDTO> {
    return this.api.post<InvoiceDTO>(this.endpoint, invoice).pipe(
      catchError(this.handleError)
    );
  }

  updateInvoice(id: number, invoice: UpdateInvoiceDTO): Observable<InvoiceDTO> {
    return this.api.put<InvoiceDTO>(`${this.endpoint}/${id}`, invoice).pipe(
      catchError(this.handleError)
    );
  }

  deleteInvoice(id: number): Observable<void> {
    return this.api.delete<void>(`${this.endpoint}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'حدث خطأ غير معروف';

    if (error.error instanceof ErrorEvent) {
      // خطأ من المتصفح
      errorMessage = `خطأ في العميل: ${error.error.message}`;
    } else {
      // خطأ من الخادم
      switch (error.status) {
        case 400:
          errorMessage = 'بيانات غير صحيحة.';
          break;
        case 404:
          errorMessage = 'العنصر غير موجود.';
          break;
        case 500:
          errorMessage = 'خطأ في الخادم، حاول لاحقًا.';
          break;
        default:
          errorMessage = `خطأ غير معروف - الرمز: ${error.status}`;
      }
    }
    return throwError(() => new Error(errorMessage));
  }
}