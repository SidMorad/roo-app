import { Directive, ElementRef, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Gesture } from "ionic-angular/gestures/gesture";

/**
 * Generated class for the PressDirective directive.
 *
 * See https://angular.io/docs/ts/latest/api/core/index/DirectiveMetadata-class.html
 * for more info on Angular Directives.
 */

@Directive({
  selector: '[longPress]' // Attribute selector
})
export class LongPressDirective implements OnInit, OnDestroy {

  el: HTMLElement;
  pressGesture: Gesture;
  @Output('long-press') onPressRelease: EventEmitter<any> = new EventEmitter();

  constructor(el: ElementRef) {
    this.el = el.nativeElement;
  }

  ngOnInit() {
    this.pressGesture = new Gesture(this.el);
    this.pressGesture.listen();

    this.pressGesture.on('press', (event) => {
      console.log('Pressed');
      this.onPressRelease.emit('released');
    });
  }

  ngOnDestroy() {
    this.pressGesture.destroy();
  }

}