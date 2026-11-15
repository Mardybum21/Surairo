import {
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  deleteDoc,
  updateDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db, isFirebaseAvailable } from './firebase';
import { Accommodation, Activity, ProviderApplication } from '../types';
import { ACCOMMODATIONS, ACTIVITIES } from '../data/patagoniaData';

export const COLLECTIONS = {
  APPLICATIONS: 'provider_applications',
  ACCOMMODATIONS: 'accommodations',
  ACTIVITIES: 'activities',
  SETTINGS: 'site_settings',
} as const;

/* =====================================================================
 * 1. GESTIÓN DE SOLICITUDES DE COLABORADORES (PROVIDER APPLICATIONS)
 * ===================================================================== */

/**
 * Guarda una solicitud de colaborador en Firestore y en localStorage como respaldo local.
 */
export async function submitProviderApplication(
  application: ProviderApplication
): Promise<{ success: boolean; mode: 'firestore' | 'local'; id: string }> {
  // Guardado en localStorage para que el usuario o navegador mantenga constancia
  try {
    const existing = JSON.parse(localStorage.getItem('surario_provider_apps') || '[]');
    const filtered = existing.filter((a: ProviderApplication) => a.id !== application.id);
    const withStatus = { ...application, status: application.status || 'pending' };
    localStorage.setItem('surario_provider_apps', JSON.stringify([withStatus, ...filtered]));
  } catch (err) {
    console.warn('[SURARIO Data] localStorage write error:', err);
  }

  // Intento de guardado en Firestore si está disponible
  if (db && isFirebaseAvailable()) {
    try {
      const docRef = doc(db, COLLECTIONS.APPLICATIONS, application.id);
      await setDoc(docRef, {
        ...application,
        status: application.status || 'pending',
        createdAt: serverTimestamp(),
      });
      return { success: true, mode: 'firestore', id: application.id };
    } catch (err) {
      console.warn('[SURARIO Data] Firestore write failed, stored in localStorage:', err);
    }
  }

  return { success: true, mode: 'local', id: application.id };
}

/**
 * Obtiene todas las solicitudes para el administrador desde Firestore.
 * Si hay solicitudes locales que aún no están en la nube, las incluye con un indicador.
 */
export async function getAdminApplications(): Promise<ProviderApplication[]> {
  const localList: ProviderApplication[] = (() => {
    try {
      return JSON.parse(localStorage.getItem('surario_provider_apps') || '[]');
    } catch {
      return [];
    }
  })();

  if (!db || !isFirebaseAvailable()) {
    return localList;
  }

  try {
    const colRef = collection(db, COLLECTIONS.APPLICATIONS);
    const snap = await getDocs(colRef);
    const remoteList: ProviderApplication[] = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        businessName: data.businessName || '',
        businessType: data.businessType || 'hotel',
        destination: data.destination || '',
        contactPerson: data.contactPerson || '',
        email: data.email || '',
        phone: data.phone || '',
        website: data.website || '',
        description: data.description || '',
        servicesOffered: data.servicesOffered || '',
        submittedAt: data.submittedAt || (data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString()),
        status: data.status || 'pending',
        adminNotes: data.adminNotes || '',
      } as ProviderApplication;
    });

    // Combinar evitando duplicados por ID (remoto prevalece)
    const remoteIds = new Set(remoteList.map((a) => a.id));
    const merged = [...remoteList];
    for (const local of localList) {
      if (!remoteIds.has(local.id)) {
        merged.push({ ...local, status: local.status || 'pending' });
      }
    }

    // Ordenar de más reciente a más antiguo
    return merged.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  } catch (error) {
    console.warn('[SURARIO Admin] Error fetching applications from Firestore, falling back to local:', error);
    return localList;
  }
}

/**
 * Actualiza el estado de una solicitud (Aprobada, Rechazada, Archivada, Pendiente)
 */
