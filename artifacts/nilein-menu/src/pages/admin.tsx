import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Route, Switch } from 'wouter';
import { Toaster, toast } from 'sonner';
import {
  Check,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  LoaderCircle,
  Lock,
  LogOut,
  Menu,
  Plus,
  Trash2,
} from 'lucide-react';
import {
  adminCategoriesKey,
  adminItemsKey,
  adminPaymentsKey,
  adminPhonesKey,
  createCategory,
  createItem,
  createPhone,
  deleteCategory,
  deleteItem,
  deletePhone,
  getAdminCategories,
  getAdminItems,
  getAdminPayments,
  getAdminPhones,
  login,
  logout,
  moveCategory,
  moveItem,
  updateCategory,
  updateItem,
  updatePayment,
  updatePhone,
  verifyAuth,
  type AdminCategory,
  type AdminItem,
  type AdminPayment,
  type AdminPhone,
  type MoveDirection,
} from '../lib/admin-api';
import { menuQueryKey, siteQueryKey } from '../lib/menu-api';
import { SidePanel } from '../components/admin/side-panel';

function invalidateAll(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: adminCategoriesKey });
  queryClient.invalidateQueries({ queryKey: adminItemsKey });
  queryClient.invalidateQueries({ queryKey: adminPhonesKey });
  queryClient.invalidateQueries({ queryKey: adminPaymentsKey });
  queryClient.invalidateQueries({ queryKey: menuQueryKey });
  queryClient.invalidateQueries({ queryKey: siteQueryKey });
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
      <Toaster position="bottom-center" richColors theme="dark" />
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

