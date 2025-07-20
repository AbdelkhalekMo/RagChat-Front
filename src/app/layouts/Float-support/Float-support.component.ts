import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-float-support',
  templateUrl: './Float-support.component.html',
  styleUrls: ['./Float-support.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class FloatSupportComponent implements OnInit {
  isHovered = false;

  constructor(private router: Router) { }

  ngOnInit() {
  }

  onMouseEnter() {
    this.isHovered = true;
  }

  onMouseLeave() {
    this.isHovered = false;
  }

  navigateToChat() {
    this.router.navigate(['/chatbot']);
  }
}
