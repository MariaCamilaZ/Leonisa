import { useState, type Dispatch, type SetStateAction } from 'react';
import { Droplet, Search, Wrench, X } from 'lucide-react';
import { PARAMETROS, REFERENCIAS, cumple, evaluar, nivelPara, type Accion, type Afinidad, type Alerta, type EstadoAccion, type Rollo } from '../data';
import { Card, Cumple, ESTADO_ACCION, Field, NivelBadge, btnPrimario, btnSecundario, fmt, inputCls } from '../ui';

type Props = {
  rollos: Rollo[];
  alertas: Alerta[];
  setAlertas: Dispatch<SetStateAction<Alerta[]>>;
  afinidades: Afinidad[];
  onAfinidad: (a: Afinidad) => void;
};

export default function Consulta({ rollos, alertas, setAlertas, afinidades, onAfinidad }: Props) {
  const [busqueda, setBusqueda] = useState('TEC 496');
  const [accionDe, setAccionDe] = useState<Alerta | null>(null);
  const [filtro, setFiltro] = useState<'abiertas' | 'todas'>('abiertas');

  const ref = REFERENCIAS.find((r) => r.codigo.replace(/\s/g, '').toLowerCase() === busqueda.replace(/\s/g, '').toLowerCase());
  const rollosRef = ref ? rollos.filter((r) => r.referencia === ref.codigo) : [];
  const ids = new Set(rollosRef.map((r) => r.id));
  const alertasRef = alertas
    .filter((a) => ids.has(a.rolloId) && (filtro === 'todas' || a.nivel !== 'resuelta'))
    .sort((a, b) => b.creada.localeCompare(a.creada));
  const afinRef = afinidades.filter((a) => ref && a.referencia === ref.codigo).sort((a, b) => b.fecha.localeCompare(a.fecha));
  const ultimaAfin = afinRef[0];
  const ultimoRollo = rollosRef[rollosRef.length - 1];

  function guardarAccion(alerta: Alerta, accion: Accion) {
    setAlertas((as) =>
      as.map((a) => (a.id === alerta.id ? { ...a, accion, nivel: accion.estado === 'cerrada' ? 'resuelta' : nivelPara(a.fueraDeRango) } : a)),
    );
    setAccionDe(null);
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <div className="flex flex-wrap items-end gap-4">
          <Field label="Consultar por referencia">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gris" />
              <input
                className={`${inputCls} w-full pl-9 sm:w-72`}
                list="refs"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Ej: TEC 496"
              />
              <datalist id="refs">
                {REFERENCIAS.filter((r) => r.disponible).map((r) => (
                  <option key={r.codigo} value={r.codigo} />
                ))}
              </datalist>
            </div>
          </Field>
          <div className="flex flex-wrap gap-2 text-sm">
            {REFERENCIAS.map((r) => (
              <button
                key={r.codigo}
                disabled={!r.disponible}
                onClick={() => setBusqueda(r.codigo)}
                className="rounded-full border border-nude px-3 py-1.5 hover:bg-crema disabled:cursor-not-allowed disabled:opacity-40"
                title={r.disponible ? '' : 'Pendiente: la enviarán próximamente'}
              >
                {r.nombre}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {!ref && <p className="text-center text-gris">No se encontró la referencia "{busqueda}".</p>}
      {ref && !ref.disponible && <p className="text-center text-gris">{ref.nombre}: información pendiente por recibir.</p>}

      {ref?.estandar && (
        <>
          <div className="grid gap-6 lg:grid-cols-3">
            <Card title={`Ficha técnica · ${ref.nombre}`} className="lg:col-span-2">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {PARAMETROS.map((p) => {
                  const r = ref.estandar![p.key];
                  const v = ultimoRollo?.muestra[p.key];
                  return (
                    <div key={p.key} className="rounded-xl bg-crema/60 p-3">
                      <p className="text-xs font-medium uppercase tracking-wide text-gris">
                        {p.label} ({p.unidad})
                      </p>
                      <p className="mt-1 font-serif text-lg tabular-nums">
                        {fmt(r.min)} – {fmt(r.max)}
                      </p>
                      {v !== undefined && (
                        <p className="mt-1 text-sm">
                          Último: <b className="tabular-nums">{fmt(v)}</b> <Cumple ok={cumple(v, r)} />
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3 text-center text-sm">
                <Dato n={rollosRef.length} label="Rollos medidos" />
                <Dato n={rollosRef.filter((r) => evaluar(r).length).length} label="No conformes" />
                <Dato n={rollosRef.filter((r) => r.observaciones.length || r.nota).length} label="Con observaciones" />
              </div>
            </Card>

            <Card title={<span className="flex items-center gap-2"><Droplet size={18} className="text-cobre" /> Última afinidad</span>}>
              {ultimaAfin ? (
                <div className="space-y-2 text-sm">
                  <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold text-white ${ultimaAfin.resultado === 'conforme' ? 'bg-ok' : 'bg-crit'}`}>
                    {ultimaAfin.resultado === 'conforme' ? 'Conforme' : 'No conforme'}
                  </span>
                  <p><span className="text-gris">Fecha:</span> {ultimaAfin.fecha}</p>
                  <p><span className="text-gris">Telar / Rollo:</span> {ultimaAfin.telar} / {ultimaAfin.rollo}</p>
                  <p><span className="text-gris">Color de tintura:</span> {ultimaAfin.color}</p>
                  <p><span className="text-gris">Condición:</span> {ultimaAfin.observacion || '—'}</p>
                </div>
              ) : (
                <p className="text-sm text-gris">Sin muestras de afinidad registradas.</p>
              )}
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            <Card
              title={<span className="flex items-center gap-2">Alertas {alertasRef.some((a) => a.nivel === 'critica') && <span className="alerta-pulso h-2.5 w-2.5 rounded-full bg-crit" />}</span>}
              extra={
                <div className="flex rounded-full border border-nude p-0.5 text-xs">
                  {(['abiertas', 'todas'] as const).map((f) => (
                    <button key={f} onClick={() => setFiltro(f)} className={`rounded-full px-3 py-1 capitalize ${filtro === f ? 'bg-carbon text-crema' : ''}`}>
                      {f}
                    </button>
                  ))}
                </div>
              }
            >
              <div className="mb-4 flex flex-wrap gap-2">
                <NivelBadge nivel="advertencia" conHint />
                <NivelBadge nivel="critica" conHint />
                <NivelBadge nivel="resuelta" conHint />
              </div>
              {alertasRef.length === 0 && <p className="text-sm text-gris">No hay alertas {filtro === 'abiertas' ? 'abiertas' : ''}.</p>}
              <ul className="flex flex-col gap-3">
                {alertasRef.map((a) => {
                  const r = rollos.find((x) => x.id === a.rolloId)!;
                  return (
                    <li key={a.id} className="rounded-xl border border-nude p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <NivelBadge nivel={a.nivel} />
                        <span className="font-semibold">Telar {r.telar} · Rollo {r.rollo}</span>
                        <span className="text-sm text-gris">Turno {r.turno ?? '—'} · {r.tejedor} · {a.creada}</span>
                        <button className={`${a.accion ? btnSecundario : btnPrimario} ml-auto py-1.5`} onClick={() => setAccionDe(a)}>
                          <Wrench size={14} /> {a.accion ? 'Ver seguimiento' : 'Tomar acción'}
                        </button>
                      </div>
                      <p className="mt-2 text-sm">
                        Fuera de estándar:{' '}
                        {a.fueraDeRango.map((k) => {
                          const p = PARAMETROS.find((x) => x.key === k)!;
                          const rg = ref.estandar![k];
                          return (
                            <span key={k} className="mr-2 inline-block rounded bg-crit/10 px-2 py-0.5 text-crit">
                              {p.label}: {fmt(r.muestra[k])} {p.unidad} (std {fmt(rg.min)}–{fmt(rg.max)})
                            </span>
                          );
                        })}
                      </p>
                      {r.observaciones.length > 0 && (
                        <p className="mt-1 text-sm text-gris">Observaciones: {r.observaciones.map((o) => `${o.metros} m ${o.defecto.toLowerCase()}`).join(', ')}</p>
                      )}
                      {(r.nota || r.tensionPlegador) && (
                        <p className="mt-1 text-sm text-gris">
                          {r.tensionPlegador && `Tensión plegador: ${r.tensionPlegador}`}
                          {r.tensionPlegador && r.nota && ' · '}
                          {r.nota && `Observación: ${r.nota}`}
                        </p>
                      )}
                      {a.accion && (
                        <p className="mt-2 rounded-lg bg-crema/60 px-3 py-2 text-sm">
                          {ESTADO_ACCION[a.accion.estado].emoji} <b>{ESTADO_ACCION[a.accion.estado].label}</b> · {a.accion.accion} · {a.accion.responsable}
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>
            </Card>

            <FormAfinidad referencia={ref.codigo} onGuardar={onAfinidad} historial={afinRef} />
          </div>
        </>
      )}

      {accionDe && <ModalAccion alerta={accionDe} onCerrar={() => setAccionDe(null)} onGuardar={guardarAccion} />}
    </div>
  );
}

function Dato({ n, label }: { n: number; label: string }) {
  return (
    <div className="rounded-xl border border-nude p-3">
      <p className="font-serif text-2xl">{n}</p>
      <p className="text-gris">{label}</p>
    </div>
  );
}

function FormAfinidad({ referencia, onGuardar, historial }: { referencia: string; onGuardar: (a: Afinidad) => void; historial: Afinidad[] }) {
  const [f, setF] = useState({ fecha: new Date().toLocaleDateString('en-CA'), telar: '54', rollo: '', color: '', resultado: 'conforme' as Afinidad['resultado'], observacion: '' });
  const listo = f.rollo && f.color;
  return (
    <Card title="Registrar muestra de afinidad">
      <p className="-mt-2 mb-4 text-sm text-gris">Muestra tinturada con un color para revisar el estado de la tela.</p>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Fecha"><input type="date" className={inputCls} value={f.fecha} onChange={(e) => setF({ ...f, fecha: e.target.value })} /></Field>
        <Field label="Color de tintura"><input className={inputCls} value={f.color} onChange={(e) => setF({ ...f, color: e.target.value })} placeholder="Ej: Negro 700" /></Field>
        <Field label="Telar"><input className={inputCls} value={f.telar} onChange={(e) => setF({ ...f, telar: e.target.value })} /></Field>
        <Field label="Rollo"><input className={inputCls} value={f.rollo} onChange={(e) => setF({ ...f, rollo: e.target.value })} /></Field>
        <Field label="Resultado">
          <select className={inputCls} value={f.resultado} onChange={(e) => setF({ ...f, resultado: e.target.value as Afinidad['resultado'] })}>
            <option value="conforme">Conforme</option>
            <option value="no-conforme">No conforme</option>
          </select>
        </Field>
        <Field label="Condición observada"><input className={inputCls} value={f.observacion} onChange={(e) => setF({ ...f, observacion: e.target.value })} /></Field>
      </div>
      <button
        className={`${btnPrimario} mt-4 w-full`}
        disabled={!listo}
        onClick={() => {
          onGuardar({ id: `af-${Date.now()}`, referencia, fecha: f.fecha, telar: +f.telar, rollo: +f.rollo, color: f.color, resultado: f.resultado, observacion: f.observacion });
          setF({ ...f, rollo: '', color: '', observacion: '' });
        }}
      >
        <Droplet size={16} /> Guardar afinidad
      </button>
      <h3 className="mb-2 mt-5 text-sm font-semibold text-gris">Historial</h3>
      <ul className="divide-y divide-nude text-sm">
        {historial.map((a) => (
          <li key={a.id} className="flex justify-between py-2">
            <span>{a.fecha} · T{a.telar}/R{a.rollo} · {a.color}</span>
            <span className={a.resultado === 'conforme' ? 'text-ok' : 'text-crit'}>{a.resultado === 'conforme' ? 'Conforme' : 'No conforme'}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function ModalAccion({ alerta, onCerrar, onGuardar }: { alerta: Alerta; onCerrar: () => void; onGuardar: (a: Alerta, acc: Accion) => void }) {
  const [acc, setAcc] = useState<Accion>(
    alerta.accion ?? { causa: '', accion: '', responsable: '', fecha: new Date().toLocaleDateString('en-CA'), estado: 'pendiente' },
  );
  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-carbon/50 p-4" onClick={onCerrar}>
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-2xl">Tomar acción</h2>
          <button onClick={onCerrar} aria-label="Cerrar"><X /></button>
        </div>
        <div className="flex flex-col gap-3">
          <Field label="Causa encontrada"><textarea rows={2} className={inputCls} value={acc.causa} onChange={(e) => setAcc({ ...acc, causa: e.target.value })} /></Field>
          <Field label="Acción correctiva"><textarea rows={2} className={inputCls} value={acc.accion} onChange={(e) => setAcc({ ...acc, accion: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Responsable"><input className={inputCls} value={acc.responsable} onChange={(e) => setAcc({ ...acc, responsable: e.target.value })} /></Field>
            <Field label="Fecha"><input type="date" className={inputCls} value={acc.fecha} onChange={(e) => setAcc({ ...acc, fecha: e.target.value })} /></Field>
          </div>
          <Field label="Estado">
            <div className="flex gap-2">
              {(Object.keys(ESTADO_ACCION) as EstadoAccion[]).map((k) => (
                <button
                  key={k}
                  onClick={() => setAcc({ ...acc, estado: k })}
                  className={`flex-1 rounded-full border px-3 py-2 text-sm ${acc.estado === k ? 'border-carbon bg-carbon text-crema' : 'border-nude'}`}
                >
                  {ESTADO_ACCION[k].emoji} {ESTADO_ACCION[k].label}
                </button>
              ))}
            </div>
          </Field>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button className={btnSecundario} onClick={onCerrar}>Cancelar</button>
          <button className={btnPrimario} disabled={!acc.causa || !acc.accion || !acc.responsable} onClick={() => onGuardar(alerta, acc)}>Guardar seguimiento</button>
        </div>
      </div>
    </div>
  );
}
