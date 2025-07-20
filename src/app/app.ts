import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './layouts/header/header.component';
import { FloatSupportComponent } from './layouts/Float-support/Float-support.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FloatSupportComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Front-Chatbot');
}
