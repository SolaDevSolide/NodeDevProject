import {Component} from '@angular/core';
import {MatToolbar} from "@angular/material/toolbar";
import {MatButton} from "@angular/material/button";
import {RouterLink, RouterOutlet} from "@angular/router";

@Component({
  selector: 'app-visualization-layout',
  imports: [
    MatToolbar,
    MatButton,
    RouterLink,
    RouterOutlet
  ],
  templateUrl: './visualization-layout.component.html',
  styleUrl: './visualization-layout.component.scss'
})
export class VisualizationLayoutComponent {

}
