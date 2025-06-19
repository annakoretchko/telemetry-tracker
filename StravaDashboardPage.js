import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    Dimensions,
} from 'react-native';
import { getStravaActivities } from './strava';

const screenWidth = Dimensions.get('window').width;

// Helper: Format duration in hh:mm:ss
function formatDuration(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h, m, s]
        .map((v) => v.toString().padStart(2, '0'))
        .join(':');
}

// Helper: Format distance (meters to miles)
function formatDistance(meters) {
    const miles = meters / 1609.34;
    return miles.toFixed(2) + ' mi';
}

export default function StravaDashboard() {
    const [loading, setLoading] = useState(true);
    const [activities, setActivities] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchActivities() {
            try {
                // Fetch last 30 activities (or fewer)
                const data = await getStravaActivities({ perPage: 30 });
                setActivities(data);
            } catch (err) {
                setError('Failed to load activities');
            } finally {
                setLoading(false);
            }
        }
        fetchActivities();
    }, []);

    if (loading) return <ActivityIndicator size="large" style={styles.loader} />;
    if (error)
        return (
            <View style={styles.container}>
                <Text style={styles.error}>{error}</Text>
            </View>
        );

    // Sort descending by date
    const sortedActivities = [...activities].sort(
        (a, b) => new Date(b.start_date) - new Date(a.start_date)
    );

    // Top 3 most recent
    const top3 = sortedActivities.slice(0, 3);

    // Calculate weekly stats (this week starting Sunday)
    const now = new Date();
    const firstDayOfWeek = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - now.getDay()
    );

    let weekActivities = 0;
    let weekDistance = 0; // meters
    let weekMovingTime = 0; // seconds

    activities.forEach((activity) => {
        const activityDate = new Date(activity.start_date);
        if (activityDate >= firstDayOfWeek) {
            weekActivities++;
            weekDistance += activity.distance || 0;
            weekMovingTime += activity.moving_time || 0;
        }
    });

    // Bubble sizes (scale for better visibility)
    const bubbleSizes = {
        activities: 70,
        distance: 70,
        time: 70,
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Top 3 Recent Activities</Text>
            <FlatList
                data={top3}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.activityItem}>
                        <Text style={styles.activityName}>
                            {item.name} - {item.type}
                        </Text>
                        <Text style={styles.activityDetails}>
                            Date: {new Date(item.start_date).toLocaleDateString()}{' '}
                            | Distance: {formatDistance(item.distance)} | Time:{' '}
                            {formatDuration(item.moving_time)}
                        </Text>
                    </View>
                )}
            />

            <Text style={[styles.title, { marginTop: 40 }]}>
                This Week Summary
            </Text>

            <View style={styles.bubbleContainer}>
                <View style={[styles.bubble, { width: bubbleSizes.activities, height: bubbleSizes.activities }]}>
                    <Text style={styles.bubbleNumber}>{weekActivities}</Text>
                    <Text style={styles.bubbleLabel}>Activities</Text>
                </View>

                <View style={[styles.bubble, { width: bubbleSizes.distance, height: bubbleSizes.distance }]}>
                    <Text style={styles.bubbleNumber}>{(weekDistance / 1609.34).toFixed(1)}</Text>
                    <Text style={styles.bubbleLabel}>Miles</Text>
                </View>

                <View style={[styles.bubble, { width: bubbleSizes.time, height: bubbleSizes.time }]}>
                    <Text style={styles.bubbleNumber}>{(weekMovingTime / 3600).toFixed(1)}</Text>
                    <Text style={styles.bubbleLabel}>Hours</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#1e3a8a',
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 16,
    },
    activityItem: {
        backgroundColor: '#2563eb',
        borderRadius: 12,
        padding: 14,
        marginBottom: 12,
    },
    activityName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
    },
    activityDetails: {
        fontSize: 14,
        color: '#d1d5db',
        marginTop: 4,
    },
    bubbleContainer: {
        marginTop: 30,
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    bubble: {
        backgroundColor: '#3b82f6',
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 12,
    },
    bubbleNumber: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 28,
    },
    bubbleLabel: {
        color: '#dbeafe',
        fontWeight: '600',
        fontSize: 14,
        marginTop: 4,
    },
    error: {
        color: 'red',
        fontSize: 18,
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
    },
});
