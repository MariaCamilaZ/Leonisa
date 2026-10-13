import { useState } from 'react';
import { Plus, Save, Trash2 } from 'lucide-react';
import { DEFECTOS, PARAMETROS, REFERENCIAS, cumple, evaluar, type Observacion, type Parametro, type Rollo } from '../data';
import { Card, Cumple, Field, btnPrimario, btnSecundario, fmt, inputCls } from '../ui';

const VACIO = { ancho: '', elongLargo: '', elongAncho: '', peso: '' } as Record<Parametro, string>;
const hoy = new Date().toLocaleDateString('en-CA');

export default function Registro({ rollos, onRegistrar }: { rollos: Rollo[]; onRegistrar: (r: Rollo) => void }) {
  const [telar, setTelar] = useState('54');
  const [rollo, setRollo] = useState('');
  const [turno, setTurno] = useState<1 | 2 | 3>(2);
  const [tejedor, setTejedor] = useState('Santiago');
  const [referencia, setReferencia] = useState('TEC 496');
  const [fecha, setFecha] = useState(hoy);
  const [muestra, setMuestra] = useState(VACIO);
  const [obs, setObs] = useState<Observacion[]>([]);
  const [tension, setTension] = useState('');
  const [nota, setNota] = useState('');
  const [guardado, setGuardado] = useState<string | null>(null);

  const est = REFERENCIAS.find((r) => r.codigo === referencia)!.estandar!;
  const numeros = Object.fromEntries(PARAMETROS.map((p) => [p.key, parseFloat(muestra[p.key].replace(',', '.'))])) as Record<Parametro, number>;
  const completo = PARAMETROS.every((p) => !Number.isNaN(numeros[p.key])) && telar && rollo && tejedor;
  const fuera = completo ? evaluar({ referencia, muestra: numeros }) : [];

  function guardar() {
    if (!completo) return;
    const r: Rollo = {
      id: `r-${telar}-${rollo}-${Date.now()}`,
      fecha,
      telar: +telar,
      rollo: +rollo,
      turno,
      tejedor,
      referencia,
      muestra: numeros,
      observaciones: obs.filter((o) => o.metros > 0),
      tensionPlegador: tension || undefined,
      nota: nota || undefined,
    };
    onRegistrar(r);
    setGuardado(fuera.length ? `Rollo ${rollo} registrado como NO CONFORME. Se generó una alerta.` : `Rollo ${rollo} registrado como CONFORME.`);
    setRollo('');
    setMuestra(VACIO);
    setObs([]);
    setTension('');
    setNota('');
  }

  // Precarga las muestras de las fichas reales para mostrar el flujo de alerta en vivo.
  function cargarFicha(ref: 'TEC 496' | 'TEC 305') {
    setReferencia(ref);
    if (ref === 'TEC 496') {
      setTelar('54');
      setRollo('8');
      setTurno(2);
      setTejedor('Santiago');
      setMuestra({ ancho: '140', elongLargo: '243', elongAncho: '208', peso: '183' });
      setObs([{ defecto: 'Por aguja', metros: 3 }]);
      setTension('');
      setNota('');
    } else {
      setTelar('56');
      setRollo('9');
      setTejedor('Edison');
      setMuestra({ ancho: '156', elongLargo: '87', elongAncho: '134', peso: '139' });
      setObs([]);
      setTension('33');
      setNota('Pol 78/68/1 · PIA 40/1');
    }
  }

  const recientes = [...rollos].sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, 8);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr]">
      <Card
        title="Registrar rollo"
        extra={
          <div className="flex gap-2">
            <button className={btnSecundario} onClick={() => cargarFicha('TEC 496')}>Ejemplo Tec 496</button>
            <button className={btnSecundario} onClick={() => cargarFicha('TEC 305')}>Ejemplo Tec 305</button>
          </div>
        }
      >
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Field label="Telar">
            <input className={inputCls} inputMode="numeric" value={telar} onChange={(e) => setTelar(e.target.value)} />
          </Field>
          <Field label="Rollo">
            <input className={inputCls} inputMode="numeric" value={rollo} onChange={(e) => setRollo(e.target.value)} placeholder="N.º" />
          </Field>
          <Field label="Turno">
            <select className={inputCls} value={turno} onChange={(e) => setTurno(+e.target.value as 1 | 2 | 3)}>
              <option value={1}>Turno 1</option>
              <option value={2}>Turno 2</option>
              <option value={3}>Turno 3</option>
            </select>
          </Field>
          <Field label="Tejedor (responsable)">
            <input className={inputCls} value={tejedor} onChange={(e) => setTejedor(e.target.value)} />
          </Field>
          <Field label="Referencia">
            <select className={inputCls} value={referencia} onChange={(e) => setReferencia(e.target.value)}>
              {REFERENCIAS.map((r) => (
                <option key={r.codigo} value={r.codigo} disabled={!r.disponible}>
                  {r.nombre}
                  {!r.disponible && ' (pendiente)'}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Fecha">
            <input type="date" className={inputCls} value={fecha} onChange={(e) => setFecha(e.target.value)} />
          </Field>
          <Field label="Tensión plegador">
            <input className={inputCls} value={tension} onChange={(e) => setTension(e.target.value)} />
          </Field>
        </div>

        <h3 className="mb-2 mt-6 font-serif text-lg font-semibold">Muestra 1 PL</h3>
        <div className="overflow-hidden rounded-xl border border-nude">
          <table className="w-full text-sm">
            <thead className="bg-crema text-left text-gris">
              <tr>
                <th className="px-3 py-2 font-medium">Parámetro</th>
                <th className="px-3 py-2 font-medium">Estándar</th>
                <th className="px-3 py-2 font-medium">Medido</th>
                <th className="w-12 px-3 py-2 text-center font-medium">✓/✗</th>
              </tr>
            </thead>
            <tbody>
              {PARAMETROS.map((p) => {
                const v = numeros[p.key];
                const ok = Number.isNaN(v) ? null : cumple(v, est[p.key]);
                return (
                  <tr key={p.key} className={`border-t border-nude ${ok === false ? 'bg-crit/5' : ''}`}>
                    <td className="px-3 py-2 font-medium">
                      {p.label} <span className="text-gris">{p.unidad}</span>
                    </td>
                    <td className="px-3 py-2 tabular-nums text-gris">
                      {fmt(est[p.key].min)} – {fmt(est[p.key].max)}
                    </td>
                    <td className="px-3 py-2">
                      <input
                        className={`${inputCls} w-24 py-1 tabular-nums`}
                        inputMode="decimal"
                        value={muestra[p.key]}
                        onChange={(e) => setMuestra({ ...muestra, [p.key]: e.target.value })}
                      />
                    </td>
                    <td className="px-3 py-2 text-center text-lg">{ok !== null && <Cumple ok={ok} />}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <h3 className="font-serif text-lg font-semibold">Observaciones / otros defectos</h3>
          <button className={btnSecundario} onClick={() => setObs([...obs, { defecto: DEFECTOS[0], metros: 0 }])}>
            <Plus size={14} /> Agregar
          </button>
        </div>
        {obs.length === 0 && <p className="mt-2 text-sm text-gris">Sin defectos por metros en el rollo.</p>}
        <div className="mt-2 flex flex-col gap-2">
          {obs.map((o, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                className={`${inputCls} w-20 py-1 tabular-nums`}
                type="number"
                min={0}
                value={o.metros || ''}
                placeholder="m"
                onChange={(e) => setObs(obs.map((x, j) => (j === i ? { ...x, metros: +e.target.value } : x)))}
              />
              <span className="text-sm text-gris">metros</span>
              <select
                className={`${inputCls} flex-1 py-1`}
                value={o.defecto}
                onChange={(e) => setObs(obs.map((x, j) => (j === i ? { ...x, defecto: e.target.value } : x)))}
              >
                {DEFECTOS.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
              <button onClick={() => setObs(obs.filter((_, j) => j !== i))} className="p-1 text-gris hover:text-crit" aria-label="Quitar">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-3">
          <Field label="Observación libre">
            <input className={inputCls} value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Ej: Pol 78/68/1 · PIA 40/1" />
          </Field>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-nude pt-5">
          <div className="text-sm">
            Estado:{' '}
            {!completo ? (
              <span className="text-gris">complete la muestra</span>
            ) : fuera.length ? (
              <span className="rounded-full bg-crit px-3 py-1 font-bold text-white">No conforme → Alerta</span>
            ) : (
              <span className="rounded-full bg-ok px-3 py-1 font-bold text-white">Conforme</span>
            )}
          </div>
          <button className={`${btnPrimario} ml-auto`} disabled={!completo} onClick={guardar}>
            <Save size={16} /> Registrar rollo
          </button>
        </div>
        {guardado && <p className="mt-3 rounded-lg bg-crema px-3 py-2 text-sm">{guardado}</p>}
      </Card>

      <Card title="Últimos rollos registrados">
        <ul className="divide-y divide-nude">
          {recientes.map((r) => {
            const f = evaluar(r);
            return (
              <li key={r.id} className="flex items-center gap-3 py-3">
                <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${f.length ? 'bg-crit' : 'bg-ok'}`} />
                <div className="flex-1 text-sm">
                  <p className="font-semibold">
                    Telar {r.telar} · Rollo {r.rollo} <span className="font-normal text-gris">· Turno {r.turno ?? '—'}</span>
                  </p>
                  <p className="text-gris">
                    {r.referencia} · {r.tejedor} · {r.fecha}
                    {r.observaciones.length > 0 && ` · ${r.observaciones.map((o) => `${o.metros} m ${o.defecto.toLowerCase()}`).join(', ')}`}
                    {r.nota && ` · ${r.nota}`}
                  </p>
                </div>
                <span className={`text-xs font-semibold ${f.length ? 'text-crit' : 'text-ok'}`}>{f.length ? 'No conforme' : 'Conforme'}</span>
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
}
