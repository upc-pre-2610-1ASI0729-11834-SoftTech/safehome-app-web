import { computed, Injectable, signal } from '@angular/core';
import { forkJoin, Observable, retry, tap } from 'rxjs';
import { DeviceEntity } from '../../devices/domain/model/device.entity';
import { SecurityEventEntity } from '../../monitoring/domain/model/security-event.entity';
import { AccountActivityEntity, HomeZoneEntity, RegisteredAccountEntity, SafeSettingsEntity, SafeUserEntity, SupportTicketEntity } from '../domain/model/safehome-state.entity';
import { SafeHomeApiService, StoredRegisteredAccount } from '../infrastructure/safehome-api.service';
import defaultData from '../../../assets/data/safehome-default-data.json';

interface SafeHomeDefaultData {
  teamCredentials: { email: string; password: string };
  user: SafeUserEntity;
  blankSettings: SafeSettingsEntity;
  settings: SafeSettingsEntity;
  devices: DeviceEntity[];
  events: SecurityEventEntity[];
  zones: HomeZoneEntity[];
  activities: AccountActivityEntity[];
}

const safeHomeDefaultData = defaultData as SafeHomeDefaultData;
const defaultUser = safeHomeDefaultData.user;
const blankSettings = safeHomeDefaultData.blankSettings;
const defaultDevices = safeHomeDefaultData.devices;
const defaultEvents = safeHomeDefaultData.events;
const defaultZones = safeHomeDefaultData.zones;
const defaultSettings = safeHomeDefaultData.settings;
const defaultActivities = safeHomeDefaultData.activities;

@Injectable({ providedIn: 'root' })
export class SafeHomeStore {
  private readonly userSignal = signal<SafeUserEntity>(defaultUser);
  readonly user = this.userSignal.asReadonly();

  private readonly devicesSignal = signal<DeviceEntity[]>(defaultDevices);
  readonly devices = this.devicesSignal.asReadonly();

  private readonly eventsSignal = signal<SecurityEventEntity[]>(defaultEvents);
  readonly events = this.eventsSignal.asReadonly();

  private readonly zonesSignal = signal<HomeZoneEntity[]>(defaultZones);
  readonly zones = this.zonesSignal.asReadonly();

  private readonly settingsSignal = signal<SafeSettingsEntity>(defaultSettings);
  readonly settings = this.settingsSignal.asReadonly();

  private readonly ticketsSignal = signal<SupportTicketEntity[]>([]);
  readonly tickets = this.ticketsSignal.asReadonly();

  private readonly activitiesSignal = signal<AccountActivityEntity[]>(defaultActivities);
  readonly activities = this.activitiesSignal.asReadonly();

  private readonly registeredAccountsSignal = signal<StoredRegisteredAccount[]>([]);
  readonly registeredAccounts = this.registeredAccountsSignal.asReadonly();

  private readonly loadingSignal = signal<boolean>(false);
  readonly loading = this.loadingSignal.asReadonly();

  private readonly errorSignal = signal<string | null>(null);
  readonly error = this.errorSignal.asReadonly();

  activeDevices = computed(() => this.devices().filter((device) => device.status === 'active').length);
  pendingAlerts = computed(() => this.events().filter((event) => event.status === 'active').length);
  warningDevices = computed(() => this.devices().filter((device) => device.status === 'warning').length);
  offlineDevices = computed(() => this.devices().filter((device) => device.status === 'offline').length);
  totalEvents = computed(() => this.events().length);
  uptime = computed(() => {
    const total = this.devices().length || 1;
    const stable = this.devices().filter((device) => device.status === 'active' || device.status === 'warning').length;
    return `${Math.min(99.9, Math.round((stable / total) * 998) / 10)}%`;
  });
  weeklyActivity = computed(() => {
    const labels = ['DASHBOARD.DAY_MON', 'DASHBOARD.DAY_TUE', 'DASHBOARD.DAY_WED', 'DASHBOARD.DAY_THU', 'DASHBOARD.DAY_FRI', 'DASHBOARD.DAY_SAT', 'DASHBOARD.DAY_SUN'];
    const values = [0, 0, 0, 0, 0, 0, 0];
    this.events().forEach((event, index) => {
      values[index % labels.length] += event.status === 'active' ? 2 : 1;
    });
    const max = Math.max(1, ...values);
    return labels.map((labelKey, index) => ({
      labelKey,
      value: values[index],
      height: Math.max(18, Math.round((values[index] / max) * 88))
    }));
  });
  averageBattery = computed(() => {
    const devices = this.devices().filter((device) => device.battery > 0);
    if (!devices.length) return 0;
    return Math.round(devices.reduce((total, device) => total + device.battery, 0) / devices.length);
  });

