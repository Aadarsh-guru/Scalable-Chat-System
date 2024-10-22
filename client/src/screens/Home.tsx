import { View, Text, ScrollView, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { Conversation } from '../types';
import ConversationCard from '../components/home/ConversationCard';
import { useData } from '../contexts/DataProvider';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useState } from 'react';

const Home: React.FC = () => {

    const queryClient = useQueryClient();
    const { conversations, setConversations } = useData();
    const [refreshing, setRefreshing] = useState(false);

    const { isLoading } = useQuery({
        queryKey: ['conversations'],
        queryFn: async () => {
            const response = await axios.get(`/api/v1/conversations/get-all`);
            if (response.data?.success) {
                setConversations([...response.data.conversations]);
                return response.data.conversations;
            } else {
                return [];
            }
        },
        staleTime: Infinity
    });

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await queryClient.invalidateQueries({
                queryKey: ['conversations']
            });
            return true;
        } catch (error: any) {
            return Alert.alert('something went wrong.');
        } finally {
            setRefreshing(false);
        };
    };

    return (
        <View
            style={{
                flex: 1,
                backgroundColor: '#fff'
            }}
        >
            {
                isLoading ? (
                    <View
                        style={{
                            flex: 1,
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}
                    >
                        <ActivityIndicator size={'large'} color={'#F43F5E'} />
                    </View>
                )
                    :
                    conversations?.length === 0 ? (
                        <View
                            style={{
                                flex: 1,
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}
                        >
                            <Text>You don't any conversation yet.</Text>
                        </View>
                    )
                        : (
                            <ScrollView
                                refreshControl={
                                    <RefreshControl
                                        refreshing={refreshing}
                                        onRefresh={onRefresh}
                                    />
                                }
                                style={{ width: '100%' }}
                            >
                                {
                                    conversations?.map((conversation: Conversation) => (
                                        <ConversationCard key={conversation.id} conversationId={conversation.id} />
                                    ))
                                }
                            </ScrollView>
                        )
            }
        </View>
    );
};

export default Home;