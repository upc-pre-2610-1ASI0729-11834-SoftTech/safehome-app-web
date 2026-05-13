
export interface DeviceEntity {
  id: number | string;
  name: string;
  code: string;
  type: 'motion' | 'camera' | 'lock' | 'smoke' | 'window' | 'gas' | 'water';
  zone: string;
  status: 'active' | 'inactive' | 'warning' | 'offline';
  battery: number;
  lastSeen: string;
  description: string;
}
