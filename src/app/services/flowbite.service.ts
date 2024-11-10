import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class FlowbiteService {
  constructor(@Inject(PLATFORM_ID) private platformId: any) {}

  loadFlowbite(callback: (flowbite: any) => void) {
    if (isPlatformBrowser(this.platformId)) {
      import('flowbite').then(flowbite => {
        // Initialize Flowbite if needed
        if (flowbite.initFlowbite) {
          flowbite.initFlowbite();
        }
        callback(flowbite);
      }).catch(err => console.error('Error loading Flowbite:', err));
    }
  }
}
