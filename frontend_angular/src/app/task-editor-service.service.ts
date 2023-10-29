import { EventEmitter, Injectable, Output } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TaskEditorServiceService {

  private problemUrl = `${environment.apiUrl}/problems/problem`;
  private resultUrl = `${environment.apiUrl}/problems/get_result`;
  private loginUrl = `${environment.apiUrl}/login/token`;
  private userUrl = `${environment.apiUrl}/login/user`;

  @Output() customEvent: EventEmitter<string> = new EventEmitter<string>();
  @Output() problemListEvent: EventEmitter<string> = new EventEmitter<string>();

  emitEvent(direction: string): void {
    this.customEvent.emit(direction);
  }

  emitProblemListEvent(){
    this.problemListEvent.emit("test")
  }

  getToken(): string {
    return localStorage.getItem("token") || "";
  }

  constructor(private httpClient: HttpClient,  private router: Router)  { }

  get_task_result(task_id: string, callback: (data: MyDictionary) => void){
    let headers = new HttpHeaders({
      "Content-Type": "application/json; charset=utf-8",
      token: this.getToken()
    });
    this.httpClient.post<MyDictionary>(this.resultUrl, {task_id: task_id},{headers: headers}).pipe(
      map(response => {
        
          // Handle 200 OK response with data
          return response;
        
      }),
      catchError(error => {
        if (error.status === 401) {
          // Handle 401 Unauthorized error here
          this.router.navigateByUrl('/login');
        }

        // Rethrow the error to propagate it down the observable chain
        return throwError(error);
      })
    ).subscribe(data => {
      callback(data)
    });
  }

  submit_task(problem_code: string, tests: string[][], number2: number, callback: (data: Result) => void){
    let headers = new HttpHeaders({
      "Content-Type": "application/json; charset=utf-8",
      token: this.getToken()
    });
    this.httpClient.post<Result>(this.problemUrl, {code: problem_code, tests: tests, number: number2},{headers: headers})
    .pipe(
      map(response => {
        
          // Handle 200 OK response with data
          return response;
        
      }),
      catchError(error => {
        if (error.status === 401) {
          // Handle 401 Unauthorized error here
          this.router.navigateByUrl('/login');
        }

        // Rethrow the error to propagate it down the observable chain
        return throwError(error);
      })
    ).subscribe(data => {
      callback(data)
    });
  }

  get_problems(callback: (data: Problem[]) => void) {
    let headers = new HttpHeaders({
      "Content-Type": "application/json; charset=utf-8",
      token: this.getToken()
    });
    this.httpClient.get<Problem[]>(this.problemUrl, {headers: headers})
    .pipe(
      map(response => {
        
          // Handle 200 OK response with data
          return response;
        
      }),
      catchError(error => {
        if (error.status === 401) {
          // Handle 401 Unauthorized error here
          this.router.navigateByUrl('/login');
        }

        // Rethrow the error to propagate it down the observable chain
        return throwError(error);
      })
    ).subscribe(data => {
      callback(data)
    })
  }

  login(email: string, password: string,  callback: () => void){
    let headers = new HttpHeaders({
      "Content-Type": "application/json; charset=utf-8",
    });
    this.httpClient.post<GetResponse>(this.loginUrl, { email: email, password: password }, {headers: headers}).subscribe(data => {
        const token = data.access_token
        
        localStorage.setItem('token', token)
        callback();
    })
  }

  get_user( callback: (data: string) => void){
    let headers = new HttpHeaders({
      "Content-Type": "application/json; charset=utf-8",
      token: this.getToken()
    });
    this.httpClient.get<GetUser>(this.userUrl, {headers: headers}).pipe(
      map(response => {
        
          // Handle 200 OK response with data
          return response;
        
      }),
      catchError(error => {
        if (error.status === 401) {
          // Handle 401 Unauthorized error here
          this.router.navigateByUrl('/login');
        }

        // Rethrow the error to propagate it down the observable chain
        return throwError(error);
      })
    ).subscribe(data => {
        callback(data.name);
    })
  }
}

interface GetUser {
  name : string;
}

interface GetResponse {
  access_token : string;
}

export interface Result{
  task_id: string;
}

export interface MyDictionary {
  outputs: string[];
  expected_outputs: string[];
  error: string;
  accepted: boolean[];
  task_status:string;
}

export interface Problem{
  name: string;
  base_code: string;
  inputs: string[];
  text_html: string;
  tests: string[][];
  number: number;
  correct: string;
  inputs_names: string[];
  entry: string;
}
