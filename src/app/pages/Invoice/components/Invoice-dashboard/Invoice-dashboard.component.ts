import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiResponse, InvoiceDTO, InvoiceStatus, UpdateInvoiceDTO } from '../../../../core/models/invoice_models';
import { InvoiceService } from '../../../../core/services/invoice_service';

@Component({
  selector: 'app-invoices-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './Invoice-dashboard.component.html',
  styleUrls: ['./Invoice-dashboard.component.css']
})
export class InvoicesDashboardComponent implements OnInit {
  private invoiceService = inject(InvoiceService);
  
  // Data properties
  invoices: InvoiceDTO[] = [];
  filteredInvoices: InvoiceDTO[] = [];
  selectedInvoice: InvoiceDTO | null = null;
  editingInvoice: InvoiceDTO | null = null;
  
  // State properties
  loading = false;
  updating = false;
  deletingInvoiceId: number | null = null;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  
  // Filter and Pagination properties
  searchTerm = '';
  selectedStatus = '';
  sortBy = 'date';
  sortOrder = 'desc';
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  
  // Edit form
  editForm: UpdateInvoiceDTO = {};
  
  // Enum reference for template
  readonly InvoiceStatus = InvoiceStatus;

  ngOnInit(): void {
    this.loadInvoices();
  }

  loadInvoices(): void {
    this.loading = true;
    this.errorMessage = null;
    
    this.invoiceService.getAllInvoices(this.currentPage, this.pageSize).subscribe({
      next: (response: ApiResponse<InvoiceDTO[]>) => {
        this.invoices = response.data || [];
        this.totalPages = response.totalPages || 1;
        
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        if (error.status === 0) {
          this.errorMessage = 'لا يمكن الاتصال بالخادم. تأكد من تشغيل الخادم على المنفذ 5071';
        } else if (error.status === 404) {
          this.errorMessage = 'نقطة النهاية غير موجودة';
        } else if (error.status === 500) {
          this.errorMessage = 'خطأ في الخادم، حاول لاحقاً';
        } else {
          this.errorMessage = error.message || 'حدث خطأ أثناء جلب البيانات';
        }
        
        // Show empty state instead of mock data
        this.invoices = [];
        this.applyFilters();
        this.loading = false;
      }
    });
  }



  applyFilters(): void {
    let filtered = [...this.invoices];
    
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(invoice =>
        invoice.invoiceNumber.toLowerCase().includes(term) ||
        invoice.customerName.toLowerCase().includes(term)
      );
    }
    
    if (this.selectedStatus !== '') {
      const status = parseInt(this.selectedStatus);
      filtered = filtered.filter(invoice => invoice.status === status);
    }
    
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;
      
      switch (this.sortBy) {
        case 'date':
          aValue = new Date(a.date);
          bValue = new Date(b.date);
          break;
        case 'total':
          aValue = a.total;
          bValue = b.total;
          break;
        case 'customer':
          aValue = a.customerName.toLowerCase();
          bValue = b.customerName.toLowerCase();
          break;
        case 'invoiceNumber':
          aValue = a.invoiceNumber.toLowerCase();
          bValue = b.invoiceNumber.toLowerCase();
          break;
        default:
          aValue = a.date;
          bValue = b.date;
      }
      
