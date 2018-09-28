import { NgModule, ModuleWithProviders } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { CookieService} from 'ngx-cookie-service';
import { HttpService } from './http.service';

@NgModule({
	imports: [HttpClientModule]
})
export class ServiceModule { 
	static forRoot(): ModuleWithProviders {
        return {
            ngModule: ServiceModule,
            providers: [ 
            	HttpService,
            	CookieService
            ]
        };
    }
}