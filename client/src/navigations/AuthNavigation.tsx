import { createStackNavigator, StackNavigationOptions } from '@react-navigation/stack';
import Login from '../screens/Login';
import Register from '../screens/Register';
import Verify from '../screens/Verify';
import ForgetPassword from '../screens/ForgetPassword';

type AuthStackParamList = {
    Login: React.FC;
    Register: React.FC;
};

const AuthNavigation = () => {

    const Stack = createStackNavigator<AuthStackParamList>();

    const screenOptions: StackNavigationOptions = {
        headerShown: false,
        cardStyleInterpolator: ({ current, layouts }) => {
            return {
                cardStyle: {
                    transform: [
                        {
                            translateX: current.progress.interpolate({
                                inputRange: [0, 1],
                                outputRange: [layouts.screen.width, 0],
                            }),
                        },
                    ],
                },
            };
        },
        transitionSpec: {
            open: { animation: 'timing', config: { duration: 300 } },
            close: { animation: 'timing', config: { duration: 300 } },
        },
    };

    return (
        <Stack.Navigator initialRouteName='Login' screenOptions={screenOptions}>
            <Stack.Screen name='Login' component={Login} />
            <Stack.Screen name='Register' component={Register} />
            {/* @ts-expect-error */}
            <Stack.Screen name='Forget-Password' component={ForgetPassword} />
            {/* @ts-expect-error */}
            <Stack.Screen name='Verify' component={Verify} />
        </Stack.Navigator>
    );
};

export default AuthNavigation;
