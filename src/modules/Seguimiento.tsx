import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ReferenceArea, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { PARAMETROS, REFERENCIAS, cumple, evaluar, type Afinidad, type Alerta, type Parametro, type Rollo } from '../data';
import { Card, fmt } from '../ui';

const C = { carbon: '#231f20', beige: '#c9a27e', nude: '#e8d5c4', ok: '#108474', warn: '#d4a017', crit: '#c0392b', gris: '#7e7d7c', cobre: '#a8754f' };

export default function Seguimiento({ rollos, alertas, afinidades }: { rollos: Rollo[]; alertas: Alerta[]; afinidades: Afinidad[] }) {
  const [param, setParam] = useState<Parametro>('ancho');
  const disponibles = REFERENCIAS.filter((r) => r.disponible);
  const [codigo, setCodigo] = useState(disponibles[0].codigo);
  const ref = disponibles.find((r) => r.codigo === codigo)!;
  const est = ref.estandar!;
  const p = PARAMETROS.find((x) => x.key === param)!;
  const rg = est[param];

  const ordenados = [...rollos].filter((r) => r.referencia === ref.codigo).sort((a, b) => a.fecha.localeCompare(b.fecha));
  const serie = ordenados.map((r) => ({ nombre: `T${r.telar}-R${r.rollo}`, fecha: r.fecha.slice(5), valor: r.muestra[param], ok: cumple(r.muestra[param], rg) }));
  const valores = serie.map((s) => s.valor);
  const pad = (rg.max - rg.min) * 0.6 || 1;
  const dominio = [Math.min(rg.min, ...valores) - pad, Math.max(rg.max, ...valores) + pad];

  const noConformes = ordenados.filter((r) => evaluar(r).length).length;
  const conformidad = ordenados.length ? Math.round(((ordenados.length - noConformes) / ordenados.length) * 100) : 0;
  const ids = new Set(ordenados.map((r) => r.id));
  alertas = alertas.filter((a) => ids.has(a.rolloId));
  const abiertas = alertas.filter((a) => a.nivel !== 'resuelta').length;
  const ultimaAfin = afinidades.filter((a) => a.referencia === ref.codigo).sort((a, b) => b.fecha.localeCompare(a.fecha))[0];

  const porTelar = agrupar(ordenados, (r) => `Telar ${r.telar}`);
  const porTurno = agrupar(ordenados, (r) => (r.turno ? `Turno ${r.turno}` : 'Sin turno'));

  const fallasPorParam = PARAMETROS.map((x) => ({ nombre: x.label, fallas: ordenados.filter((r) => !cumple(r.muestra[x.key], est[x.key])).length }));

  const estadoAlertas = [
    { nombre: 'Advertencia', valor: alertas.filter((a) => a.nivel === 'advertencia').length, color: C.warn },
    { nombre: 'Crítica', valor: alertas.filter((a) => a.nivel === 'critica').length, color: C.crit },
    { nombre: 'Resuelta', valor: alertas.filter((a) => a.nivel === 'resuelta').length, color: C.ok },
  ];

  const metrosDefecto = ordenados.flatMap((r) => r.observaciones).reduce<Record<string, number>>((acc, o) => ({ ...acc, [o.defecto]: (acc[o.defecto] ?? 0) + o.metros }), {});

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-gris">Referencia:</span>
        {REFERENCIAS.map((r) => (
          <button
            key={r.codigo}
            disabled={!r.disponible}
            onClick={() => setCodigo(r.codigo)}
            title={r.disponible ? '' : 'Pendiente: la enviarán próximamente'}
            className={`rounded-full px-4 py-1.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40 ${codigo === r.codigo ? 'bg-carbon text-crema' : 'border border-nude bg-white'}`}
          >
            {r.nombre}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Rollos medidos" valor={ordenados.length} sub={ref.nombre} />
        <Kpi label="Conformidad" valor={`${conformidad}%`} sub={`${noConformes} no conformes`} color={conformidad >= 85 ? C.ok : C.warn} />
        <Kpi label="Alertas abiertas" valor={abiertas} sub={`${alertas.length} en total`} color={abiertas ? C.crit : C.ok} />
        <Kpi label="Última afinidad" valor={ultimaAfin ? (ultimaAfin.resultado === 'conforme' ? 'Conforme' : 'No conforme') : '—'} sub={ultimaAfin ? `${ultimaAfin.fecha} · ${ultimaAfin.color}` : ''} />
      </div>

      <Card
        title={`Tendencia por parámetro · ${ref.nombre}`}
        extra={
          <div className="flex flex-wrap gap-1">
            {PARAMETROS.map((x) => (
              <button key={x.key} onClick={() => setParam(x.key)} className={`rounded-full px-3 py-1 text-xs font-medium ${param === x.key ? 'bg-carbon text-crema' : 'border border-nude'}`}>
                {x.label}
              </button>
            ))}
          </div>
        }
      >
        <p className="-mt-2 mb-3 text-sm text-gris">
          Franja = estándar {fmt(rg.min)} – {fmt(rg.max)} {p.unidad}. Puntos rojos = fuera de norma.
        </p>
        <div className="h-72">
          <ResponsiveContainer>
            <LineChart data={serie} margin={{ top: 10, right: 16, bottom: 0, left: 0 }}>
              <CartesianGrid stroke={C.nude} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="nombre" tick={{ fontSize: 11, fill: C.gris }} />
              <YAxis domain={dominio} tickFormatter={(v) => fmt(v)} tick={{ fontSize: 11, fill: C.gris }} width={60} />
              <ReferenceArea y1={rg.min} y2={rg.max} fill={C.ok} fillOpacity={0.12} stroke={C.ok} strokeOpacity={0.3} />
              <Tooltip formatter={(v) => [`${fmt(Number(v))} ${p.unidad}`, p.label]} labelFormatter={(l, pl) => `${l} · ${pl?.[0]?.payload.fecha ?? ''}`} />
              <Line
                type="monotone"
                dataKey="valor"
                stroke={C.carbon}
                strokeWidth={2}
                dot={(d: { cx?: number; cy?: number; index?: number; payload?: { ok: boolean } }) => (
                  <circle key={d.index} cx={d.cx} cy={d.cy} r={d.payload?.ok ? 4 : 6} fill={d.payload?.ok ? C.carbon : C.crit} stroke="#fff" strokeWidth={1.5} />
                )}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Conformidad por telar">
          <Barras data={porTelar} />
        </Card>
        <Card title="Conformidad por turno">
          <Barras data={porTurno} />
        </Card>
        <Card title="Estado de alertas">
          <div className="h-56">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={estadoAlertas} dataKey="valor" nameKey="nombre" innerRadius={50} outerRadius={80} paddingAngle={3}>
                  {estadoAlertas.map((e) => (
                    <Cell key={e.nombre} fill={e.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Parámetros que más fallan">
          <div className="h-56">
            <ResponsiveContainer>
              <BarChart data={fallasPorParam} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid stroke={C.nude} horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: C.gris }} />
                <YAxis type="category" dataKey="nombre" width={120} tick={{ fontSize: 12, fill: C.carbon }} />
                <Tooltip />
                <Bar dataKey="fallas" name="Rollos fuera de norma" fill={C.cobre} radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Otras novedades (observaciones)">
          {Object.keys(metrosDefecto).length === 0 ? (
            ordenados.some((r) => r.nota) ? null : <p className="text-sm text-gris">Sin observaciones registradas.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {Object.entries(metrosDefecto).map(([d, m]) => (
                <li key={d} className="flex items-center justify-between rounded-xl bg-crema/60 px-4 py-3">
                  <span className="font-medium">{d}</span>
                  <span className="font-serif text-2xl">{m} m</span>
                </li>
              ))}
            </ul>
          )}
          <ul className="mt-4 divide-y divide-nude text-sm">
            {ordenados
              .filter((r) => r.observaciones.length || r.nota)
              .map((r) => (
                <li key={r.id} className="flex justify-between py-2">
                  <span>Telar {r.telar} · Rollo {r.rollo} · {r.fecha}</span>
                  <span className="text-gris">{[...r.observaciones.map((o) => `${o.metros} m ${o.defecto.toLowerCase()}`), r.nota].filter(Boolean).join(', ')}</span>
                </li>
              ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

function agrupar(rollos: Rollo[], clave: (r: Rollo) => string) {
  const m = new Map<string, { nombre: string; conformes: number; noConformes: number }>();
  for (const r of rollos) {
    const k = clave(r);
    const g = m.get(k) ?? { nombre: k, conformes: 0, noConformes: 0 };
    evaluar(r).length ? g.noConformes++ : g.conformes++;
    m.set(k, g);
  }
  return [...m.values()].sort((a, b) => a.nombre.localeCompare(b.nombre));
}

function Barras({ data }: { data: { nombre: string; conformes: number; noConformes: number }[] }) {
  return (
    <div className="h-56">
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid stroke={C.nude} vertical={false} />
          <XAxis dataKey="nombre" tick={{ fontSize: 12, fill: C.carbon }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: C.gris }} width={30} />
          <Tooltip />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="conformes" name="Conformes" stackId="a" fill={C.ok} />
          <Bar dataKey="noConformes" name="No conformes" stackId="a" fill={C.crit} radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function Kpi({ label, valor, sub, color = C.carbon }: { label: string; valor: string | number; sub: string; color?: string }) {
  return (
    <div className="rounded-2xl border border-nude bg-white p-5 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-gris">{label}</p>
      <p className="mt-1 font-serif text-3xl" style={{ color }}>
        {valor}
      </p>
      <p className="mt-1 text-xs text-gris">{sub}</p>
    </div>
  );
}