export async function updateApplicationStatus(
  id: string,
  status: 'pending' | 'approved' | 'rejected' | 'archived',
  adminNotes?: string
): Promise<boolean> {
  // Actualizar en localStorage
  try {
    const local = JSON.parse(localStorage.getItem('surario_provider_apps') || '[]');
    const updated = local.map((a: ProviderApplication) =>
      a.id === id ? { ...a, status, adminNotes: adminNotes ?? a.adminNotes } : a
    );
    localStorage.setItem('surario_provider_apps', JSON.stringify(updated));
  } catch (err) {
    console.warn('[SURARIO Admin] localStorage update error:', err);
  }

  // Actualizar en Firestore
  if (db && isFirebaseAvailable()) {
    try {
      const docRef = doc(db, COLLECTIONS.APPLICATIONS, id);
      const patch: Record<string, any> = { status };
      if (adminNotes !== undefined) patch.adminNotes = adminNotes;
      await updateDoc(docRef, patch);
      return true;
    } catch (err) {
      console.error('[SURARIO Admin] Firestore update status failed:', err);
      // If doc didn't exist in Firestore, create it
      try {
        const local = JSON.parse(localStorage.getItem('surario_provider_apps') || '[]');
        const target = local.find((a: ProviderApplication) => a.id === id);
        if (target) {
          const docRef = doc(db, COLLECTIONS.APPLICATIONS, id);
          await setDoc(docRef, { ...target, status, adminNotes: adminNotes || '', updatedAt: serverTimestamp() });
          return true;
        }
      } catch {
        // ignore
      }
    }
  }

  return true;
}

/**
 * Elimina una solicitud de colaborador
 */
export async function deleteApplication(id: string): Promise<boolean> {
  try {
    const local = JSON.parse(localStorage.getItem('surario_provider_apps') || '[]');
    const filtered = local.filter((a: ProviderApplication) => a.id !== id);
    localStorage.setItem('surario_provider_apps', JSON.stringify(filtered));
  } catch (err) {
    console.warn('[SURARIO Admin] localStorage delete error:', err);
  }

  if (db && isFirebaseAvailable()) {
    try {
      const docRef = doc(db, COLLECTIONS.APPLICATIONS, id);
      await deleteDoc(docRef);
      return true;
    } catch (err) {
      console.error('[SURARIO Admin] Firestore delete failed:', err);
    }
  }

  return true;
}

/**
 * Migra solicitudes locales a Firestore
 */
export async function migrateLocalApplicationsToFirestore(): Promise<{
  migrated: number;
  total: number;
}> {
  if (!db || !isFirebaseAvailable()) {
    throw new Error('Firestore no está disponible para migrar registros.');
  }

  const stored = localStorage.getItem('surario_provider_apps');
  if (!stored) return { migrated: 0, total: 0 };

  const apps: ProviderApplication[] = JSON.parse(stored);
  let count = 0;

  for (const app of apps) {
    try {
      const docRef = doc(db, COLLECTIONS.APPLICATIONS, app.id);
      await setDoc(
        docRef,
        {
          ...app,
          status: app.status || 'pending',
          createdAt: serverTimestamp(),
        },
        { merge: true }
      );
      count++;
    } catch (err) {
      console.warn(`[SURARIO Migration] Error migrating application ${app.id}:`, err);
    }
  }

  return { migrated: count, total: apps.length };
}

/* =====================================================================
 * 2. GESTIÓN DE ALOJAMIENTOS (ACCOMMODATIONS CRUD)
 * ===================================================================== */

/**
 * Obtiene todos los alojamientos para el panel de administración (publicados y borradores).
 */
export async function getAllAdminAccommodations(): Promise<Accommodation[]> {
  if (!db || !isFirebaseAvailable()) {
    return ACCOMMODATIONS.map((a) => ({ ...a, published: false }));
  }

  try {
    const colRef = collection(db, COLLECTIONS.ACCOMMODATIONS);
    const snap = await getDocs(colRef);
    if (snap.empty) {
      // Si la colección de Firestore está vacía, devolvemos la base editorial local como borradores
      return ACCOMMODATIONS.map((a) => ({ ...a, published: false }));
    }
    return snap.docs.map((d) => {
      const data = d.data() as Accommodation;
      return {
        ...data,
        published: Boolean(data.published),
      };
    });
  } catch (error) {
    console.warn('[SURARIO Admin] Error fetching accommodations:', error);
    return ACCOMMODATIONS.map((a) => ({ ...a, published: false }));
  }
}

/**
 * Guarda o actualiza un alojamiento en Firestore
 */
export async function saveAccommodation(item: Accommodation): Promise<boolean> {
  if (!db || !isFirebaseAvailable()) {
    throw new Error('Firestore no está disponible para guardar alojamientos.');
  }

  const cleanItem: Accommodation = {
    ...item,
    id: item.id.trim() || `acc-${Date.now()}`,
    published: item.published ?? true,
    updatedAt: new Date().toISOString(),
  };

  const docRef = doc(db, COLLECTIONS.ACCOMMODATIONS, cleanItem.id);
  await setDoc(docRef, cleanItem, { merge: true });
  return true;
}

