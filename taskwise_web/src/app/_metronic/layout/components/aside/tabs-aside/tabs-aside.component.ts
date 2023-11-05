import { Component, HostListener, Input, OnInit } from '@angular/core';

import { Tab, tabs } from '../tabs';
import { KTHelpers } from 'src/app/_metronic/kt';
import { AuthService } from 'src/app/modules/auth';


@Component({
selector: 'app-tabs-aside',
templateUrl: './tabs-aside.component.html',
})
export class TabsAsideComponent implements OnInit {


isDesktop: boolean;
@Input() activeTab: Tab = tabs[0];
@Input() setActiveTab: (
activeTabLink:
    | 'Dashboard'
    | 'Profile'
    | 'Projects'
    | 'Tasks'
    | 'Tickets'
    | 'Users'
    | 'add-user'
    | 'Settings'
) => void;

allTabs: ReadonlyArray<Tab> = [];

@HostListener("window:resize", ['$event'])
onResize(event: any){
    if(window.innerWidth <= 991 || screen.width <= 991) this.isDesktop = false;
    else this.isDesktop = true;
}

constructor(private authService: AuthService) {}

ngOnInit(): void {
    if(window.innerWidth <= 991 || screen.width <= 991) this.isDesktop = false; 
    else this.isDesktop = true;

    if(this.authService.isClient()) this.allTabs = tabs.filter((tab: Tab) => tab.link == 'Dashboard' || tab.link == 'Profile' || tab.link == 'Projects' || tab.link == 'Settings')
    else if(this.authService.isEngineer()) this.allTabs = tabs.filter((tab: Tab) => tab.link !== 'Users' && tab.link !== 'add-user' && tab.link !== "Projects")
    else this.allTabs = tabs;
}

closeMenu() {
    KTHelpers.menuReinitialization();
}
}
