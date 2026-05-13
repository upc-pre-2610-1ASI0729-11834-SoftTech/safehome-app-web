
export interface DeviceResource {
  id: number | string;
  name: string;
  code: string;
  type: string;
  zone: string;
  status: string;
  battery: number;
  lastSeen: string;
  description: string;
}
