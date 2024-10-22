import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from "jwt-decode";
import { decode, encode } from 'base-64';
import LoadingScreen from "../screens/Loading";
import { User } from "../types";

interface handleLoginProps {
    accessToken: string;
    refreshToken: string;
    user: User | null;
};

interface AuthStateProps {
    user: User | null;
    accessToken: string;
    refreshToken: string;
};

interface AuthContextProps {
    auth: AuthStateProps;
    setAuth: React.Dispatch<React.SetStateAction<AuthStateProps>>;
    handleLogin: (props: handleLoginProps) => void;
    handleLogout: () => void;
};

const AuthContext = createContext<AuthContextProps>({
    auth: {
        user: null,
        accessToken: "",
        refreshToken: ""
    },
    setAuth: () => { },
    handleLogin: () => { },
    handleLogout: () => { }
});

export const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }: { children: React.ReactNode }) => {

    const [loading, setLoading] = useState(true);
    const [auth, setAuth] = useState<AuthStateProps>({
        user: null,
        accessToken: "",
        refreshToken: ""
    });

    axios.defaults.baseURL = process.env.EXPO_PUBLIC_API_URL!
    axios.defaults.headers.common["Authorization"] = auth?.accessToken ? `Bearer ${auth.accessToken}` : "";
    axios.defaults.headers.common['resorce-access-key'] = process.env.EXPO_PUBLIC_RESORCE_ACCESS_KEY as string;

    if (!global.btoa) {
        global.btoa = encode;
    }

    if (!global.atob) {
        global.atob = decode;
    }

    useEffect(() => {
        const getLocalData = async () => {
            try {
                const dataToBeParsed = await AsyncStorage.getItem('auth');
                const storedAuth = await JSON.parse(dataToBeParsed!) as AuthStateProps;
                if (storedAuth) {
                    const decodedToken = jwtDecode(storedAuth?.accessToken);
                    const expiresAt = decodedToken?.exp;
                    const currentTime = Math.floor(Date.now() / 1000);
                    if (expiresAt! <= currentTime) {
                        // If access token has expired, refresh the token
                        await refreshToken();
                    } else {
                        setAuth({
                            accessToken: storedAuth.accessToken,
                            refreshToken: storedAuth.refreshToken,
                            user: storedAuth.user,
                        });
                    }
                }

            } catch (error) {
                await handleLogout();
            } finally {
                setLoading(false); // Set loading to false once the data is retrieved
            }
        };
        getLocalData();
    }, []);

    const handleLogin = async ({ accessToken, refreshToken, user }: handleLoginProps) => {
        setAuth({ accessToken, refreshToken, user });
        await AsyncStorage.setItem('auth', JSON.stringify({ accessToken, refreshToken, user }));
        return;
    };

    const refreshToken = async () => {
        try {
            const { data } = await axios.post("/api/v1/auth/refresh", {
                refreshToken: auth?.refreshToken,
            });
            const { accessToken, refreshToken, user, success } = data;
            if (success) {
                setAuth({ accessToken, refreshToken, user });
                await AsyncStorage.setItem('auth', JSON.stringify({ accessToken, refreshToken, user }));
            };
        } catch (error) {
            throw error;
        };
    };

    const handleLogout = async () => {
        try {
            const { data } = await axios.post("/api/v1/auth/logout");
            if (data?.success) {
                setAuth({ accessToken: "", refreshToken: "", user: null });
                return await AsyncStorage.removeItem('auth');
            }
        } catch (error) {
            throw error;
        }
    };

    if (loading) {
        return <LoadingScreen />;
    };

    return (
        <AuthContext.Provider
            value={{
                auth, setAuth,
                handleLogin,
                handleLogout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;