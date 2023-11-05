import { UserGetDTO } from "../modules/auth"
import { NotificationGetDTO } from "./NotificationDTO"
import { ProjectGetDTO } from "./ProjectDTO"
import { TaskGetDTO } from "./TaskDTO"
import { TicketGetDTO } from "./TicketDTO"

export interface PaginateGetDTO{
    numOfDocs: number,
    docs: ProjectGetDTO[] | TaskGetDTO[] | TicketGetDTO[] | UserGetDTO[] | NotificationGetDTO[],
    nextPage?: number,
    previousPage?: number,
    limit?: number
}