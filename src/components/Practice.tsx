import { useState } from 'react';
import { Check, ExternalLink } from 'lucide-react';
import type { Track } from '../content';
import { Line } from '../highlight';
import { cn } from '../cn';
import { CodeBlock, CopyButton, Toggle } from './ui';
import { ymlText } from './Workflow';

const DONE_KEY = 'ci-apoio-roteiro';

function readDone(): Record<string, boolean> {
  try {
    return JSON.parse(localStorage.getItem(DONE_KEY) || '{}');
  } catch {
    return {};
  }
}

type Props = { t: Track; copied: string | null; onCopy: (id: string, text: string) => void };

/** Roteiro da prática: passos com comandos para copiar, progresso salvo e "Mostrar como faz". */
function Practice({ t, copied, onCopy }: Props) {
  const [done, setDone] = useState(readDone);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const repoUrl = t.pastaUrl;
  const count = t.steps.filter((_, i) => done[`${t.id}-${i}`]).length;
  const pct = Math.round((count / t.steps.length) * 100);

  function toggleDone(key: string) {
    setDone((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem(DONE_KEY, JSON.stringify(next));
      } catch {
        // sem localStorage: o progresso vale só para esta visita
      }
      return next;
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ctp-surface-0 bg-ctp-mantle px-4 py-3">
        <div className="min-w-0">
          <p className="text-xs text-ctp-meta">Repositório-base</p>
          <a
            href={repoUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 truncate font-mono text-sm text-ctp-text underline decoration-ctp-surface-2 underline-offset-4 hover:decoration-ctp-accent"
          >
            {t.repo}/{t.pasta}
            <ExternalLink size={13} aria-hidden="true" />
          </a>
        </div>
        <CopyButton id="repo" text={repoUrl} copied={copied} onCopy={onCopy} />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between font-mono text-xs text-ctp-meta">
          <span>progresso</span>
          <span className="tabular-nums" aria-live="polite">
            {count} de {t.steps.length} passos
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-ctp-surface-0">
          <div
            className="h-full rounded-full bg-ctp-accent transition-[width] duration-300 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <ol className="space-y-4">
        {t.steps.map((step, i) => {
          const key = `${t.id}-${i}`;
          const isDone = !!done[key];
          const isOpen = !!open[key];
          return (
            <li
              key={key}
              className={cn(
                'space-y-4 rounded-xl border p-4 transition-colors sm:p-5',
                isDone ? 'border-ctp-green/40' : 'border-ctp-surface-0'
              )}
            >
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={isDone}
                  aria-label={`Marcar o passo ${i + 1} como feito`}
                  onClick={() => toggleDone(key)}
                  className={cn(
                    'mt-0.5 grid size-5 shrink-0 cursor-pointer place-items-center rounded border transition-colors',
                    isDone ? 'border-ctp-green bg-ctp-green text-ctp-base' : 'border-ctp-surface-2 hover:border-ctp-accent'
                  )}
                >
                  {isDone && <Check size={13} strokeWidth={3} aria-hidden="true" />}
                </button>
                <div>
                  <p className="font-mono text-xs text-ctp-meta">passo {i + 1}</p>
                  <h3 className={cn('font-semibold', isDone ? 'text-ctp-subtext-0 line-through decoration-ctp-surface-2' : 'text-ctp-text')}>
                    {step.t}
                  </h3>
                </div>
              </div>

              {step.parts.map((part, j) => {
                const pid = `${key}-${j}`;
                if (part.kind === 'cmds')
                  return (
                    <div key={pid} className="overflow-hidden rounded-lg border border-ctp-surface-0 bg-ctp-mantle">
                      <ul className="divide-y divide-ctp-surface-0/70">
                        {part.items.map(([cmd, why], k) => {
                          const shown = part.lang === 'sh' && cmd[0] !== '#' ? `$ ${cmd}` : cmd;
                          return (
                            <li key={k} className="px-3 py-2">
                              <div className="flex items-center gap-3">
                                <code className="flex-1 overflow-x-auto font-mono text-[13px] whitespace-pre">
                                  <Line text={shown} lang={part.lang} />
                                </code>
                                <CopyButton id={`${pid}-${k}`} text={cmd} copied={copied} onCopy={onCopy} />
                              </div>
                              {isOpen && why && <p className="mt-1 text-sm text-ctp-subtext-0">{why}</p>}
                            </li>
                          );
                        })}
                      </ul>
                      {part.items.length > 1 && (
                        <div className="flex justify-end border-t border-ctp-surface-0 px-2 py-1">
                          <CopyButton
                            id={`${pid}-all`}
                            text={part.items.map(([c]) => c).join('\n')}
                            copied={copied}
                            onCopy={onCopy}
                            label="copiar todos"
                          />
                        </div>
                      )}
                    </div>
                  );
                if (part.kind === 'code')
                  return (
                    <CodeBlock
                      key={pid}
                      name={part.block[0]}
                      lang={part.block[1]}
                      code={part.block[2]}
                      copy={{ id: pid, copied, onCopy }}
                    />
                  );
                if (part.kind === 'clicks')
                  return (
                    <ol key={pid} className="space-y-1.5 text-[15px] text-ctp-subtext-1">
                      {part.items.map((item, k) => (
                        <li key={k} className="flex gap-3">
                          <span className="w-5 shrink-0 text-right font-mono text-xs leading-6 text-ctp-meta">{k + 1}.</span>
                          {item}
                        </li>
                      ))}
                    </ol>
                  );
                return (
                  <CopyButton
                    key={pid}
                    id={`wf-${pid}`}
                    text={ymlText(t)}
                    copied={copied}
                    onCopy={onCopy}
                    label={`copiar o ${t.wf} inteiro`}
                    className="border border-ctp-surface-1"
                  />
                );
              })}

              <Toggle open={isOpen} onClick={() => setOpen((o) => ({ ...o, [key]: !o[key] }))}>
                {isOpen ? 'Esconder detalhes' : 'Mostrar como faz'}
              </Toggle>
              {isOpen && (
                <div className="space-y-2 rounded-lg bg-ctp-surface-0/40 px-4 py-3 text-[15px] leading-relaxed">
                  <p className="text-ctp-text">
                    <span className="font-medium">O que deve aparecer: </span>
                    <span className="text-ctp-subtext-1">{step.tela}</span>
                  </p>
                  {step.dicas.map((dica) => (
                    <p key={dica} className="text-ctp-subtext-0">
                      Dica: {dica}
                    </p>
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export default Practice;
