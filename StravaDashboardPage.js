import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    ScrollView,
    Dimensions,
} from 'react-native';
import { getStravaActivities } from './strava';

const screenWidth = Dimensions.get('window').width;

function formatDuration(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
}

function formatDistance(meters) {
    const miles = meters / 1609.34;
    return miles.toFixed(1) + ' mi';
}

function formatHeartRate(hr) {
    return hr.toFixed(0) + ' hr';
}

export default function StravaDashboard() {
    const [loading, setLoading] = useState(true);
    const [activities, setActivities] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchActivities() {
            try {
                const data = await getStravaActivities({ perPage: 200 }); // adjust limit
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
    if (error) return <View style={styles.container}><Text style={styles.error}>{error}</Text></View>;

    const now = new Date();

    // Weekly boundaries
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());

    // Yearly boundaries
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    let weekStats = { activities: 0, distance: 0, time: 0 };
    let yearStats = { activities: 0, distance: 0, time: 0 };

    activities.forEach((a) => {
        const date = new Date(a.start_date);
        if (date >= startOfYear) {
            yearStats.activities++;
            yearStats.distance += a.distance || 0;
            yearStats.time += a.moving_time || 0;
        }
        if (date >= startOfWeek) {
            weekStats.activities++;
            weekStats.distance += a.distance || 0;
            weekStats.time += a.moving_time || 0;
        }
    });

    const top3 = [...activities]
        .sort((a, b) => new Date(b.start_date) - new Date(a.start_date))
        .slice(0, 3);

    const renderBubbleSet = (label, stats, color) => (
        <View style={styles.bubbleSet}>
            <Text style={[styles.bubbleSetTitle, { color }]}>{label}</Text>
            <View style={styles.bubbleRow}>
                <View style={[styles.bubble, { backgroundColor: color }]}>
                    <Text style={styles.bubbleNumber}>{stats.activities}</Text>
                    <Text style={styles.bubbleLabel}>Activities</Text>
                </View>
                <View style={[styles.bubble, { backgroundColor: color }]}>
                    <Text style={styles.bubbleNumber}>
                        {(stats.distance / 1609.34).toFixed(1)}
                    </Text>
                    <Text style={styles.bubbleLabel}>Miles</Text>
                </View>
                <View style={[styles.bubble, { backgroundColor: color }]}>
                    <Text style={styles.bubbleNumber}>
                        {(stats.time / 3600).toFixed(1)}
                    </Text>
                    <Text style={styles.bubbleLabel}>Hours</Text>
                </View>
            </View>
        </View>
    );

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.title}>Top 3 Recent Activities</Text>
            <FlatList
                data={top3}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.activityItem}>
                        <Text style={styles.activityName}>{item.name} - {item.type}</Text>
                        <Text style={styles.activityDetails}>
                            {new Date(item.start_date).toLocaleDateString()} | {formatDistance(item.distance)} | {formatHeartRate(item.average_heartrate)} | {formatDuration(item.moving_time) }
                        </Text>
                    </View>
                )}
            />

            {renderBubbleSet('This Week', weekStats, '#3b82f6')}
            {renderBubbleSet('This Year', yearStats, '#10b981')}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f4f8' },
    content: { padding: 20 },
    title: {
        fontSize: 22,
        fontWeight: '800',
        color: '#1e40af',
        marginBottom: 16,
    },
    activityItem: {
        backgroundColor: '#e0e7ff',
        borderRadius: 10,
        padding: 14,
        marginBottom: 12,
    },
    activityName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1e3a8a',
    },
    activityDetails: {
        fontSize: 14,
        color: '#475569',
        marginTop: 4,
    },
    bubbleSet: {
        marginTop: 28,
    },
    bubbleSetTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 12,
        textAlign: 'center',
    },
    bubbleRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    bubble: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 5,
    },
    bubbleNumber: {
        fontSize: 24,
        fontWeight: '700',
        color: 'white',
    },
    bubbleLabel: {
        fontSize: 14,
        color: '#f0fdf4',
    },
    error: { color: 'red', fontSize: 18 },
    loader: { flex: 1, justifyContent: 'center' },
});
