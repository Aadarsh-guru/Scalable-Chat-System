import { createStackNavigator } from '@react-navigation/stack';
import TabNavigation from './TabNavigation';
import Chat from '../screens/Chat';
import CreateGroup from '../screens/CreateGroup';
import EditProfile from '../screens/EditProfile';
import SearchProfile from '../screens/SearchProfile';
import FriendProfile from '../screens/FriendProfile';
import ViewMedia from '../screens/ViewMedia';
import GroupChat from '../screens/GroupChat';
import GroupInfo from '../screens/GroupInfo';

const MainNavigation = () => {

    const Stack = createStackNavigator();

    const horizontalSlideConfig = {
        gestureDirection: 'horizontal',
        transitionSpec: {
            open: { animation: 'timing', config: { duration: 300 } },
            close: { animation: 'timing', config: { duration: 300 } },
        },
        cardStyleInterpolator: ({ current, layouts }: { current: any, layouts: any }) => {
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
    };

    return (
        <Stack.Navigator initialRouteName='Main' >
            <Stack.Screen
                name='Main'
                options={{
                    headerShown: false
                }}
                component={TabNavigation} />
            <Stack.Screen
                name='Chat'
                // @ts-expect-error
                component={Chat}
                // @ts-expect-error
                options={horizontalSlideConfig}
            />
            <Stack.Screen
                name='Group-Chat'
                // @ts-expect-error
                component={GroupChat}
                // @ts-expect-error
                options={horizontalSlideConfig}
            />
            <Stack.Screen
                name='Create-Group'
                component={CreateGroup}
                // @ts-expect-error
                options={horizontalSlideConfig}
            />
            <Stack.Screen
                name='Group-Info'
                // @ts-expect-error
                component={GroupInfo}
                // @ts-expect-error
                options={horizontalSlideConfig}
            />
            <Stack.Screen
                name='Edit-Profile'
                component={EditProfile}
                // @ts-expect-error
                options={{
                    ...horizontalSlideConfig,
                    headerTitle: 'Edit Your Profile'
                }}
            />
            <Stack.Screen
                name='Search-Profile'
                component={SearchProfile}
                // @ts-expect-error
                options={{
                    ...horizontalSlideConfig,
                    headerTitle: 'Search Profile'
                }}
            />
            <Stack.Screen
                name='Friend-Profile'
                component={FriendProfile}
                // @ts-expect-error
                options={{
                    ...horizontalSlideConfig,
                    headerTitle: 'Friend Profile'
                }}
            />
            <Stack.Screen
                name='View-Media'
                // @ts-expect-error
                component={ViewMedia}
                // @ts-expect-error
                options={{
                    ...horizontalSlideConfig,
                }}
            />
        </Stack.Navigator>
    );
};

export default MainNavigation;
