import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskEditorServiceService } from '../task-editor-service.service';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.css']
})
export class LoginFormComponent implements OnInit {
  loginForm: FormGroup;
  email: any;
  password: any;

  constructor(private service: TaskEditorServiceService,private formBuilder: FormBuilder, private router: Router,private route: ActivatedRoute ) {
      this.loginForm = this.formBuilder.group({
        email: ['', Validators.required],
        password: ['', Validators.required]
      });

   }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['email']) {
         let email = this.loginForm.get('email')
         if(email != null)
            email.patchValue(params['email'])
      }
      
      if (params['password']) {
        let email = this.loginForm.get('password')
        if(email != null)
           email.patchValue(params['password'])
     }

    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      // Handle form submission logic here
      const password = this.loginForm.value.password;
      const email = this.loginForm.value.email;
      const callback = () : void => { this.router.navigate(['/workspace']); }

      this.service.login(email, password, callback)
      // You can send an API request here or perform any other action.
    }
  }
}
