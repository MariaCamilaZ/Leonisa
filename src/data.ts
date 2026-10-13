// Datos quemados del demo. Fuente: ficha manuscrita + audios (ver docs/requerimientos.md).

export type Parametro = 'ancho' | 'elongLargo' | 'elongAncho' | 'peso';

export const PARAMETROS: { key: Parametro; label: string; unidad: string }[] = [
  { key: 'ancho', label: 'Ancho', unidad: 'cm' },
  { key: 'elongLargo', label: 'Elongación largo', unidad: '%' },
  { key: 'elongAncho', label: 'Elongación ancho', unidad: '%' },
  { key: 'peso', label: 'Peso', unidad: 'g/m²' },
];

export type Rango = { min: number; max: number };

export type Referencia = {
  codigo: string;
  nombre: string;
  disponible: boolean;
  estandar?: Record<Parametro, Rango>;
};

export const REFERENCIAS: Referencia[] = [
  {
    codigo: 'TEC 496',
    nombre: 'Tec 496',
    disponible: true,
    estandar: {
      ancho: { min: 138.23, max: 138.7 }, // escrito "138,7 - 138,23" en la ficha
      elongLargo: { min: 215.91, max: 263.89 },
      elongAncho: { min: 218.7, max: 267.3 },
      peso: { min: 170.05, max: 187.95 },
    },
  },
  {
    codigo: 'TEC 305',
    nombre: 'Tec 305',
    disponible: true,
    estandar: {
      ancho: { min: 155.2, max: 164.8 },
      elongLargo: { min: 90, max: 110 },
      elongAncho: { min: 126, max: 154 },
      peso: { min: 128.25, max: 141.75 },
    },
  },
  { codigo: 'REF 3', nombre: 'Referencia 3', disponible: false },
];

export type Observacion = { defecto: string; metros: number };
export const DEFECTOS = ['Por aguja', 'Por hilo doble'];

export type Rollo = {
  id: string;
  fecha: string; // ISO yyyy-mm-dd
  telar: number;
  rollo: number;
  turno?: 1 | 2 | 3; // la planilla de tejeduría circular (TEC 305) no lo trae
  tejedor: string;
  tensionPlegador?: string;
  nota?: string; // observación libre de la planilla
  referencia: string;
  muestra: Record<Parametro, number>;
  observaciones: Observacion[];
  ejemplo?: boolean; // true = dato inventado para poblar gráficas
};

export type NivelAlerta = 'advertencia' | 'critica' | 'resuelta';
export type EstadoAccion = 'pendiente' | 'proceso' | 'cerrada';

export type Accion = {
  causa: string;
  accion: string;
  responsable: string;
  fecha: string;
  estado: EstadoAccion;
};

export type Alerta = {
  id: string;
  rolloId: string;
  nivel: NivelAlerta;
  fueraDeRango: Parametro[];
  creada: string;
  accion?: Accion;
  nueva?: boolean;
};

export type Afinidad = {
  id: string;
  fecha: string;
  referencia: string;
  telar: number;
  rollo: number;
  color: string;
  resultado: 'conforme' | 'no-conforme';
  observacion: string;
  foto?: string; // URL local de la imagen de la muestra tinturada (demo: no se sube a ningún servidor)
};

export function cumple(valor: number, r: Rango) {
  return valor >= r.min && valor <= r.max;
}

export function evaluar(rollo: Pick<Rollo, 'referencia' | 'muestra'>): Parametro[] {
  const est = REFERENCIAS.find((r) => r.codigo === rollo.referencia)?.estandar;
  if (!est) return [];
  return PARAMETROS.map((p) => p.key).filter((k) => !cumple(rollo.muestra[k], est[k]));
}

// Supuesto del demo: 1 parámetro fuera = advertencia, 2 o más = crítica.
export function nivelPara(fuera: Parametro[]): NivelAlerta {
  return fuera.length >= 2 ? 'critica' : 'advertencia';
}

// Rollo real de la ficha manuscrita.
const ROLLO_FICHA: Rollo = {
  id: 'r-54-1',
  fecha: '2026-10-05',
  telar: 54,
  rollo: 1,
  turno: 2,
  tejedor: 'Santiago',
  referencia: 'TEC 496',
  muestra: { ancho: 140, elongLargo: 243, elongAncho: 208, peso: 183 },
  observaciones: [],
};

