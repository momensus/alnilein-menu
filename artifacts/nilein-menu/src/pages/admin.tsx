import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Toaster, toast } from 'sonner';
import {
  Check,
  Eye,
  EyeOff,
  LoaderCircle,
  Lock,
  LogOut,
  Plus,
  Trash2,
} from 'lucide-react';
import {
  adminCategoriesKey,
  adminItemsKey,
  createCategory,
  createItem,
  deleteCategory,
  deleteItem,
  getAdminCategories,
  getAdminItems,
  login,
  logout,
  updateCategory,
  updateItem,
  verifyAuth,
  type AdminCategory,
  type AdminItem,
} from '../lib/admin-api';
import { menuQueryKey } from '../lib/menu-api';

function invalidateAll(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: adminCategoriesKey });
  queryClient.invalidateQueries({ queryKey: adminItemsKey });
  queryClient.invalidateQueries({ queryKey: menuQueryKey });
}

function ConfirmDialog({
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="dialog-backdrop" role="presentation" onClick={onCancel}>
      <section
        className="help-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <h2>{title}</h2>
        <p className="dialog-copy">{message}</p>
        <div className="dialog-actions">
          <button className="dialog-done dialog-danger" onClick={onConfirm} data-testid="button-confirm-delete">
            {confirmLabel}
          </button>
          <button className="dialog-ghost" onClick={onCancel}>
            تراجع
          </button>
        </div>
      </section>
    </div>
  );
}

function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!password) return;
    setPending(true);
    setError('');
    try {
      await login(password);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'تعذّر تسجيل الدخول');
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="menu-shell admin-shell" dir="rtl" lang="ar">
      <Toaster position="bottom-center" richColors />
      <div className="admin-login-wrap">
        <form className="admin-login-card" onSubmit={submit}>
          <span className="admin-login-icon"><Lock size={24} /></span>
          <p className="eyebrow">لوحة التحكم</p>
          <h1>إدارة قائمة النيلين</h1>
          <p className="admin-login-sub">أدخل كلمة المرور للمتابعة.</p>
          <label className="admin-field">
            <span>كلمة المرور</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              data-testid="input-admin-password"
            />
          </label>
          {error && <p className="admin-error" role="alert">{error}</p>}
          <button className="admin-primary" type="submit" disabled={pending || !password} data-testid="button-admin-login">
            {pending ? <LoaderCircle size={17} className="spin" /> : null}
            دخول
          </button>
        </form>
      </div>
    </div>
  );
}

