import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useData } from '../../contexts/DataProvider';

const ProfileHeaderRight = () => {

    const { setOpenLogoutModel } = useData();

    return (
        <TouchableOpacity
            onPress={() => setOpenLogoutModel(true)}
            style={{ marginRight: 20 }}
        >
            <Ionicons
                name='log-out-outline'
                size={24} color={'#F43F5E'}
            />
        </TouchableOpacity>
    )
}

export default ProfileHeaderRight;