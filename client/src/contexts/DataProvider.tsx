import { createContext, useContext, useEffect, useState } from "react";
import { Conversation, DataContextType, Message } from "../types";
import { useSocket } from "./SocketProvider";
import { useAuth } from "./AuthProvider";

const DataContext = createContext<DataContextType>({
    openLogoutModel: false,
    setOpenLogoutModel: () => { },
    searchTextValue: '',
    setSearchTextValue: () => { },
    conversations: [],
    setConversations: () => { },
});

export const useData = () => useContext(DataContext);

const DataProvider: React.FC<React.PropsWithChildren> = ({ children }) => {

    const [searchTextValue, setSearchTextValue] = useState<string>('');
    const [openLogoutModel, setOpenLogoutModel] = useState<boolean>(false);
    const [conversations, setConversations] = useState<Conversation[]>([]);

    const { socket } = useSocket();
    const { auth } = useAuth();

    useEffect(() => {

        if (!socket) return;

        const handleReceiveMessage = (message: Message) => {
            setConversations(prevConversations => {
                const updatedConversations = prevConversations.map(conversation => {
                    if (conversation.id === message.conversationId) {
                        return {
                            ...conversation,
                            messages: [...conversation.messages, message],
                        };
                    }
                    return conversation;
                });
                return updatedConversations;
            });
        };

        const handleAddConversation = (newConversation: Conversation) => {
            if (newConversation?.users?.some(u => u.id === auth?.user?.id)) {
                setConversations(prevConversations => {
                    const conversationExists = prevConversations.some(
                        conversation => conversation.id === newConversation.id
                    );
                    if (!conversationExists) {
                        return [...prevConversations, newConversation];
                    }
                    return prevConversations;
                });
            }
        };

        const handleRemoveConversation = (removedConversation: Conversation) => {
            setConversations(prev => prev.filter(conversation => conversation.id !== removedConversation.id));
        };


        const handleAddUserConversation = (newConversation: Conversation) => {
            if (newConversation?.users?.some(u => u.id === auth?.user?.id)) {
                setConversations(prevConversations => {
                    const conversationExists = prevConversations.some(
                        conversation => conversation.id === newConversation.id
                    );
                    if (!conversationExists) {
                        return [...prevConversations, newConversation];
                    }
                    return prevConversations;
                });
            }
        };

        const handleRemoveUserConversation = ({ conversation, userId }: { conversation: Conversation, userId: string }) => {
            if (userId === auth?.user?.id) {
                setConversations(prev => prev.filter(con => con.id !== conversation.id));
            }
        };

        socket.on('event:add-user', handleAddUserConversation);
        socket.on('event:remove-user', handleRemoveUserConversation);
        socket.on('event:add-conversation', handleAddConversation)
        socket.on('event:remove-conversation', handleRemoveConversation)
        socket.on('event:receive-message', handleReceiveMessage);

        return () => {

            socket.off('event:add-user', handleAddUserConversation);
            socket.off('event:remove-user', handleRemoveUserConversation);
            socket.off('event:add-conversation', handleAddConversation);
            socket.off('event:remove-conversation', handleRemoveConversation);
            socket.off('event:receive-message', handleReceiveMessage);

        };
    }, [socket]);

    return (
        <DataContext.Provider
            value={{
                openLogoutModel, setOpenLogoutModel,
                searchTextValue, setSearchTextValue,
                conversations, setConversations,
            }}
        >
            {children}
        </DataContext.Provider>
    )
}

export default DataProvider;