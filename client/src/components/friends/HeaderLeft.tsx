import { View, Text } from 'react-native';
import { useAuth } from '../../contexts/AuthProvider';

const FriendsHeaderLeft = () => {

    const { auth } = useAuth();

    return (
        <View
            style={{
                marginLeft: 20
            }}
        >
            <Text
                style={{
                    fontSize: 20,
                    fontWeight: '600'
                }}
            >
                {auth?.user?.friends.length} friends
            </Text>
        </View>
    );
};

export default FriendsHeaderLeft;