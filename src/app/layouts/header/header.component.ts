import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  /**
   * Get the count of invoices (placeholder for now)
   * In a real app, this would fetch from a service
   */
  getInvoiceCount(): number {
    // For now, return a placeholder number
    // In a real app, you would inject InvoiceService and get the actual count
    return 5; // Placeholder
  }

}
