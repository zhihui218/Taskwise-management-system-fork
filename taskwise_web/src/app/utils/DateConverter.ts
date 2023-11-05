import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, format, isYesterday } from 'date-fns';

export class DateFormatter{
    //* Today Date
    today = new Date();
    // Date range of current week for current date
    thisWeek: Date[] = [startOfWeek(new Date(this.today), { weekStartsOn: 1 }), endOfWeek(new Date(this.today), { weekStartsOn: 1 })];;
    // Date range of current month for current date
    thisMonth: Date[] = [startOfMonth(new Date(this.today)), endOfMonth(new Date(this.today))];;
    // * "This Week" graph's label
    weekDate: string[] = ['Mon', 'Tue', 'Wed', 'Thurs', 'Fri', 'Sat', 'Sun'];
    fullWeekDate: string[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    // * "This Month" graph's label
    monthDate: string[] = [];
    //* "This Year" graph's label
    yearDate: string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    longMonth = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    constructor(){ this.getDayOfMonth(); }

    getDayOfMonth(): void{
        const startDate = this.thisMonth[0].getDate();
        const endDate = this.thisMonth[1].getDate();
        // Retrieve the month of current date (0: January)
        const currentMonth = this.today.getMonth();
        // Store the formatted date of current month
        for(let i = startDate; i <= endDate; i++) this.monthDate.push(`${i} ${this.yearDate[currentMonth]}`)
    }

    formatDate(date: Date, dateFormat: string): string{
        return format(date, dateFormat);
    }

    isOverdue(due_date: string){
        const start = new Date(due_date).setHours(0,0,0,0);
        const end = new Date(this.today).setHours(0,0,0,0);
        return start < end;
    }
    
    isToday(due_date: string, today: Date){
        const start = new Date(due_date).setHours(0,0,0,0);
        const end = new Date(today).setHours(0,0,0,0);
        return start == end;
    }
    
    isThisWeek(due_date: string, thisWeek: any[]){
        const start = new Date(due_date).setHours(0,0,0,0);
        const startWeek = new Date(thisWeek[0]).setHours(0,0,0,0);
        const endWeek = new Date(thisWeek[1]).setHours(0,0,0,0);
        return startWeek < start && start  <= endWeek;
    }

    isThisMonth(due_date: string, thisMonth: any[]){
        const start = new Date(due_date).setHours(0,0,0,0);
        const startMonth = new Date(thisMonth[0]).setHours(0,0,0,0);
        const endMonth = new Date(thisMonth[1]).setHours(0,0,0,0);
        return startMonth < start && start <= endMonth;
    }

    
    countTimestamp(createdAt: string): string {
        const now = new Date();
        const createdAtDate = new Date(createdAt);
    
        const timeDifference = now.getTime() - createdAtDate.getTime();
    
        const minutes = Math.floor(timeDifference / (1000 * 60));
        if (minutes < 60) {
            if (minutes === 1) {
                return '1 minute ago';
            }
            return `${minutes} minutes ago`;
        }
    
        const hours = Math.floor(timeDifference / (1000 * 60 * 60));
        if (hours < 24) {
            if (hours === 1) {
                return '1 hour ago';
            }
            return `${hours} hours ago`;
        }
    
        const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
        if (days === 1) {
            return '1 day ago';
        }
        return `${days} days ago`;
    }

    checkChatDate(createdAt: string): string{
        if(this.isToday(createdAt, this.today)){
            return "Today";
        }
        else if(isYesterday(new Date(createdAt))){
            return "Yesterday"; 
        }
        else if(this.isThisWeek(createdAt, this.thisWeek)){
            return this.fullWeekDate[new Date(createdAt).getDay()];
        }
        else{ return format(new Date(createdAt), 'dd/MM/yyyy')};
    }
    

    countOverdueDays(due_date: string): number{
        const start = new Date(due_date);
        const end = new Date(this.today);

        // Set the time components to 00:00:00 for both dates
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);

        // Calculate the difference in milliseconds
        const differenceMs = end.getTime() - start.getTime();

        // Convert the difference to days
        const days = Math.floor(differenceMs / (1000 * 60 * 60 * 24));

        return days;
    }

    //? Return the 'Hour' for task & ticket
    transformToHours(day: number, hour: number, minute: number): number{
        return (day * 24) + hour + (minute / 60);
    }

    //? Return the 'day', 'hour', 'minute' based on the `estimatedCompletedHour` field of a task / ticket
    transformToDayAndHourAndMinute(estimatedCompletedHour: number): any {
        const days = Math.floor(estimatedCompletedHour / 24);
        const remainingHours = estimatedCompletedHour % 24;
        const hours = Math.floor(remainingHours);
        const minutes = Math.round((remainingHours - hours) * 60);

        return { day: days, hour: hours, minute: minutes };
    }

    //? Calculate the number of year the engineer working in the company
    calculateYearOfExperience(joining_date: string){
        const currentDate = new Date();
        const timeDifference = currentDate.getTime() - new Date(joining_date).getTime();
        const yearsOfExperience = timeDifference / (365 * 24 * 60 * 60 * 1000); // Calculate years
        return parseFloat(yearsOfExperience.toFixed(1));
    }

    get todayDate() { return this.today };
    get startDayOfMonth() { return this.thisMonth[0] };
    get currentLongMonth() { return this.longMonth[this.today.getMonth()] };

}