import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'react-native';
import AuthNavigation from './AuthNavigation';
import MainNavigation from './MainNavigation';
import { useAuth } from '../contexts/AuthProvider';

const RootNavigation = () => {

    const { auth } = useAuth();

    return (
        <NavigationContainer>
            {auth?.accessToken ? <MainNavigation /> : <AuthNavigation />}
            <StatusBar barStyle={"dark-content"} backgroundColor={"#fff"} />
        </NavigationContainer>
    );
};

export default RootNavigation;