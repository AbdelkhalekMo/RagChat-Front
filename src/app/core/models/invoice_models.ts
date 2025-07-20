
export enum InvoiceStatus {
  Draft = 0,
  Issued = 1,
  Paid = 2,
  Overdue = 3
}

export interface InvoiceDetailsDTO {
  id?: number;
  item: string;
  quantity: number;
  price: number;
}

export interface InvoiceDTO {
  id: number;
  invoiceNumber: string;
  date: Date;
  customerName: string;
  total: number;
  status: InvoiceStatus;
  paymentDate?: Date;
  invoiceDetails?: InvoiceDetailsDTO[];
}

export interface CreateInvoiceDTO {
  invoiceNumber: string;
  date: Date;
  customerName: string;
  total: number;
  status: InvoiceStatus;
  paymentDate?: Date;
  invoiceDetails?: InvoiceDetailsDTO[];
}

export interface UpdateInvoiceDTO {
  invoiceNumber?: string;
  date?: Date;
  customerName?: string;
  total?: number;
  status?: InvoiceStatus;
  paymentDate?: Date;
  invoiceDetails?: InvoiceDetailsDTO[];
}

// تعريف ApiResponse مع totalPages
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  totalPages: number;
}