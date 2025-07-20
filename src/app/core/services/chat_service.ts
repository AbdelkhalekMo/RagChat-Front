import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ChatResponse, UserMessageDto} from '../models/Chat_models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private apiUrl = environment.apiUrl;
  private endpoint = 'api/chat'; 

  constructor(private http: HttpClient) {}

  /**
   * Sends a message to the chat API
   * @param message The message content
   * @param language The language code (default: 'en')
   * @returns Observable of the chat response
   */
  sendMessage(message: string, language: string = 'en'): Observable<ChatResponse> {
    const userMessage: UserMessageDto = {
      message: message,
      language: language
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<ChatResponse>(`${this.apiUrl}/${this.endpoint}`, userMessage, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Handles HTTP errors
   * @param error The error object
   * @returns Observable that throws an error
   */
  private handleError(error: any): Observable<never> {
    let errorMessage = 'حدث خطأ غير معروف';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `خطأ في العميل: ${error.error.message}`;
    } else {
      // Server-side error
      switch (error.status) {
        case 400:
          errorMessage = 'بيانات غير صحيحة.';
          break;
        case 404:
          errorMessage = 'خدمة المحادثة غير متاحة.';
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