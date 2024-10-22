import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useData } from '../contexts/DataProvider';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { SearchedUser } from '../types';
import SearchCard from '../components/search/SearchCard';

const Search = () => {

    const { searchTextValue } = useData();

    if (!searchTextValue) {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#fff',
                }}
            >
                <Text>Search people by their username.</Text>
            </View>
        );
    }

    const { data, isFetching } = useQuery({
        queryKey: ['search-users', searchTextValue],
        queryFn: async () => {
            const response = await axios.get(`/api/v1/users/search-users?query=${searchTextValue}`);
            const { users, success } = response.data;
            if (success) {
                return users;
            } else {
                return [];
            }
        },
        staleTime: 60000
    });


    return (
        <View
            style={{
                flex: 1,
                backgroundColor: '#fff'
            }}
        >
            {
                data?.length === 0 ? (
                    <View
                        style={{
                            flex: 1,
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}
                    >
                        <Text>No results found.</Text>
                    </View>
                )
                    : isFetching ? (
                        <View
                            style={{
                                flex: 1,
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}
                        >
                            <ActivityIndicator size={'large'} color={'grey'} />
                        </View>
                    )
                        : (
                            <ScrollView style={{ width: '100%' }} >
                                {
                                    data?.map((user: SearchedUser) => (
                                        <SearchCard key={user.id} user={user} />
                                    ))
                                }
                            </ScrollView>
                        )
            }
        </View>
    )
}

export default Search;