function ItemRow({ item }: { item: AdminItem }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState(item.name);
  const [price, setPrice] = useState(item.price === null ? '' : String(item.price));
  const [confirmDelete, setConfirmDelete] = useState(false);

  const dirty =
    name.trim() !== item.name ||
    (price.trim() === '' ? null : Number(price)) !== item.price;

  const saveMutation = useMutation({
    mutationFn: () =>
      updateItem(item.id, {
        name: name.trim(),
        price: price.trim() === '' ? null : Number(price),
      }),
    onSuccess: () => {
      invalidateAll(queryClient);
      toast.success('تم حفظ الصنف');
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'تعذّر الحفظ'),
  });

  const toggleMutation = useMutation({
    mutationFn: () => updateItem(item.id, { isAvailable: item.isAvailable === 1 ? 0 : 1 }),
    onSuccess: () => {
      invalidateAll(queryClient);
      toast.success(item.isAvailable === 1 ? 'تم إخفاء الصنف' : 'تم إظهار الصنف');
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'تعذّر التحديث'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteItem(item.id),
    onSuccess: () => {
      invalidateAll(queryClient);
      toast.success('تم حذف الصنف');
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'تعذّر الحذف'),
  });

  const hidden = item.isAvailable !== 1;

  return (
    <li className={`admin-item${hidden ? ' is-hidden' : ''}`} data-testid={`admin-item-${item.id}`}>
      <div className="admin-item-fields">
        <input
          className="admin-input admin-item-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="اسم الصنف"
          aria-label="اسم الصنف"
        />
        <label className="admin-price-field">
          <input
            className="admin-input"
            value={price}
            onChange={(event) => setPrice(event.target.value.replace(/[^\d]/g, ''))}
            placeholder="السعر"
            inputMode="numeric"
            aria-label="السعر بالجنيه"
          />
          <span>ج.س</span>
        </label>
      </div>
      <div className="admin-item-actions">
        {dirty && (
          <button
            className="admin-icon-btn admin-save"
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending || !name.trim()}
            aria-label="حفظ الصنف"
            title="حفظ"
          >
            {saveMutation.isPending ? <LoaderCircle size={17} className="spin" /> : <Check size={17} />}
          </button>
        )}
        <button
          className="admin-icon-btn"
          onClick={() => toggleMutation.mutate()}
          disabled={toggleMutation.isPending}
          aria-label={hidden ? 'إظهار الصنف' : 'إخفاء الصنف'}
          title={hidden ? 'إظهار' : 'إخفاء'}
          data-testid={`button-toggle-item-${item.id}`}
        >
          {hidden ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
        <button
          className="admin-icon-btn admin-danger-btn"
          onClick={() => setConfirmDelete(true)}
          aria-label="حذف الصنف"
          title="حذف"
        >
          <Trash2 size={17} />
        </button>
      </div>
      {confirmDelete && (
        <ConfirmDialog
          title="حذف الصنف؟"
          message={`سيتم حذف «${item.name}» نهائياً من القائمة.`}
          confirmLabel="حذف"
          onCancel={() => setConfirmDelete(false)}
          onConfirm={() => {
            setConfirmDelete(false);
            deleteMutation.mutate();
          }}
        />
      )}
    </li>
  );
}

function CategoryCard({ category, items }: { category: AdminCategory; items: AdminItem[] }) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState(category.title);
  const [note, setNote] = useState(category.note);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const dirty = title.trim() !== category.title || note.trim() !== category.note;

  const saveMutation = useMutation({
    mutationFn: () => updateCategory(category.id, { title: title.trim(), note: note.trim() }),
    onSuccess: () => {
      invalidateAll(queryClient);
      toast.success('تم حفظ القسم');
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'تعذّر الحفظ'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteCategory(category.id),
    onSuccess: () => {
      invalidateAll(queryClient);
      toast.success('تم حذف القسم');
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'تعذّر الحذف'),
  });

  const addMutation = useMutation({
    mutationFn: () =>
      createItem({
        categoryId: category.id,
        name: newName.trim(),
        price: newPrice.trim() === '' ? null : Number(newPrice),
      }),
    onSuccess: () => {
      setNewName('');
      setNewPrice('');
      invalidateAll(queryClient);
      toast.success('تمت إضافة الصنف');
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'تعذّر الإضافة'),
  });

  return (
    <section className="admin-category" data-testid={`admin-category-${category.id}`}>
      <div className="admin-category-head">
        <div className="admin-category-fields">
          <input
            className="admin-input admin-category-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="اسم القسم"
            aria-label="اسم القسم"
          />
          <input
            className="admin-input admin-category-note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="وصف القسم"
            aria-label="وصف القسم"
          />
        </div>
        <div className="admin-category-actions">
          {dirty && (
            <button
              className="admin-small-btn"
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending || !title.trim()}
            >
              {saveMutation.isPending ? <LoaderCircle size={15} className="spin" /> : <Check size={15} />}
              حفظ
            </button>
          )}
          <button
            className="admin-icon-btn admin-danger-btn"
            onClick={() => setConfirmDelete(true)}
            aria-label="حذف القسم"
            title="حذف القسم"
          >
            <Trash2 size={17} />
          </button>
        </div>
      </div>

      <p className="admin-count">
        {items.length} أصناف · {items.filter((i) => i.isAvailable !== 1).length} مخفية
      </p>

      <ul className="admin-items">
        {items.map((item) => (
          <ItemRow key={item.id} item={item} />
        ))}
      </ul>

      <div className="admin-add-row">
        <input
          className="admin-input"
          value={newName}
          onChange={(event) => setNewName(event.target.value)}
          placeholder="صنف جديد…"
          aria-label="اسم الصنف الجديد"
          data-testid={`input-new-item-${category.id}`}
        />
        <label className="admin-price-field">
          <input
            className="admin-input"
            value={newPrice}
            onChange={(event) => setNewPrice(event.target.value.replace(/[^\d]/g, ''))}
            placeholder="السعر"
            inputMode="numeric"
            aria-label="سعر الصنف الجديد بالجنيه"
          />
          <span>ج.س</span>
        </label>
        <button
          className="admin-small-btn"
          onClick={() => addMutation.mutate()}
          disabled={addMutation.isPending || !newName.trim()}
          data-testid={`button-add-item-${category.id}`}
        >
          {addMutation.isPending ? <LoaderCircle size={15} className="spin" /> : <Plus size={15} />}
          إضافة
        </button>
      </div>

      {confirmDelete && (
        <ConfirmDialog
          title="حذف القسم؟"
          message={
            items.length > 0
              ? `القسم يحتوي على ${items.length} أصناف. احذف الأصناف أولاً ثم احذف القسم.`
              : `سيتم حذف قسم «${category.title}» نهائياً.`
          }
          confirmLabel="حذف القسم"
          onCancel={() => setConfirmDelete(false)}
          onConfirm={() => {
            setConfirmDelete(false);
            deleteMutation.mutate();
          }}
        />
      )}
    </section>
  );
}

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const queryClient = useQueryClient();
  const [newTitle, setNewTitle] = useState('');
  const [newNote, setNewNote] = useState('');

  const categoriesQuery = useQuery({ queryKey: adminCategoriesKey, queryFn: getAdminCategories });
  const itemsQuery = useQuery({ queryKey: adminItemsKey, queryFn: () => getAdminItems() });

  const doLogout = async () => {
    try {
      await logout();
    } catch {
      /* ignore */
    }
    onLogout();
  };

  const addCategory = useMutation({
    mutationFn: () => createCategory({ title: newTitle.trim(), note: newNote.trim() }),
    onSuccess: () => {
      setNewTitle('');
      setNewNote('');
      invalidateAll(queryClient);
      toast.success('تمت إضافة القسم');
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'تعذّر الإضافة'),
  });

  const categories = categoriesQuery.data?.categories ?? [];
  const allItems = itemsQuery.data?.items ?? [];
  const hiddenCount = allItems.filter((i) => i.isAvailable !== 1).length;
  const loading = categoriesQuery.isLoading || itemsQuery.isLoading;
  const failed = categoriesQuery.isError || itemsQuery.isError;

  return (
    <div className="menu-shell admin-shell" dir="rtl" lang="ar">
      <Toaster position="bottom-center" richColors />
      <header className="site-header">
        <div className="header-inner">
          <span className="brand-lockup">
            <span className="brand-stamp" aria-hidden="true"><img src="/nilein-logo.png" alt="" /></span>
            <span className="brand-copy">
              <span className="brand-name">النيلين</span>
              <span className="brand-subtitle">لوحة التحكم</span>
            </span>
          </span>
          <button className="admin-logout" onClick={doLogout} data-testid="button-admin-logout">
            <LogOut size={17} />
            خروج
          </button>
        </div>
      </header>

      <main className="admin-main">
        <div className="admin-stats">
          <div className="admin-stat"><strong>{categories.length}</strong><span>أقسام</span></div>
          <div className="admin-stat"><strong>{allItems.length}</strong><span>أصناف</span></div>
          <div className="admin-stat"><strong>{hiddenCount}</strong><span>مخفية</span></div>
        </div>

        {loading ? (
          <div className="menu-loading" data-testid="loading-admin" aria-live="polite">
            {[0, 1].map((n) => (
              <div className="menu-section skeleton-card" key={n} aria-hidden="true">
                <div className="skeleton-line skeleton-title" />
                <div className="skeleton-line" />
                <div className="skeleton-line short" />
              </div>
            ))}
          </div>
        ) : failed ? (
          <div className="empty-state" data-testid="error-admin">
            <h3>تعذّر تحميل البيانات</h3>
            <p>تحقق من الاتصال وحاول مرة ثانية.</p>
            <button
              onClick={() => {
                categoriesQuery.refetch();
                itemsQuery.refetch();
              }}
            >
              إعادة المحاولة
            </button>
          </div>
        ) : (
          <>
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                items={allItems.filter((item) => item.categoryId === category.id)}
              />
            ))}

            <section className="admin-category admin-new-category">
              <h2>قسم جديد</h2>
              <div className="admin-add-row">
                <input
                  className="admin-input"
                  value={newTitle}
                  onChange={(event) => setNewTitle(event.target.value)}
                  placeholder="اسم القسم…"
                  aria-label="اسم القسم الجديد"
                  data-testid="input-new-category"
                />
                <input
                  className="admin-input"
                  value={newNote}
                  onChange={(event) => setNewNote(event.target.value)}
                  placeholder="الوصف…"
                  aria-label="وصف القسم الجديد"
                />
                <button
                  className="admin-small-btn"
                  onClick={() => addCategory.mutate()}
                  disabled={addCategory.isPending || !newTitle.trim()}
                  data-testid="button-add-category"
                >
                  {addCategory.isPending ? <LoaderCircle size={15} className="spin" /> : <Plus size={15} />}
                  إضافة قسم
                </button>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    verifyAuth()
      .then((result) => setAuthed(result.authenticated))
      .catch(() => setAuthed(false));
  }, []);

  if (authed === null) {
    return (
      <div className="menu-shell admin-shell" dir="rtl" lang="ar">
        <div className="admin-login-wrap">
          <LoaderCircle size={28} className="spin admin-spin" />
        </div>
      </div>
    );
  }

  if (!authed) {
    return <LoginForm onSuccess={() => setAuthed(true)} />;
  }

  return <Dashboard onLogout={() => setAuthed(false)} />;
}

export default AdminPage;
