import {Component} from '@angular/core';
import {RouterLink, RouterOutlet} from "@angular/router";
import {MatCard} from "@angular/material/card";
import {MatButton} from "@angular/material/button";

@Component({
    selector: 'app-root',
  imports: [RouterOutlet, MatCard, MatButton, RouterLink],
    templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'frontend';
}