  constructor(private api: SafeHomeApiService) {
    this.loadInitialState();
  }

  isTeamAccount(email: string, password: string): boolean {
    return email.toLowerCase() === safeHomeDefaultData.teamCredentials.email.toLowerCase() && password === safeHomeDefaultData.teamCredentials.password;
  }

  createAccount(data: { name: string; email: string }): void {
    const user = this.buildUser(data.name, data.email, 'SafeHome Pro', 'January 2025');
    this.userSignal.set(user);
    this.activitiesSignal.set([]);
    this.saveSession(user, this.devices(), this.events(), this.zones(), this.settings(), this.tickets(), []);
  }

  loadTeamAccount(): void {
    this.userSignal.set(defaultUser);
    this.devicesSignal.set(defaultDevices);
    this.eventsSignal.set(defaultEvents);
    this.zonesSignal.set(defaultZones);
    this.settingsSignal.set(defaultSettings);
    this.ticketsSignal.set([]);
    this.activitiesSignal.set(defaultActivities);
    document.body.classList.remove('dark-mode');
    this.saveSession(defaultUser, defaultDevices, defaultEvents, defaultZones, defaultSettings, [], defaultActivities);
  }

  createEmptyAccount(name: string, email: string, password: string): void {
    const user = this.buildUser(name, email, 'SafeHome Basic', 'May 2026');
    const cleanSettings = { ...blankSettings };
    this.setEmptyAccountState(user, cleanSettings);
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.api.createRegisteredAccount({ name, email, password }).pipe(retry(2)).subscribe({
      next: account => {
        const existing = this.registeredAccounts().filter((item) => item.email.toLowerCase() !== email.toLowerCase());
        this.registeredAccountsSignal.set([...existing, account]);
        this.loadingSignal.set(false);
        this.saveSession(user, [], [], [], cleanSettings, [], []);
      },
      error: err => this.setError(err, 'No se pudo crear la cuenta')
    });
  }

  loadRegisteredAccount(account: RegisteredAccountEntity): void {
    const user = this.buildUser(account.name, account.email, 'SafeHome Basic', 'May 2026');
    const cleanSettings = { ...blankSettings };
    this.setEmptyAccountState(user, cleanSettings);
    this.saveSession(user, [], [], [], cleanSettings, [], []);
  }

  findRegisteredAccount(email: string, password: string): RegisteredAccountEntity | undefined {
    return this.registeredAccounts().find((account) => account.email.toLowerCase() === email.toLowerCase() && account.password === password);
  }

  nextDeviceCode(type: DeviceEntity['type']): string {
    const nextId = Math.max(this.devices().length, ...this.devices().map((item) => Number(item.id) || 0)) + 1;
    const prefixMap: Record<DeviceEntity['type'], string> = {
      motion: 'PIR',
      camera: 'CAM',
      lock: 'LOCK',
      smoke: 'SMK',
      window: 'WIN',
      gas: 'GAS',
      water: 'WTR'
    };
    return `SH-2024-${prefixMap[type]}-${String(nextId).padStart(2, '0')}`;
  }

  getDeviceById(id: number | string): DeviceEntity | undefined {
    return this.devices().find((device) => String(device.id) === String(id));
  }

