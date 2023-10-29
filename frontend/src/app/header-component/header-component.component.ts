import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { TaskEditorServiceService } from '../task-editor-service.service';

@Component({
  selector: 'app-header-component',
  templateUrl: './header-component.component.html',
  styleUrls: ['./header-component.component.css']
})
export class HeaderComponentComponent implements OnInit {
  isComponentVisible: boolean = true;
  username = ''

  constructor(private service: TaskEditorServiceService, private router: Router) { 
    
  }
  checkRoute(url: string) {
    this.isComponentVisible = !url.includes('login');

  }

  ngOnInit(): void {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.checkRoute(event.urlAfterRedirects);
      }
    });
    const callback = (data: string) : void => { this.username = data }

    this.service.get_user(callback)
  }

  emitEvent(direction: string){
    this.service.emitEvent(direction)
  }
  
  emitProblemListEvent(){
    this.service.emitProblemListEvent()
  }

}
