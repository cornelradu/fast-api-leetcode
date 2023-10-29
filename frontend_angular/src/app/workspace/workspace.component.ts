import { Call, FactoryTarget, ThisReceiver } from '@angular/compiler';
import { Component, ElementRef, HostListener, OnInit, Renderer2, ViewChild } from '@angular/core';
import { Result, TaskEditorServiceService } from 'src/app/task-editor-service.service';
import { MyDictionary } from 'src/app/task-editor-service.service';
import { Problem } from 'src/app/task-editor-service.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { CookieService } from 'ngx-cookie-service';
import { AfterViewInit } from '@angular/core';
import * as Prism from 'prismjs';

import 'prismjs/components/prism-python';

@Component({
  selector: 'app-workspace',
  templateUrl: './workspace.component.html',
  styleUrls: ['./workspace.component.css'],
  animations: [
    trigger('slideInOut', [
      state('in', style({
        transform: 'translateX(0)',
        opacity: 1
      })),
      state('out', style({
        transform: 'translateX(-100%)',
        opacity: 0
      })),
      transition('in => out', animate('300ms ease-out')),
      transition('out => in', animate('300ms ease-in'))
    ])
  ]
})
export class WorkspaceComponent implements OnInit {



  textareaContent: SafeHtml = '';
  problems: Problem[] = [];
  htmlContent: SafeHtml = '';
  index = 0;
  crt_test_case_item = 0;
  crt_test_cases : string[][] = []
  showTestCase = true;
  ran_once = false;
  outputs: string[] = [];
  expected_outputs: string[] = [];
  crt_test_result_item = 0;
  crt_result_cases = []
  loading=false
  error = ""
  is_error = false
  accepted: boolean[] = [];
  goodAnswer: boolean = true;
  isProblemListVisible = false;
  intervalId: any;
  @ViewChild('codeElement', { static: false }) codeElement!: ElementRef;


  constructor(private service: TaskEditorServiceService, private sanitizer: DomSanitizer, private cookieService: CookieService, private renderer: Renderer2, private el: ElementRef) { }
  
  ngOnInit(): void {
    this.outputs = []
    this.expected_outputs = []
      const callback = (data: Problem[]) : void => { 
        
        this.problems = data; 
        const cookieValue = this.cookieService.get('textareaValue_' + this.index);
        if ( cookieValue === undefined || cookieValue == '')  
          this.textareaContent = this.problems[this.index].base_code
        else
          this.textareaContent = cookieValue

        Prism.highlightAll()
        this.htmlContent = this.sanitizer.bypassSecurityTrustHtml(this.problems[this.index].text_html );
        this.crt_test_cases = this.problems[this.index].tests;
      }
      this.service.get_problems(callback);

      this.service.customEvent
        .subscribe((direction:string) => {
            if (direction == 'next'){
              this.index = this.index + 1 > this.problems.length - 1 ? 0 : this.index + 1;
            } else {
              this.index = this.index - 1 < 0 ? this.problems.length - 1 : this.index - 1;
            }
            const cookieValue = this.cookieService.get('textareaValue_' + this.index);
            if ( cookieValue === undefined || cookieValue == '')
              this.textareaContent = this.problems[this.index].base_code
            else
              this.textareaContent = cookieValue
            const codeContent = this.codeElement.nativeElement;
            setTimeout(() => {
              Prism.highlightElement(codeContent,false);
            }, 1)
            this.htmlContent = this.sanitizer.bypassSecurityTrustHtml(this.problems[this.index].text_html );
            this.crt_test_cases = this.problems[this.index].tests;
        });

        this.service.problemListEvent
        .subscribe((data:string) => {
            this.toggleProblemsList()
        });
  }

  toggleProblemsList(){
    this.isProblemListVisible = !this.isProblemListVisible;
  }

  trackByFn(index: number, item: string) {
    return index;  
  }

  handleClick() {
    const callback = (data: Result) : void => { 
      this.ran_once = true;
      const callback2 = (data: MyDictionary) : void => { 
        if (data.error === undefined && data.task_status == 'SUCCESS'){
          this.outputs = data.outputs;
          this.expected_outputs = data.expected_outputs;
          this.is_error=false
          this.accepted=data.accepted;
          var res = true;
          for(var i = 0; i < Object.values(this.accepted).length; i++){
            res = res && this.accepted[i]
          }
          
          this.goodAnswer = res;
          clearInterval(this.intervalId);
          this.loading = false
        } else if(data.error != undefined) {
            this.error = data.error;
            this.is_error=true
            this.loading = false
            clearInterval(this.intervalId);
        }
          this.showTestCase = false
          
          
      }
      this.intervalId = setInterval(() => {
          this.service.get_task_result(data.task_id, callback2);
      }, 1000);

    }
    
    this.loading = true
    const codeContent = this.codeElement.nativeElement.textContent;
    this.service.submit_task(codeContent, this.crt_test_cases, this.problems[this.index].number, callback);
  }

