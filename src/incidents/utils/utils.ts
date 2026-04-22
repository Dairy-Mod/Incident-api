import { envs } from 'src/config/envs';

export const generateMapBoxStaticImage = (lat: number, lon: number): string => {
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    throw new Error('Latitude and longitude must be valid numbers.');
  }

  const accessToken = envs.MAPBOX_TOKEN;
  const zoom = 13;
  const width = 800;
  const height = 600;

  return `https://api.mapbox.com/styles/v1/mapbox/light-v11/static/pin-s-l+000(${lon},${lat})/${lon},${lat},${zoom}/${width}x${height}?access_token=${encodeURIComponent(accessToken)}`;
};
