import { Link, useLocation } from 'wouter';
import { Phone, UtensilsCrossed, X } from 'lucide-react';

const LINKS = [
  { href: '/nilein-dashboard', label: 'قائمة الطعام', icon: UtensilsCrossed, testId: 'nav-admin-menu' },
  { href: '/nilein-dashboard/contact', label: 'التواصل والدفع', icon: Phone, testId: 'nav-admin-contact' },
];

export function SidePanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [location] = useLocation();
  return (
    <>
      <div
        className={`admin-backdrop${open ? ' open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className={`admin-side${open ? ' open' : ''}`} aria-label="تنقل لوحة التحكم">
        <button className="admin-side-close" onClick={onClose} aria-label="إغلاق القائمة" data-testid="button-admin-close-menu">
          <X size={19} />
        </button>
        <nav className="admin-nav">
          {LINKS.map((link) => {
            const active = location === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={`admin-nav-link${active ? ' active' : ''}`}
                aria-current={active ? 'page' : undefined}
                data-testid={link.testId}
              >
                <Icon size={19} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
