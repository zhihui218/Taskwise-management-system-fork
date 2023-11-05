export interface UserModel{
  _id: string;
  email: string;
  password: string;
  role: string;
  firstLogin: boolean;
  joining_date: string;
  // First time login manager / engineer / client need to fill up the below information
  name?: string;
  phone?: string;
  profile?: Map<String, String>;
  //? For "Engineer"
  Age?: Number,
  Gender?: Number,
  EducationBackground?: Number,
  MaritalStatus?: Number,
  DistanceFromHome?: Number,
  EmpEducationLevel?: Number,
  EmpEnvironmentSatisfaction?: Number,
  EmpJobSatisfaction?: Number,
  NumCompaniesWorked?: Number,
  OverTime?: Number,
  EmpRelationshipSatisfaction?: Number,
  TotalWorkExperienceInYears?: Number,
  EmpWorkLifeBalance?: Number,
  ExperienceYearsAtThisCompany?: Number,
  ExperienceYearsInCurrentRole?: Number,
  Attrition?: Number
  EmpDepartment?: Number,
  EmpJobRole?: Number,
  BusinessTravelFrequency?: Number,	
  EmpHourlyRate?: Number,
  EmpJobInvolvement?: Number,
  EmpJobLevel?: Number,
  EmpLastSalaryHikePercent?: Number,
  TrainingTimesLastYear?: Number,
  YearsSinceLastPromotion?: Number,
  YearsWithCurrManager?: Number
}

// Get user with user.role === "ENGINEER || CLIENT" 
export interface UserGetDTO{
  _id: string;
  email: string;
  name: string;
  role: string;
  // A new user who haven't login doesn't have the below properties
  profile?: Map<String, String>;
  joining_date?: string;
  phone?: string;
  //? For "ENGINEER"
  currentWorkingHour?: number;
  EmpDepartment?: string;
  EmpJobRole?: string;
  BusinessTravelFrequency?: string;
  EmpHourlyRate?: string;
  EmpJobInvolvement?: string;
  EmpJobLevel?: string;
  EmpLastSalaryHikePercent?: string;
  TrainingTimesLastYear?: string;
  YearsSinceLastPromotion?: string;
  YearsWithCurrManager?: string;
  PerformanceRating?: number;
  //? For "CLIENT"
  company_name?: string;
}

// Change user's details (Except of password)
export interface UserInfoPostDTO{
  name: string;
  phone: string;
  profile: File;
}

// Change user password
export interface UserPasswordPostDTO{
  password: string;
}

// Change both the password and other details of the user (for first time login)
export interface UserPostDTO extends UserInfoPostDTO, UserPasswordPostDTO{}

// Used for registering user (Manager/Engineer/Client)
export interface UserRegisterDTO{
  role: string; //* MANAGER / ENGINEER / CLIENT
  email: string;
  name: string;
  password: string;
  joining_date?: string
}

// Used for performance prediction
export interface engineerDetailDTO{
  //? Filled in by "ENGINEER"
  Age?: Number,
  Gender?: Number,
  EducationBackground?: Number,
  MaritalStatus?: Number,
  DistanceFromHome?: Number,
  EmpEducationLevel?: Number,
  EmpEnvironmentSatisfaction?: Number,
  EmpJobSatisfaction?: Number,
  NumCompaniesWorked?: Number,
  OverTime?: Number,
  EmpRelationshipSatisfaction?: Number,
  TotalWorkExperienceInYears?: Number,
  EmpWorkLifeBalance?: Number,
  //* Automated calculation using `joining_date`
  ExperienceYearsAtThisCompany?: Number,
  ExperienceYearsInCurrentRole?: Number,
  Attrition?: Number
  //? Filled in by "MANAGER"
  EmpDepartment?: Number,
  EmpJobRole?: Number,
  BusinessTravelFrequency?: Number,	
  EmpHourlyRate?: Number,
  EmpJobInvolvement?: Number,
  EmpJobLevel?: Number,
  EmpLastSalaryHikePercent?: Number,
  TrainingTimesLastYear?: Number,
  YearsSinceLastPromotion?: Number,
  YearsWithCurrManager?: Number
}

export interface EngineerRemarkAndKPI {
  //? Sum of workload per day in the current week
  workloadObj: any,
  taskCompletionRate: number | null,
  ticketResolutionRate: number | null,
  workloadKPI: number | null,
  onTimeTaskKPI: number | null,
  onTimeTicketKPI: number | null,
  fixedTicketKPI: number | null,
  numOfEarlyTaskCompletion: number | null,
  numOfEarlyTicketResolution: number | null,
  numOfLateTask: number | null,
  numOfLateTicket: number | null,
}

export function isUserPasswordPostDTO(object: any): object is UserPasswordPostDTO {
  return 'password' in object;
}

export function isUserInfoPostDTO(object: any): object is UserInfoPostDTO {
  return 'profile' in object;
}
