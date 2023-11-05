//* Used in 'Project' page
export interface ProjectTaskProgressTrackerDTO {
    numOfTasks: number,
    numOfCompletedTasks: number;
}


export interface ProjectTicketProgressTrackerDTO{
    numOfTickets: number,
    numOfSolvedTickets: number
}

//* Used in 'Project-details" page
export interface ProjectTaskProgressGetDTO{
    totalCounts: number;
    numOfPending: number;
    numOfOnHold: number;
    numOfCompleted: number

}

export interface ProjectTicketProgressGetDTO{
    totalCounts: number;
    numOfPending: number;
    numOfReopened: number;
    numOfSolved: number;
}

//? For "Pie Chart" of tickets at "Task-Detail" page
export interface TaskTicketProgressGetDTO{
    totalCounts: number;
    pendingPercent: number;
    reopenedPercent: number;
    solvedPercent :number ;
}