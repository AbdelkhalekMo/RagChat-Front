import { Component, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../../../core/services/chat_service';
import { ChatMessage } from '../../../../core/models/Chat_models';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [ChatService],
  templateUrl: './Chatbot.component.html',
  styleUrls: ['./Chatbot.component.css']
})
export class ChatComponent implements AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  @ViewChild('messageInput') private messageInput!: ElementRef;

  messages: ChatMessage[] = [];
  currentMessage: string = '';
  isLoading: boolean = false;
  selectedLanguage: string = 'en';
  


  private shouldScrollToBottom = false;

  constructor(private chatService: ChatService) {
    // Detect browser language
    const browserLang = navigator.language || 'en';
    this.selectedLanguage = browserLang.startsWith('ar') ? 'ar' : 'en';
  }

  ngAfterViewChecked() {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  setLanguage(language: string) {
    this.selectedLanguage = language;
    if (this.messageInput) {
      this.messageInput.nativeElement.focus();
    }
  }

  /**
   * Automatically detects the language of the input text
   */
  private detectLanguage(text: string): string {
    if (!text || text.trim().length === 0) {
      return this.selectedLanguage;
    }

    const cleanText = text.trim().toLowerCase();

    // Arabic detection patterns
    const arabicPatterns = [
      // Arabic keywords from your backend
      /\b(اجمالي|مجموع|قيمة|سعر|عدد|كم|متأخرة|متأخر|غير مدفوعة|لم تدفع بعد|متدفعتش|ملخص)\b/g,
      /\b(تتعدى|اكبر|أكبر|اكبر من|أكبر من|أقل|اقل|أقل من|اقل من)\b/g,
      /\b(عميل|زبون|شهر|شهور|شهرية|أيام|آخر|النهارده|اليوم|يوم)\b/g,
      /\b(فاتورة|فواتير|الفواتير|العميل|الشهر|هذا الشهر|الأسبوع الماضي)\b/g,
      // Arabic letters detection
      /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/g
    ];

    // English keywords from your backend
    const englishPatterns = [
      /\b(total|sum|value|amount|count|how many|overdue|unpaid|summary)\b/gi,
      /\b(greater|above|more than|less|below|under|customer|month|latest|last|day|days|today)\b/gi,
      /\b(invoice|invoices|this month|last week)\b/gi
    ];

    // Count Arabic matches
    let arabicMatches = 0;
    arabicPatterns.forEach(pattern => {
      const matches = cleanText.match(pattern);
      if (matches) {
        arabicMatches += matches.length;
      }
    });

    // Count English matches
    let englishMatches = 0;
    englishPatterns.forEach(pattern => {
      const matches = cleanText.match(pattern);
      if (matches) {
        englishMatches += matches.length;
      }
    });

    // Additional detection: Arabic script vs Latin script
    const arabicChars = (cleanText.match(/[\u0600-\u06FF]/g) || []).length;
    const latinChars = (cleanText.match(/[a-zA-Z]/g) || []).length;

    // Decision logic
    if (arabicMatches > englishMatches || arabicChars > latinChars) {
      return 'ar';
    } else if (englishMatches > arabicMatches || latinChars > arabicChars) {
      return 'en';
    }

    // If no clear detection, check for Arabic characters presence
    if (arabicChars > 0) {
      return 'ar';
    }

    // Fallback to current selected language
    return this.selectedLanguage;
  }

  /**
   * Updates UI language based on detected language
   */
  private updateUILanguage(detectedLanguage: string) {
    if (this.selectedLanguage !== detectedLanguage) {
      this.selectedLanguage = detectedLanguage;
      
      // Optional: Show a subtle notification about language detection
      console.log(`Language automatically detected: ${detectedLanguage === 'ar' ? 'Arabic' : 'English'}`);
    }
  }

  sendMessage() {
    const message = this.currentMessage.trim();
    if (!message || this.isLoading) return;

    // Automatically detect language from the message
    const detectedLanguage = this.detectLanguage(message);
    
    // Update UI language if different
    this.updateUILanguage(detectedLanguage);

    // Add user message
    const userMessage: ChatMessage = {
      id: this.generateId(),
      content: message,
      isUser: true,
      timestamp: new Date(),
      language: detectedLanguage
    };

    this.messages.push(userMessage);
    this.currentMessage = '';
    this.isLoading = true;
    this.shouldScrollToBottom = true;

    // Send to service with detected language
    this.chatService.sendMessage(message, detectedLanguage).subscribe({
      next: (response) => {
        const botMessage: ChatMessage = {
          id: this.generateId(),
          content: response.response,
          isUser: false,
          timestamp: new Date(),
          language: detectedLanguage
        };

        this.messages.push(botMessage);
        this.isLoading = false;
        this.shouldScrollToBottom = true;
        
        // Focus back to input
        setTimeout(() => {
          if (this.messageInput) {
            this.messageInput.nativeElement.focus();
          }
        }, 100);
      },
      error: (error) => {
        console.error('Chat error:', error);
        const errorMessage: ChatMessage = {
          id: this.generateId(),
          content: detectedLanguage === 'ar' 
            ? 'عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.'
            : 'Sorry, an error occurred. Please try again.',
          isUser: false,
          timestamp: new Date(),
          language: detectedLanguage
        };

        this.messages.push(errorMessage);
        this.isLoading = false;
        this.shouldScrollToBottom = true;
      }
    });
  }



  /**
   * Real-time language detection as user types (optional enhancement)
   */
  onInputChange() {
    if (this.currentMessage && this.currentMessage.trim().length > 3) {
      const detectedLanguage = this.detectLanguage(this.currentMessage);
      this.updateUILanguage(detectedLanguage);
    }
  }

  trackByMessageId(index: number, message: ChatMessage): string {
    return message.id;
  }

  private scrollToBottom() {
    try {
      if (this.messagesContainer) {
        const element = this.messagesContainer.nativeElement;
        element.scrollTop = element.scrollHeight;
      }
    } catch (err) {
      console.warn('Could not scroll to bottom:', err);
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}