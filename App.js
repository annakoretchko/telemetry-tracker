import React, { useState } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    Button,
    FlatList,
    StyleSheet,
    Alert,
} from 'react-native'
import { sendEvent } from './api';  // Import the API helper


export default function App() {
    const [events, setEvents] = useState([]);

    const trackEvent = async () => {
        const newEvent = {
            id: Date.now().toString(),
            type: 'UserAction',
            timestamp: new Date().toISOString(),
        };

        try {
            await sendEvent(newEvent);
            setEvents([newEvent, ...events]);
            Alert.alert('Event Tracked', `Type: ${newEvent.type}\nTime: ${newEvent.timestamp}`);
        } catch (error) {
            Alert.alert('Error', 'Failed to send event.');
        }
    };

    const clearEvents = () => setEvents([]);

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Telemetry Tracker Demo</Text>

            <View style={styles.buttonContainer}>
                <Button title="Track Event" onPress={trackEvent} />
                <View style={{ height: 12 }} />
                <Button title="Clear Events" color="red" onPress={clearEvents} />
            </View>

            <Text style={styles.logTitle}>Sent Events:</Text>

            <FlatList
                data={events}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <Text style={styles.eventItem}>
                        - [{item.timestamp}] {item.type}
                    </Text>
                )}
                ListEmptyComponent={<Text style={styles.empty}>No events tracked yet.</Text>}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#f0f4f8' },
    title: { fontSize: 28, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
    buttonContainer: { marginBottom: 30 },
    logTitle: { fontSize: 20, fontWeight: '600', marginBottom: 12 },
    eventItem: { fontSize: 16, marginBottom: 8 },
    empty: { fontStyle: 'italic', color: '#666' },
});