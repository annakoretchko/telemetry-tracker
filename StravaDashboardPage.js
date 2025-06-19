import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { getStravaActivities } from './strava';

export default function StravaDashboard() {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchActivities() {
            const data = await getStravaActivities({ perPage: 10 });
            setActivities(data);
            setLoading(false);
        }
        fetchActivities();
    }, []);

    if (loading) return <Text style={styles.loading}>Loading activities...</Text>;

    if (activities.length === 0)
        return <Text style={styles.empty}>No activities found.</Text>;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Strava Activities</Text>
            <FlatList
                data={activities}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.activityItem}>
                        <Text style={styles.activityName}>{item.name}</Text>
                        <Text>{new Date(item.start_date).toLocaleDateString()}</Text>
                        <Text>Distance: {(item.distance / 1000).toFixed(2)} km</Text>
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    title: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
    loading: { marginTop: 50, textAlign: 'center' },
    empty: { marginTop: 50, textAlign: 'center', fontStyle: 'italic' },
    activityItem: {
        padding: 12,
        marginBottom: 10,
        backgroundColor: '#e0e7ff',
        borderRadius: 8,
    },
    activityName: { fontWeight: '600', fontSize: 16 },
});
