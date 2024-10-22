export type Friend = {
    id: string;
    fullName: string;
    username: string;
    email: string;
    profile: string;
    about: string;
    userId: string;
    friendId: string;
}

export type Conversation = {
    id: string;
    isGroup: boolean;
    groupName: string;
    groupAbout: string;
    groupProfile: string;
    groupAdminId: string;
    users: {
        id: string;
        fullName: string;
        username: string;
        about: string;
        profile: string;
        email: string;
    }[];
    messages: Message[];
    createdAt: string;
    updatedAt: string;
}

export type User = {
    id: string;
    fullName: string;
    username: string;
    email: string;
    profile: string;
    about: string;
    friends: Friend[];
    createdAt: string;
};

export type SearchedUser = {
    id: string;
    fullName: string;
    username: string;
    about: string;
    profile: string;
    email: string;
};

export type Message = {
    id: string;
    conversationId: string;
    messageType: "TEXT" | "AUDIO" | "VIDEO" | "DOCUMENT" | "IMAGE";
    body: string;
    senderId: string;
    createdAt: string;
    updatedAt: string;
};

export type DataContextType = {
    openLogoutModel: boolean;
    setOpenLogoutModel: (open: boolean) => void;
    searchTextValue: string;
    setSearchTextValue: (value: string) => void;
    conversations: Conversation[];
    setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
};