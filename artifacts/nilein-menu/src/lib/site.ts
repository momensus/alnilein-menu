/* TODO: replace with the restaurant's real contact + payment details. */

export const RESTAURANT_NAME = 'النيلين';
export const RESTAURANT_SUB = 'للأسماك والمشويات';

export const PHONES: string[] = [
  // e.g. '+249912331459',
];

export type PaymentMethod = {
  id: string;
  name: string;
  color: string;
  ink: string;
  number: string;
  holder: string;
};

export const PAYMENTS: PaymentMethod[] = [
  { id: 'bankak', name: 'بنكك', color: '#b8312f', ink: '#fff', number: '', holder: '' },
  { id: 'ocash', name: 'أوكاش', color: '#7a4bb3', ink: '#fff', number: '', holder: '' },
  { id: 'fawry', name: 'فوري', color: '#f2b705', ink: '#1a1210', number: '', holder: '' },
  { id: 'cashi', name: 'كاشي', color: '#1f9d8a', ink: '#fff', number: '', holder: '' },
];
