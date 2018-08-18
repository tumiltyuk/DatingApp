import { Injectable } from '../../../node_modules/@angular/core';
import { HttpInterceptor, HttpHandler, HttpEvent, HttpErrorResponse, HttpRequest, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Observable, throwError } from '../../../node_modules/rxjs';
import { catchError } from '../../../node_modules/rxjs/operators';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(req).pipe(
            catchError(error => {
                if (error instanceof HttpErrorResponse) {

                    if (error.status === 401) {
                        return throwError(error.statusText);
                    }
                    const applicationError = error.headers.get('Application-Error');
                    if (applicationError) {
                        console.error(applicationError);
                        return throwError(applicationError);
                    }
                    const serverError = error.error;
                    let modalStateErrors = '';
                    if (serverError && typeof serverError === 'object') {
                        for (const key in serverError) {
                            if (serverError[key]) {
                                modalStateErrors += serverError[key] + '\n';
                            }
                        }
                    }
                    return throwError(modalStateErrors || serverError || 'server Error');
                }
            })
        );
    }
}

export const ErrorInterceptorProvider = {
    provide: HTTP_INTERCEPTORS,
    useClass: ErrorInterceptor,
    multi: true
}