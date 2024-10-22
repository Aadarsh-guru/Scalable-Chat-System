import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import Home from '../screens/Home';
import Search from '../screens/Search';
import Friends from '../screens/Friends';
import Profile from '../screens/Profile';
import HomeHeaderLeft from '../components/home/HeaderLeft';
import HomeHeaderRight from '../components/home/HeaderRight';
import SearchInput from '../components/search/SearchInput';
import FriendsHeaderLeft from '../components/friends/HeaderLeft';
import FriendsHeaderRight from '../components/friends/HeaderRight';
import ProfileHeaderLeft from '../components/profile/HeaderLeft';
import ProfileHeaderRight from '../components/profile/HeaderRight';

const TabNavigation = () => {

    const Tab = createBottomTabNavigator();

    return (
        <Tab.Navigator
            screenOptions={{
                tabBarHideOnKeyboard: true,
                tabBarActiveTintColor: '#F43F5E',
            }}
            initialRouteName='Home'
        >
            <Tab.Screen
                name='Home'
                component={Home}
                options={{
                    headerTitle: '',
                    headerLeft: HomeHeaderLeft,
                    headerRight: HomeHeaderRight,
                    tabBarIcon: ({ size, color }) => (
                        <Ionicons name='chatbubbles-outline' size={size} color={color} />
                    )
                }}
            />
            <Tab.Screen
                name='Search'
                component={Search}
                options={{
                    headerTitle: SearchInput,
                    headerTitleAlign: 'center',
                    tabBarIcon: ({ size, color }) => (
                        <Ionicons name='search-outline' size={size} color={color} />
                    ),
                }}
            />
            <Tab.Screen
                name='Friends'
                component={Friends}
                options={{
                    tabBarIcon: ({ size, color }) => (
                        <Ionicons name='people-outline' size={size} color={color} />
                    ),
                    headerTitle: '',
                    headerLeft: FriendsHeaderLeft,
                    headerRight: FriendsHeaderRight
                }}
            />
            <Tab.Screen
                name='Profile'
                component={Profile}
                options={{
                    tabBarIcon: ({ size, color }) => (
                        <Ionicons name='person-outline' size={size} color={color} />
                    ),
                    headerTitle: '',
                    headerLeft: ProfileHeaderLeft,
                    headerRight: ProfileHeaderRight,
                }}
            />
        </Tab.Navigator>
    )
}

export default TabNavigation;