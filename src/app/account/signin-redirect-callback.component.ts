import { Component, OnInit } from '@angular/core';
import { GoogleLoginService } from '@app/_services';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signin-callback',
  template: `<div></div>`
})

export class SigninRedirectCallbackComponent implements OnInit {
  constructor(private googleLoginService: GoogleLoginService,
              private _router: Router) { }

  ngOnInit() {
    this.googleLoginService.completeSignInWithAuthority().then(user => {
      this._router.navigate(['/'], { replaceUrl: true });
    })
  }
}