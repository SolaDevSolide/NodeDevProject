import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HttpClient} from '@angular/common/http';
import {FormsModule} from '@angular/forms';

// Angular Material
import {MatCardModule} from '@angular/material/card';
import {MatListModule} from '@angular/material/list';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {environment} from "../../environments/environment";

interface UploadedFile {
  file: File;
  filename?: string;  // assigned by backend if you do a validation call
  recognized?: boolean; // e.g. if backend says it's recognized
  tableType?: 'orders' | 'products' | 'unknown';
}

@Component({
  standalone: true,
  selector: 'app-csv-upload',
  templateUrl: './csv-upload.component.html',
  styleUrls: ['./csv-upload.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatListModule,
    MatIconModule,
    MatButtonModule
  ]
})
export class CsvUploadComponent implements OnInit {
  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;

  uploadedFiles: UploadedFile[] = [];
  isDragging: boolean = false;
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {
  }

  ngOnInit(): void {
  }

  /**
   * DRAG & DROP handlers
   */
  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        this.uploadedFiles.push({file: files[i]});
      }
    }
  }

  onDragEnter(event: DragEvent) {
    event.preventDefault();
    this.isDragging = true;  // Enable the "drag-over" class
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false; // Disable the "drag-over" class
  }


  /**
   * Trigger file browse
   */
  browseFiles() {
    if (this.fileInputRef) {
      this.fileInputRef.nativeElement.click();
    }
  }

  /**
   * File input change
   */
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    for (let i = 0; i < input.files.length; i++) {
      this.uploadedFiles.push({file: input.files[i]});
    }
    // Clear input so user can select same file again if needed
    input.value = '';
  }

  /**
   * Remove a file from the list
   */
  removeFile(index: number) {
    this.uploadedFiles.splice(index, 1);
  }

  /**
   * Validate files with the backend
   * Calls /api/upload/validate
   */
  validateFiles() {
    if (this.uploadedFiles.length === 0) return;

    const formData = new FormData();
    this.uploadedFiles.forEach(f => formData.append('files', f.file));

    this.http.post<any>(`${this.apiUrl}/api/upload/validate`, formData)
      .subscribe({
        next: (res) => {
          const results = res.results || [];
          // Match up each file by originalName => recognized or unknown
          this.uploadedFiles.forEach(uf => {
            const match = results.find((r: any) => r.originalName === uf.file.name);
            if (match) {
              uf.filename = match.filename;
              uf.tableType = match.tableType;
              uf.recognized = match.tableType !== 'unknown';
            } else {
              uf.recognized = false;
            }
          });
        },
        error: (err) => {
          console.error('Validation error', err);
        }
      });
  }

  /**
   * Final Insert
   * Calls /api/upload/insert
   */
  uploadToBackend() {
    if (this.uploadedFiles.length === 0) return;

    // Only send recognized files, ignoring unknown if you like
    const recognizedFiles = this.uploadedFiles.filter(f => f.tableType !== 'unknown');
    if (recognizedFiles.length === 0) {
      alert('No recognized CSV files to insert.');
      return;
    }

    const formData = new FormData();

    // Build a "filesTableMap" for each recognized file
    const filesTableMap: any[] = [];
    recognizedFiles.forEach(uf => {
      formData.append('files', uf.file);
      filesTableMap.push({
        filename: uf.filename,       // assigned by backend if you want
        tableType: uf.tableType
      });
    });

    formData.append('filesTableMap', JSON.stringify(filesTableMap));

    this.http.post<any>(`${this.apiUrl}/api/upload/insert`, formData)
      .subscribe({
        next: (res) => {
          console.log('Insert successful:', res);
          alert('CSV data inserted successfully!');
        },
        error: (err) => {
          console.error('Insert error', err);
        }
      });
  }
}
