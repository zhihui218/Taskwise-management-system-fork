export const COMPANY: string = "Netsinity";
export const COMPANY_LOGO: string = "./assets/media/taskwise/netsinity_logo.png";
export const COUNTRY_CURRENCY: string = "MYR"

export const ROLE = {
    MANAGER: 'MANAGER',
    ENGINEER: 'ENGINEER',
    CLIENT: 'CLIENT'
}

export const NOTIFICATION_TYPE = {
    TASK_ASSIGNED: 'task_assigned',
    PROJECT_CREATED: 'project_created',
    PROJECT_COMPLETED: 'project_completed',
    TICKET_CREATED: 'ticket_created',
    TICKET_SOLVED: 'ticket_solved',
    TICKET_REOPENED: 'ticket_reopened',
    TICKET_DUE_DATE: 'ticket_due_date',
    CHAT_RECEIVED: 'chat_received',
}

export const KPI_DISTRIBUTION = {
    WORKLOAD: 50,
    FIXED_TICKET: 20,
    ON_TIME_TASK: 15,
    ON_TIME_TICKET: 15
}

export const MAXWORKHOUR = {
    BASIC: 40
}

export const TYPE = {
    PROJECT: 'Project',
    TASK: 'Task',
    TICKET: 'Ticket'
}

export const STATUS = {
    PENDING: 'Pending',
    ONHOLD: 'On Hold',
    COMPLETED: 'Completed'
}

export const PROJECT_TYPE = {
    NEW_SUPPLY: 'New supply',
    MAINTENANCE_CONTRACT: 'Maintenance contract',
    OUT_OF_CONTRACT_SUPPORT: 'Out of contract support',
    OTHERS: 'Others'
}

export const TICKET_STATUS = {
    PENDING: 'Pending',
    SOLVED: 'Solved',
    //* When ticket's status changes from "Solved" to other, it becomes "Reopened"
    REOPENED: 'Reopened'
}

export const PRIORITY = {
    LOW: 'Low',
    MEDIUM: 'Medium',
    HIGH: 'High'
}

export const GENDER = {
    Male: 1,
    Female: 0
}

export const EDUCATION_BACKGROUND = {
    'Life Sciences': 5,
    Medical: 4,
    Marketing: 3,
    'Technical Degree': 2,
    Other: 1,
    'Human Resources': 0,
}

export const MARITAL_STATUS = {
    Married: 2,
    Single: 1,
    Divorced: 0
}

export const EMP_DEPARTMENT = {
    Sales: 5,
    Development: 4,
    'Research & Development': 3,
    'Human Resources': 2,
    Finance: 1,
    'Data Science': 0,
}

export const EMP_JOB_ROLE = {
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
}

export const BUSINESS_TRAVEL_FREQUENCY = {
    // Travel_Rarely: 2,
    // Travel_Frequently: 1,
    // 'Non-Travel': 0
    'Travel Rarely': 2,
    'Travel Frequently': 1,
    'Non-Travel': 0
}

export const OVERTIME = {
    No:0,
    Yes:1
}

export const ATTRITION = {
    No: 0,
    Yes: 1
}

export const EMP_EDUCATION_LEVEL = {
    'Below College': 1,
    'College': 2,
    'Bachelor': 3,
    'Master': 4,
    'Doctor': 5,
}

export const EMP_ENVIRONMENT_SATISFACTION = {
    Low: 1,
    Medium: 2,
    High: 3,
    'Very High': 4,
}

export const EMP_JOB_INVOLVEMENT = {
    Low: 1,
    Medium: 2,
    High: 3,
    'Very High': 4,
}

export const EMP_JOB_LEVEL = {
    Entry: 1,
    Junior: 2,
    Experience: 3,
    Senior: 4,
    Expert: 5
}

export const EMP_JOB_SATISFACTION = {
    Low: 1,
    Medium: 2,
    High: 3,
    'Very High': 4,
}

export const EMP_RELATIONSHIP_SATISFACTION = {
    Low: 1,
    Medium: 2,
    High: 3,
    'Very High': 4,
}

export const EMP_WORKLIFE_BALANCE = {
    Bad: 1,
    Good: 2,
    Better: 3,
    Best: 4,
}

export const PERFORMANCE_RATING = {
    1: 'Low',
    2: 'Good',
    3: 'Excellent',
    4: 'Outstanding'
}


//? Necessary pdf settings (jspdf)
export function pdfSettings(canvas: any) {
    //? Necessary settings for generating PDF file using `jsPDF` && `html2canvas`
    let imgWidth: number = 208;
    let pageHeight: number =  295;
    // let heightLeft = imgHeight;
    let imgHeight: number = (canvas.height * imgWidth) / canvas.width;
    let position = 0;
    return { imgWidth, imgHeight, position, pageHeight };
}

//? Align the text at the middle of the page (jspdf)
export function alignTitleTextCenter(pdf: any, title: string, y_coordinate: number, drawALine: boolean = false, line_coordinate: number = 0){
    //* 1. Calculate title width
    const titleWidth = pdf.getStringUnitWidth(title) * pdf.getFontSize() / pdf.internal.scaleFactor;
    //* 2. Get page width
    const pageWidth = pdf.internal.pageSize.width;
    //* 3 Calculate title X-coordinate (at center)
    const titleX = (pageWidth - titleWidth) / 2;
    //* 4 Write the title at the center of the page
    pdf.text(title, titleX, y_coordinate);
    //* 5 Draw a line below the title
    if(drawALine){
        pdf.setLineWidth(0.1); // Line width
        pdf.line(10, y_coordinate + line_coordinate, pageWidth - 10, y_coordinate + line_coordinate); // Line coordinates    
    }
}

export function setFontSizeAndType(pdf: any, font_type: string, font_weight: string, font_size: number){
    pdf.setFont(font_type, font_weight);
    pdf.setFontSize(font_size);
}


