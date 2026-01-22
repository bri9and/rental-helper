// Maintenance issue categories - can be imported in both client and server components

// Maintenance issue reported by cleaner
export interface IMaintenanceIssue {
  id: string;           // e.g., 'plumbing-toilet'
  category: string;     // e.g., 'plumbing'
  item: string;         // e.g., 'Toilet'
  description?: string; // Optional details
  urgent: boolean;      // Needs immediate attention
}

// All possible maintenance items organized by category
export const MAINTENANCE_CATEGORIES = {
  plumbing: {
    label: 'Plumbing',
    items: [
      { id: 'plumbing-toilet', item: 'Toilet' },
      { id: 'plumbing-faucet', item: 'Faucet/Sink' },
      { id: 'plumbing-shower', item: 'Shower/Tub' },
      { id: 'plumbing-drain', item: 'Clogged Drain' },
      { id: 'plumbing-waterheater', item: 'Water Heater' },
      { id: 'plumbing-leak', item: 'Water Leak' },
    ],
  },
  appliances: {
    label: 'Appliances',
    items: [
      { id: 'appliances-dishwasher', item: 'Dishwasher' },
      { id: 'appliances-washer', item: 'Washer' },
      { id: 'appliances-dryer', item: 'Dryer' },
      { id: 'appliances-fridge', item: 'Refrigerator' },
      { id: 'appliances-microwave', item: 'Microwave' },
      { id: 'appliances-oven', item: 'Oven/Stove' },
      { id: 'appliances-disposal', item: 'Garbage Disposal' },
    ],
  },
  hvac: {
    label: 'HVAC',
    items: [
      { id: 'hvac-ac', item: 'AC Not Working' },
      { id: 'hvac-heater', item: 'Heater Not Working' },
      { id: 'hvac-thermostat', item: 'Thermostat' },
    ],
  },
  electrical: {
    label: 'Electrical',
    items: [
      { id: 'electrical-lights', item: 'Lights Out' },
      { id: 'electrical-outlet', item: 'Outlet Not Working' },
      { id: 'electrical-smoke', item: 'Smoke Detector' },
    ],
  },
  structural: {
    label: 'Structural',
    items: [
      { id: 'structural-door', item: 'Door Problem' },
      { id: 'structural-window', item: 'Window Problem' },
      { id: 'structural-lock', item: 'Lock Broken' },
      { id: 'structural-leak', item: 'Ceiling/Roof Leak' },
    ],
  },
  other: {
    label: 'Other',
    items: [
      { id: 'other-pest', item: 'Pest Issue' },
      { id: 'other-other', item: 'Other' },
    ],
  },
} as const;