/**
 * Publica o despublica un alojamiento
 */
export async function toggleAccommodationPublished(id: string, published: boolean): Promise<boolean> {
  if (!db || !isFirebaseAvailable()) return false;
  const docRef = doc(db, COLLECTIONS.ACCOMMODATIONS, id);
  await updateDoc(docRef, { published, updatedAt: new Date().toISOString() });
  return true;
}

/**
 * Elimina un alojamiento
 */
export async function deleteAccommodation(id: string): Promise<boolean> {
  if (!db || !isFirebaseAvailable()) return false;
  const docRef = doc(db, COLLECTIONS.ACCOMMODATIONS, id);
  await deleteDoc(docRef);
  return true;
}

/* =====================================================================
 * 3. GESTIÓN DE TOURS Y EXPERIENCIAS (ACTIVITIES CRUD)
 * ===================================================================== */

/**
 * Obtiene todas las actividades para el panel de administración (publicadas y borradores).
 */
export async function getAllAdminActivities(): Promise<Activity[]> {
  if (!db || !isFirebaseAvailable()) {
    return ACTIVITIES.map((a) => ({ ...a, published: false }));
  }

  try {
    const colRef = collection(db, COLLECTIONS.ACTIVITIES);
    const snap = await getDocs(colRef);
    if (snap.empty) {
      return ACTIVITIES.map((a) => ({ ...a, published: false }));
    }
    return snap.docs.map((d) => {
      const data = d.data() as Activity;
      return {
        ...data,
        published: Boolean(data.published),
      };
    });
  } catch (error) {
    console.warn('[SURARIO Admin] Error fetching activities:', error);
    return ACTIVITIES.map((a) => ({ ...a, published: false }));
  }
}

/**
 * Guarda o actualiza una actividad en Firestore
 */
export async function saveActivity(item: Activity): Promise<boolean> {
  if (!db || !isFirebaseAvailable()) {
    throw new Error('Firestore no está disponible para guardar experiencias.');
  }

  const cleanItem: Activity = {
    ...item,
    id: item.id.trim() || `act-${Date.now()}`,
    name: item.name || item.title,
    title: item.title || item.name || 'Experiencia',
    published: item.published ?? true,
    updatedAt: new Date().toISOString(),
  };

  const docRef = doc(db, COLLECTIONS.ACTIVITIES, cleanItem.id);
  await setDoc(docRef, cleanItem, { merge: true });
  return true;
}

/**
 * Publica o despublica una experiencia
 */
export async function toggleActivityPublished(id: string, published: boolean): Promise<boolean> {
  if (!db || !isFirebaseAvailable()) return false;
  const docRef = doc(db, COLLECTIONS.ACTIVITIES, id);
  await updateDoc(docRef, { published, updatedAt: new Date().toISOString() });
  return true;
}

/**
 * Elimina una experiencia
 */
export async function deleteActivity(id: string): Promise<boolean> {
  if (!db || !isFirebaseAvailable()) return false;
  const docRef = doc(db, COLLECTIONS.ACTIVITIES, id);
  await deleteDoc(docRef);
  return true;
}

/* =====================================================================
 * 4. SEMBRADO INICIAL CONTROLADO (SEED DATA)
 * ===================================================================== */

export interface SeedResult {
  accommodationsCreated: number;
  accommodationsSkipped: number;
  activitiesCreated: number;
  activitiesSkipped: number;
  totalCreated: number;
  totalSkipped: number;
  createdIds: string[];
  skippedIds: string[];
}

/**
 * Siembra los 21 datos iniciales de patagoniaData.ts en Firestore de forma segura.
 * - Siempre importa con `published: false` (como borradores protegidos).
 * - No sobrescribe fichas existentes en Firestore para proteger ediciones del administrador.
 * - Retorna un desglose completo de creados y omitidos.
 */
