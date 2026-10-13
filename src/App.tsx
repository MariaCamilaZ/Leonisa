import { useState } from 'react';
import { BarChart3, Bell, ClipboardPlus, Search, Siren, X } from 'lucide-react';
import { AFINIDADES_INICIALES, ALERTAS_INICIALES, ROLLOS_INICIALES, evaluar, nivelPara, type Afinidad, type Alerta, type Rollo } from './data';
import { beep } from './ui';
import Registro from './modules/Registro';
import Consulta from './modules/Consulta';
import Seguimiento from './modules/Seguimiento';

const MODULOS = [
  { id: 'registro', label: 'Registro de rollos', icon: ClipboardPlus },
  { id: 'consulta', label: 'Consulta y afinidad', icon: Search },
  { id: 'seguimiento', label: 'Seguimiento', icon: BarChart3 },
] as const;
type ModuloId = (typeof MODULOS)[number]['id'];

export default function App() {
  const [modulo, setModulo] = useState<ModuloId>('registro');
  const [rollos, setRollos] = useState<Rollo[]>(ROLLOS_INICIALES);
  const [alertas, setAlertas] = useState<Alerta[]>(ALERTAS_INICIALES);
  const [afinidades, setAfinidades] = useState<Afinidad[]>(AFINIDADES_INICIALES);
  // Al abrir el demo, las alertas de las fichas reales (Telar 54 y Telar 56) llegan como nuevas.
  const [nuevas, setNuevas] = useState<string[]>(['a-r-54-1', 'a-r-56-1', 'a-r-56-2']);

  const abiertas = alertas.filter((a) => a.nivel !== 'resuelta').length;

  function registrarRollo(r: Rollo) {
    setRollos((rs) => [...rs, r]);
    const fuera = evaluar(r);
    if (fuera.length) {
      const a: Alerta = { id: `a-${r.id}`, rolloId: r.id, nivel: nivelPara(fuera), fueraDeRango: fuera, creada: r.fecha };
      setAlertas((as) => [...as, a]);
      setNuevas((n) => [...n, a.id]);
      beep();
    }
  }

  function verAlertas() {
    setNuevas([]);
    setModulo('consulta');
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-nude bg-crema/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <img src="/leonisa-logo.svg" alt="Leonisa" className="h-6" />
            <span className="hidden h-6 w-px bg-beige sm:block" />
            <span className="font-serif text-lg leading-tight">Control de calidad · Tejeduría</span>
          </div>
          <nav className="order-3 flex w-full gap-1 overflow-x-auto sm:order-none sm:w-auto sm:flex-1">
            {MODULOS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setModulo(id)}
                className={`flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  modulo === id ? 'bg-carbon text-crema' : 'hover:bg-nude/60'
                }`}
              >
                <Icon size={16} /> {label}
              </button>
            ))}
          </nav>
          <button onClick={verAlertas} className="relative ml-auto rounded-full p-2 hover:bg-nude/60" aria-label="Alertas abiertas">
            <Bell size={20} />
            {abiertas > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-crit px-1 text-[11px] font-bold text-white">
                {abiertas}
              </span>
            )}
          </button>
        </div>
      </header>

      {nuevas.length > 0 && (
        <div className="fixed bottom-5 right-5 z-30 w-[min(92vw,360px)]">
          <div className="alerta-pulso flex items-start gap-3 rounded-2xl bg-crit p-4 text-white shadow-xl">
            <Siren className="mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="font-bold tracking-wide">
                {nuevas.length} NUEVA{nuevas.length > 1 ? 'S' : ''} ALERTA{nuevas.length > 1 ? 'S' : ''}
              </p>
              <p className="text-sm opacity-90">Rollo no conforme: hay parámetros fuera del estándar.</p>
              <button onClick={verAlertas} className="mt-2 rounded-full bg-white px-3 py-1 text-xs font-bold text-crit">
                Ver y tomar acción
              </button>
            </div>
            <button onClick={() => setNuevas([])} aria-label="Cerrar">
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {modulo === 'registro' && <Registro rollos={rollos} onRegistrar={registrarRollo} />}
        {modulo === 'consulta' && (
          <Consulta
            rollos={rollos}
            alertas={alertas}
            setAlertas={setAlertas}
            afinidades={afinidades}
            onAfinidad={(a) => setAfinidades((as) => [...as, a])}
          />
        )}
        {modulo === 'seguimiento' && <Seguimiento rollos={rollos} alertas={alertas} afinidades={afinidades} />}
      </main>

      <footer className="pb-6 text-center text-xs text-gris">Demo visual · datos de ejemplo cargados en el navegador</footer>
    </div>
  );
}
