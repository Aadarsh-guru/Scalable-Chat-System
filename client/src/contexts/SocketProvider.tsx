import { createContext, useContext, useEffect, useMemo } from "react";
import { Socket, io } from "socket.io-client";
import { useAuth } from "./AuthProvider";

type SocketContextType = {
    socket: Socket | null;
};

const SocketContext = createContext<SocketContextType>({
    socket: null
});

export const useSocket = () => useContext(SocketContext);

const SocketProvider: React.FC<React.PropsWithChildren> = ({ children }) => {

    const { auth } = useAuth();

    const socket = useMemo(() => {
        return io(process.env.EXPO_PUBLIC_API_URL as string, {
            withCredentials: true,
            auth: { accessToken: auth?.accessToken }
        });
    }, [auth?.accessToken]);

    useEffect(() => {
        return () => {
            socket.disconnect();
        };
    }, [socket]);

    return (
        <SocketContext.Provider value={{ socket }} >
            {children}
        </SocketContext.Provider>
    )
}

export default SocketProvider;