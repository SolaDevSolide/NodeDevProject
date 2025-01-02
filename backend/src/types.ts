export enum TableType {
    Orders = 'orders',
    Products = 'products',
    Unknown = 'unknown',
}

export interface ValidationResult {
    originalName: string;
    filename: string;
    tableType: TableType;
}

export interface FileTableMap {
    filename: string;
    tableType: TableType;
}

export interface CSVRow {
    [key: string]: unknown;
}

export interface OrderRow extends CSVRow {
    order_id: string;
    address: string;
    date: string;
    status: string;
}

export function isOrderRow(row: CSVRow | null): row is OrderRow {
    return (
        row !== null &&
        typeof row.order_id === 'string' &&
        typeof row.address === 'string' &&
        typeof row.date === 'string' &&
        typeof row.status === 'string'
    );
}

export interface ProductRow extends CSVRow {
    product_id: string;
    order_id: string;
    category: string;
    name: string;
    description: string;
    price: string;
}

// Type guard for ProductRow
export function isProductRow(row: CSVRow | null): row is ProductRow {
    return (
        row !== null &&
        typeof row.product_id === 'string' &&
        typeof row.order_id === 'string' &&
        typeof row.category === 'string' &&
        typeof row.name === 'string' &&
        typeof row.description === 'string' &&
        typeof row.price === 'string'
    );
}