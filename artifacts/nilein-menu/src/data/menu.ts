export type MenuItem = {
  id: string;
  name: string;
  category: string;
};

export type MenuCategory = {
  id: string;
  title: string;
  note: string;
  items: MenuItem[];
};

// Names transcribed only where legible in the supplied menu references.
// Prices are intentionally omitted until the restaurant confirms its current list.
export const menuCategories: MenuCategory[] = [
  {
    id: 'fish',
    title: 'الأسماك',
    note: 'من قائمة الأسماك',
    items: [
      { id: 'fish-soup', name: 'شورية سمك', category: 'fish' },
      { id: 'fish-fatta', name: 'فتة سمك', category: 'fish' },
      { id: 'fried-fish-kg', name: 'كيلو سمك فرايد', category: 'fish' },
      { id: 'fried-fish-half', name: 'نصف كيلو سمك فرايد', category: 'fish' },
      { id: 'tilapia', name: 'كيلو سمك بلطي', category: 'fish' },
      { id: 'takeaway-soup', name: 'شورية سفري', category: 'fish' },
    ],
  },
  {
    id: 'grill',
    title: 'اللحوم والمشاوي',
    note: 'من قائمة اللحوم',
    items: [
      { id: 'lamb-kebab-kg', name: 'كيلو شيش ضأن', category: 'grill' },
      { id: 'lamb-kebab-half', name: 'نصف كيلو شيش ضأن', category: 'grill' },
      { id: 'grilled-liver', name: 'قطعة كبدة مشوية', category: 'grill' },
      { id: 'lamb-saj', name: 'كيلو ضأن صاج', category: 'grill' },
      { id: 'camel-kebab-kg', name: 'كيلو شيش إبل', category: 'grill' },
      { id: 'camel-kebab-half', name: 'نصف كيلو شيش إبل', category: 'grill' },
      { id: 'camel-liver-quarter', name: 'كبدة إبل ربع', category: 'grill' },
    ],
  },
  {
    id: 'mandi',
    title: 'المندي',
    note: 'أطباق من قائمة المندي',
    items: [
      { id: 'mandi-meat', name: 'مندي لحم', category: 'mandi' },
      { id: 'mandi-chicken-whole', name: 'مندي فرخة كاملة', category: 'mandi' },
      { id: 'mandi-chicken-half', name: 'نصف فرخة مندي', category: 'mandi' },
      { id: 'mandi-chicken-quarter', name: 'ربع فرخة مندي', category: 'mandi' },
      { id: 'rice', name: 'طلب رز', category: 'mandi' },
      { id: 'yogurt', name: 'كاسة زبادي', category: 'mandi' },
    ],
  },
  {
    id: 'juices',
    title: 'العصائر',
    note: 'عصائر ومشروبات',
    items: [
      { id: 'grapefruit', name: 'جريب فروت', category: 'juices' },
      { id: 'takeaway-sharbot', name: 'شربوت سفري', category: 'juices' },
      { id: 'moses-milk', name: 'موز باللبن', category: 'juices' },
      { id: 'sharbot', name: 'جك شربوت', category: 'juices' },
      { id: 'lemon-mint-jug', name: 'جك ليمون بالنعناع', category: 'juices' },
      { id: 'strawberry-milk', name: 'فراولة بالحليب', category: 'juices' },
      { id: 'pineapple-milk', name: 'أناناس بالحليب', category: 'juices' },
      { id: 'pineapple', name: 'أناناس عادي', category: 'juices' },
      { id: 'orange', name: 'برتقال', category: 'juices' },
      { id: 'mango-milk', name: 'مانجو بالحليب', category: 'juices' },
      { id: 'fruit-salad-drink', name: 'سلطة فواكه مشكلة', category: 'juices' },
      { id: 'watermelon', name: 'بطيخ', category: 'juices' },
      { id: 'mixed-juice', name: 'عصير مشكل', category: 'juices' },
    ],
  },
  {
    id: 'salads',
    title: 'السلطات',
    note: 'إضافات من قائمة السلطات',
    items: [
      { id: 'green-salad', name: 'سلطة خضراء', category: 'salads' },
      { id: 'dakوة-salad', name: 'سلطة دكوة', category: 'salads' },
      { id: 'tahini-salad', name: 'سلطة طحينية', category: 'salads' },
    ],
  },
];
