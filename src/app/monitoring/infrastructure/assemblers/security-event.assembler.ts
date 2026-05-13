import { SecurityEventEntity } from '../../domain/model/security-event.entity';
import { SecurityEventResource } from '../resources/security-event.resource';


export class SecurityEventAssembler {
  
  static toEntity(resource: SecurityEventResource): SecurityEventEntity {
    return {
      id: resource.id,
      title: resource.title,
      device: resource.device,
      zone: resource.zone,
      type: resource.type as SecurityEventEntity['type'],
      severity: resource.severity as SecurityEventEntity['severity'],
      status: resource.status as SecurityEventEntity['status'],
      createdAt: resource.createdAt,
      description: resource.description
    };
  }
}
