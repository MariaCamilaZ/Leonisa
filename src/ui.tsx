import type { ReactNode } from 'react';
import type { EstadoAccion, NivelAlerta } from './data';

export function Card({ title, extra, children, className = '' }: { title?: ReactNode; extra?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`min-w-0 rounded-2xl border border-nude bg-white p-4 shadow-sm sm:p-5 ${className}`}>
      {title && (
        <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-serif text-xl font-semibold">{title}</h2>
          {extra}
        </header>
      )}
      {children}
    </section>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex min-w-0 flex-col gap-1 text-sm">
      <span className="font-medium text-gris">{label}</span>
      {children}
    </label>
  );
}

export const inputCls =
  'min-w-0 rounded-lg border border-nude bg-crema/40 px-3 py-2 outline-none focus:border-cobre focus:ring-2 focus:ring-beige/40';

export const btnPrimario =
  'inline-flex items-center justify-center gap-2 rounded-full bg-carbon px-5 py-2.5 text-sm font-semibold text-crema hover:bg-cobre transition-colors disabled:opacity-40';

export const btnSecundario =
  'inline-flex items-center justify-center gap-2 rounded-full border border-carbon px-4 py-2 text-sm font-semibold hover:bg-crema transition-colors';

const NIVEL: Record<NivelAlerta, { emoji: string; label: string; hint: string; cls: string }> = {
  advertencia: { emoji: '🟡', label: 'Advertencia', hint: 'revisar', cls: 'bg-warn/15 text-[#8a6a00] border-warn/40' },
  critica: { emoji: '🔴', label: 'Crítica', hint: 'atención inmediata', cls: 'bg-crit/10 text-crit border-crit/40' },
  resuelta: { emoji: '🟢', label: 'Resuelta', hint: 'acción correctiva realizada', cls: 'bg-ok/10 text-ok border-ok/40' },
};

export function NivelBadge({ nivel, conHint }: { nivel: NivelAlerta; conHint?: boolean }) {
  const n = NIVEL[nivel];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${n.cls}`}>
      {n.emoji} {n.label}
      {conHint && <span className="font-normal opacity-80">→ {n.hint}</span>}
    </span>
  );
}

export const ESTADO_ACCION: Record<EstadoAccion, { emoji: string; label: string }> = {
  pendiente: { emoji: '🔴', label: 'Pendiente' },
  proceso: { emoji: '🟡', label: 'En proceso' },
  cerrada: { emoji: '🟢', label: 'Cerrada' },
};

export function Cumple({ ok }: { ok: boolean }) {
  return ok ? (
    <span className="font-bold text-ok" title="Cumple">✓</span>
  ) : (
    <span className="font-bold text-crit" title="No cumple">✗</span>
  );
}

export const fmt = (n: number) => n.toLocaleString('es-CO', { maximumFractionDigits: 2 });

// Señal sonora corta con Web Audio, sin archivos.
export function beep() {
  try {
    const ctx = new AudioContext();
    [0, 0.25, 0.5].forEach((t) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.value = 880;
      g.gain.setValueAtTime(0.15, ctx.currentTime + t);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.2);
      o.connect(g).connect(ctx.destination);
      o.start(ctx.currentTime + t);
      o.stop(ctx.currentTime + t + 0.2);
    });
  } catch {
    /* sin audio disponible */
  }
}
