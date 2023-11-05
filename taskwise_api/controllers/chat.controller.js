const ChatService = require("../services/chat.service");

exports.retrieveUnreadChat = async(req, res, next) => {
    try{
        const recipient_id = req.params._id;

        const unread_chats = await ChatService.retrieveUnreadChat(recipient_id);

        req.chats = unread_chats;

        //? Get chat details as well as formatting them
        next();

    }catch(error){
        console.error(error);
        res.status(500).json(undefined);
    }
}

exports.clearChat = async(req, res, next) => {
    try{
        const { user_id, ticket_id, receiver_id } = req.body;

        await ChatService.deleteChat(user_id, ticket_id, receiver_id);

        res.status(200).json(true);

    }catch(error){
        console.error("error: ", error);

        res.status(500).json(undefined);
    }
}

exports.markChatAsRead = async(req, res, next) => {
    try{
        const { ticket_id, receiver_id } = req.body;
        
        await ChatService.markChatAsRead(ticket_id, receiver_id);

        res.status(200).json(true);
    }catch(error){
        console.error(error);
        res.status(500).json(undefined);
    }
}

exports.markAllAsRead = async(req, res, next) => {
    try{
        const receiver_id = req.params._id;
        
        await ChatService.markAllAsRead(receiver_id);

        res.status(200).json(true);
    }catch(error){
        console.error(error);
        res.status(500).json(undefined);
    }
}

exports.retrieveChat = async(req, res, next) => {
    try{
        const ticket_id = req.params.ticket_id;
        const user_id = req.params.user_id;
        const page = parseInt(req.query.page);

        //? Check number of chat to determine whether 'hasPreviousChat'
        const totalCounts = await ChatService.totalCounts(ticket_id, user_id);

        //? Retrieve the chat history (from latest -> oldest)
        const chat_history = await ChatService.retrieveChatHistory(ticket_id, page, user_id);

        //? The older chat will be placed on top
        res.status(200).json({
            docs: chat_history.reverse(),
            previousPage: totalCounts > (page * 15)
        });
        
    }catch(error){
        console.error(error);
        res.status(500).json(undefined);
    }
}

exports.deleteTicketChat = async(ticket_id) =>{
    try{
        await ChatService.deleteChatByTicket(ticket_id);
    }catch(error){ throw error; }
}