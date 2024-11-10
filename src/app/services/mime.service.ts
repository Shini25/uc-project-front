import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MimeService {
  private mimeTypesMapping: { [key: string]: string } = {
    'application/vnd.oasis.opendocument.text': 'ODT',
    'application/msword': 'DOC',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
    'application/vnd.ms-excel': 'XLS',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
    'application/pdf': 'PDF',
    'image/jpeg': 'JPEG',
    'image/png': 'PNG',
    'application/vnd.ms-powerpoint': 'PPT',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PPTX',
  };

  getFileExtension(mimeType: string): string {
    return this.mimeTypesMapping[mimeType] || 'Format inconnu';
  }
}
