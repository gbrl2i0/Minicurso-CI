// Confete com WAAPI: pedacinhos nas cores do tema saem de um ponto, sobem e caem. Some sozinho.
const CORES = ['--ctp-green', '--ctp-mauve', '--ctp-peach', '--ctp-yellow', '--ctp-blue', '--ctp-pink', '--ctp-teal'];

export function confete(x = innerWidth / 2, y = innerHeight / 3) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const css = getComputedStyle(document.documentElement);
  const layer = document.createElement('div');
  layer.setAttribute('aria-hidden', 'true');
  layer.style.cssText = 'position:fixed;inset:0;pointer-events:none;overflow:hidden;z-index:60';
  document.body.append(layer);

  const fim: Promise<unknown>[] = [];
  for (let i = 0; i < 110; i++) {
    const p = document.createElement('i');
    const w = 6 + Math.random() * 5;
    const h = Math.random() < 0.3 ? w : w * 0.45;
    p.style.cssText = `position:absolute;left:${x - w / 2}px;top:${y - h / 2}px;width:${w}px;height:${h}px;border-radius:${h === w ? '50%' : '1px'};background:${css.getPropertyValue(CORES[i % CORES.length])}`;
    layer.append(p);
    // Sai num leque para cima, desacelera e cai com a gravidade, girando.
    const ang = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.1;
    const v = 140 + Math.random() * 300;
    const dx = Math.cos(ang) * v;
    const dy = Math.sin(ang) * v;
    const queda = innerHeight * 0.5 + Math.random() * innerHeight * 0.4;
    const giro = (Math.random() - 0.5) * 1440;
    const dur = 1600 + Math.random() * 1000;
    fim.push(
      p.animate(
        [
          { transform: 'translate(0, 0) rotate(0deg)', opacity: 1, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' },
          { transform: `translate(${dx}px, ${dy}px) rotate(${giro * 0.3}deg)`, opacity: 1, offset: 0.25, easing: 'cubic-bezier(0.45, 0, 0.75, 0.6)' },
          { transform: `translate(${dx * 1.4}px, ${dy + queda}px) rotate(${giro}deg)`, opacity: 0 },
        ],
        { duration: dur, fill: 'forwards' }
      ).finished
    );
  }
  Promise.allSettled(fim).then(() => layer.remove());
}
