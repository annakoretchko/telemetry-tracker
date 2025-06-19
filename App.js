import React, { useState, useRef, useEffect } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    FlatList,
    StyleSheet,
    Alert,
    TouchableOpacity,
    Animated,
    Easing,
} from 'react-native';
import { sendEvent } from './api';
import EventGraph from './EventGraph';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

function EventItem({ item }) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(-20)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 400,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 400,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }),
        ]).start();
    }, [fadeAnim, slideAnim]);

    return (
        <Animated.View
            style={[
                styles.eventItem,
                {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                },
            ]}
        >
            <Text style={styles.eventText}>
                [{new Date(item.timestamp).toLocaleTimeString()}] {item.type}
            </Text>
        </Animated.View>
    );
}

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
                <AnimatedTouchable
                    style={[styles.button, styles.trackButton]}
                    activeOpacity={0.7}
                    onPress={trackEvent}
                >
                    <Text style={styles.buttonText}>Track Event</Text>
                </AnimatedTouchable>

                <AnimatedTouchable
                    style={[styles.button, styles.clearButton]}
                    activeOpacity={0.7}
                    onPress={clearEvents}
                >
                    <Text style={styles.buttonText}>Clear Events</Text>
                </AnimatedTouchable>
            </View>

            <Text style={styles.logTitle}>Sent Events:</Text>

            <FlatList
                data={events}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => <EventItem item={item} />}
                ListEmptyComponent={<Text style={styles.empty}>No events tracked yet.</Text>}
                contentContainerStyle={events.length === 0 && { flex: 1, justifyContent: 'center' }}
            />
            <EventGraph events={events} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
        paddingHorizontal: 24,
        paddingTop: 40,
    },
    title: {
        fontSize: 30,
        fontWeight: '800',
        color: '#4338ca',
        textAlign: 'center',
        marginBottom: 28,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 32,
    },
    button: {
        flex: 1,
        marginHorizontal: 10,
        paddingVertical: 14,
        borderRadius: 12,
        shadowColor: '#4338ca',
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    trackButton: {
        backgroundColor: '#4f46e5',
    },
    clearButton: {
        backgroundColor: '#e11d48',
    },
    buttonText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 16,
        textAlign: 'center',
    },
    logTitle: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 20,
        color: '#374151',
    },
    eventItem: {
        backgroundColor: '#ffffff',
        padding: 16,
        marginBottom: 12,
        borderRadius: 14,
        shadowColor: '#00000020',
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
    },
    eventText: {
        fontSize: 16,
        color: '#1f2937',
    },
    empty: {
        fontStyle: 'italic',
        color: '#9ca3af',
        fontSize: 18,
        textAlign: 'center',
    },
});
