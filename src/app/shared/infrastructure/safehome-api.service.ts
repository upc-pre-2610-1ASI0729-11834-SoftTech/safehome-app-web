import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { DeviceEntity } from '../../devices/domain/model/device.entity';
import { SecurityEventEntity } from '../../monitoring/domain/model/security-event.entity';
import { AccountActivityEntity, HomeZoneEntity, RegisteredAccountEntity, SafeSettingsEntity, SafeUserEntity, SupportTicketEntity } from '../domain/model/safehome-state.entity';

export interface StoredCurrentUser extends SafeUserEntity {
  id: number | string;
}

export interface StoredSettings extends SafeSettingsEntity {
  id: number | string;
}

export interface StoredRegisteredAccount extends RegisteredAccountEntity {
  id?: number | string;
}

@Injectable({ providedIn: 'root' })
export class SafeHomeApiService {
  private readonly endpoint = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getCurrentUser(): Observable<StoredCurrentUser[]> {
    return this.http.get<StoredCurrentUser[]>(`${this.endpoint}/currentUser`);
  }

  getDevices(): Observable<DeviceEntity[]> {
    return this.http.get<DeviceEntity[]>(`${this.endpoint}/devices`);
  }

  getDeviceById(id: number | string): Observable<DeviceEntity> {
    return this.http.get<DeviceEntity>(`${this.endpoint}/devices/${id}`);
  }

  getEvents(): Observable<SecurityEventEntity[]> {
    return this.http.get<SecurityEventEntity[]>(`${this.endpoint}/events`);
  }

  getZones(): Observable<HomeZoneEntity[]> {
    return this.http.get<HomeZoneEntity[]>(`${this.endpoint}/zones`);
  }

  getSettings(): Observable<StoredSettings[]> {
    return this.http.get<StoredSettings[]>(`${this.endpoint}/settings`);
  }

  getTickets(): Observable<SupportTicketEntity[]> {
    return this.http.get<SupportTicketEntity[]>(`${this.endpoint}/tickets`);
  }

  getActivities(): Observable<AccountActivityEntity[]> {
    return this.http.get<AccountActivityEntity[]>(`${this.endpoint}/activities`);
  }

  getRegisteredAccounts(): Observable<StoredRegisteredAccount[]> {
    return this.http.get<StoredRegisteredAccount[]>(`${this.endpoint}/registeredAccounts`);
  }

  updateCurrentUser(user: SafeUserEntity): Observable<StoredCurrentUser> {
    return this.http.put<StoredCurrentUser>(`${this.endpoint}/currentUser/1`, { id: 1, ...user });
  }

  updateSettings(settings: SafeSettingsEntity): Observable<StoredSettings> {
    return this.http.put<StoredSettings>(`${this.endpoint}/settings/1`, { id: 1, ...settings });
  }

  createRegisteredAccount(account: RegisteredAccountEntity): Observable<StoredRegisteredAccount> {
    return this.http.post<StoredRegisteredAccount>(`${this.endpoint}/registeredAccounts`, account);
  }

  createDevice(device: DeviceEntity): Observable<DeviceEntity> {
    return this.http.post<DeviceEntity>(`${this.endpoint}/devices`, device);
  }

  updateDevice(device: DeviceEntity): Observable<DeviceEntity> {
    return this.http.put<DeviceEntity>(`${this.endpoint}/devices/${device.id}`, device);
  }

  deleteDevice(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/devices/${id}`);
  }

  updateEvent(event: SecurityEventEntity): Observable<SecurityEventEntity> {
    return this.http.put<SecurityEventEntity>(`${this.endpoint}/events/${event.id}`, event);
  }

  deleteEvent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.endpoint}/events/${id}`);
  }

  replaceEvents(events: SecurityEventEntity[]): Observable<SecurityEventEntity[]> {
    return this.replaceCollection('events', events);
  }

  createZone(zone: HomeZoneEntity): Observable<HomeZoneEntity> {
    return this.http.post<HomeZoneEntity>(`${this.endpoint}/zones`, zone);
  }

  updateZone(zone: HomeZoneEntity): Observable<HomeZoneEntity> {
    return this.http.put<HomeZoneEntity>(`${this.endpoint}/zones/${zone.id}`, zone);
  }

  createTicket(ticket: SupportTicketEntity): Observable<SupportTicketEntity> {
    return this.http.post<SupportTicketEntity>(`${this.endpoint}/tickets`, ticket);
  }

  replaceActivities(activities: AccountActivityEntity[]): Observable<AccountActivityEntity[]> {
    return this.replaceCollection('activities', activities);
  }

  saveSessionState(
    user: SafeUserEntity,
    devices: DeviceEntity[],
    events: SecurityEventEntity[],
    zones: HomeZoneEntity[],
    settings: SafeSettingsEntity,
    tickets: SupportTicketEntity[],
    activities: AccountActivityEntity[]
  ): Observable<void> {
    return forkJoin({
      user: this.updateCurrentUser(user),
      devices: this.replaceCollection('devices', devices),
      events: this.replaceCollection('events', events),
      zones: this.replaceCollection('zones', zones),
      settings: this.updateSettings(settings),
      tickets: this.replaceCollection('tickets', tickets),
      activities: this.replaceCollection('activities', activities)
    }).pipe(map(() => undefined));
  }

  private replaceCollection<T extends { id?: number | string }>(resource: string, items: T[]): Observable<T[]> {
    const url = `${this.endpoint}/${resource}`;
    return this.http.get<T[]>(url).pipe(
      switchMap(currentItems => {
        const requests = currentItems
          .filter(item => item.id !== undefined)
          .map(item => this.http.delete(`${url}/${item.id}`));
        const cleanup = requests.length ? forkJoin(requests) : of([]);
        return cleanup.pipe(
          switchMap(() => items.length ? forkJoin(items.map(item => this.http.post<T>(url, item))) : of([] as T[]))
        );
      })
    );
  }
}
