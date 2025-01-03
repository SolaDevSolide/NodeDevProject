import {AfterViewInit, Component, ElementRef, Inject, OnInit, PLATFORM_ID, ViewChild} from '@angular/core';
import {isPlatformBrowser} from '@angular/common';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../../environments/environment'; // Or wherever your environment is
import * as d3 from 'd3';

interface Product {
  product_id: string;
  order_id: string;
  category: string;
  name: string;
  description: string;
  price: string;
}

interface JoinedOrder {
  order_id: string;
  address: string;
  date: string;
  status: string;
  products?: Product[];
}

@Component({
  selector: 'app-visualization-d3',
  imports: [],
  templateUrl: './visualization-d3.component.html',
  styleUrl: './visualization-d3.component.scss'
})
export class VisualizationD3Component implements OnInit, AfterViewInit {
  @ViewChild('chartContainer', {static: false}) chartContainer!: ElementRef;

  private apiUrl = environment.apiUrl;  // e.g. http://localhost:3000
  private data: JoinedOrder[] = [];
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    // Only fetch data if in the browser environment (avoid SSR issues)
    if (this.isBrowser) {
      this.fetchData();
    }
  }

  ngAfterViewInit(): void {
    // We'll create the chart after data is fetched
    // If data is already fetched by the time this runs, we can do it directly
    // or we can wait for the HTTP to finish.
  }

  private fetchData(): void {
    this.http.get<JoinedOrder[]>(`${this.apiUrl}/api/visualization/join`)
      .subscribe({
        next: (res) => {
          this.data = res;
          // Now that we have data, create the chart
          this.createChart();
        },
        error: (err) => {
          console.error('Failed to fetch joined data', err);
        }
      });
  }

  private createChart(): void {
    // Access the native element to append our D3 <svg>
    const element = this.chartContainer.nativeElement;
    const width = 700;
    const height = 400;
    const margin = {top: 20, right: 20, bottom: 40, left: 50};

    // Clear any existing chart (in case we refresh)
    d3.select(element).select('svg').remove();

    const svg = d3.select(element)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    // Transformable area for the chart to handle margins
    const chartArea = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Convert joined data -> an array of { order_id, productCount }
    const barData = this.data.map((o) => ({
      order_id: o.order_id,
      productCount: o.products?.length || 0
    }));

    // X-scale: band scale for order IDs
    const xScale = d3.scaleBand()
      .domain(barData.map((d: { order_id: string; productCount: number }) => d.order_id))
      .range([0, width - margin.left - margin.right])
      .padding(0.1);

    // Y-scale: linear scale from 0 to max productCount
    const yMax = d3.max(barData, (d: { productCount: any; }) => d.productCount) || 1;
    const yScale = d3.scaleLinear()
      .domain([0, yMax])
      .range([height - margin.top - margin.bottom, 0])
      .nice();

    // X-axis
    chartArea.append('g')
      .attr('transform', `translate(0, ${height - margin.top - margin.bottom})`)
      .call(d3.axisBottom(xScale));

    // Y-axis
    chartArea.append('g')
      .call(d3.axisLeft(yScale));

    // Bars
    chartArea.selectAll('.bar')
      .data(barData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d: { order_id: any; }) => xScale(d.order_id)!)
      .attr('y', (d: { productCount: any; }) => yScale(d.productCount))
      .attr('width', xScale.bandwidth())
      .attr('height', (d: { productCount: any; }) => (height - margin.top - margin.bottom) - yScale(d.productCount))
      .attr('fill', 'steelblue');

    // Optional: show productCount text on top of each bar
    chartArea.selectAll('.label')
      .data(barData)
      .enter()
      .append('text')
      .attr('x', (d: { order_id: any; }) => xScale(d.order_id)! + xScale.bandwidth() / 2)
      .attr('y', (d: { productCount: any; }) => yScale(d.productCount) - 5)
      .attr('text-anchor', 'middle')
      .text((d: { productCount: { toString: () => any; }; }) => d.productCount.toString())
      .style('font-size', '12px')
      .style('fill', '#333');
  }
}