  loadDeviceById(id: number | string): void {
    if (this.getDeviceById(id)) return;

    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.api.getDeviceById(id).pipe(retry(2)).subscribe({
      next: device => {
        const savedDevice = this.normalizeDevice(device);
        this.devicesSignal.update(devices => [savedDevice, ...devices.filter((item) => String(item.id) !== String(savedDevice.id))]);
        this.loadingSignal.set(false);
      },
      error: err => this.setError(err, 'No se pudo cargar el dispositivo')
    });
  }

  updateUser(user: SafeUserEntity): void {
    const savedUser = { ...user, initials: this.getInitials(user.name) };
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.api.updateCurrentUser(savedUser).pipe(retry(2)).subscribe({
      next: () => {
        this.userSignal.set(savedUser);
        this.loadingSignal.set(false);
        this.addActivity('Profile updated', 'Personal information was saved', 'info');
      },
      error: err => this.setError(err, 'No se pudo guardar el perfil')
    });
  }

  addDevice(device: Omit<DeviceEntity, 'id'>): Observable<DeviceEntity> {
    const nextId = Math.max(this.devices().length, ...this.devices().map((item) => Number(item.id) || 0)) + 1;
    const newDevice: DeviceEntity = {
      id: nextId,
      ...device,
      name: device.name || `Device ${nextId}`,
      code: device.code || this.nextDeviceCode(device.type),
      zone: device.zone || 'Unassigned zone'
    };

    this.devicesSignal.update(devices => [newDevice, ...devices]);
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.api.createDevice(newDevice).pipe(
      retry(2),
      tap({
        next: savedDevice => {
          this.devicesSignal.update(devices =>
            devices.map((item) => String(item.id) === String(newDevice.id) ? savedDevice : item)
          );
          this.loadingSignal.set(false);
          this.addActivity('Device added', `${savedDevice.name} registered`, 'success');
        },
        error: err => {
          this.devicesSignal.update(devices => devices.filter((item) => String(item.id) !== String(newDevice.id)));
          this.setError(err, 'No se pudo agregar el dispositivo');
        }
      })
    );
  }