export async function seedInitialDataToFirestore(): Promise<SeedResult> {
  if (!db || !isFirebaseAvailable()) {
    throw new Error('Firestore no está disponible para sembrar datos.');
  }

  let accCreated = 0;
  let accSkipped = 0;
  let actCreated = 0;
  let actSkipped = 0;
  const createdIds: string[] = [];
  const skippedIds: string[] = [];

  const now = new Date().toISOString();

  // 1. Alojamientos (11)
  for (const acc of ACCOMMODATIONS) {
    const docRef = doc(db, COLLECTIONS.ACCOMMODATIONS, acc.id);
    const existing = await getDoc(docRef);
    if (!existing.exists()) {
      await setDoc(docRef, {
        ...acc,
        published: false, // CONDICIÓN ESTRICTA: Inicializado como Borrador
        createdAt: now,
        updatedAt: now,
      });
      accCreated++;
      createdIds.push(acc.id);
    } else {
      accSkipped++;
      skippedIds.push(acc.id);
    }
  }

  // 2. Actividades y Experiencias (10)
  for (const act of ACTIVITIES) {
    const docRef = doc(db, COLLECTIONS.ACTIVITIES, act.id);
    const existing = await getDoc(docRef);
    if (!existing.exists()) {
      await setDoc(docRef, {
        ...act,
        name: act.title, // Asegura compatibilidad title/name
        published: false, // CONDICIÓN ESTRICTA: Inicializado como Borrador
        createdAt: now,
        updatedAt: now,
      });
      actCreated++;
      createdIds.push(act.id);
    } else {
      actSkipped++;
      skippedIds.push(act.id);
    }
  }

  return {
    accommodationsCreated: accCreated,
    accommodationsSkipped: accSkipped,
    activitiesCreated: actCreated,
    activitiesSkipped: actSkipped,
    totalCreated: accCreated + actCreated,
    totalSkipped: accSkipped + actSkipped,
    createdIds,
    skippedIds,
  };
}

/* =====================================================================
 * 5. CONSUMO PÚBLICO EN TIEMPO REAL (PUBLIC PORTAL SYNC)
 * ===================================================================== */

/**
 * Recupera alojamientos publicados de Firestore exclusivamente con `published == true`.
 * Los borradores (`published == false`) NUNCA se muestran a los visitantes.
 * Si Firestore no tiene ningún documento importado aún, utiliza el catálogo editorial local como respaldo.
 */
export async function getLiveAccommodations(
  fallback: Accommodation[] = ACCOMMODATIONS
): Promise<Accommodation[]> {
  if (!db || !isFirebaseAvailable()) {
    return fallback;
  }

  try {
    const q = query(
      collection(db, COLLECTIONS.ACCOMMODATIONS),
      where('published', '==', true)
    );
    const snap = await getDocs(q);

    // Si hay fichas con published == true, devolvemos exclusivamente esas
    if (!snap.empty) {
      return snap.docs.map((docSnap) => docSnap.data() as Accommodation);
    }

    // Si no hay ninguna publicada, comprobamos si la colección de Firestore ya contiene documentos
    const allDocsSnap = await getDocs(collection(db, COLLECTIONS.ACCOMMODATIONS));
    if (!allDocsSnap.empty) {
      // La base de datos ya está inicializada, pero todos los alojamientos son borradores
      // Los visitantes públicos NO deben ver ningún borrador
      return [];
    }

    // Colección totalmente vacía en la nube: respaldo inicial hasta que se importe
    return fallback;
  } catch (err) {
    console.warn('[SURARIO Public] Firestore fetch error, using local fallback:', err);
    return fallback;
  }
}

/**
 * Recupera actividades publicadas de Firestore exclusivamente con `published == true`.
 * Los borradores (`published == false`) NUNCA se muestran a los visitantes.
 * Si Firestore no tiene ningún documento importado aún, utiliza el catálogo editorial local como respaldo.
 */
export async function getLiveActivities(
  fallback: Activity[] = ACTIVITIES
): Promise<Activity[]> {
  if (!db || !isFirebaseAvailable()) {
    return fallback;
  }

  try {
    const q = query(
      collection(db, COLLECTIONS.ACTIVITIES),
      where('published', '==', true)
    );
    const snap = await getDocs(q);

    if (!snap.empty) {
      return snap.docs.map((docSnap) => docSnap.data() as Activity);
    }

    const allDocsSnap = await getDocs(collection(db, COLLECTIONS.ACTIVITIES));
    if (!allDocsSnap.empty) {
      return [];
    }

    return fallback;
  } catch (err) {
    console.warn('[SURARIO Public] Firestore fetch error, using local fallback:', err);
    return fallback;
  }
}
