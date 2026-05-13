import { DeviceEntity } from '../../domain/model/device.entity';
import { DeviceResource } from '../resources/device.resource';


export class DeviceAssembler {
  
  static toEntity(resource: DeviceResource): DeviceEntity {
    return {
      id: resource.id,
      name: resource.name,
      code: resource.code,
      type: resource.type as DeviceEntity['type'],
      zone: resource.zone,
      status: resource.status as DeviceEntity['status'],
      battery: resource.battery,
      lastSeen: resource.lastSeen,
      description: resource.description
    };
  }

  
  static toResource(entity: DeviceEntity): DeviceResource {
    return { ...entity };
  }
}
