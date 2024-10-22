import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const FriendsHeaderRight = () => {
    return (
        <TouchableOpacity
            style={{ marginRight: 20 }}
        >
            <Ionicons
                name='filter-outline'
                size={24} color={'grey'}
            />
        </TouchableOpacity>
    )
}

export default FriendsHeaderRight;