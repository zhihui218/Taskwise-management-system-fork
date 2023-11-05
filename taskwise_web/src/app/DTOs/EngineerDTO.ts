import { EmployeeGetDTO } from "./EmployeeDTO";

export interface EngineerGetDTO extends EmployeeGetDTO{
    engineerId: string 
}