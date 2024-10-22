import { View, Text, ScrollView } from 'react-native';
import { Friend } from '../types';
import { useAuth } from '../contexts/AuthProvider';
import FriendCard from '../components/friends/FriendCard';

const Friends: React.FC = () => {

    const { auth } = useAuth();

    return (
        <View
            style={{
                flex: 1,
                backgroundColor: '#fff'
            }}
        >
            {
                auth?.user?.friends.length === 0 ? (
                    <View
                        style={{
                            flex: 1,
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}
                    >
                        <Text>You don't have friends.</Text>
                    </View>
                )
                    : (
                        <ScrollView style={{ width: '100%' }} >
                            {
                                auth?.user?.friends?.map((user: Friend) => (
                                    <FriendCard key={user.id} user={user} />
                                ))
                            }
                        </ScrollView>
                    )
            }
        </View>
    );
};

export default Friends;