function ItemRow({ item, disableUp, disableDown }: { item: AdminItem; disableUp: boolean; disableDown: boolean }) {
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

  const moveMutation = useMutation({
    mutationFn: (direction: MoveDirection) => moveItem(item.id, direction),
    onSuccess: () => invalidateAll(queryClient),
    onError: (err) => toast.error(err instanceof Error ? err.message : 'تعذّر الترتيب'),
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
        <div className="admin-move-pair">
          <button
            className="admin-icon-btn admin-move-btn"
            onClick={() => moveMutation.mutate('up')}
            disabled={disableUp || moveMutation.isPending}
            aria-label="نقل الصنف لأعلى"
            title="لأعلى"
            data-testid={`button-move-up-item-${item.id}`}
          >
            <ChevronUp size={17} />
          </button>
          <button
            className="admin-icon-btn admin-move-btn"
            onClick={() => moveMutation.mutate('down')}
            disabled={disableDown || moveMutation.isPending}
            aria-label="نقل الصنف لأسفل"
            title="لأسفل"
            data-testid={`button-move-down-item-${item.id}`}
          >
            <ChevronDown size={17} />
          </button>
        </div>
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

function CategoryCard({ category, items, disableUp, disableDown }: { category: AdminCategory; items: AdminItem[]; disableUp: boolean; disableDown: boolean }) {
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

  const moveMutation = useMutation({
    mutationFn: (direction: MoveDirection) => moveCategory(category.id, direction),
    onSuccess: () => invalidateAll(queryClient),
    onError: (err) => toast.error(err instanceof Error ? err.message : 'تعذّر الترتيب'),
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
          <div className="admin-move-pair">
            <button
              className="admin-icon-btn admin-move-btn"
              onClick={() => moveMutation.mutate('up')}
              disabled={disableUp || moveMutation.isPending}
              aria-label="نقل القسم لأعلى"
              title="لأعلى"
              data-testid={`button-move-up-category-${category.id}`}
            >
              <ChevronUp size={17} />
            </button>
            <button
              className="admin-icon-btn admin-move-btn"
              onClick={() => moveMutation.mutate('down')}
              disabled={disableDown || moveMutation.isPending}
              aria-label="نقل القسم لأسفل"
              title="لأسفل"
              data-testid={`button-move-down-category-${category.id}`}
            >
              <ChevronDown size={17} />
            </button>
          </div>
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
        {items.map((item, index) => (
          <ItemRow key={item.id} item={item} disableUp={index === 0} disableDown={index === items.length - 1} />
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

function PhoneRow({ phone }: { phone: AdminPhone }) {
  const queryClient = useQueryClient();
  const [number, setNumber] = useState(phone.number);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const dirty = number.trim() !== phone.number;

  const saveMutation = useMutation({
    mutationFn: () => updatePhone(phone.id, number.trim()),
    onSuccess: () => {
      invalidateAll(queryClient);
      toast.success('تم حفظ الرقم');
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'تعذّر الحفظ'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deletePhone(phone.id),
    onSuccess: () => {
      invalidateAll(queryClient);
      toast.success('تم حذف الرقم');
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'تعذّر الحذف'),
  });

  return (
    <li className="admin-item" data-testid={`admin-phone-${phone.id}`}>
      <div className="admin-item-fields admin-phone-fields">
        <input
          className="admin-input"
          value={number}
          onChange={(event) => setNumber(event.target.value)}
          placeholder="رقم الهاتف"
          inputMode="tel"
          dir="ltr"
          aria-label="رقم الهاتف"
          style={{ textAlign: 'left' }}
        />
      </div>
      <div className="admin-item-actions">
        {dirty && (
          <button
            className="admin-icon-btn admin-save"
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending || !number.trim()}
            aria-label="حفظ الرقم"
            title="حفظ"
          >
            {saveMutation.isPending ? <LoaderCircle size={17} className="spin" /> : <Check size={17} />}
          </button>
        )}
        <button
          className="admin-icon-btn admin-danger-btn"
          onClick={() => setConfirmDelete(true)}
          aria-label="حذف الرقم"
          title="حذف"
        >
          <Trash2 size={17} />
        </button>
      </div>
      {confirmDelete && (
        <ConfirmDialog
          title="حذف الرقم؟"
          message={`سيتم حذف الرقم «${phone.number}» من القائمة.`}
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

function PhonesCard() {
  const queryClient = useQueryClient();
  const [newNumber, setNewNumber] = useState('');
  const phonesQuery = useQuery({ queryKey: adminPhonesKey, queryFn: getAdminPhones });

  const addMutation = useMutation({
    mutationFn: () => createPhone(newNumber.trim()),
    onSuccess: () => {
      setNewNumber('');
      invalidateAll(queryClient);
      toast.success('تمت إضافة الرقم');
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'تعذّر الإضافة'),
  });

  const phones = phonesQuery.data?.phones ?? [];

  return (
    <section className="admin-category" data-testid="admin-phones">
      <div className="admin-category-head">
        <div className="admin-category-fields">
          <h2 className="admin-section-title">أرقام التواصل</h2>
          <p className="admin-count">{phones.length} أرقام</p>
        </div>
      </div>
      {phonesQuery.isLoading ? (
        <div className="skeleton-line" />
      ) : (
        <ul className="admin-items">
          {phones.map((phone) => (
            <PhoneRow key={phone.id} phone={phone} />
          ))}
        </ul>
      )}
      <div className="admin-add-row admin-add-single">
        <input
          className="admin-input"
          value={newNumber}
          onChange={(event) => setNewNumber(event.target.value)}
          placeholder="رقم جديد…"
          inputMode="tel"
          dir="ltr"
          aria-label="رقم الهاتف الجديد"
          style={{ textAlign: 'left' }}
          data-testid="input-new-phone"
        />
        <button
          className="admin-small-btn"
          onClick={() => addMutation.mutate()}
          disabled={addMutation.isPending || !newNumber.trim()}
          data-testid="button-add-phone"
        >
          {addMutation.isPending ? <LoaderCircle size={15} className="spin" /> : <Plus size={15} />}
          إضافة
        </button>
      </div>
    </section>
  );
}

function PaymentRow({ payment }: { payment: AdminPayment }) {
  const queryClient = useQueryClient();
  const [number, setNumber] = useState(payment.number);
  const [holder, setHolder] = useState(payment.holder);
  const dirty = number.trim() !== payment.number || holder.trim() !== payment.holder;

  const saveMutation = useMutation({
    mutationFn: () => updatePayment(payment.id, { number: number.trim(), holder: holder.trim() }),
    onSuccess: () => {
      invalidateAll(queryClient);
      toast.success(`تم حفظ ${payment.name}`);
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : 'تعذّر الحفظ'),
  });

  return (
    <li className="admin-item admin-payment-row" data-testid={`admin-payment-${payment.id}`}>
      <span className="admin-pay-badge" style={{ background: payment.color, color: payment.ink }}>
        {payment.name}
      </span>
      <div className="admin-item-fields admin-payment-fields">
        <input
          className="admin-input"
          value={number}
          onChange={(event) => setNumber(event.target.value.replace(/[^\d]/g, ''))}
          placeholder="رقم الحساب"
          inputMode="numeric"
          dir="ltr"
          aria-label={`رقم حساب ${payment.name}`}
          style={{ textAlign: 'left' }}
        />
        <input
          className="admin-input"
          value={holder}
          onChange={(event) => setHolder(event.target.value)}
          placeholder="اسم صاحب الحساب"
          aria-label={`اسم صاحب حساب ${payment.name}`}
        />
      </div>
      <div className="admin-item-actions">
        {dirty && (
          <button
            className="admin-icon-btn admin-save"
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            aria-label={`حفظ ${payment.name}`}
            title="حفظ"
          >
            {saveMutation.isPending ? <LoaderCircle size={17} className="spin" /> : <Check size={17} />}
          </button>
        )}
      </div>
    </li>
  );
}

function PaymentsCard() {
  const paymentsQuery = useQuery({ queryKey: adminPaymentsKey, queryFn: getAdminPayments });
  const payments = paymentsQuery.data?.payments ?? [];

  return (
    <section className="admin-category" data-testid="admin-payments">
      <div className="admin-category-head">
        <div className="admin-category-fields">
          <h2 className="admin-section-title">حسابات الدفع</h2>
          <p className="admin-count">تظهر في أسفل القائمة مباشرة بعد الحفظ</p>
        </div>
      </div>
      {paymentsQuery.isLoading ? (
        <div className="skeleton-line" />
      ) : (
        <ul className="admin-items">
          {payments.map((payment) => (
            <PaymentRow key={payment.id} payment={payment} />
          ))}
        </ul>
      )}
    </section>
  );
}

function MenuPage() {
  const queryClient = useQueryClient();
  const [newTitle, setNewTitle] = useState('');
  const [newNote, setNewNote] = useState('');

  const categoriesQuery = useQuery({ queryKey: adminCategoriesKey, queryFn: getAdminCategories });
  const itemsQuery = useQuery({ queryKey: adminItemsKey, queryFn: () => getAdminItems() });

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
    <>
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
            {categories.map((category, index) => (
              <CategoryCard
                key={category.id}
                category={category}
                items={allItems.filter((item) => item.categoryId === category.id)}
                disableUp={index === 0}
                disableDown={index === categories.length - 1}
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
    </>
  );
}

function ContactPage() {
  return (
    <main className="admin-main">
      <PhonesCard />
      <PaymentsCard />
    </main>
  );
}

function AdminLayout({ onLogout, children }: { onLogout: () => void; children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const doLogout = async () => {
    try {
      await logout();
    } catch {
      /* ignore */
    }
    onLogout();
  };
  return (
    <div className="menu-shell admin-shell" dir="rtl" lang="ar">
      <Toaster position="bottom-center" richColors theme="dark" />
      <header className="site-header">
        <div className="header-inner">
          <div className="admin-brand-group">
            <button className="admin-burger" onClick={() => setDrawerOpen(true)} aria-label="فتح قائمة التنقل" data-testid="button-admin-menu">
              <Menu size={20} />
            </button>
            <span className="brand-lockup">
              <span className="brand-stamp" aria-hidden="true"><img src="/nilein-logo.png" alt="" /></span>
              <span className="brand-copy">
                <span className="brand-name">النيلين</span>
                <span className="brand-subtitle">لوحة التحكم</span>
              </span>
            </span>
          </div>
          <button className="admin-logout" onClick={doLogout} data-testid="button-admin-logout">
            <LogOut size={17} />
            خروج
          </button>
        </div>
      </header>
      <div className="admin-body">
        <SidePanel open={drawerOpen} onClose={() => setDrawerOpen(false)} />
        {children}
      </div>
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

  return (
    <AdminLayout onLogout={() => setAuthed(false)}>
      <Switch>
        <Route path="/nilein-dashboard/contact" component={ContactPage} />
        <Route component={MenuPage} />
      </Switch>
    </AdminLayout>
  );
}

export default AdminPage;