      if (aValue < bValue) return this.sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    
    this.filteredInvoices = filtered;
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.sortBy = 'date';
    this.sortOrder = 'desc';
    this.applyFilters();
  }

  // Pagination methods
  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadInvoices();
    }
  }

  // Retry loading data
  retryLoadData(): void {
    this.errorMessage = null;
    this.loadInvoices();
  }

  getPages(): number[] {
    const pages = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  // Statistics methods
  getPaidInvoicesCount(): number {
    return this.invoices.filter(inv => inv.status === InvoiceStatus.Paid).length;
  }

  getSentInvoicesCount(): number {
    return this.invoices.filter(inv => inv.status === InvoiceStatus.Issued).length;
  }

  getTotalAmount(): number {
    return this.invoices.reduce((sum, inv) => sum + inv.total, 0);
  }

  // View invoice details
  viewInvoiceDetails(invoice: InvoiceDTO): void {
    this.selectedInvoice = invoice;
    this.showModal('invoiceDetailsModal');
  }

  closeDetailsModal(): void {
    this.selectedInvoice = null;
    this.hideModal('invoiceDetailsModal');
  }

  // Edit invoice
  editInvoice(invoice: InvoiceDTO): void {
    this.editingInvoice = invoice;
    this.editForm = {
      invoiceNumber: invoice.invoiceNumber,
      customerName: invoice.customerName,
      date: new Date(invoice.date),
      total: invoice.total,
      status: invoice.status,
      paymentDate: invoice.paymentDate ? new Date(invoice.paymentDate) : undefined,
      invoiceDetails: invoice.invoiceDetails?.map(d => ({ ...d })) || []
    };
    this.showModal('editInvoiceModal');
  }

  updateInvoice(): void {
    if (!this.editingInvoice) {
      this.errorMessage = 'لا توجد فاتورة للتعديل';
      return;
    }
    
    this.updating = true;
    this.errorMessage = null;
    
    this.invoiceService.updateInvoice(this.editingInvoice.id, this.editForm).subscribe({
      next: (updatedInvoice) => {
        this.loadInvoices();
        
        this.successMessage = 'تم تحديث الفاتورة بنجاح';
        this.closeEditModal();
        this.updating = false;
      },
      error: (error) => {
        if (error.status === 404) {
          this.errorMessage = 'الفاتورة غير موجودة أو تم حذفها';
        } else if (error.status === 400) {
          this.errorMessage = 'بيانات الفاتورة غير صحيحة';
        } else if (error.status === 0) {
          this.errorMessage = 'لا يمكن الاتصال بالخادم. تأكد من تشغيل الخادم';
        } else {
          this.errorMessage = error.message || 'فشل في تحديث الفاتورة';
        }
        this.updating = false;
      }
    });
  }

  closeEditModal(): void {
    this.editingInvoice = null;
    this.editForm = {};
    this.hideModal('editInvoiceModal');
  }

  // Delete invoice
  deleteInvoice(invoice: InvoiceDTO): void {
    const confirmMessage = `هل أنت متأكد من حذف الفاتورة "${invoice.invoiceNumber}"؟\n\nهذا الإجراء لا يمكن التراجع عنه.`;
    if (!confirm(confirmMessage)) {
      return;
    }
    
    this.deletingInvoiceId = invoice.id || 0;
    this.errorMessage = null;
    
    this.invoiceService.deleteInvoice(invoice.id).subscribe({
      next: () => {
        this.loadInvoices();
        
        this.successMessage = 'تم حذف الفاتورة بنجاح';
        this.deletingInvoiceId = null;
      },
      error: (error) => {
        if (error.status === 404) {
          this.errorMessage = 'الفاتورة غير موجودة أو تم حذفها مسبقاً';
        } else if (error.status === 403) {
          this.errorMessage = 'ليس لديك صلاحية لحذف هذه الفاتورة';
        } else if (error.status === 0) {
          this.errorMessage = 'لا يمكن الاتصال بالخادم. تأكد من تشغيل الخادم';
        } else {
          this.errorMessage = error.message || 'فشل في حذف الفاتورة';
        }
        this.deletingInvoiceId = null;
      }
    });
  }

  // Utility methods
  getStatusText(status: InvoiceStatus): string {
    switch (status) {
      case InvoiceStatus.Draft: return 'مسودة';
      case InvoiceStatus.Issued: return 'مرسلة';
      case InvoiceStatus.Paid: return 'مدفوعة';
      case InvoiceStatus.Overdue: return 'متأخرة';
      default: return 'غير محدد';
    }
  }

  getStatusBadgeClass(status: InvoiceStatus): string {
    switch (status) {
      case InvoiceStatus.Draft: return 'badge bg-secondary';
      case InvoiceStatus.Issued: return 'badge bg-warning';
      case InvoiceStatus.Paid: return 'badge bg-success';
      case InvoiceStatus.Overdue: return 'badge bg-danger';
      default: return 'badge bg-light text-dark';
    }
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return '-';
    
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) return '-';
      
      return dateObj.toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return '-';
    }
  }

  trackByInvoice(index: number, invoice: InvoiceDTO): number {
    return invoice.id;
  }

  // Modal helper methods
  private showModal(modalId: string): void {
    setTimeout(() => {
      const modalElement = document.getElementById(modalId);
      if (modalElement) {
        if (typeof (window as any).bootstrap !== 'undefined' && (window as any).bootstrap.Modal) {
          const modal = new (window as any).bootstrap.Modal(modalElement);
          modal.show();
        } else {
          modalElement.style.display = 'block';
          modalElement.classList.add('show');
          document.body.classList.add('modal-open');
          
          const backdrop = document.createElement('div');
          backdrop.className = 'modal-backdrop fade show';
          backdrop.id = 'modalBackdrop';
          document.body.appendChild(backdrop);
        }
      }
    }, 100);
  }

  private hideModal(modalId: string): void {
    const modalElement = document.getElementById(modalId);
    if (modalElement) {
      if (typeof (window as any).bootstrap !== 'undefined' && (window as any).bootstrap.Modal) {
        const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
        if (modal) {
          modal.hide();
        }
      } else {
        modalElement.style.display = 'none';
        modalElement.classList.remove('show');
        document.body.classList.remove('modal-open');
        
        const backdrop = document.getElementById('modalBackdrop');
        if (backdrop) {
          backdrop.remove();
        }
      }
    }
  }
}