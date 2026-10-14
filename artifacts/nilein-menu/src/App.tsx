import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Route, Switch } from 'wouter';
import {
  ArrowUp,
  ChevronDown,
  ChevronLeft,
  CircleHelp,
  Fish,
  Search,
  X,
} from 'lucide-react';
import { fetchMenu, formatPrice, menuQueryKey, useMenuLiveUpdates } from './lib/menu-api';
import AdminPage from './pages/admin';

function MenuPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [introOpen, setIntroOpen] = useState(true);
  const [introLeaving, setIntroLeaving] = useState(false);
  const [heroSettle, setHeroSettle] = useState(false);
  const dismissTimers = useRef<number[]>([]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: menuQueryKey,
    queryFn: fetchMenu,
  });
  useMenuLiveUpdates(true);

  const menuCategories = useMemo(() => data?.categories ?? [], [data]);

  const filteredCategories = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase('ar');
    return menuCategories
      .filter((category) => activeCategory === 'all' || category.id === activeCategory)
      .map((category) => ({
        ...category,
        items: category.items.filter((item) => item.name.toLocaleLowerCase('ar').includes(query)),
      }))
      .filter((category) => category.items.length > 0);
  }, [activeCategory, searchTerm, menuCategories]);

  const chooseCategory = (id: string) => {
    setActiveCategory(id);
    setSearchTerm('');
  };

  const dismissIntro = useCallback(() => {
    if (!introOpen || introLeaving) return;
    setIntroLeaving(true);
    const rise = window.setTimeout(() => {
      setIntroOpen(false);
      setIntroLeaving(false);
      setHeroSettle(true);
      const settle = window.setTimeout(() => setHeroSettle(false), 700);
      dismissTimers.current.push(settle);
    }, 880);
    dismissTimers.current.push(rise);
  }, [introOpen, introLeaving]);

  useEffect(() => {
    if (introOpen) {
      document.body.style.overflow = 'hidden';
      window.scrollTo({ top: 0 });
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [introOpen]);

  useEffect(() => {
    if (!introOpen) return;
    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) > 4) dismissIntro();
    };
    const onTouchMove = () => dismissIntro();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' || event.key === 'ArrowDown' || event.key === 'PageDown' || event.key === ' ') {
        event.preventDefault();
        dismissIntro();
      }
    };
    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('keydown', onKey);
    };
  }, [introOpen, dismissIntro]);

  useEffect(() => {
    const timers = dismissTimers.current;
    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  return (
    <div className="menu-shell" dir="rtl" lang="ar">
      <AnimatePresence>
        {introOpen && (
          <motion.div
            className={`intro-overlay${introLeaving ? ' leaving' : ''}`}
            role="dialog"
            aria-modal="true"
            aria-label="أهلاً بكم في مطعم النيلين"
            data-testid="intro-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -70 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
          >
            <div className="intro-sea" aria-hidden="true">
              <span className="intro-bubble bubble-one" />
              <span className="intro-bubble bubble-two" />
              <span className="intro-bubble bubble-three" />
              <span className="intro-bubble bubble-four" />
              <Fish className="intro-fish fish-one" size={30} />
              <Fish className="intro-fish fish-two" size={20} />
              <Fish className="intro-fish fish-three" size={24} />
            </div>

            <motion.div
              className="intro-inner"
              initial={{ opacity: 0, y: 26, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.08 }}
            >
              <div className="intro-seal">
                <img className="intro-logo" src="/nilein-logo.png" alt="شعار مطعم النيلين" />
              </div>
              <p className="intro-kicker"><span className="live-dot" /> قائمة مطعم النيلين</p>
              <h1 className="intro-title brand-font">على مهل…<br /><span>اختار اللي بتحبه</span></h1>
              <p className="intro-sub">أسماك ومشاوي وأطباق من مطبخ النيلين. تصفّح قائمتنا على راحتك.</p>
              <button
                className="intro-cta"
                onClick={() => { chooseCategory('all'); dismissIntro(); }}
                data-testid="button-dismiss-intro"
              >
                تصفّح القائمة <ChevronLeft size={18} />
              </button>
              <button className="intro-scroll-hint" onClick={dismissIntro} aria-label="مرر للأسفل لعرض القائمة">
                <span>اسحب للأسفل</span>
                <ChevronDown size={20} />
              </button>
            </motion.div>

            <div className="intro-tide" aria-hidden="true">
              <svg className="tide-wave tide-back" viewBox="0 0 1440 140" preserveAspectRatio="none">
                <path d="M0,72 C220,120 460,24 720,60 C980,96 1220,118 1440,66 L1440,140 L0,140 Z" />
              </svg>
              <svg className="tide-wave tide-front" viewBox="0 0 1440 140" preserveAspectRatio="none">
                <path d="M0,84 C260,40 500,116 760,82 C1020,48 1240,92 1440,74 L1440,140 L0,140 Z" />
              </svg>
              <div className="tide-body" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="site-header">
        <div className="header-inner">
          <a className="brand-lockup" href="#top" aria-label="مطعم النيلين — بداية القائمة" data-testid="link-home">
            <span className="brand-stamp" aria-hidden="true"><img src="/nilein-logo.png" alt="" /></span>
            <span className="brand-copy">
              <span className="brand-name">النيلين</span>
              <span className="brand-subtitle">للأسماك والمشويات</span>
            </span>
          </a>
          <div className="header-actions">
            {searchOpen && (
              <label className="search-box">
                <Search size={17} aria-hidden="true" />
                <input
                  autoFocus
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="ابحث في القائمة"
                  aria-label="ابحث في القائمة"
                  data-testid="input-menu-search"
                />
                {searchTerm && (
                  <button className="icon-button search-clear" onClick={() => setSearchTerm('')} aria-label="مسح البحث" data-testid="button-clear-search">
                    <X size={16} />
                  </button>
                )}
              </label>
            )}
            <button
              className={`icon-button header-icon ${searchOpen ? 'icon-selected' : ''}`}
              onClick={() => { setSearchOpen((open) => !open); setSearchTerm(''); }}
              aria-label={searchOpen ? 'إغلاق البحث' : 'ابحث في القائمة'}
              data-testid="button-toggle-search"
            >
              {searchOpen ? <X size={19} /> : <Search size={19} />}
            </button>
          </div>
        </div>
      </header>

      <main id="top">
        <section className="hero-wrap">
          <div className={`hero hero-mark${heroSettle ? ' hero-settle' : ''}`}>
            <div className="hero-content">
              <div className="hero-kicker"><span className="live-dot" /> قائمة مطعم النيلين</div>
              <h1 className="brand-font">على مهل…<br /><span>اختار اللي بتحبه</span></h1>
              <p className="hero-description">أسماك ومشاوي وأطباق من مطبخ النيلين. تصفّح قائمتنا على راحتك.</p>
              <a className="hero-link" href="#menu-list" onClick={() => chooseCategory('all')} data-testid="link-browse-menu">
                تصفّح القائمة <ChevronLeft size={17} />
              </a>
            </div>
            <div className="hero-side" aria-hidden="true">
              <div className="hero-seal">
                <img className="hero-logo" src="/nilein-logo.png" alt="" />
              </div>
              <span className="hero-orbit orbit-one" />
              <span className="hero-orbit orbit-two" />
            </div>
            <div className="hero-footnote"><span>من أهل النيلين</span><span>قائمة الطعام</span></div>
          </div>
        </section>

        <section className="menu-area" id="menu-list">
          <div className="menu-intro">
            <div>
              <p className="eyebrow">أهلاً وسهلاً</p>
              <h2 className="section-title">قائمة الطعام</h2>
            </div>
          </div>

          {isLoading ? (
            <div className="menu-loading" data-testid="loading-menu" aria-live="polite">
              {[0, 1].map((n) => (
                <div className="menu-section skeleton-card" key={n} aria-hidden="true">
                  <div className="skeleton-line skeleton-title" />
                  <div className="skeleton-line" />
                  <div className="skeleton-line" />
                  <div className="skeleton-line short" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="empty-state" data-testid="error-menu">
              <span className="empty-icon"><Search size={23} /></span>
              <h3>تعذّر تحميل القائمة</h3>
              <p>تحقق من الاتصال وحاول مرة ثانية.</p>
              <button onClick={() => refetch()} data-testid="button-retry-menu">إعادة المحاولة</button>
            </div>
          ) : (
            <>
              <nav className="category-scroll" aria-label="أقسام القائمة">
                <button
                  className={`category-chip ${activeCategory === 'all' ? 'active' : ''}`}
                  onClick={() => chooseCategory('all')}
                  data-testid="button-category-all"
                >كل القائمة <span>{menuCategories.reduce((sum, category) => sum + category.items.length, 0)}</span></button>
                {menuCategories.map((category) => (
                  <button
                    key={category.id}
                    className={`category-chip ${activeCategory === category.id ? 'active' : ''}`}
                    onClick={() => chooseCategory(category.id)}
                    data-testid={`button-category-${category.id}`}
                  >{category.title}</button>
                ))}
              </nav>

              <div className="results-topline">
                <span>{searchTerm ? `نتائج البحث عن «${searchTerm}»` : activeCategory === 'all' ? 'أطباق من قائمتنا' : menuCategories.find((category) => category.id === activeCategory)?.note}</span>
                <span className="results-count">{filteredCategories.reduce((sum, category) => sum + category.items.length, 0)} صنف</span>
              </div>

              {filteredCategories.length > 0 ? (
                <div className="menu-sections">
                  {filteredCategories.map((category) => (
                    <section className="menu-section" key={category.id} aria-labelledby={`heading-${category.id}`}>
                      <div className="category-heading">
                        <div className="category-title-wrap">
                          <span className="category-number">{String(menuCategories.findIndex((c) => c.id === category.id) + 1).padStart(2, '0')}</span>
                          <div>
                            <h3 id={`heading-${category.id}`}>{category.title}</h3>
                            <p>{category.note}</p>
                          </div>
                        </div>
                        <span className="heading-rule" />
                        <span className="heading-count">{category.items.length} أصناف</span>
                      </div>
                      <div className="items-grid">
                        {category.items.map((item) => (
                          <article className="menu-item" key={item.id} data-testid={`card-menu-item-${item.id}`}>
                            <h4>{item.name}</h4>
                            <span className="item-price">{formatPrice(item.price)}</span>
                          </article>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              ) : (
                <div className="empty-state" data-testid="empty-search-results">
                  <span className="empty-icon"><Search size={23} /></span>
                  <h3>ما لقينا هالصنف</h3>
                  <p>جرّب كلمة ثانية أو ارجع لكل القائمة.</p>
                  <button onClick={() => { setSearchTerm(''); chooseCategory('all'); }} data-testid="button-reset-search">عرض كل القائمة</button>
                </div>
              )}

              <aside className="menu-note">
                <span className="note-icon"><CircleHelp size={19} /></span>
                <p>الأسعار محدثة من إدارة المطعم. أهلاً بكم، ونوّرتونا.</p>
              </aside>
            </>
          )}
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-brand">
          <span className="footer-name brand-font">النيلين</span>
          <span>للأسماك والمشويات</span>
        </div>
        <p>أهلاً بكم، ونوّرتونا.</p>
        <button className="back-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="العودة إلى أعلى الصفحة" data-testid="button-back-to-top"><ArrowUp size={17} /></button>
        <span className="footer-end">قائمة الطعام · مطعم النيلين</span>
      </footer>

    </div>
  );
}

function App() {
  return (
    <Switch>
      <Route path="/nilein-dashboard" component={AdminPage} />
      <Route component={MenuPage} />
    </Switch>
  );
}

export default App;
