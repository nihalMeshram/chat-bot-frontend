import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [CommonModule, FormsModule],
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
})
export class Home {

  inputText = '';
  responseText = '';

  constructor() { }

  async onSubmit() {
    if (!this.inputText.trim()) return;
    // Placeholder response logic
    this.responseText = `🤖 You asked: "${this.inputText}"\n(Answer will be generated here...)`;
    this.inputText = '';
  }

  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.onSubmit();
    }
  }
}
