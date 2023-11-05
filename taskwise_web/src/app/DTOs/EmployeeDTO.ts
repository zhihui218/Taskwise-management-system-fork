export interface EmployeePostDTO{
    email: string,
    password: string,
}

export interface EmployeeGetDTO{
    //! Later need to put "_id" as well
    name: string,
    phone: string,
    profile: string,
}

export interface EmployeePutDTO{
    name: string,
    phone: string,
    profile: string,
    password: string,
}