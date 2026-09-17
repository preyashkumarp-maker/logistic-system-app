export const APP_CONFIG = {
  trackingUpdateIntervalMs: Number(process.env.EXPO_PUBLIC_TRACKING_UPDATE_INTERVAL_MS ?? 15000),
  trackingDistanceFilter: Number(process.env.EXPO_PUBLIC_TRACKING_DISTANCE_FILTER ?? 25),
  defaultPageSize: 20,
};