  handleTestCaseButtonClick(i: number){
    this.crt_test_case_item = i;
  }

  handleTestResultButtonClick(i: number){
    this.crt_test_result_item = i;
  }

  toggleTestCase() {
    this.showTestCase = true;
  }

  toggleResult() {
    this.showTestCase = false;
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Tab') {
      event.preventDefault(); // Prevent the default behavior of moving focus to the next element
      const textarea = event.target;
  
      const codeElement = this.el.nativeElement.querySelector('code');
      const cursorPosition = this.saveCursorPosition(codeElement);

      // Insert a tab character at the cursor position
      const tabCharacter = '   ';
      const textBeforeCursor = codeElement.textContent.slice(0, cursorPosition);
      const textAfterCursor = codeElement.textContent.slice(cursorPosition);
      codeElement.textContent = textBeforeCursor + tabCharacter + textAfterCursor;

      Prism.highlightAll()

      // Restore the cursor position after inserting the tab character
      this.restoreCursorPosition(codeElement, cursorPosition + 3);
      //Prism.highlightAll();
    }
  }

  restoreCursorPosition(element: HTMLElement, offset: number = 0) {
    const range = document.createRange();
    const selection = window.getSelection();

    let currentNode = element;
    let currentOffset = 0;

    for (let i = 0; i < element.childNodes.length; i++) {
      const childNode = element.childNodes[i];
      if (childNode.nodeType === Node.TEXT_NODE) {

        const textLength = childNode.textContent === null ? 0 : childNode.textContent.length;
        if (currentOffset + textLength >= offset) {
          range.setStart(childNode, offset - currentOffset);
          range.collapse(true);
          break;
        }
        currentOffset += textLength;
      } else if (childNode.nodeType === Node.ELEMENT_NODE) {
        const spanLength = (childNode as HTMLElement).innerText.length;
        if (currentOffset + spanLength >= offset) {
          if(childNode.firstChild !== null)
              range.setStart(childNode.firstChild, offset - currentOffset);
          range.collapse(true);
          break;
        }
        currentOffset += spanLength;
      }
    }

    if (selection && range) {
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }



  saveCursorPosition(element: HTMLElement): number {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0).cloneRange();
      range.selectNodeContents(element);
      if(selection.focusNode !== null)
        range.setEnd(selection.focusNode, selection.focusOffset);
      return range.toString().length;
    }
    return 0;
  }

  @HostListener('keyup', ['$event'])
  onKeyUp(event: KeyboardEvent): void {
    const codeContent = this.codeElement.nativeElement.textContent;

    this.cookieService.set('textareaValue_' + this.index , codeContent, 1);
    this.highlightCode()

  }

  onCustomEvent(message: string): void {
    this.index += 1;
  }

  highlightCode(){
    const codeElement = this.el.nativeElement.querySelector('code');
    const cursorPosition = this.saveCursorPosition(codeElement);

    // Highlight the code with Prism.js
    Prism.highlightElement(codeElement);

    // Restore the cursor position after highlighting
    this.restoreCursorPosition(codeElement, cursorPosition);
  }

  
  onTableRowClick(event: Event) {
    // Handle the table row click event here
    const target = event.target as HTMLElement;
    if (target.tagName === 'TD') {
      const clickedRowData = target.innerText;
      const regex = /^\d+/;
      const match = clickedRowData.match(regex);
      if (match){
          const number = parseInt(match[0], 10);
          this.index = number - 1;
          const cookieValue = this.cookieService.get('textareaValue_' + this.index);
          if ( cookieValue === undefined || cookieValue == '')
              this.textareaContent = this.problems[this.index].base_code
            else
              this.textareaContent = cookieValue
            const codeContent = this.codeElement.nativeElement;
            setTimeout(() => {
              Prism.highlightElement(codeContent,false);
            }, 1)
          this.htmlContent = this.sanitizer.bypassSecurityTrustHtml(this.problems[this.index].text_html );
          this.crt_test_cases = this.problems[this.index].tests;
          this.isProblemListVisible = false;
      }
    }
  }

  getCookieValue(cookieName: string): string | null {
    const name = cookieName + '=';
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieArray = decodedCookie.split(';');
    console.log(cookieArray)
    for (let i = 0; i < cookieArray.length; i++) {
      let cookie = cookieArray[i];
      while (cookie.charAt(0) === ' ') {
        cookie = cookie.substring(1);
      }
      if (cookie.indexOf(name) === 0) {
        return cookie.substring(name.length, cookie.length);
      }
    }
    return null;
  }

  refreshProblemCode() {
      const pastDate = new Date('2000-01-01');
      this.cookieService.set('textareaValue_' + this.index, '', { expires: pastDate })
      this.textareaContent = this.problems[this.index].base_code


      const codeContent = this.codeElement.nativeElement;
      setTimeout(() => {
        Prism.highlightElement(codeContent,false);
      }, 1)
      
  }


  ngAfterViewInit(): void {
    
    Prism.highlightAll();
  }
}
