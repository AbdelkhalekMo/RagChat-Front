import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-Not-found',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './Not-found.component.html',
  styleUrls: ['./Not-found.component.css']
})
export class NotFoundComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
