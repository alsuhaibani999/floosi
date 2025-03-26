import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  User as FirebaseUser,
  UserCredential
} from "firebase/auth";
import { apiRequest } from "./queryClient";
import type { InsertUser } from "@shared/schema";

// تكوين Firebase - خاص بتطبيق فلوسي
const firebaseConfig = {
  apiKey: "AIzaSyCk_NRGAqxkK6X0Q18kwSfYickpZMOE6U",
  authDomain: "floosi-d2b08.firebaseapp.com",
  projectId: "floosi-d2b08",
  storageBucket: "floosi-d2b08.firebasestorage.app",
  messagingSenderId: "843786375286",
  appId: "1:843786375286:web:af81096d2ac3b865e2cf57",
  measurementId: "G-LWR7VBFPTB"
};

// تهيئة تطبيق Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// وظائف المصادقة المباشرة مع Firebase
export async function registerWithEmailAndPassword(
  email: string, 
  password: string
): Promise<UserCredential> {
  return createUserWithEmailAndPassword(auth, email, password);
}

export async function loginWithEmailAndPassword(
  email: string, 
  password: string
): Promise<UserCredential> {
  return signInWithEmailAndPassword(auth, email, password);
}

// وظائف المصادقة المدمجة مع API الخلفية

// تسجيل مستخدم جديد مع التكامل بين Firebase والخادم
export async function registerWithFirebase(userData: InsertUser): Promise<any> {
  try {
    // استخدام واجهة API المحلية للتسجيل والتي ستتعامل مع Firebase أيضًا
    const response = await apiRequest("POST", "/api/register", userData);
    return await response.json();
  } catch (error: any) {
    console.error("Registration error:", error);
    throw new Error(error.message || "فشل في تسجيل المستخدم");
  }
}

// تسجيل الدخول للمستخدم مع التكامل بين Firebase والخادم
export async function loginWithFirebase(
  username: string,
  password: string
): Promise<any> {
  try {
    // استخدام واجهة API المحلية للمصادقة، والتي ستتعامل مع Firebase في الخلفية
    const response = await apiRequest("POST", "/api/login", { username, password });
    return await response.json();
  } catch (error: any) {
    console.error("Login error:", error);
    throw new Error(error.message || "فشل في تسجيل الدخول");
  }
}

// تسجيل الخروج
export async function logoutUser(): Promise<void> {
  try {
    // تسجيل الخروج من Firebase
    await signOut(auth).catch(err => {
      console.warn("Firebase signOut error:", err);
    });
    
    // تسجيل الخروج من الخادم
    await apiRequest("POST", "/api/logout");
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
}

export function onAuthChange(callback: (user: FirebaseUser | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

export { auth };