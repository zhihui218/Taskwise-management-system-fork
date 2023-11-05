type Tab = {
  link:
    | 'Dashboard'
    | 'Profile'
    | 'Projects'
    | 'Tasks'
    | 'Tickets'
    | 'Users'
    | 'add-user'
    | 'Settings'
  icon: string;
  tooltip:
    | 'Dashboard'
    | 'Profile'
    | 'Projects'
    | 'Tasks'
    | 'Tickets'
    | 'All Users'
    | 'Add User'
    | 'Settings'
    routerLink: string,
};

const tabs: ReadonlyArray<Tab> = [
  {
    link: 'Dashboard',
    icon: 'bi-file-bar-graph-fill',
    tooltip: 'Dashboard',
    routerLink: '/dashboard'
  },
  {
    link: 'Profile',
    icon: 'bi-person-fill',
    tooltip: 'Profile',
    routerLink: '/crafted/account/overview'
  },
  {
    link: 'Projects',
    icon: 'bi-briefcase-fill',
    tooltip: 'Projects',
    routerLink: '/crafted/pages/profile/projects'
  },
  {
    link: 'Tasks',
    icon: 'bi-stack',
    tooltip: 'Tasks',
    routerLink: '/crafted/pages/profile/campaigns'
  },
  {
    link: 'Tickets',
    icon: 'bi-ticket-fill',
    tooltip: 'Tickets',
    routerLink: '/crafted/pages/profile/tickets'
  },
  {
    link: 'Users',
    icon: 'bi-people-fill',
    tooltip: 'All Users',
    routerLink: '/crafted/account/users'
  },
  {
    link: 'add-user',
    icon: 'bi bi-person-fill-add',
    tooltip: 'Add User',
    routerLink: '/crafted/account/add-user'
  },
  {
    link: 'Settings',
    icon: 'bi bi-gear-fill',
    tooltip: 'Settings',
    routerLink: '/crafted/account/settings'
  },
];

export { tabs, Tab };
