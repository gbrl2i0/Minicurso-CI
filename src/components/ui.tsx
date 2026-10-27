import type { ReactNode } from 'react';
import { Check, Copy } from 'lucide-react';
import type { Foto as FotoT, Lang } from '../content';
import { Line } from '../highlight';
import { cn } from '../cn';

type CopyProps = {
  id: string;
  text: string;
  copied: string | null;
  onCopy: (id: string, text: string) => void;
  label?: string;
  className?: string;
};

export function CopyButton({ id, text, copied, onCopy, label = 'copiar', className }: CopyProps) {
  const done = copied === id;
  return (
    <button
      type="button"
      onClick={() => onCopy(id, text)}
      className={cn(
        'inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 font-mono text-xs transition-colors',
        done ? 'text-ctp-accent' : 'text-ctp-meta hover:bg-ctp-surface-0/60 hover:text-ctp-text',
        className
      )}
    >
      {done ? <Check size={13} aria-hidden="true" /> : <Copy size={13} aria-hidden="true" />}
      <span aria-live="polite">{done ? 'copiado' : label}</span>
    </button>
  );
}

type CodeProps = {
  name: string;
  lang: Lang;
  code: string;
  copy?: Omit<CopyProps, 'text' | 'label' | 'className'>;
  actions?: ReactNode;
  after?: ReactNode;
};

/** Bloco de código com o nome do arquivo em cima, como uma aba de editor. */
export function CodeBlock({ name, lang, code, copy, actions, after }: CodeProps) {
  return (
    <figure className="overflow-hidden rounded-xl border border-ctp-surface-0 bg-ctp-mantle">
      <figcaption className="flex items-center justify-between gap-3 border-b border-ctp-surface-0 px-4 py-2">
        <span className="truncate font-mono text-xs text-ctp-subtext-0">{name}</span>
        <span className="flex items-center gap-1">
          {actions}
          {copy && <CopyButton {...copy} text={code} />}
        </span>
      </figcaption>
      <pre className="overflow-x-auto px-4 py-3.5 font-mono text-[13px] leading-6">
        <code>
          {code.split('\n').map((line, i) => (
            <span key={i} className="block">
              <Line text={line} lang={lang} />
            </span>
          ))}
        </code>
      </pre>
      {after}
    </figure>
  );
}

type SectionProps = {
  id: string;
  number: string;
  label: string;
  title: string;
  intro?: ReactNode;
  children: ReactNode;
};

/** Seção numerada: rótulo pequeno com o número, título e texto de abertura. */
export function Section({ id, number, label, title, intro, children }: SectionProps) {
  return (
    <section id={id} aria-labelledby={`${id}-titulo`} className="space-y-8 border-t border-ctp-surface-0 py-16">
      <header className="space-y-3">
        <p className="font-mono text-xs text-ctp-meta">
          <span className="text-ctp-accent">{number}</span> · {label}
        </p>
        <h2 id={`${id}-titulo`} className="text-2xl font-semibold tracking-tight text-ctp-text sm:text-3xl">
          {title}
        </h2>
        {intro && <p className="prose-text">{intro}</p>}
      </header>
      {children}
    </section>
  );
}

/** Botão de abrir/fechar com + e −. */
export function Toggle({ open, onClick, children }: { open: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-expanded={open}
      onClick={onClick}
      className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-ctp-subtext-1 transition-colors hover:text-ctp-accent"
    >
      <span aria-hidden="true" className="grid size-5 place-items-center rounded border border-ctp-surface-1 font-mono text-xs">
        {open ? '−' : '+'}
      </span>
      {children}
    </button>
  );
}

/** Captura de tela real do GitHub, com legenda. Fica em public/fotos. */
export function Foto({ foto }: { foto: FotoT }) {
  return (
    <figure className="space-y-2">
      <a href={`${import.meta.env.BASE_URL}fotos/${foto.src}`} target="_blank" rel="noreferrer" className="block">
        <img
          src={`${import.meta.env.BASE_URL}fotos/${foto.src}`}
          alt={foto.alt}
          width={foto.w}
          height={foto.h}
          loading="lazy"
          decoding="async"
          className="h-auto w-full rounded-lg border border-ctp-surface-0 bg-white"
        />
      </a>
      <figcaption className="text-sm text-ctp-subtext-0">{foto.legenda}</figcaption>
    </figure>
  );
}
