/**
 * خدمة التخزين المؤقت للتطبيق
 * تساعد في تخزين البيانات المستخدمة بشكل متكرر وتقليل الطلبات على الخادم
 */

// مدة صلاحية التخزين المؤقت (5 دقائق)
const CACHE_EXPIRATION = 5 * 60 * 1000;

// واجهة لعناصر التخزين المؤقت
interface CacheItem<T> {
  value: T;
  timestamp: number;
  expiration: number;
}

class CacheService {
  private cache: Map<string, CacheItem<any>>;
  
  constructor() {
    this.cache = new Map();
    
    // استعادة البيانات المخزنة مسبقاً من localStorage إذا وجدت
    this.loadFromLocalStorage();
    
    // تنظيف البيانات منتهية الصلاحية كل دقيقة
    setInterval(() => this.cleanExpiredItems(), 60 * 1000);
  }
  
  /**
   * تخزين قيمة في الذاكرة المؤقتة
   * @param key مفتاح التخزين
   * @param value القيمة المراد تخزينها
   * @param expiration مدة الصلاحية بالمللي ثانية (القيمة الافتراضية 5 دقائق)
   */
  set<T>(key: string, value: T, expiration: number = CACHE_EXPIRATION): void {
    const item: CacheItem<T> = {
      value,
      timestamp: Date.now(),
      expiration
    };
    
    this.cache.set(key, item);
    this.saveToLocalStorage();
  }
  
  /**
   * الحصول على قيمة من الذاكرة المؤقتة
   * @param key مفتاح البيانات
   * @returns القيمة المخزنة أو undefined إذا لم توجد أو انتهت صلاحيتها
   */
  get<T>(key: string): T | undefined {
    const item = this.cache.get(key) as CacheItem<T> | undefined;
    
    if (!item) {
      return undefined;
    }
    
    // التحقق من انتهاء صلاحية البيانات
    if (Date.now() - item.timestamp > item.expiration) {
      this.cache.delete(key);
      this.saveToLocalStorage();
      return undefined;
    }
    
    return item.value;
  }
  
  /**
   * التحقق من وجود قيمة في الذاكرة المؤقتة وعدم انتهاء صلاحيتها
   * @param key مفتاح البيانات
   * @returns true إذا كانت القيمة موجودة وصالحة
   */
  has(key: string): boolean {
    const item = this.cache.get(key);
    
    if (!item) {
      return false;
    }
    
    // التحقق من انتهاء صلاحية البيانات
    if (Date.now() - item.timestamp > item.expiration) {
      this.cache.delete(key);
      this.saveToLocalStorage();
      return false;
    }
    
    return true;
  }
  
  /**
   * حذف قيمة من الذاكرة المؤقتة
   * @param key مفتاح البيانات
   */
  delete(key: string): void {
    this.cache.delete(key);
    this.saveToLocalStorage();
  }
  
  /**
   * مسح جميع البيانات المؤقتة
   */
  clear(): void {
    this.cache.clear();
    localStorage.removeItem('app_cache');
  }
  
  /**
   * تمديد صلاحية القيمة المؤقتة
   * @param key مفتاح البيانات
   * @param expiration مدة الصلاحية الجديدة (اختياري)
   * @returns true إذا تم تمديد الصلاحية بنجاح
   */
  extend(key: string, expiration: number = CACHE_EXPIRATION): boolean {
    const item = this.cache.get(key);
    
    if (!item) {
      return false;
    }
    
    item.timestamp = Date.now();
    item.expiration = expiration;
    this.cache.set(key, item);
    this.saveToLocalStorage();
    
    return true;
  }
  
  /**
   * حفظ البيانات في localStorage
   */
  private saveToLocalStorage(): void {
    try {
      const serialized = JSON.stringify(Array.from(this.cache.entries()));
      localStorage.setItem('app_cache', serialized);
    } catch (error) {
      console.error('Error saving cache to localStorage:', error);
    }
  }
  
  /**
   * استعادة البيانات من localStorage
   */
  private loadFromLocalStorage(): void {
    try {
      const serialized = localStorage.getItem('app_cache');
      
      if (serialized) {
        const entries = JSON.parse(serialized);
        this.cache = new Map(entries);
      }
    } catch (error) {
      console.error('Error loading cache from localStorage:', error);
      // في حالة حدوث خطأ، نبدأ بذاكرة مؤقتة جديدة فارغة
      this.cache = new Map();
    }
  }
  
  /**
   * إزالة العناصر منتهية الصلاحية من الذاكرة المؤقتة
   */
  private cleanExpiredItems(): void {
    const now = Date.now();
    let hasChanges = false;
    
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.expiration) {
        this.cache.delete(key);
        hasChanges = true;
      }
    }
    
    if (hasChanges) {
      this.saveToLocalStorage();
    }
  }
}

// تصدير نسخة واحدة (singleton) من خدمة التخزين المؤقت
export const cacheService = new CacheService();