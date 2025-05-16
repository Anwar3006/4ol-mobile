export const everyDays100 = Array.from({length: 100}, (_, i) => i + 1);
export const howManyPerDaysTakeMedicine = Array.from(
  {length: 4},
  (_, i) => i + 1,
);

export const hours = Array.from({length: 4}, (_, i) => i);

export const trackLengthCycle = Array.from({length: 61}, (_, index) => ({
  label: `${index + 22}`,
  value: index + 22,
}));

export const trackUserAge = Array.from({length: 111}, (_, index) => ({
  label: `${index + 10}`,
  value: index + 10,
}));

export const trackLengthPeriods = Array.from({length: 30}, (_, index) => ({
  label: `${index + 2}`,
  value: index + 2,
}));
export const minutes = Array.from({length: 60}, (_, i) => i);
export const notification_api_url =
  'https://healthcare-admin-lilac.vercel.app/api/notifications';

export const APP_LOGO = require('../../assets/images/logo2.png');

// export const everyDays100 = Array.from({length: 100}, (_, i) => i + 1);
//   '#47BE7D',
//   '#F640B1',
//   '#0E124C',
//   'red',
//   '#000000',
//   '#63605C',
//   '#5270FF',
//   '#FBDE5A',
//   '#F8AC25',
//   '#FFFFFF',
