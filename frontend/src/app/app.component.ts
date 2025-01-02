import {Component} from '@angular/core';
import {CsvUploadComponent} from "./csv-upload/csv-upload.component";

@Component({
    selector: 'app-root',
  imports: [CsvUploadComponent],
    templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'frontend';
}