  updateDevice(device: DeviceEntity): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.api.updateDevice(device).pipe(retry(2)).subscribe({
      next: savedDevice => {
        const deviceData = this.normalizeDevice(savedDevice);
        this.devicesSignal.update(devices => devices.map((item) => String(item.id) === String(deviceData.id) ? deviceData : item));
        this.loadingSignal.set(false);
        this.addActivity('Device updated', `${deviceData.name} information changed`, 'info');
      },
      error: err => this.setError(err, 'No se pudo actualizar el dispositivo')
    });
  }

  toggleDevice(id: number | string): void {
    const device = this.devices().find((item) => String(item.id) === String(id));
    if (!device) return;
    const status: DeviceEntity['status'] = device.status === 'active' ? 'inactive' : 'active';
    this.updateDevice({ ...device, status, lastSeen: status === 'active' ? 'Just now' : 'Inactive' });
  }

  deleteDevice(id: number | string): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.api.deleteDevice(id).pipe(retry(2)).subscribe({
      next: () => {
        this.devicesSignal.update(devices => devices.filter((item) => String(item.id) !== String(id)));
        this.loadingSignal.set(false);
        this.addActivity('Device deleted', 'A device was removed from the panel', 'warning');
      },
      error: err => this.setError(err, 'No se pudo eliminar el dispositivo')
    });
  }

  markEventAttended(id: number): void {
    const event = this.events().find((item) => item.id === id);
    if (!event) return;
    const updatedEvent: SecurityEventEntity = {
      ...event,
      status: 'attended',
      severity: event.severity === 'critical' ? 'medium' : event.severity
    };
    this.updateEventState(updatedEvent, 'Alert attended', 'A security alert was marked as attended', 'success');
  }

  markAllAlertsAttended(): void {
    const events = this.events().map((item) => item.status === 'active' ? {
      ...item,
      status: 'attended' as const,
      severity: item.severity === 'critical' ? 'medium' as const : item.severity
    } : item);
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.api.replaceEvents(events).pipe(retry(2)).subscribe({
      next: savedEvents => {
        this.eventsSignal.set(savedEvents);
        this.loadingSignal.set(false);
        this.addActivity('Alerts updated', 'All active alerts were marked as attended', 'success');
      },
      error: err => this.setError(err, 'No se pudo actualizar la alerta')
    });
  }

  updateEvent(event: SecurityEventEntity): void {
    this.updateEventState(event, 'Event updated', event.title, 'info');
  }

  reactivateEvent(id: number): void {
    const event = this.events().find((item) => item.id === id);
    if (!event) return;
    const updatedEvent: SecurityEventEntity = {
      ...event,
      status: 'active',
      severity: event.severity === 'resolved' ? 'medium' : event.severity
    };
    this.updateEventState(updatedEvent, 'Event reactivated', 'An event was restored as active', 'warning');
  }

  deleteEvent(id: number): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.api.deleteEvent(id).pipe(retry(2)).subscribe({
      next: () => {
        this.eventsSignal.update(events => events.filter((item) => item.id !== id));
        this.loadingSignal.set(false);
        this.addActivity('Event deleted', 'An event was removed from the history', 'warning');
      },
      error: err => this.setError(err, 'No se pudo eliminar el evento')
    });
  }

  addZone(): void {
    const nextId = Math.max(0, ...this.zones().map((item) => item.id)) + 1;
    const zone: HomeZoneEntity = { id: nextId, name: `New zone ${nextId}`, deviceCount: 0, status: 'safe', signal: 100 };
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.api.createZone(zone).pipe(retry(2)).subscribe({
      next: savedZone => {
        this.zonesSignal.update(zones => [...zones, savedZone]);
        this.loadingSignal.set(false);
      },
      error: err => this.setError(err, 'No se pudo agregar la zona')
    });
  }

  updateZone(zone: HomeZoneEntity): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.api.updateZone(zone).pipe(retry(2)).subscribe({
      next: savedZone => {
        this.zonesSignal.update(zones => zones.map((item) => item.id === savedZone.id ? savedZone : item));
        this.loadingSignal.set(false);
      },
      error: err => this.setError(err, 'No se pudo guardar la zona')
    });
  }

  updateSettings(settings: SafeSettingsEntity): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.api.updateSettings(settings).pipe(retry(2)).subscribe({
      next: savedSettings => {
        const { id: _id, ...cleanSettings } = savedSettings;
        this.settingsSignal.set(cleanSettings);
        document.body.classList.toggle('dark-mode', cleanSettings.darkMode);
        this.loadingSignal.set(false);
      },
      error: err => this.setError(err, 'No se pudo guardar la configuración')
    });
  }

  addTicket(ticket: Omit<SupportTicketEntity, 'id' | 'createdAt'>): void {
    const nextId = Math.max(0, ...this.tickets().map((item) => item.id)) + 1;
    const savedTicket: SupportTicketEntity = { id: nextId, createdAt: new Date().toLocaleString(), ...ticket };
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.api.createTicket(savedTicket).pipe(retry(2)).subscribe({
      next: ticketData => {
        this.ticketsSignal.update(tickets => [ticketData, ...tickets]);
        this.loadingSignal.set(false);
        this.addActivity('Support message sent', ticketData.subject, 'success');
      },
      error: err => this.setError(err, 'No se pudo guardar el mensaje')
    });
  }

  addActivity(title: string, description: string, tone: AccountActivityEntity['tone']): void {
    const nextId = Math.max(0, ...this.activities().map((item) => item.id)) + 1;
    const activity: AccountActivityEntity = { id: nextId, title, description, time: 'Now', tone };
    const activities = [activity, ...this.activities()].slice(0, 8);
    this.activitiesSignal.set(activities);
    this.api.replaceActivities(activities).pipe(retry(2)).subscribe({
      error: err => this.errorSignal.set(this.formatError(err, 'No se pudo guardar la actividad'))
    });
  }

  restoreDefaultConfig(): void {
    this.updateSettings(defaultSettings);
    this.addActivity('Default configuration restored', 'Settings returned to the standard values', 'info');
  }

  private loadInitialState(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    forkJoin({
      users: this.api.getCurrentUser(),
      devices: this.api.getDevices(),
      events: this.api.getEvents(),
      zones: this.api.getZones(),
      settings: this.api.getSettings(),
      tickets: this.api.getTickets(),
      activities: this.api.getActivities(),
      registeredAccounts: this.api.getRegisteredAccounts()
    }).pipe(retry(2)).subscribe({
      next: data => {
        const { id: _userId, ...user } = data.users[0] ?? { id: 1, ...defaultUser };
        const { id: _settingsId, ...settings } = data.settings[0] ?? { id: 1, ...defaultSettings };
        this.userSignal.set(user);
        this.devicesSignal.set(data.devices.map((device) => this.normalizeDevice(device)));
        this.eventsSignal.set(data.events);
        this.zonesSignal.set(data.zones);
        this.settingsSignal.set(settings);
        this.ticketsSignal.set(data.tickets);
        this.activitiesSignal.set(data.activities);
        this.registeredAccountsSignal.set(data.registeredAccounts);
        document.body.classList.toggle('dark-mode', settings.darkMode);
        this.loadingSignal.set(false);
      },
      error: err => {
        this.errorSignal.set(this.formatError(err, 'No se pudo cargar la información'));
        this.loadingSignal.set(false);
      }
    });
  }

  private updateEventState(event: SecurityEventEntity, activityTitle: string, activityDescription: string, tone: AccountActivityEntity['tone']): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.api.updateEvent(event).pipe(retry(2)).subscribe({
      next: savedEvent => {
        this.eventsSignal.update(events => events.map((item) => item.id === savedEvent.id ? savedEvent : item));
        this.loadingSignal.set(false);
        this.addActivity(activityTitle, activityDescription, tone);
      },
      error: err => this.setError(err, 'No se pudo actualizar el evento')
    });
  }

  private normalizeDevice(device: DeviceEntity): DeviceEntity {
    return { ...device };
  }

  private setEmptyAccountState(user: SafeUserEntity, settings: SafeSettingsEntity): void {
    this.userSignal.set(user);
    this.devicesSignal.set([]);
    this.eventsSignal.set([]);
    this.zonesSignal.set([]);
    this.settingsSignal.set(settings);
    this.ticketsSignal.set([]);
    this.activitiesSignal.set([]);
    document.body.classList.remove('dark-mode');
  }

  private saveSession(
    user: SafeUserEntity,
    devices: DeviceEntity[],
    events: SecurityEventEntity[],
    zones: HomeZoneEntity[],
    settings: SafeSettingsEntity,
    tickets: SupportTicketEntity[],
    activities: AccountActivityEntity[]
  ): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.api.saveSessionState(user, devices, events, zones, settings, tickets, activities).pipe(retry(2)).subscribe({
      next: () => this.loadingSignal.set(false),
      error: err => this.setError(err, 'No se pudo guardar la sesión')
    });
  }

  private buildUser(name: string, email: string, plan: string, memberSince: string): SafeUserEntity {
    return {
      name,
      email,
      phone: '',
      address: '',
      plan,
      initials: this.getInitials(name),
      memberSince
    };
  }

  private getInitials(name: string): string {
    return name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'SH';
  }

  private setError(error: unknown, fallback: string): void {
    this.errorSignal.set(this.formatError(error, fallback));
    this.loadingSignal.set(false);
  }

  private formatError(error: unknown, fallback: string): string {
    if (error instanceof Error) {
      return error.message.includes('Resource not found') ? fallback : error.message;
    }
    return fallback;
  }
}
