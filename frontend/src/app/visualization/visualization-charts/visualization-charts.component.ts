import {Component, Inject, OnInit, PLATFORM_ID, ViewChild} from '@angular/core';
import {HttpClient} from '@angular/common/http';
// Import & register needed chart components
import {
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  ChartConfiguration,
  ChartOptions,
  Legend,
  LinearScale,
  Title,
  Tooltip
} from 'chart.js';
import {CommonModule, isPlatformBrowser} from '@angular/common';
import {BaseChartDirective} from 'ng2-charts';
import {environment} from "../../../environments/environment";

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);


@Component({
  selector: 'app-visualization-charts',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './visualization-charts.component.html',
  styleUrls: ['./visualization-charts.component.scss']
})
export class VisualizationChartsComponent implements OnInit {
  // Flag indicating if we are in browser context
  isBrowser: boolean;
  barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      {
        label: 'Number of Products per Order',
        data: [],
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };
  barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
      },
    },
  };
  @ViewChild(BaseChartDirective) chart!: BaseChartDirective;
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Determine if running in browser or server
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    // Only fetch data if browser
    if (this.isBrowser) {
      this.fetchData();
    }
  }

  fetchData(): void {
    this.http.get<any[]>(`${this.apiUrl}/api/visualization/join`).subscribe({
      next: (data) => {
        console.log(data)
        this.processData(data);
      },
      error: (err) => console.error('Failed to fetch data', err),
    });
  }

  processData(data: any[]): void {
    const labels: string[] = [];
    const productCounts: number[] = [];

    data.forEach((order) => {
      labels.push(`Order ${order.order_id}`);
      productCounts.push(order.products.length);
    });

    this.barChartData.labels = labels;
    this.barChartData.datasets[0].data = productCounts;

    // Force the chart to re-render
    if (this.chart) {
      this.chart.update();
    }
  }
}
