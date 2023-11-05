import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { PaginateGetDTO } from 'src/app/DTOs/PaginateGetDTO';
import { DashboardService } from 'src/app/Services/dashboard.service';
import { UserGetDTO } from 'src/app/modules/auth';
import { ROLE } from '../const';

@Component({
  selector: 'app-user-table',
  templateUrl: './user-table.component.html',
  styleUrls: ['./user-table.component.scss']
})
export class UserTableComponent implements OnInit {

  @Input() role: string;
  ROLE = ROLE;
  isLoading: boolean = false;
  //* Pagination 
  pagination: PaginateGetDTO; // To check the pagination details 
  paginateUser: UserGetDTO[]; // Store the "docs" stored in the pagination details
  // Default: Display 1st page, each page with 3 rows only
  page: number  = 1;
  limit: number = 10;

  constructor
  (
    private dashboardService: DashboardService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ){}

  async ngOnInit(): Promise<void> {
    await this.loadData(this.role);
  }

  async onPageChange($event): Promise<void>{
    this.page = $event.page + 1;
    this.limit = $event.rows;
    await this.loadData(this.role);
  }

  async loadData(role: string): Promise<void>{
    this.isLoading = true;

    // // IF user.role == "ENGINEER"
    // if(this.isEngineer()) this.pagination = await this.taskService.getEngineerPaginateTask(this.authService.currentUserValue._id, this.page, this.limit);
    // // IF user.role == "MANAGER"
    // else this.pagination = await this.taskService.getPaginateTask(this.page, this.limit);

    this.pagination = await this.dashboardService.getPaginateUser(role, this.page, this.limit);

    if(this.pagination){
      this.paginateUser = this.pagination['docs'] as UserGetDTO[];
    }

    this.isLoading = false;
    this.cdr.detectChanges();
  }

  displayDetails(user: UserGetDTO){
    this.router.navigate(
      ['/crafted/account/users', this.role, user._id], 
      // { 
      //   relativeTo: this.route,
      //   state:{ task: task },
      // });
    )
  }
}
