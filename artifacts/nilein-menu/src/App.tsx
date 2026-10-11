import { useMemo, useState } from 'react';
import {
  ArrowUp,
  Check,
  ChevronLeft,
  CircleHelp,
  Clock3,
  Download,
  QrCode,
  Search,
  Share2,
  X,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { menuCategories } from './data/menu';

function App() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [helpOpen, setHelpOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const filteredCategories = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase('ar');
    return menuCategories
      .filter((category) => activeCategory === 'all' || category.id === activeCategory)
      .map((category) => ({
        ...category,
        items: category.items.filter((item) => item.name.toLocaleLowerCase('ar').includes(query)),
      }))
      .filter((category) => category.items.length > 0);
  }, [activeCategory, searchTerm]);

  const chooseCategory = (id: string) => {
    setActiveCategory(id);
    setSearchTerm('');
  };

  const shareMenu = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'مطعم النيلين للأسماك والمشويات', url });
      } catch {
        // A dismissed native share sheet is not an error for the guest.
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setHelpOpen(true);
    }
  };

  const downloadQr = () => {
    const svg = document.querySelector('#menu-qr svg');
    if (!svg) return;
    const source = new XMLSerializer().serializeToString(svg);
    const file = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'nilein-menu-qr.svg';
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="menu-shell" dir="rtl" lang="ar">
      <header className="site-header">
        <div className="header-inner">
          <a className="brand-lockup" href="#top" aria-label="مطعم النيلين — بداية القائمة" data-testid="link-home">
            <span className="brand-stamp" aria-hidden="true"><img src="/nilein-logo.jpg" alt="" /></span>
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
            <button className="icon-button header-icon share-button" onClick={shareMenu} aria-label="مشاركة القائمة" data-testid="button-share-menu">
              {copied ? <Check size={18} /> : <Share2 size={18} />}
              <span className="share-label">{copied ? 'نُسخ الرابط' : 'مشاركة'}</span>
            </button>
            <button className="icon-button header-icon qr-button" onClick={() => setQrOpen(true)} aria-label="عرض رمز QR للقائمة" data-testid="button-show-qr">
              <QrCode size={18} />
              <span className="qr-label">رمز QR</span>
            </button>
          </div>
        </div>
      </header>

      <main id="top">
        <section className="hero-wrap">
          <div className="hero hero-mark">
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
                <img className="hero-logo" src="/nilein-logo.jpg" alt="" />
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
            <div className="price-notice" role="status" data-testid="status-prices-unconfirmed">
              <span className="notice-mark"><Clock3 size={16} /></span>
              <span><strong>الأسعار غير مؤكدة</strong><small>اسأل فريق المطعم عن السعر الحالي</small></span>
            </div>
          </div>

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
                    {category.items.map((item, index) => (
                      <article className="menu-item" key={item.id} data-testid={`card-menu-item-${item.id}`}>
                        <span className="item-index">{String(index + 1).padStart(2, '0')}</span>
                        <h4>{item.name}</h4>
                        <span className="item-price">يُرجى التأكد</span>
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
            <p>القائمة للتعرّف على الأصناف فقط. الأسعار والتوفّر يتغيّران؛ يُرجى التأكّد من فريق المطعم قبل الطلب.</p>
          </aside>
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

      <div className="mobile-help-bar safe-bottom">
        <button onClick={() => setHelpOpen(true)} data-testid="button-price-help">
          <CircleHelp size={18} /><span>تحتاج تعرف السعر؟ اسأل فريقنا</span><ChevronLeft size={17} />
        </button>
      </div>

      {helpOpen && (
        <div className="dialog-backdrop" role="presentation" onClick={() => setHelpOpen(false)}>
          <section className="help-dialog" role="dialog" aria-modal="true" aria-labelledby="help-title" onClick={(event) => event.stopPropagation()}>
            <button className="dialog-close" onClick={() => setHelpOpen(false)} aria-label="إغلاق" data-testid="button-close-help"><X size={19} /></button>
            <span className="dialog-icon"><CircleHelp size={24} /></span>
            <p className="eyebrow">نحن بالخدمة</p>
            <h2 id="help-title">اسأل فريق النيلين</h2>
            <p className="dialog-copy">الأسعار والتوفّر غير مؤكدة في هذه القائمة. تفضّل بسؤال فريق المطعم مباشرةً قبل الطلب.</p>
            <button className="dialog-done" onClick={() => setHelpOpen(false)} data-testid="button-help-done">حاضر <ChevronLeft size={17} /></button>
          </section>
        </div>
      )}

      {qrOpen && (
        <div className="dialog-backdrop" role="presentation" onClick={() => setQrOpen(false)}>
          <section className="help-dialog qr-dialog" role="dialog" aria-modal="true" aria-labelledby="qr-title" onClick={(event) => event.stopPropagation()}>
            <button className="dialog-close" onClick={() => setQrOpen(false)} aria-label="إغلاق" data-testid="button-close-qr"><X size={19} /></button>
            <p className="eyebrow">قائمة مطعم النيلين</p>
            <h2 id="qr-title">رمز QR للقائمة</h2>
            <div className="qr-frame" id="menu-qr">
              <QRCodeSVG value={window.location.href} size={220} level="H" includeMargin bgColor="#ffffff" fgColor="#123f5b" />
            </div>
            <p className="dialog-copy">هذا الرمز يفتح رابط القائمة الحالي. حمّل الرمز من الصفحة المنشورة لاستخدامه مع الزوار.</p>
            <button className="dialog-done qr-download" onClick={downloadQr} data-testid="button-download-qr"><Download size={17} /> تنزيل رمز QR بصيغة SVG</button>
          </section>
        </div>
      )}
    </div>
  );
}

export default App;
