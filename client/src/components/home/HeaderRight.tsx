import { TouchableOpacity } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const HomeHeaderRight = () => {

    const navigation = useNavigation();

    return (
        <TouchableOpacity
            // @ts-expect-error
            onPress={() => navigation.navigate('Create-Group')}
            style={{
                marginRight: 20
            }}
        >
            <AntDesign
                name='addusergroup'
                size={24}
                color='grey'
            />
        </TouchableOpacity>
    )
}

export default HomeHeaderRight;