import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HttpClient} from '@angular/common/http';
import {MatCardModule} from '@angular/material/card';
import {MatTableModule} from '@angular/material/table';
import {MatButtonModule} from '@angular/material/button';
import {environment} from "../../environments/environment";

interface Order {
  order_id: string;
  address: string;
  date: string;
  status: string;
}

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
  products: Product[];
}

@Component({
  standalone: true,
  selector: 'app-data-page',
  templateUrl: './data-page.component.html',
  styleUrls: ['./data-page.component.scss'],
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
  ]
})
export class DataPageComponent implements OnInit {
  orders: Order[] = [];
  products: Product[] = [];
  joinedData: JoinedOrder[] = [];
  displayedOrderColumns = ['order_id', 'address', 'date', 'status'];
  displayedProductColumns = [
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
    this.fetchOrders();
    this.fetchProducts();
    this.fetchJoinedData();
  }

  fetchOrders() {
    this.http.get<Order[]>(`${this.apiUrl}/api/orders`).subscribe({
      next: (res) => {
        this.orders = res;
      },
      error: (err) => console.error('Error fetching orders', err)
    });
  }

  fetchProducts() {
    this.http.get<Product[]>(`${this.apiUrl}/api/products`).subscribe({
      next: (res) => {
        this.products = res;
      },
      error: (err) => console.error('Error fetching products', err)
    });
  }

  fetchJoinedData() {
    this.http.get<JoinedOrder[]>(`${this.apiUrl}/api/visualization/join`).subscribe({
      next: (res) => {
        this.joinedData = res;
      },
      error: (err) => console.error('Error fetching joined data', err)
    });
  }
}
