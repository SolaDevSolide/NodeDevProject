import {Routes} from '@angular/router';
import {MainPageComponent} from "./main-page/main-page.component";
import {DataPageComponent} from "./data-page/data-page.component";
import {CsvUploadComponent} from "./csv-upload/csv-upload.component";

export const routes: Routes = [
  {path: 'home', component: MainPageComponent},         // Landing/Home
  {path: 'visualization', component: DataPageComponent},
  {path: 'upload', component: CsvUploadComponent},
  {path: "", redirectTo: "home", pathMatch: "full"}
  // Add more pages as needed for new features (･ω･)b
];
