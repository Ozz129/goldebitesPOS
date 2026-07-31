/**
 * Barrel de stores. Se importa una sola vez al arrancar la app (ver main.tsx) para que
 * los efectos de registro (ej. registerSearchProvider) se ejecuten desde el inicio,
 * sin depender de que el usuario visite cada módulo primero.
 */
export * from './uiStore';
export * from './notificationsStore';
export * from './settingsStore';
