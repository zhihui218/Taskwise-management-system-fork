export interface ChatPostDTO{
    sender_id: string;
    receiver_id: string;
    ticket_id: string;
    message: string;
}

export interface ChatDTO{
    sender_id: string;
    receiver_id: string;
    ticket_id: string;
    message: string;
    //? 'Date' if sender send message
    //? 'string' if receiver receive message
    createdAt?: string;
}

export interface ChatDeleteDTO{
    user_id: string;
    ticket_id: string;
    receiver_id: string;
}

export interface ChatPaginateDTO{
    docs: ChatDTO[],
    previousPage: boolean;
}

export interface ChatUnreadDTO{
    sender_id: string,
    sender_name?: string,
    sender_profile?: Map<String, String>;
    ticket_id: string,
    ticket_name: string,
    unreadCount: number
}