/** Datos base colombianos reutilizados por los distintos generadores mock del proyecto. */

export const CO_FIRST_NAMES = [
  'Camila', 'Juan', 'Valentina', 'Santiago', 'Mariana', 'Andrés', 'Sofía', 'Carlos',
  'Isabella', 'Julián', 'Daniela', 'Felipe', 'Laura', 'Nicolás', 'Gabriela', 'Sebastián',
  'Paula', 'Alejandro', 'Natalia', 'David', 'Luisa', 'Miguel', 'Catalina', 'Diego',
  'Manuela', 'Ricardo', 'Vanessa', 'Óscar', 'Tatiana', 'Fernando',
];

export const CO_LAST_NAMES = [
  'Ramírez', 'Gómez', 'Rodríguez', 'Martínez', 'López', 'García', 'Hernández', 'Muñoz',
  'Ortiz', 'Pérez', 'Rojas', 'Vargas', 'Castro', 'Suárez', 'Jiménez', 'Torres',
  'Restrepo', 'Bolaños', 'Chaux', 'Muñoz', 'Erazo', 'Zúñiga', 'Mosquera', 'Ordóñez',
  'Fajardo', 'Cerón', 'Paz', 'Valencia', 'Salazar', 'Guerrero',
];

export const POPAYAN_NEIGHBORHOODS = [
  'El Recuerdo', 'Bello Horizonte', 'La Esmeralda', 'Centenario', 'Pandiguando',
  'San Camilo', 'La Campiña', 'Valencia', 'Chapinero', 'La Paz', 'Suizo',
  'El Uvo', 'Modelo', 'Yambitará', 'Berlín', 'Colinas del Norte',
];

let namePointer = 0;
let phonePointer = 3000000;

export function randomFullName(): string {
  namePointer += 1;
  const first = CO_FIRST_NAMES[(namePointer * 7) % CO_FIRST_NAMES.length];
  const last1 = CO_LAST_NAMES[(namePointer * 3) % CO_LAST_NAMES.length];
  const last2 = CO_LAST_NAMES[(namePointer * 11 + 5) % CO_LAST_NAMES.length];
  return `${first} ${last1} ${last2}`;
}

export function randomPhoneCO(): string {
  phonePointer += 137;
  const suffix = (phonePointer % 9000000) + 1000000;
  return `3${String(suffix).padStart(9, '0').slice(0, 9)}`;
}

export function randomEmail(name: string): string {
  const slug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .split(' ')
    .slice(0, 2)
    .join('.');
  return `${slug}@gmail.com`;
}

export function randomAddress(): { line1: string; neighborhood: string; city: string } {
  namePointer += 1;
  const streetType = namePointer % 2 === 0 ? 'Calle' : 'Carrera';
  const n1 = 5 + (namePointer % 40);
  const n2 = 1 + (namePointer % 30);
  const n3 = (namePointer * 13) % 100;
  return {
    line1: `${streetType} ${n1} # ${n2}-${n3}`,
    neighborhood: POPAYAN_NEIGHBORHOODS[namePointer % POPAYAN_NEIGHBORHOODS.length],
    city: 'Popayán, Cauca',
  };
}
