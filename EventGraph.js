import React from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

export default function EventGraph({ events }) {
    // Count how many events occurred in each hour (0-23)
    const hours = Array(24).fill(0);
    events.forEach(event => {
        const hour = new Date(event.timestamp).getHours();
        hours[hour]++;
    });

    const screenWidth = Dimensions.get('window').width - 32;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Events per Hour</Text>
            <LineChart
                data={{
                    labels: hours.map((_, i) => i.toString()),
                    datasets: [{ data: hours }],
                }}
                width={screenWidth}
                height={220}
                chartConfig={{
                    backgroundColor: '#1e3a8a',
                    backgroundGradientFrom: '#1e3a8a',
                    backgroundGradientTo: '#3b82f6',
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                    style: { borderRadius: 16 },
                    propsForDots: {
                        r: '5',
                        strokeWidth: '2',
                        stroke: '#ffffff',
                    },
                }}
                bezier
                style={{ borderRadius: 16 }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 10,
        color: '#1e3a8a',
    },
});
