import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { InvoiceService } from '../../../../core/services/invoice_service';
import { CreateInvoiceDTO, InvoiceStatus } from '../../../../core/models/invoice_models';

@Component({
  selector: 'app-invoice-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './Invoice-form.component.html',
  styleUrls: ['./Invoice-form.component.css']
})

export class InvoiceFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private invoiceService = inject(InvoiceService);

  invoiceForm!: FormGroup;
  isSubmitting = false;
  totalAmount = 0;

  ngOnInit() {
    this.initializeForm();
    this.calculateTotal();
  }

  initializeForm() {
    this.invoiceForm = this.fb.group({
      invoiceNumber: ['', Validators.required],
      date: ['', Validators.required],
      customerName: ['', Validators.required],
      status: ['', Validators.required],
      paymentDate: [''],
      details: this.fb.array([this.createDetailGroup()])
    });
  }

  createDetailGroup() {
    return this.fb.group({
      item: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      price: [0, [Validators.required, Validators.min(0)]]
    });
  }

  get detailsArray() {
    return this.invoiceForm.get('details') as FormArray;
  }

  addDetail() {
    this.detailsArray.push(this.createDetailGroup());
  }

  removeDetail(index: number) {
    if (this.detailsArray.length > 1) {
      this.detailsArray.removeAt(index);
      this.calculateTotal();
    }
  }

  calculateTotal() {
    this.totalAmount = this.detailsArray.controls.reduce((total, control) => {
      const quantity = control.get('quantity')?.value || 0;
      const price = control.get('price')?.value || 0;
      return total + (quantity * price);
    }, 0);
  }

  onSubmit() {
    if (this.invoiceForm.valid) {
      this.isSubmitting = true;
      
      const formValue = this.invoiceForm.value;
      const invoiceData: CreateInvoiceDTO = {
        invoiceNumber: formValue.invoiceNumber,
        date: new Date(formValue.date),
        customerName: formValue.customerName,
        total: this.totalAmount,
        status: InvoiceStatus[formValue.status as keyof typeof InvoiceStatus], 
        paymentDate: formValue.paymentDate ? new Date(formValue.paymentDate) : undefined,
        invoiceDetails: formValue.details 
      };

      this.invoiceService.createInvoice(invoiceData).subscribe({
        next: (response) => {
          alert('تم إنشاء الفاتورة بنجاح');
          this.router.navigate(['/invoices']);
        },
        error: (error) => {
          alert('حدث خطأ: ' + error.message);
          this.isSubmitting = false;
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/invoices']);
  }
}