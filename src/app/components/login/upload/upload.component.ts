import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpEventType, HttpHeaders } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { catchError, finalize, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { AuthService } from '../../../services/auth.service';

interface UploadStatus {
  id: string;
  filename: string;
  status: string;
  progress: number;
  message?: string;
  timestamp: Date;
}

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressBarModule
  ],
  templateUrl: './upload.component.html',
  styleUrl: './upload.component.scss'
})
export class UploadComponent implements OnInit, OnDestroy {
  uploadForm!: FormGroup;
  selectedFiles: File[] = [];
  isDragging = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  uploading = false;
  uploadProgress = 0;
  currentUploadIds: string[] = [];
  uploadHistory: UploadStatus[] = [];
  statusCheckInterval: any;
  pollingActive = false;
  
  readonly API_URL = 'http://localhost:8081/api/data';
  readonly ALLOWED_TYPES = ['.rdf', '.ttl', '.gz'];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.uploadForm = this.fb.group({
      files: ['', Validators.required]
    });
    
    const history = localStorage.getItem('uploadHistory');
    if (history) {
      try {
        this.uploadHistory = JSON.parse(history);
        // Check status of all previous uploads that were still processing
        this.checkAllUploadsStatus();
      } catch (e) {
        console.error('Error parsing upload history', e);
        localStorage.removeItem('uploadHistory');
        this.uploadHistory = [];
      }
    }
  }

  get isMultipleMode(): boolean {
    return this.selectedFiles.length > 1;
  }

  onFileSelected(event: Event): void {
    const element = event.target as HTMLInputElement;
    if (element.files && element.files.length > 0) {
      // Handle any number of files
      const newFiles = Array.from(element.files);
      this.selectedFiles = newFiles;
      this.validateFiles();
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      // Handle any number of files
      const newFiles = Array.from(event.dataTransfer.files);
      this.selectedFiles = newFiles;
      this.validateFiles();
    }
  }

  validateFiles(): void {
    this.errorMessage = null;
    
    const invalidFiles: string[] = [];
    
    this.selectedFiles.forEach(file => {
      const fileName = file.name.toLowerCase();
      const isValid = this.ALLOWED_TYPES.some(ext => fileName.endsWith(ext));
      
      if (!isValid) {
        invalidFiles.push(file.name);
      }
    });
    
    if (invalidFiles.length > 0) {
      this.errorMessage = `Invalid files: ${invalidFiles.join(', ')}. Please select only ${this.ALLOWED_TYPES.join(', ')} files.`;
      this.selectedFiles = this.selectedFiles.filter(file => {
        const fileName = file.name.toLowerCase();
        return this.ALLOWED_TYPES.some(ext => fileName.endsWith(ext));
      });
    }
  }

  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
    if (this.selectedFiles.length === 0) {
      this.errorMessage = null;
    }
  }

  onSubmit(): void {
    if (this.selectedFiles.length === 0) {
      this.errorMessage = 'Please select at least one file';
      return;
    }

    // Check if any of the files are already being processed
    const fileNames = this.selectedFiles.map(file => file.name);
    const processingFiles = this.uploadHistory.filter(upload => 
      upload.status === 'processing' && fileNames.includes(upload.filename)
    );

    if (processingFiles.length > 0) {
      this.errorMessage = `The following file(s) are already being processed: ${processingFiles.map(f => f.filename).join(', ')}`;
      return;
    }

    this.errorMessage = null;
    this.successMessage = null;
    this.uploading = true;
    this.uploadProgress = 0;
    this.currentUploadIds = [];

    const formData = new FormData();
    
    const user = this.authService.currentUserValue;
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${user?.token}`
    });

    if (this.selectedFiles.length > 1) {
      // Multiple files upload
      this.selectedFiles.forEach(file => {
        formData.append('files', file);
      });
      
      this.http.post(`${this.API_URL}/upload-multiple`, formData, {
        headers,
        reportProgress: true,
        observe: 'events'
      })
      .pipe(
        map(event => {
          if (event.type === HttpEventType.UploadProgress && event.total) {
            this.uploadProgress = Math.round(100 * event.loaded / event.total);
          } else if (event.type === HttpEventType.Response) {
            return event.body;
          }
          return null;
        }),
        catchError(error => {
          this.errorMessage = error.error?.message || 'Error uploading files';
          this.uploading = false;
          return of(null);
        }),
        finalize(() => {})
      )
      .subscribe(response => {
        if (response) {
          const data: any = response;
          this.successMessage = data.message || 'Files uploaded successfully';
          
          if (data.uploadIds && Array.isArray(data.uploadIds)) {
            this.currentUploadIds = data.uploadIds;
            
            // Add all uploads to history
            for (let i = 0; i < Math.min(this.currentUploadIds.length, this.selectedFiles.length); i++) {
              this.addToHistory({
                id: this.currentUploadIds[i],
                filename: this.selectedFiles[i]?.name || `File ${i+1}`,
                status: 'processing',
                progress: 0,
                timestamp: new Date()
              });
            }
            
            this.trackMultipleUploadsStatus();
          }
        }
      });
    } else {
      // Single file upload
      formData.append('file', this.selectedFiles[0]);
      
      this.http.post(`${this.API_URL}/upload`, formData, {
        headers,
        reportProgress: true,
        observe: 'events'
      })
      .pipe(
        map(event => {
          if (event.type === HttpEventType.UploadProgress && event.total) {
            this.uploadProgress = Math.round(100 * event.loaded / event.total);
          } else if (event.type === HttpEventType.Response) {
            return event.body;
          }
          return null;
        }),
        catchError(error => {
          this.errorMessage = error.error?.message || 'Error uploading file';
          this.uploading = false;
          return of(null);
        }),
        finalize(() => {})
      )
      .subscribe(response => {
        if (response) {
          const data: any = response;
          this.successMessage = data.message || 'File uploaded successfully';
          this.currentUploadIds = [data.uploadId];
          
          this.addToHistory({
            id: data.uploadId,
            filename: this.selectedFiles[0].name,
            status: 'processing',
            progress: 0,
            timestamp: new Date()
          });
          
          this.trackUploadStatus();
        }
      });
    }
  }

  trackUploadStatus(): void {
    if (this.currentUploadIds.length === 0) return;
    
    this.stopStatusTracking();
    
    this.pollingActive = true;
    this.statusCheckInterval = setInterval(() => {
      this.checkUploadStatus(this.currentUploadIds[0]);
    }, 2000);
  }
  
  trackMultipleUploadsStatus(): void {
    if (this.currentUploadIds.length === 0) return;
    
    this.stopStatusTracking();
    
    this.pollingActive = true;
    this.statusCheckInterval = setInterval(() => {
      this.checkMultipleUploadStatus();
    }, 2000);
  }
  
  stopStatusTracking(): void {
    if (this.statusCheckInterval) {
      clearInterval(this.statusCheckInterval);
      this.statusCheckInterval = null;
      this.pollingActive = false;
    }
  }

 checkUploadStatus(uploadId: string): void {
  this.http.get(`${this.API_URL}/status?uploadId=${uploadId}`)
    .subscribe({
      next: (response: any) => {
        // Use the progress value from the response
        if (response.progress !== undefined) {
          this.uploadProgress = response.progress;
        }
        
        this.updateUploadStatus(uploadId, response);
        
        if (['completed', 'failed'].includes(response.status)) {
          this.stopStatusTracking();
          this.uploading = false; // This will hide the progress bar
          
          if (response.status === 'completed') {
            this.uploadProgress = 100;
            // Show success message with file name if available
            this.successMessage = `File ${response.fileName || 'upload'} has been successfully processed.`;
            
            // Clear selected files to enable new uploads
            this.clearFiles();
            
            // Auto-hide success message after 5 seconds
            setTimeout(() => {
              this.successMessage = null;
            }, 5000);
          } else if (response.status === 'failed') {
            this.errorMessage = `Error processing file: ${response.message || 'An unknown error occurred'}`;
            
            // Auto-hide error message after 5 seconds
            setTimeout(() => {
              this.errorMessage = null;
            }, 5000);
          }
        }
      },
      error: (err) => {
        console.error('Error checking status:', err);
        this.stopStatusTracking();
        this.uploading = false; // Make sure to hide progress bar on error
        this.errorMessage = 'Error checking upload status';
      }
    });
}
  
  checkMultipleUploadStatus(): void {
  const uploadIds = this.currentUploadIds.join(',');
  
  this.http.get(`${this.API_URL}/status-batch?uploadIds=${uploadIds}`)
    .subscribe({
      next: (response: any) => {
        if (response && Array.isArray(response)) {
          let totalProgress = 0;
          
          // Update each upload status
          response.forEach((status: any) => {
            if (status.uploadId) {
              this.updateUploadStatus(status.uploadId, status);
              
              // Add each file's progress to calculate average
              if (status.progress !== undefined) {
                totalProgress += status.progress;
              }
            }
          });
          
          // Update overall progress as average of all files
          if (response.length > 0) {
            this.uploadProgress = Math.round(totalProgress / response.length);
          }
          
          // Check if all uploads are completed or failed
          const allDone = response.every((status: any) => 
            ['completed', 'failed'].includes(status.status)
          );
          
          if (allDone) {
            this.stopStatusTracking();
            this.uploading = false; // This will hide the progress bar
            
            // Calculate statistics
            const completedCount = response.filter((status: any) => 
              status.status === 'completed'
            ).length;
            
            const failedCount = response.filter((status: any) => 
              status.status === 'failed'
            ).length;
            
            // Show appropriate message based on results
            if (completedCount === response.length) {
              this.successMessage = `All ${completedCount} files have been successfully processed.`;
            } else if (failedCount === response.length) {
              this.errorMessage = `All ${failedCount} file uploads failed. Please check the history for details.`;
            } else {
              this.successMessage = `${completedCount} of ${response.length} files were successfully processed. ${failedCount} files failed.`;
            }
            
            // Clear selected files to enable new uploads
            this.clearFiles();
            
            // Auto-hide messages after 5 seconds
            setTimeout(() => {
              this.successMessage = null;
              this.errorMessage = null;
            }, 5000);
          }
        }
      },
      error: (err) => {
        console.error('Error checking batch status:', err);
        this.stopStatusTracking();
        this.uploading = false; // Make sure to hide progress bar on error
        this.errorMessage = 'Error checking upload status';
      }
    });
}

  checkAllUploadsStatus(): void {
    const processingUploads = this.uploadHistory.filter(upload => upload.status === 'processing');
    if (processingUploads.length > 0) {
      this.http.get(`${this.API_URL}/status-all`)
        .subscribe({
          next: (response: any) => {
            if (response && Array.isArray(response)) {
              // Map response items by uploadId for easier access
              const statusMap = new Map();
              response.forEach(item => {
                if (item.uploadId) {
                  statusMap.set(item.uploadId, item);
                }
              });
              
              // Update each processing upload with its current status
              processingUploads.forEach(upload => {
                const status = statusMap.get(upload.id);
                if (status) {
                  this.updateUploadStatus(upload.id, status);
                } else {
                  // If status not found, mark as failed
                  this.updateUploadStatus(upload.id, {
                    status: 'failed',
                    message: 'Status information not available'
                  });
                }
              });
            }
          },
          error: (err) => {
            console.error('Error checking all statuses:', err);
            // Mark all processing uploads as failed on error
            processingUploads.forEach(upload => {
              this.updateUploadStatus(upload.id, {
                status: 'failed',
                message: 'Failed to retrieve status'
              });
            });
          }
        });
    }
  }

  addToHistory(upload: UploadStatus): void {
    // Check if upload with same ID already exists
    const existingIndex = this.uploadHistory.findIndex(item => item.id === upload.id);
    if (existingIndex !== -1) {
      // Update existing entry instead of adding a new one
      this.uploadHistory[existingIndex] = {
        ...this.uploadHistory[existingIndex],
        ...upload,
        timestamp: new Date() // Update timestamp
      };
    } else {
      // Add new entry at the beginning
      this.uploadHistory.unshift(upload);
    }
  
    // Limit history size
    if (this.uploadHistory.length > 20) {
      this.uploadHistory = this.uploadHistory.slice(0, 20);
    }
    
    localStorage.setItem('uploadHistory', JSON.stringify(this.uploadHistory));
  }

  updateUploadStatus(uploadId: string, newStatus: any): void {
    const index = this.uploadHistory.findIndex(item => item.id === uploadId);
    if (index !== -1) {
      // Asegurarse de que siempre tenemos un valor progress, incluso si la API no lo proporciona
      let progress = this.uploadHistory[index].progress;
      
      // Si es un estado completado, establecer progress a 100%
      if (newStatus.status === 'completed') {
        progress = 100;
      }
      // Si hay un progress en el newStatus, usarlo
      else if (newStatus.progress !== undefined) {
        progress = newStatus.progress;
      }
      
      this.uploadHistory[index] = {
        ...this.uploadHistory[index],
        status: newStatus.status || this.uploadHistory[index].status,
        progress: progress,
        message: newStatus.message || this.uploadHistory[index].message
      };
      
      localStorage.setItem('uploadHistory', JSON.stringify(this.uploadHistory));
    }
  }

  clearFiles(): void {
    this.selectedFiles = [];
    this.errorMessage = null;
    this.uploadForm.get('files')?.reset();
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'completed': return 'text-success';
      case 'failed': return 'text-danger';
      case 'processing': return 'text-primary';
      default: return '';
    }
  }

  clearHistory(): void {
    if (this.uploadHistory.length > 0) {
      if (confirm('Are you sure you want to delete the entire upload history?')) {
        const processingUploads = this.uploadHistory.filter(upload => upload.status === 'processing');
        
        if (processingUploads.length > 0) {
          if (confirm(`There are ${processingUploads.length} file(s) currently being processed. Do you really want to delete the entire history?`)) {
            this.uploadHistory = [];
            localStorage.removeItem('uploadHistory');
            this.successMessage = 'History successfully cleared';
            setTimeout(() => this.successMessage = null, 3000);
          }
        } else {
          this.uploadHistory = [];
          localStorage.removeItem('uploadHistory');
          this.successMessage = 'History successfully cleared';
          setTimeout(() => this.successMessage = null, 3000);
        }
      }
    }
  }

  ngOnDestroy(): void {
    this.stopStatusTracking();
  }
}