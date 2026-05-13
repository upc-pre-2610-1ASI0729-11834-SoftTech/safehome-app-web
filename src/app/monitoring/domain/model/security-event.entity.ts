
export interface SecurityEventEntity {
  id: number;
  title: string;
  device: string;
  zone: string;
  type: 'intrusion' | 'battery' | 'camera' | 'lock' | 'system' | 'smoke';
  severity: 'critical' | 'medium' | 'info' | 'resolved';
  status: 'active' | 'attended' | 'resolved';
  createdAt: string;
  description: string;
}
