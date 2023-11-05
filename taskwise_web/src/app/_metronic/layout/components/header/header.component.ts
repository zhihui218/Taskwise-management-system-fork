import {
  Component,
  ElementRef,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { NavigationCancel, NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { LayoutService } from '../../core/layout.service';
import { MenuComponent } from '../../../kt/components';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit, OnDestroy {
  headerContainerCssClasses: string = '';
  @ViewChild('ktPageTitle', { static: true }) ktPageTitle: ElementRef;

  private unsubscribe: Subscription[] = [];
  @Output() displayOverlay: EventEmitter<boolean> = new EventEmitter<boolean>();
  shouldDisplayOverlay: boolean = false;

  constructor(private layout: LayoutService, private router: Router) {
    this.routingChanges();
  }

  toggleOverlay(): void{
    this.shouldDisplayOverlay = !this.shouldDisplayOverlay;
    this.displayOverlay.emit(this.shouldDisplayOverlay);
  }

  ngOnInit(): void {
    this.headerContainerCssClasses =
      this.layout.getStringCSSClasses('headerContainer');
  }

  routingChanges() {
    const routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd || event instanceof NavigationCancel) {
        MenuComponent.reinitialization();
      }
    });
    this.unsubscribe.push(routerSubscription);
  }

  ngOnDestroy() {}
}
