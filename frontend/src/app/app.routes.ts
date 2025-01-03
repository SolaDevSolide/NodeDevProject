import {Routes} from '@angular/router';
import {MainPageComponent} from "./main-page/main-page.component";
import {CsvUploadComponent} from "./csv-upload/csv-upload.component";
import {VisualizationLayoutComponent} from "./visualization/visualization-layout/visualization-layout.component";
import {VisualizationChartsComponent} from "./visualization/visualization-charts/visualization-charts.component";
import {VisualizationTableComponent} from "./visualization/visualization-table/visualization-table.component";
import {VisualizationD3Component} from "./visualization/visualization-d3/visualization-d3.component";

export const routes: Routes = [
  {path: 'home', component: MainPageComponent},         // Landing/Home
  {
    path: 'visualization',
    component: VisualizationLayoutComponent,
    children: [
      {path: 'charts', component: VisualizationChartsComponent},
      {path: 'table', component: VisualizationTableComponent},
      {path: 'd3', component: VisualizationD3Component},
      {path: '', redirectTo: 'charts', pathMatch: 'full'},
    ]
  },
  {path: 'upload', component: CsvUploadComponent},
  {path: "", redirectTo: "home", pathMatch: "full"}
  // Add more pages as needed for new features (･ω･)b
];
