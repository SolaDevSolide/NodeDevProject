import {Component, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {CommonModule} from '@angular/common';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatTableModule} from '@angular/material/table';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatButtonModule} from '@angular/material/button';
import {FormsModule} from '@angular/forms';
import {MatCard} from "@angular/material/card";
import {environment} from "../../../environments/environment";

/** Order interface from /api/orders */
interface Order {
  order_id: string;
  address: string;
  date: string;
  status: string;
}

/** Product interface from /api/products  */
interface Product {
  product_id: string;
  order_id: string;
  category: string;
  name: string;
  description: string;
  price: string;
}

/** Joined interface from /api/visualization/join */
interface JoinedOrder {
  order_id: string;
  address: string;
  date: string;
  status: string;
  products: Product[];
}

@Component({
  standalone: true,
  selector: 'app-visualization-table',
  templateUrl: './visualization-table.component.html',
  styleUrls: ['./visualization-table.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTableModule,
    MatExpansionModule,
    MatButtonModule,
    MatCard
  ]
})
export class VisualizationTableComponent implements OnInit {
  /** Current selection for the view: "orders", "products", or "join" */
  selectedView: 'orders' | 'products' | 'join' = 'orders';
  /** Arrays to store fetched data */
  orders: Order[] = [];
  products: Product[] = [];
  joined: JoinedOrder[] = [];
  /** Columns to display for orders */
  orderColumns = ['order_id', 'address', 'date', 'status'];
  /** Columns to display for products */
  productColumns = [
    'product_id',
    'order_id',
    'category',
    'name',
    'description',
    'price'
  ];
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {
  }

  ngOnInit(): void {
    // Default to "orders"
    this.fetchOrders();
  }

  /** Called whenever the user changes the select dropdown */
  onViewChange(view: 'orders' | 'products' | 'join'): void {
    this.selectedView = view;
    switch (view) {
      case 'orders':
        this.fetchOrders();
        break;
      case 'products':
        this.fetchProducts();
        break;
      case 'join':
        this.fetchJoined();
        break;
    }
  }

  private fetchOrders(): void {
    this.http.get<Order[]>(`${this.apiUrl}/api/orders`).subscribe({
      next: (data) => {
        this.orders = data;
        // Clear out the others so old data doesn't linger
        this.products = [];
        this.joined = [];
      },
      error: (err) => console.error('Failed to fetch orders', err)
    });
  }

  private fetchProducts(): void {
    this.http.get<Product[]>(`${this.apiUrl}/api/products`).subscribe({
      next: (data) => {
        this.products = data;
        // Clear out the others so old data doesn't linger
        this.orders = [];
        this.joined = [];
      },
      error: (err) => console.error('Failed to fetch products', err)
    });
  }

  private fetchJoined(): void {
    this.http.get<JoinedOrder[]>(`${this.apiUrl}/api/visualization/join`).subscribe({
      next: (data) => {
        this.joined = data;
        // Clear out the others
        this.orders = [];
        this.products = [];
      },
      error: (err) => console.error('Failed to fetch joined data', err)
    });
  }
}
