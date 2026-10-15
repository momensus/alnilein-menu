import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Route, Switch } from 'wouter';
import { fetchMenu, fetchSite, formatPrice, menuQueryKey, siteQueryKey, useMenuLiveUpdates, type PublicMenuCategory, type PublicMenuItem } from './lib/menu-api';
import { art, itemArt, fishSVG, FISH_COLORS, CHECK_SVG, SEARCH_SVG, PHONE_SVG, PAYMENT_LOGOS, CATEGORY_ART } from './lib/art';
import { RESTAURANT_NAME, RESTAURANT_SUB } from './lib/site';
import AdminPage from './pages/admin';

function norm(s: string): string {  return s
    .replace(/[\u064B-\u0652]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .toLocaleLowerCase('ar');
}

/** Inline style with CSS custom properties. */
function css(vars: Record<string, string | number>): CSSProperties {
  return vars as CSSProperties;
}

type Bubble = { left: string; size: number; d: string; dl: string };
function makeBubbles(n: number, min: number, max: number, dMin: number, dMax: number, seed: number): Bubble[] {
  const out: Bubble[] = [];
  let s = seed;
  const rnd = () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
  for (let i = 0; i < n; i += 1) {
    out.push({
      left: `${(rnd() * 96).toFixed(1)}%`,
      size: Math.round(min + rnd() * (max - min)),
      d: `${(dMin + rnd() * (dMax - dMin)).toFixed(1)}s`,
      dl: `${(rnd() * dMax).toFixed(1)}s`,
    });
  }
  return out;
}

type HeroFish = { top: string; w: number; dur: string; delay: string; colors: [string, string, string]; rev: boolean };
const HERO_FISH: HeroFish[] = [
  { top: '9%', w: 132, dur: '24s', delay: '-6s', colors: FISH_COLORS.ember, rev: false },
  { top: '23%', w: 108, dur: '28s', delay: '-18s', colors: FISH_COLORS.ember, rev: true },
  { top: '48%', w: 40, dur: '22s', delay: '-3s', colors: FISH_COLORS.pearl, rev: false },
  { top: '51%', w: 36, dur: '22s', delay: '-5s', colors: FISH_COLORS.pearl, rev: false },
  { top: '54%', w: 42, dur: '22s', delay: '-7s', colors: FISH_COLORS.pearl, rev: false },
  { top: '50%', w: 38, dur: '22s', delay: '-9s', colors: FISH_COLORS.pearl, rev: false },
  { top: '80%', w: 84, dur: '25s', delay: '-12s', colors: FISH_COLORS.gold, rev: true },
];

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through */
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

function MenuPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loaderOn, setLoaderOn] = useState(true);
  const [loaderGone, setLoaderGone] = useState(false);
  const [selected, setSelected] = useState<{ item: PublicMenuItem; category: PublicMenuCategory } | null>(null);
  const [activePay, setActivePay] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const [progress, setProgress] = useState(0);
  const heroRef = useRef<HTMLElement>(null);
  const copyTimer = useRef<number | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: menuQueryKey,
    queryFn: fetchMenu,
  });
  const { data: siteData } = useQuery({
    queryKey: siteQueryKey,
    queryFn: fetchSite,
  });
  useMenuLiveUpdates(true);

  const sitePhones = useMemo(() => siteData?.phones ?? [], [siteData]);
  const sitePayments = useMemo(() => siteData?.payments ?? [], [siteData]);

  const menuCategories = useMemo(() => data?.categories ?? [], [data]);

  // Loader: fixed timing, then remove from DOM
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.body.style.overflow = 'hidden';
    const t1 = window.setTimeout(() => setLoaderOn(false), reduced ? 300 : 2700);
    const t2 = window.setTimeout(() => {
      setLoaderGone(true);
      document.body.style.overflow = '';
    }, (reduced ? 300 : 2700) + 1100);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      document.body.style.overflow = '';
    };
  }, []);

  // Scroll progress + back-to-top visibility
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
      setShowTop(window.scrollY > 600);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const filteredCategories = useMemo(() => {
    const query = norm(searchTerm.trim());
    return menuCategories
      .filter((category) => activeCategory === 'all' || category.id === activeCategory)
      .map((category) => ({
        ...category,
        items: category.items.filter((item) => !query || norm(item.name).includes(query)),
      }))
      .filter((category) => category.items.length > 0);
  }, [activeCategory, searchTerm, menuCategories]);

  const chooseCategory = (id: string) => {
    setActiveCategory(id);
    document.getElementById('list')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Scroll reveal
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const els = Array.from(document.querySelectorAll('.rv:not(.in)'));
    if (reduced || !('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, k) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).style.transitionDelay = `${(k % 5) * 55}ms`;
            entry.target.classList.add('in');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.06, rootMargin: '0px 0px -5% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [filteredCategories, isLoading]);

  // Tap ripple (delegated)
  const onRipple = useCallback((event: React.PointerEvent) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const target = (event.target as HTMLElement).closest('.row, .chip, .pm, .cta, .copy');
    if (!target) return;
    const rect = (target as HTMLElement).getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const rip = document.createElement('span');
    rip.className = 'rip';
    rip.style.width = `${size}px`;
    rip.style.height = `${size}px`;
    rip.style.left = `${event.clientX - rect.left - size / 2}px`;
    rip.style.top = `${event.clientY - rect.top - size / 2}px`;
    target.appendChild(rip);
    window.setTimeout(() => rip.remove(), 700);
  }, []);

  // Hero pointer parallax
  const onHeroMove = useCallback((event: React.PointerEvent) => {
    if (event.pointerType !== 'mouse') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = heroRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mx = ((event.clientX - rect.left) / rect.width - 0.5).toFixed(3);
    const my = ((event.clientY - rect.top) / rect.height - 0.5).toFixed(3);
    heroRef.current?.style.setProperty('--mx', mx);
    heroRef.current?.style.setProperty('--my', my);
  }, []);
  const onHeroLeave = useCallback(() => {
    heroRef.current?.style.setProperty('--mx', '0');
    heroRef.current?.style.setProperty('--my', '0');
  }, []);

  // Sheet: escape + body lock
  useEffect(() => {
    if (!selected) return;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelected(null);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [selected]);

  useEffect(() => () => {
    if (copyTimer.current) window.clearTimeout(copyTimer.current);
  }, []);

  const ambientBubbles = useMemo(() => makeBubbles(10, 5, 16, 16, 30, 7), []);
  const heroBubbles = useMemo(() => makeBubbles(20, 4, 15, 7, 16, 42), []);
  const loaderBubbles = useMemo(() => makeBubbles(8, 4, 11, 3, 6, 99), []);
  const sparkles = useMemo(() => {
    const arr: { left: string; top: string; s: string; d: string; dl: string }[] = [];
    let s = 1234;
    const rnd = () => {
      s = (s * 1103515245 + 12345) % 2147483648;
      return s / 2147483648;
    };
    for (let i = 0; i < 18; i += 1) {
      arr.push({
        left: `${(rnd() * 100).toFixed(1)}%`,
        top: `${(30 + rnd() * 60).toFixed(1)}%`,
        s: `${(3 + rnd() * 6).toFixed(0)}px`,
        d: `${(5 + rnd() * 6).toFixed(1)}s`,
        dl: `${(rnd() * 8).toFixed(1)}s`,
      });
    }
    return arr;
  }, []);

  const activePayment = sitePayments.find((p) => p.id === activePay) ?? null;

  const doCopy = async (text: string) => {
    const ok = await copyText(text);
    if (ok) {
      setCopied(true);
      if (copyTimer.current) window.clearTimeout(copyTimer.current);
      copyTimer.current = window.setTimeout(() => setCopied(false), 1600);
    }
  };

  const totalItems = menuCategories.reduce((sum, c) => sum + c.items.length, 0);

  return (
    <div className="menu-shell" dir="rtl" lang="ar" onPointerDown={onRipple}>
      {!loaderGone && (
        <div className={`loader${loaderOn ? '' : ' out'}`} aria-hidden="true">
          <div className="ptw">
            <div className="pt">
              <div className="water">
                <svg className="lw" viewBox="0 0 400 18" preserveAspectRatio="none">
                  <path d="M0 9Q25 0 50 9T100 9T150 9T200 9T250 9T300 9T350 9T400 9V18H0Z" />
                </svg>
              </div>
              <div className="lfish" dangerouslySetInnerHTML={{ __html: fishSVG(...FISH_COLORS.gold) }} />
              {loaderBubbles.map((b, i) => (
                <span key={i} className="bub" style={css({ left: b.left, width: b.size, height: b.size, '--d': b.d, '--dl': b.dl })} />
              ))}
            </div>
          </div>
          <h2 className="lname">{RESTAURANT_NAME}</h2>
          <div className="lbar" />
        </div>
      )}
      <div className="ambient" aria-hidden="true">
        {ambientBubbles.map((b, i) => (
          <span key={i} className="bub" style={css({ left: b.left, width: b.size, height: b.size, '--d': b.d, '--dl': b.dl })} />
        ))}
      </div>

      <div className="wrap">
        <header className="hero" ref={heroRef} onPointerMove={onHeroMove} onPointerLeave={onHeroLeave}>
          <div className="scene" aria-hidden="true">
            <div className="rays">
              <div className="ray" />
              <div className="ray" />
              <div className="ray" />
            </div>
            <svg className="surface" viewBox="0 0 800 30" preserveAspectRatio="none">
              <path d="M0 14 Q50 2 100 14 T200 14 T300 14 T400 14 T500 14 T600 14 T700 14 T800 14" />
            </svg>
            {HERO_FISH.map((f, i) => (
              <span
                key={i}
                className={`fish${f.rev ? ' rev' : ''}`}
                style={css({ top: f.top, width: f.w, '--dur': f.dur, '--delay': f.delay, '--sw': '1200px', '--o': 0.9 })}
                dangerouslySetInnerHTML={{ __html: fishSVG(...f.colors) }}
              />
            ))}
            {heroBubbles.map((b, i) => (
              <span key={i} className="bub" style={css({ left: b.left, width: b.size, height: b.size, '--d': b.d, '--dl': b.dl })} />
            ))}
            <div className="floor" />
          </div>
          <div className="sparks" aria-hidden="true">
            {sparkles.map((sp, i) => (
              <i key={i} style={css({ left: sp.left, top: sp.top, '--s': sp.s, '--d': sp.d, '--dl': sp.dl })} />
            ))}
          </div>
          <div className="hero-in enter">
            <div className="kicker">قائمة مطعم {RESTAURANT_NAME}</div>
            <h1 dir="auto">{RESTAURANT_NAME}</h1>
            <p className="sub">{RESTAURANT_SUB}</p>
            <button className="cta" type="button" onClick={() => document.getElementById('bar')?.scrollIntoView({ behavior: 'smooth' })} data-testid="button-browse-menu">
              استعرض القائمة
            </button>
          </div>
        </header>

        <div className="bar" id="bar">
          <div className="bar-in">
            <div className="search">
              <span dangerouslySetInnerHTML={{ __html: SEARCH_SVG }} />
              <input
                id="q"
                type="search"
                autoComplete="off"
                enterKeyHint="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="ابحث في القائمة…"
                aria-label="ابحث في القائمة"
                data-testid="input-menu-search"
              />
              {searchTerm && (
                <button className="clear" type="button" onClick={() => setSearchTerm('')} aria-label="مسح البحث" data-testid="button-clear-search">
                  ×
                </button>
              )}
            </div>
            <nav className="chips" aria-label="الأقسام">
              <button
                className="chip"
                type="button"
                aria-pressed={activeCategory === 'all'}
                onClick={() => chooseCategory('all')}
                data-testid="button-category-all"
              >
                كل القائمة · {totalItems}
              </button>
              {menuCategories.map((category) => (
                <button
                  key={category.id}
                  className="chip"
                  type="button"
                  aria-pressed={activeCategory === category.id}
                  onClick={() => chooseCategory(category.id)}
                  data-testid={`button-category-${category.id}`}
                >
                  <span className="ci" dangerouslySetInnerHTML={{ __html: art(CATEGORY_ART[category.id]) }} />
                  {category.title}
                </button>
              ))}
            </nav>
          </div>
        </div>

        <main id="list" aria-live="polite">
          {isLoading ? (
            <div data-testid="loading-menu" aria-live="polite">
              <div className="skel" />
              <div className="skel" />
              <div className="skel" />
              <div className="skel" />
            </div>
          ) : isError ? (
            <div className="state" data-testid="error-menu">
              <h3>تعذّر تحميل القائمة</h3>
              <p>تحقق من الاتصال وحاول مرة ثانية.</p>
              <button type="button" onClick={() => refetch()} data-testid="button-retry-menu">إعادة المحاولة</button>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="state" data-testid="empty-search-results">
              <h3>ما لقينا هالصنف</h3>
              <p>جرّب كلمة ثانية أو ارجع لكل القائمة.</p>
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setActiveCategory('all');
                }}
                data-testid="button-reset-search"
              >
                عرض كل القائمة
              </button>
            </div>
          ) : (
            filteredCategories.map((category, ci) => (
              <section className="cat" key={category.id} aria-labelledby={`heading-${category.id}`}>
                <div className="cat-head rv">
                  <span className="cat-plate" dangerouslySetInnerHTML={{ __html: art(CATEGORY_ART[category.id]) }} />
                  <div className="t">
                    <h2 id={`heading-${category.id}`}>{category.title}</h2>
                    <span className="count">{category.items.length} أصناف</span>
                  </div>
                  <span
                    className="cat-fish"
                    style={{ animationDuration: `${13 + ((ci * 5) % 9)}s`, animationDelay: `${-((ci * 7) % 12)}s` }}
                    dangerouslySetInnerHTML={{ __html: fishSVG(...FISH_COLORS.gold) }}
                  />
                </div>
                <div className="items">
                  {category.items.map((item, i) => (
                    <button
                      key={item.id}
                      type="button"
                      className="row rv"
                      style={css({ '--i': Math.min(i, 10) })}
                      onClick={() => setSelected({ item, category })}
                      data-testid={`card-menu-item-${item.id}`}
                    >
                      <span className="th" dangerouslySetInnerHTML={{ __html: itemArt(item.id, category.id) }} />
                      <span className="name" dir="auto">{item.name}</span>
                      <span className="dots" />
                      <span className="price">
                        {formatPrice(item.price)}
                        <span className="cur">ج.س</span>
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            ))
          )}
        </main>

        <footer>
          <h2>{RESTAURANT_NAME} {RESTAURANT_SUB}</h2>
          {sitePhones.length > 0 && (
            <>
              <div className="pay-hint">للتواصل</div>
              <div className="phones">
                {sitePhones.map((phone) => (
                  <a key={phone.id} className="phone" href={`tel:${phone.number.replace(/\s/g, '')}`}>
                    <span dangerouslySetInnerHTML={{ __html: PHONE_SVG }} />
                    {phone.number}
                  </a>
                ))}
              </div>
            </>
          )}
          <div className="pay-h">
            <h2>حسابات الدفع</h2>
            <p className="pay-hint">اختر وسيلة الدفع</p>
          </div>
          <div className="pay">
            <div className={`pay-grid${activePay ? ' sel' : ''}`}>
              {sitePayments.map((pm) => (
                <button
                  key={pm.id}
                  type="button"
                  className="pm"
                  style={css({ '--c': pm.color, '--ic': pm.ink })}
                  aria-pressed={activePay === pm.id}
                  onClick={() => setActivePay((cur) => (cur === pm.id ? null : pm.id))}
                  data-testid={`button-pay-${pm.id}`}
                >
                  <span className="lg" dangerouslySetInnerHTML={{ __html: PAYMENT_LOGOS[pm.methodId] ?? '' }} />
                  <span className="nm">{pm.name}</span>
                  <span className="ck" dangerouslySetInnerHTML={{ __html: CHECK_SVG }} />
                </button>
              ))}
            </div>
            {activePayment && (
              <div className="pay-d" style={css({ '--c': activePayment.color, '--ic': activePayment.ink })}>
                <div className="hd">
                  <span className="pd-em" dangerouslySetInnerHTML={{ __html: PAYMENT_LOGOS[activePayment.methodId] ?? '' }} />
                  {activePayment.name}
                </div>
                <div className="line">
                  {activePayment.number ? (
                    <span className="num">{activePayment.number}</span>
                  ) : (
                    <span className="num none">سيتم إضافة الرقم قريباً</span>
                  )}
                  {activePayment.number && (
                    <button
                      type="button"
                      className={`copy${copied ? ' ok' : ''}`}
                      onClick={() => doCopy(activePayment.number)}
                      data-testid="button-copy-account"
                    >
                      {copied ? 'تم النسخ' : 'نسخ'}
                    </button>
                  )}
                </div>
                {activePayment.holder && (
                  <div className="own">
                    <span>اسم صاحب الحساب</span>
                    <strong>{activePayment.holder}</strong>
                  </div>
                )}
              </div>
            )}
          </div>
        </footer>
      </div>

      <div
        className={`scrim${selected ? ' on' : ''}`}
        onClick={() => setSelected(null)}
        role="presentation"
      >
        {selected && (
          <div
            className="sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="s-name"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="art">
              <div className="plate-big" dangerouslySetInnerHTML={{ __html: itemArt(selected.item.id, selected.category.id) }} />
            </div>
            <button className="x" type="button" onClick={() => setSelected(null)} aria-label="إغلاق" data-testid="button-close-sheet">
              ×
            </button>
            <div className="sheet-body">
              <span className="cat-tag">{selected.category.title}</span>
              <h2 id="s-name" dir="auto">{selected.item.name}</h2>
              <div className="big">
                {formatPrice(selected.item.price)}
                <small>ج.س</small>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="pgbar" style={{ transform: `scaleX(${progress})` }} aria-hidden="true" />
      <button
        type="button"
        className={`totop${showTop ? ' show' : ''}`}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="العودة إلى أعلى الصفحة"
        data-testid="button-back-to-top"
      >
        <svg className="ring" viewBox="0 0 48 48" aria-hidden="true">
          <circle cx="24" cy="24" r="20" />
          <circle className="prg" cx="24" cy="24" r="20" style={css({ '--p': 125.66 * (1 - progress) })} />
        </svg>
        <svg className="ar" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 19V5 M5 12l7-7 7 7" />
        </svg>
      </button>
    </div>
  );
}

function App() {
  return (
    <Switch>
      <Route path="/nilein-dashboard" component={AdminPage} />
      <Route path="/nilein-dashboard/:rest*" component={AdminPage} />
      <Route component={MenuPage} />
    </Switch>
  );
}

export default App;
