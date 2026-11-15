import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth, isFirebaseAvailable } from './firebase';

export const DESIGNATED_ADMIN_EMAIL = (
  import.meta.env.VITE_SURARIO_ADMIN_EMAIL || 'joansagales@gmail.com'
).toLowerCase();

export interface AdminAuthState {
  user: User | null;
  isAdmin: boolean;
  isPendingVerification: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * Comprueba estrictamente si el usuario autenticado es el administrador designado
 * Y si ha verificado su correo electrónico con éxito.
 */
export function isDesignatedAdmin(user: User | null): boolean {
  if (!user || !user.email) return false;
  return (
    user.email.toLowerCase() === DESIGNATED_ADMIN_EMAIL &&
    Boolean(user.emailVerified)
  );
}

/**
 * Inicia sesión para el administrador.
 * Comprueba si el correo está verificado; si no lo está, no concede privilegios.
 */
export async function loginAdmin(
  email: string,
  pass: string
): Promise<{ user: User; isEmailVerified: boolean }> {
  if (!auth || !isFirebaseAvailable()) {
    throw new Error('Firebase Authentication no está disponible en este entorno.');
  }

  const cleanEmail = email.trim().toLowerCase();
  if (cleanEmail !== DESIGNATED_ADMIN_EMAIL) {
    throw new Error('Acceso denegado: este correo no tiene permisos de administración en SURARIO.');
  }

  const credentials = await signInWithEmailAndPassword(auth, cleanEmail, pass);
  const user = credentials.user;

  // Si no está verificado, intentar enviar correo si no se envió recientemente
  if (!user.emailVerified) {
    try {
      await sendEmailVerification(user);
    } catch {
      // Ignorar si se alcanzó límite de reenvío
    }
    return { user, isEmailVerified: false };
  }

  // Si está verificado, forzar refresco del token para propagar email_verified: true
  await user.getIdToken(true);
  return { user, isEmailVerified: true };
}

/**
 * Inicializa la cuenta de administrador para el primer acceso si aún no existe en Firebase Auth.
 * Bloqueado estrictamente para que ningún otro correo pueda registrarse.
 * Envía obligatoriamente el correo de verificación.
 */
export async function initializeAdminAccount(
  email: string,
  pass: string
): Promise<{ user: User; emailSent: boolean }> {
  if (!auth || !isFirebaseAvailable()) {
    throw new Error('Firebase Authentication no está disponible en este entorno.');
  }

  const cleanEmail = email.trim().toLowerCase();
  if (cleanEmail !== DESIGNATED_ADMIN_EMAIL) {
    throw new Error('Registro denegado: solo el correo oficial de administración puede inicializarse.');
  }

  if (pass.length < 8) {
    throw new Error('La contraseña debe tener al menos 8 caracteres.');
  }

  const credentials = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
  const user = credentials.user;

  let emailSent = false;
  try {
    await sendEmailVerification(user);
    emailSent = true;
  } catch (verifyErr) {
    console.error('[SURARIO Auth] Error sending verification email:', verifyErr);
  }

  return { user, emailSent };
}

/**
 * Reenvía el correo de verificación al usuario administrador
 */
export async function sendAdminVerificationEmail(user?: User | null): Promise<void> {
  const targetUser = user || (auth ? auth.currentUser : null);
  if (!targetUser) {
    throw new Error('No hay ninguna sesión activa para verificar.');
  }
  if (targetUser.email?.toLowerCase() !== DESIGNATED_ADMIN_EMAIL) {
    throw new Error('Operación denegada.');
  }
  await sendEmailVerification(targetUser);
}

/**
 * Recarga el estado del usuario en Firebase y refresca el token JWT
 * para validar si ya completó la verificación del correo.
 */
export async function reloadAndVerifyAdmin(
  user?: User | null
): Promise<{ isVerified: boolean; user: User | null }> {
  const targetUser = user || (auth ? auth.currentUser : null);
  if (!targetUser) {
    return { isVerified: false, user: null };
  }

  // Recarga el usuario desde los servidores de Firebase
  await targetUser.reload();
  // Forzar actualización del token para que incluya email_verified: true
  await targetUser.getIdToken(true);

  const verified = isDesignatedAdmin(targetUser);
  return { isVerified: verified, user: targetUser };
}

/**
 * Envía correo de recuperación de contraseña al administrador oficial
 */
export async function sendAdminPasswordReset(email: string): Promise<void> {
  if (!auth || !isFirebaseAvailable()) {
    throw new Error('Firebase Authentication no está disponible.');
  }

  const cleanEmail = email.trim().toLowerCase();
  if (cleanEmail !== DESIGNATED_ADMIN_EMAIL) {
    throw new Error('Operación denegada.');
  }

  await sendPasswordResetEmail(auth, cleanEmail);
}

/**
 * Cierra la sesión administrativa
 */
export async function logoutAdmin(): Promise<void> {
  if (!auth) return;
  await signOut(auth);
}

/**
 * Escucha cambios en el estado de autenticación asegurando que solo
 * los usuarios verificados con el email designado tengan privilegios.
 */
export function subscribeToAuthChanges(
  onStateChange: (state: AdminAuthState) => void
): () => void {
  if (!auth || !isFirebaseAvailable()) {
    onStateChange({
      user: null,
      isAdmin: false,
      isPendingVerification: false,
      isLoading: false,
      error: 'Firebase Auth no configurado',
    });
    return () => {};
  }

  const unsubscribe = onAuthStateChanged(
    auth,
    (user) => {
      const isCorrectEmail = user?.email?.toLowerCase() === DESIGNATED_ADMIN_EMAIL;
      const isVerified = isDesignatedAdmin(user);
      const isPending = Boolean(user && isCorrectEmail && !user.emailVerified);

      onStateChange({
        user,
        isAdmin: isVerified,
        isPendingVerification: isPending,
        isLoading: false,
        error: null,
      });
    },
    (error) => {
      onStateChange({
        user: null,
        isAdmin: false,
        isPendingVerification: false,
        isLoading: false,
        error: error.message,
      });
    }
  );

  return unsubscribe;
}
