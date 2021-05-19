import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GoogleLoginService } from '@app/_services';

@Component({
  selector: 'app-signout-callback',
  template: `<div></div>`
})

export class SignoutRedirectCallbackComponent implements OnInit {
  constructor(private googleLoginService: GoogleLoginService,
              private _router: Router) { }

  ngOnInit() {
    this.googleLoginService.completeLogout().then(_ => {
      this._router.navigate(['/'], { replaceUrl: true });
    })
  }
}