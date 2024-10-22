import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AuthProvider from './AuthProvider';
import DataProvider from './DataProvider';
import SocketProvider from './SocketProvider';

const queryClient = new QueryClient();

const Providers: React.FC<React.PropsWithChildren> = ({ children }) => {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <SocketProvider>
                    <DataProvider>
                        {children}
                    </DataProvider>
                </SocketProvider>
            </AuthProvider>
        </QueryClientProvider>
    );
};

export default Providers;