// Historial de ejemplo para que las gráficas tengan qué mostrar.
const EJEMPLOS: [string, number, number, 1 | 2 | 3, string, number, number, number, number, Observacion[]][] = [
  ['2026-09-21', 54, 1, 1, 'Santiago', 138.5, 238.4, 241.2, 179.6, []],
  ['2026-09-22', 54, 2, 2, 'Santiago', 138.4, 246.1, 236.8, 181.3, []],
  ['2026-09-23', 51, 1, 1, 'Operario T51', 138.6, 229.7, 249.5, 176.2, [{ defecto: 'Por aguja', metros: 3 }]],
  ['2026-09-24', 54, 3, 3, 'Operario T54-N', 138.3, 252.8, 244.0, 189.1, []],
  ['2026-09-25', 51, 2, 2, 'Operario T51', 138.5, 241.0, 238.9, 183.4, []],
  ['2026-09-26', 54, 4, 1, 'Santiago', 138.6, 233.5, 229.1, 178.0, []],
  ['2026-09-28', 54, 5, 2, 'Santiago', 138.4, 258.2, 252.6, 184.7, [{ defecto: 'Por hilo doble', metros: 3 }]],
  ['2026-09-29', 51, 3, 1, 'Operario T51', 138.9, 244.6, 240.3, 180.9, []],
  ['2026-09-30', 54, 6, 2, 'Santiago', 138.5, 236.9, 235.4, 182.2, []],
  ['2026-10-01', 51, 4, 3, 'Operario T51-N', 138.4, 249.3, 246.8, 177.5, []],
  ['2026-10-02', 54, 7, 1, 'Santiago', 138.6, 240.2, 214.6, 185.8, []],
  ['2026-10-03', 51, 5, 2, 'Operario T51', 138.5, 245.7, 243.1, 181.1, []],
];

// Planilla de tejeduría circular, Telar 56 / TEC 305 (foto). Rollo y fecha no se ven en la foto: se asumen 7 y 8.
const ROLLOS_TEC305: Rollo[] = [
  {
    id: 'r-56-1',
    fecha: '2026-10-13',
    telar: 56,
    rollo: 7,
    tejedor: 'Oswaldo',
    referencia: 'TEC 305',
    tensionPlegador: '32',
    muestra: { ancho: 164, elongLargo: 100, elongAncho: 122, peso: 130 },
    observaciones: [],
  },
  {
    id: 'r-56-2',
    fecha: '2026-10-13',
    telar: 56,
    rollo: 8,
    tejedor: 'Edison',
    referencia: 'TEC 305',
    tensionPlegador: '+UP 33',
    muestra: { ancho: 156, elongLargo: 87, elongAncho: 134, peso: 139 },
    observaciones: [],
    nota: 'Pol 78/68/1 · PIA 40/1',
  },
];

// Historial de ejemplo TEC 305 (inventado, solo para las gráficas).
const EJEMPLOS_TEC305: [string, number, 1 | 2 | 3, string, number, number, number, number][] = [
  ['2026-10-06', 1, 1, 'Oswaldo', 160.4, 98.2, 140.1, 134.6],
  ['2026-10-07', 2, 2, 'Edison', 158.9, 104.5, 137.8, 136.2],
  ['2026-10-08', 3, 1, 'Oswaldo', 162.1, 95.7, 145.3, 132.9],
  ['2026-10-09', 4, 2, 'Edison', 165.6, 101.3, 133.0, 138.4],
  ['2026-10-10', 5, 1, 'Oswaldo', 159.7, 107.9, 148.6, 135.1],
  ['2026-10-11', 6, 2, 'Edison', 161.3, 99.4, 141.7, 142.8],
];

export const ROLLOS_INICIALES: Rollo[] = [
  ...EJEMPLOS_TEC305.map(([fecha, rollo, turno, tejedor, ancho, elongLargo, elongAncho, peso]) => ({
    id: `r-56-${rollo}-${fecha}`,
    fecha,
    telar: 56,
    rollo,
    turno,
    tejedor,
    referencia: 'TEC 305',
    muestra: { ancho, elongLargo, elongAncho, peso },
    observaciones: [],
    ejemplo: true,
  })),
  ...ROLLOS_TEC305,
  ...EJEMPLOS.map(([fecha, telar, rollo, turno, tejedor, ancho, elongLargo, elongAncho, peso, observaciones]) => ({
    id: `r-${telar}-${rollo}-${fecha}`,
    fecha,
    telar,
    rollo,
    turno,
    tejedor,
    referencia: 'TEC 496',
    muestra: { ancho, elongLargo, elongAncho, peso },
    observaciones,
    ejemplo: true,
  })),
  ROLLO_FICHA,
];

export const ALERTAS_INICIALES: Alerta[] = ROLLOS_INICIALES.flatMap((r) => {
  const fuera = evaluar(r);
  if (!fuera.length) return [];
  const alerta: Alerta = { id: `a-${r.id}`, rolloId: r.id, nivel: nivelPara(fuera), fueraDeRango: fuera, creada: r.fecha };
  // Las alertas viejas del ejemplo ya tienen seguimiento cerrado.
  if (r.ejemplo && (r.fecha < '2026-10-01' || r.referencia === 'TEC 305')) {
    alerta.nivel = 'resuelta';
    alerta.accion = {
      causa: 'Tensión de hilo descalibrada',
      accion: 'Ajuste de tensión y nueva muestra',
      responsable: 'Supervisor de turno',
      fecha: r.fecha,
      estado: 'cerrada',
    };
  }
  return [alerta];
});

export const AFINIDADES_INICIALES: Afinidad[] = [
  { id: 'af-1', fecha: '2026-09-26', referencia: 'TEC 496', telar: 54, rollo: 4, color: 'Negro 700', resultado: 'conforme', observacion: 'Tono uniforme' },
  { id: 'af-2', fecha: '2026-10-02', referencia: 'TEC 496', telar: 54, rollo: 7, color: 'Nude 802', resultado: 'conforme', observacion: 'Sin barrado visible' },
];
