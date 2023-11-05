module.exports = {
    roles: {
        manager: 'MANAGER', 
        engineer: 'ENGINEER',
        client: 'CLIENT',
    },

    notification_type: {
        task_assigned: 'task_assigned',
        project_created: 'project_created', 
        project_completed: 'project_completed',
        ticket_created: 'ticket_created', 
        ticket_solved: 'ticket_solved', 
        ticket_reopened: 'ticket_reopened',
        ticket_due_date: 'ticket_due_date',
    },

    type: {
        project: 'Project',
        task: 'Task',
        ticket: 'Ticket'
    },

    project_type: {
        NEW_SUPPLY: 'New supply',
        MAINTENANCE_CONTRACT: 'Maintenance contract',
        OUT_OF_CONTRACT_SUPPORT: 'Out of contract support',
        OTHERS: 'Others'
    },

    status: {
        pending: 'Pending',
        onHold: 'On Hold',
        completed: 'Completed'
    },

    ticket_status: {
        pending: 'Pending',
        reopened: 'Reopened',
        solved: 'Solved'
    },

    maxWorkHourPerWeek: {
        'BASIC': 40
    },

    GENDER : {
        Male: 1,
        Female: 0
    },
    
    EDUCATION_BACKGROUND : {
        'Life Sciences': 5,
        Medical: 4,
        Marketing: 3,
        'Technical Degree': 2,
        Other: 1,
        'Human Resources': 0,
    },
    
    MARITAL_STATUS : {
        Married: 2,
        Single: 1,
        Divorced: 0
    },
    
    EMP_DEPARTMENT : {
        Sales: 5,
        Development: 4,
        'Research & Development': 3,
        'Human Resources': 2,
        Finance: 1,
        'Data Science': 0,
    },
    
    EMP_JOB_ROLE : {
        'Sales Executive': 18,
        Developer: 17,
        'Manager R&D': 16,
        'Research Scientist': 15,
        'Sales Representative': 14,
        'Laboratory Technician': 13,
        'Senior Developer': 12,
        Manager: 11,
        'Finance Manager': 10,
        'Human Resources': 9,
        'Technical Lead': 8,
        'Manufacturing Director': 7,
        'Healthcare Representative': 6,
        'Data Scientist': 5,
        'Research Director': 4,
        'Business Analyst': 3,
        'Senior Manager R&D': 2,
        'Delivery Manager': 1,
        'Technical Architect': 0,
    },
    
    BUSINESS_TRAVEL_FREQUENCY : {
        'Travel Rarely': 2,
        'Travel Frequently': 1,
        'Non-Travel': 0
    },
    
    OVERTIME : {
        No:0,
        Yes:1
    },
    
    ATTRITION : {
        No: 0,
        Yes: 1
    },
    
    EMP_EDUCATION_LEVEL : {
        'Below College': 1,
        'College': 2,
        'Bachelor': 3,
        'Master': 4,
        'Doctor': 5,
    },
    
    EMP_ENVIRONMENT_SATISFACTION : {
        Low: 1,
        Medium: 2,
        High: 3,
        'Very High': 4,
    },
    
    EMP_JOB_INVOLVEMENT : {
        Low: 1,
        Medium: 2,
        High: 3,
        'Very High': 4,
    },
    
    EMP_JOB_LEVEL : {
        Entry: 1,
        Junior: 2,
        Experience: 3,
        Senior: 4,
        Expert: 5
    },
    
    EMP_JOB_SATISFACTION : {
        Low: 1,
        Medium: 2,
        High: 3,
        'Very High': 4,
    },
    
    EMP_RELATIONSHIP_SATISFACTION : {
        Low: 1,
        Medium: 2,
        High: 3,
        'Very High': 4,
    },
    
    EMP_WORKLIFE_BALANCE : {
        Bad: 1,
        Good: 2,
        Better: 3,
        Best: 4,
    },
}