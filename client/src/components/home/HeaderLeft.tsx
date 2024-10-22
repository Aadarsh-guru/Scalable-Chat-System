import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const HomeHeaderLeft = () => {
    return (
        <View style={{
            marginLeft: 20,
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'row',
            gap: 5,
        }} >
            <Ionicons style={{ marginTop: 5 }} name='chatbox' size={24} color='#F43F5E' />
            <Text style={{
                fontSize: 24,
                color: 'grey',
                fontWeight: '500',
            }} >
                ChatApp
            </Text>
        </View>
    )
}

export default HomeHeaderLeft;