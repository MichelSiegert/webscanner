import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SNACK_BAR_MESSAGE_TYPE } from '../types/snackbarmessagetype';

@Injectable({
  providedIn: 'root'
})
export class SnackbarService {
  constructor(private snackBar: MatSnackBar) { }

  public showSnackBar(context: string, message: string) {
    console.log(context);
    this.snackBar.open(message, 'close', {
      duration: 3000,
      panelClass: [context || SNACK_BAR_MESSAGE_TYPE.default],
      verticalPosition: 'bottom',
      horizontalPosition: 'end'
    });
  }

  public showErrorMessage(message: string) {
    this.showSnackBar(SNACK_BAR_MESSAGE_TYPE.error, message);
  }

  public showSuccessMessage(message: string) {
    this.showSnackBar(SNACK_BAR_MESSAGE_TYPE.success, message);
  }

  public showWarningMessage(message: string) {
    this.showSnackBar(SNACK_BAR_MESSAGE_TYPE.warning, message);
  }

  public showDefaultMessage(message: string) {
    this.showSnackBar(SNACK_BAR_MESSAGE_TYPE.default, message);
  }

  public showServiceFailureMessage(serviceName: string, error: ErrorEvent) {
    const errorMessage = error.message ? error.message : error.error.message;
    const errorLabel = `${serviceName} service has failed: ${errorMessage}`;
    this.showErrorMessage(errorLabel);
  }
}
