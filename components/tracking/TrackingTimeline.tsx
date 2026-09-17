import { StyleSheet, Text, View } from 'react-native';

import { ParcelTrackingEvent } from '@/types/parcel';
import { formatDateTime } from '@/utils/date';

export function TrackingTimeline({ events }: { events: ParcelTrackingEvent[] }) {
  return (
    <View style={styles.container}>
      {events.length === 0 ? <Text style={styles.empty}>No tracking history yet.</Text> : null}
      {events.map((event, index) => (
        <View key={`${event.status}-${index}`} style={styles.row}>
          <View style={styles.lineColumn}>
            <View style={styles.dot} />
            {index < events.length - 1 ? <View style={styles.line} /> : null}
          </View>
          <View style={styles.content}>
            <Text style={styles.status}>{event.status}</Text>
            <Text style={styles.time}>{formatDateTime(event.timestamp)}</Text>
            {event.latitude && event.longitude ? (
              <Text style={styles.coords}>{event.latitude.toFixed(5)}, {event.longitude.toFixed(5)}</Text>
            ) : null}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 10 },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  lineColumn: { width: 22, alignItems: 'center', marginRight: 10 },
  dot: { width: 12, height: 12, borderRadius: 999, backgroundColor: '#2563eb', marginTop: 6 },
  line: { width: 2, flex: 1, backgroundColor: '#cbd5e1', marginTop: 4 },
  content: { flex: 1, paddingBottom: 16 },
  status: { fontWeight: '700', color: '#0f172a' },
  time: { color: '#64748b', marginTop: 4, fontSize: 12 },
  coords: { color: '#475569', marginTop: 4, fontSize: 12 },
  empty: { color: '#64748b' },
});
