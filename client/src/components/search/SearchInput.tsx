import { View, TextInput, TouchableOpacity, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useData } from '../../contexts/DataProvider';
import { useState } from 'react';

const SearchInput: React.FC = () => {

    const [searchText, setSearchText] = useState('');
    const { setSearchTextValue } = useData();

    const handleSearch = () => {
        setSearchTextValue(searchText);
        Keyboard.dismiss();
    };

    return (
        <View
            style={{
                width: '100%',
                backgroundColor: '#f2f2f2',
                paddingVertical: 5,
                paddingHorizontal: 20,
                borderRadius: 10,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
            <TextInput
                style={{
                    flex: 1,
                    paddingRight: 5,
                }}
                placeholder="Search by user's username."
                value={searchText}
                onChangeText={(text) => setSearchText(text)}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
            />
            <TouchableOpacity onPress={() => handleSearch()} >
                <Ionicons name='search-outline' size={24} color={'grey'} />
            </TouchableOpacity>
        </View>
    )
}

export default SearchInput;