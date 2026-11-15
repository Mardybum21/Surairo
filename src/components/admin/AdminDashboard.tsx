import React, { useState, useEffect } from 'react';
import {
  Accommodation,
  Activity,
  ProviderApplication,
  Language,
  Currency,
  AccommodationType,
  ActivityCategory,
  Difficulty,
  PriceRange,
} from '../../types';
import { DESTINATIONS } from '../../data/patagoniaData';
import {
  getAdminApplications,
  updateApplicationStatus,
  deleteApplication,
  migrateLocalApplicationsToFirestore,
  getAllAdminAccommodations,
  saveAccommodation,
  toggleAccommodationPublished,
  deleteAccommodation,
  getAllAdminActivities,
  saveActivity,
  toggleActivityPublished,
  deleteActivity,
  seedInitialDataToFirestore,
  SeedResult,
} from '../../services/dataService';
import { logoutAdmin, DESIGNATED_ADMIN_EMAIL } from '../../services/authService';
import { PreviewModal } from './PreviewModal';
import { PublicationConfirmModal, ConfirmationType } from './PublicationConfirmModal';
import {
  Eye,
  Plus,
  Trash2,
  Edit3,
  Globe,
  EyeOff,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
} from 'lucide-react';

interface AdminDashboardProps {
  onBackToPublic: () => void;
  language?: Language;
}

type AdminTab = 'resumen' | 'solicitudes' | 'alojamientos' | 'experiencias' | 'configuracion';

export function AdminDashboard({ onBackToPublic }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('resumen');

  // Data States
  const [applications, setApplications] = useState<ProviderApplication[]>([]);
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Filters
  const [appStatusFilter, setAppStatusFilter] = useState<string>('all');
  const [accFilter, setAccFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [accSearch, setAccSearch] = useState<string>('');
  const [actFilter, setActFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [actSearch, setActSearch] = useState<string>('');

  // Modals for Editing
  const [editingAcc, setEditingAcc] = useState<Partial<Accommodation> | null>(null);
  const [isAccModalOpen, setIsAccModalOpen] = useState(false);

  const [editingAct, setEditingAct] = useState<Partial<Activity> | null>(null);
  const [isActModalOpen, setIsActModalOpen] = useState(false);

  // Preview Modal State
  const [previewItem, setPreviewItem] = useState<{
    type: 'accommodation' | 'activity';
    item: Accommodation | Activity;
  } | null>(null);

  // Confirmation Modals State
  const [confirmModalConfig, setConfirmModalConfig] = useState<{
    isOpen: boolean;
    type: ConfirmationType;
    title: string;
    itemName: string;
    onConfirm: () => Promise<void>;
  } | null>(null);

  // Seeding State
  const [seedDetails, setSeedDetails] = useState<SeedResult | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);

  // Load all data on mount
  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [apps, accs, acts] = await Promise.all([
        getAdminApplications(),
        getAllAdminAccommodations(),
        getAllAdminActivities(),
      ]);
      setApplications(apps);
      setAccommodations(accs);
      setActivities(acts);
    } catch (err) {
      console.error('[AdminDashboard] Error loading data:', err);
      setActionNotice({
        type: 'error',
        message: 'Error al conectar con la base de datos de Firestore.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const notify = (type: 'success' | 'error', message: string) => {
    setActionNotice({ type, message });
    setTimeout(() => {
      setActionNotice(null);
    }, 5000);
  };

  // =========================================================================
  // ACTIONS: SOLICITUDES DE PROVEEDORES
  // =========================================================================

  const handleUpdateAppStatus = async (
    id: string,
    status: 'pending' | 'approved' | 'rejected' | 'archived'
  ) => {
    try {
      await updateApplicationStatus(id, status);
      setApplications((prev) =>
        prev.map((app) => (app.id === id ? { ...app, status } : app))
      );
      notify('success', `Solicitud marcada como ${status}.`);
    } catch {
      notify('error', 'Error al actualizar el estado de la solicitud.');
    }
  };

  const handleDeleteApplication = (id: string, businessName: string) => {
    setConfirmModalConfig({
      isOpen: true,
      type: 'delete',
      title: '¿Eliminar solicitud de colaborador?',
      itemName: businessName,
      onConfirm: async () => {
        try {
          await deleteApplication(id);
          setApplications((prev) => prev.filter((app) => app.id !== id));
          setConfirmModalConfig(null);
          notify('success', `Solicitud de «${businessName}» eliminada con éxito.`);
        } catch {
          notify('error', 'No se pudo eliminar la solicitud de Firestore.');
        }
      },
    });
  };

  const handleConvertAppToAccommodation = (app: ProviderApplication) => {
    const matchedDest = DESTINATIONS.find(
      (d) =>
        d.name.toLowerCase().includes(app.destination.toLowerCase()) ||
        app.destination.toLowerCase().includes(d.name.toLowerCase())
    );

    const initialAcc: Partial<Accommodation> = {
      id: `acc-${Date.now()}`,
      name: app.businessName,
      nameEn: app.businessName,
      destinationId: matchedDest ? matchedDest.id : 'bariloche',
      destinationName: matchedDest ? matchedDest.name : app.destination,
      country: matchedDest ? matchedDest.country : 'Argentina',
      zone: matchedDest ? matchedDest.zone : 'argentina-norte',
      type: (app.businessType === 'hotel' ||
      app.businessType === 'cabana' ||
      app.businessType === 'hostal' ||
      app.businessType === 'refugio' ||
      app.businessType === 'camping'
        ? app.businessType
        : 'hotel') as AccommodationType,
      typeLabel: app.businessType.toUpperCase(),
      priceRange: 'Medio',
      indicativePrice: '$120 - $180 / noche',
      pricePerNight: 120,
      currency: 'USD',
      rating: 4.8,
      image: matchedDest
        ? matchedDest.image
        : 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80',
      shortDescription: app.description.slice(0, 160),
      shortDescriptionEn: app.description.slice(0, 160),
      longDescription: `${app.description}\n\nServicios ofrecidos: ${app.servicesOffered || 'No especificados'}.\nContacto: ${app.contactPerson} (${app.email}, ${app.phone})`,
      longDescriptionEn: `${app.description}\n\nContact: ${app.contactPerson} (${app.email}, ${app.phone})`,
      amenities: app.servicesOffered
        ? app.servicesOffered.split(',').map((s) => s.trim())
        : ['Wifi', 'Estacionamiento', 'Calefacción'],
      location: app.destination,
      officialUrl: app.website || '',
      bookingProvider: 'Reserva Directa',
      published: false, // CONDICIÓN: Se crea inicialmente como Borrador
    };

    setEditingAcc(initialAcc);
    setIsAccModalOpen(true);
    setActiveTab('alojamientos');
  };

  const handleConvertAppToActivity = (app: ProviderApplication) => {
    const matchedDest = DESTINATIONS.find(
      (d) =>
        d.name.toLowerCase().includes(app.destination.toLowerCase()) ||
        app.destination.toLowerCase().includes(d.name.toLowerCase())
    );

    const initialAct: Partial<Activity> = {
      id: `act-${Date.now()}`,
      title: app.businessName,
      name: app.businessName,
      titleEn: app.businessName,
      destinationId: matchedDest ? matchedDest.id : 'bariloche',
      destinationName: matchedDest ? matchedDest.name : app.destination,
      country: matchedDest ? matchedDest.country : 'Argentina',
      zone: matchedDest ? matchedDest.zone : 'argentina-norte',
      category: 'trekking',
      categoryLabel: 'Trekking & Guías',
      duration: 'Día completo (6-8 hs)',
      durationEn: 'Full day (6-8 hours)',
      difficulty: 'Moderada',
      bestSeason: 'Octubre a Abril',
      indicativePrice: '$85 / persona',
      price: 85,
      currency: 'USD',
      image: matchedDest
        ? matchedDest.image
        : 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
      shortDescription: app.description.slice(0, 160),
      descriptionEn: app.description.slice(0, 160),
      fullDescription: `${app.description}\n\nServicios y logística: ${app.servicesOffered || 'Guía profesional habilitado'}.\nContacto: ${app.contactPerson} (${app.email}, ${app.phone})`,
      fullDescriptionEn: `${app.description}\n\nContact: ${app.contactPerson} (${app.email}, ${app.phone})`,
      included: ['Guía profesional', 'Seguro de actividad', 'Refrigerio de montaña'],
      whatToBring: ['Calzado de trekking', 'Campera cortaviento', 'Botella de agua'],
      operatorName: app.businessName,
      officialUrl: app.website || '',
      published: false, // CONDICIÓN: Se crea inicialmente como Borrador
    };

    setEditingAct(initialAct);
    setIsActModalOpen(true);
    setActiveTab('experiencias');
  };

  // =========================================================================
  // ACTIONS: ALOJAMIENTOS (CRUD, PUBLISH, UNPUBLISH, DELETE)
  // =========================================================================

  const handleSaveAccommodation = async (
    e: React.FormEvent,
    forcePublished?: boolean
  ) => {
    e.preventDefault();
    if (!editingAcc || !editingAcc.name || !editingAcc.destinationId) {
      notify('error', 'Por favor completa el nombre y el destino del alojamiento.');
      return;
    }

    const matchedDest = DESTINATIONS.find((d) => d.id === editingAcc.destinationId);
    const publishedState = forcePublished !== undefined ? forcePublished : Boolean(editingAcc.published);

    const completeAcc: Accommodation = {
      id: editingAcc.id || `acc-${Date.now()}`,
      name: editingAcc.name.trim(),
      nameEn: editingAcc.nameEn || editingAcc.name,
      destinationId: editingAcc.destinationId,
      destinationName: matchedDest ? matchedDest.name : editingAcc.destinationName || '',
      country: matchedDest ? matchedDest.country : editingAcc.country || 'Argentina',
      zone: matchedDest ? matchedDest.zone : editingAcc.zone || 'argentina-norte',
      type: editingAcc.type || 'hotel',
      typeLabel: (editingAcc.type || 'hotel').toUpperCase(),
      priceRange: editingAcc.priceRange || 'Medio',
      indicativePrice:
        editingAcc.indicativePrice ||
        `${editingAcc.currency || 'USD'} ${editingAcc.pricePerNight || 120} / noche`,
      pricePerNight: Number(editingAcc.pricePerNight) || 120,
      currency: editingAcc.currency || 'USD',
      rating: editingAcc.rating || 4.8,
      image:
        editingAcc.image ||
        'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80',
      shortDescription: editingAcc.shortDescription || '',
      shortDescriptionEn: editingAcc.shortDescriptionEn || editingAcc.shortDescription || '',
      longDescription: editingAcc.longDescription || '',
      longDescriptionEn: editingAcc.longDescriptionEn || editingAcc.longDescription || '',
      amenities: Array.isArray(editingAcc.amenities)
        ? editingAcc.amenities
        : String(editingAcc.amenities || '')
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
      amenitiesEn: Array.isArray(editingAcc.amenitiesEn)
        ? editingAcc.amenitiesEn
        : String(editingAcc.amenitiesEn || '')
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
      location: editingAcc.location || (matchedDest ? matchedDest.name : ''),
      coordinates:
        editingAcc.coordinates ||
        (matchedDest ? matchedDest.coordinates : { lat: -41.13, lng: -71.3 }),
      officialUrl: editingAcc.officialUrl || '',
      affiliateUrl: editingAcc.affiliateUrl || '',
      bookingProvider: editingAcc.bookingProvider || 'SURARIO Direct Partner',
      published: publishedState,
      demoNote: editingAcc.demoNote || '',
      updatedAt: new Date().toISOString(),
    };

    try {
      await saveAccommodation(completeAcc);
      setAccommodations((prev) => {
        const idx = prev.findIndex((a) => a.id === completeAcc.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = completeAcc;
          return next;
        }
        return [completeAcc, ...prev];
      });
      setIsAccModalOpen(false);
      setEditingAcc(null);
      notify(
        'success',
        publishedState
          ? `Alojamiento «${completeAcc.name}» guardado y publicado en SURARIO.`
          : `Alojamiento «${completeAcc.name}» guardado como borrador privado.`
      );
    } catch (err: any) {
      console.error(err);
      notify('error', 'Error al guardar el alojamiento en Firestore.');
    }
  };

  const handleRequestPublishAcc = (acc: Accommodation) => {
    setConfirmModalConfig({
      isOpen: true,
      type: 'publish',
      title: `¿Publicar «${acc.name}» en SURARIO?`,
      itemName: acc.name,
      onConfirm: async () => {
        try {
          await toggleAccommodationPublished(acc.id, true);
          setAccommodations((prev) =>
            prev.map((a) =>
              a.id === acc.id
                ? { ...a, published: true, updatedAt: new Date().toISOString() }
                : a
            )
          );
          setConfirmModalConfig(null);
          notify(
            'success',
            `«${acc.name}» publicado con éxito en SURARIO. Ahora es visible para los visitantes.`
          );
        } catch {
          notify('error', 'No se pudo publicar la ficha en Firestore.');
        }
      },
    });
  };

  const handleRequestUnpublishAcc = (acc: Accommodation) => {
    setConfirmModalConfig({
      isOpen: true,
      type: 'unpublish',
      title: `¿Despublicar «${acc.name}»?`,
      itemName: acc.name,
      onConfirm: async () => {
        try {
          await toggleAccommodationPublished(acc.id, false);
          setAccommodations((prev) =>
            prev.map((a) =>
              a.id === acc.id
                ? { ...a, published: false, updatedAt: new Date().toISOString() }
                : a
            )
          );
          setConfirmModalConfig(null);
          notify(
            'success',
            `«${acc.name}» retirado de la web pública. Conservado en el panel como Borrador.`
          );
        } catch {
          notify('error', 'No se pudo despublicar el alojamiento en Firestore.');
        }
      },
    });
  };

  const handleRequestDeleteAcc = (acc: Accommodation) => {
    setConfirmModalConfig({
      isOpen: true,
      type: 'delete',
      title: `¿Eliminar definitivamente «${acc.name}»?`,
      itemName: acc.name,
      onConfirm: async () => {
        try {
          await deleteAccommodation(acc.id);
          setAccommodations((prev) => prev.filter((a) => a.id !== acc.id));
          setConfirmModalConfig(null);
          notify('success', `Alojamiento «${acc.name}» eliminado definitivamente de Firestore.`);
        } catch {
          notify('error', 'Error al eliminar el alojamiento de Firestore.');
        }
      },
    });
  };

  // =========================================================================
  // ACTIONS: EXPERIENCIAS Y TOURS (CRUD, PUBLISH, UNPUBLISH, DELETE)
  // =========================================================================

  const handleSaveActivity = async (
    e: React.FormEvent,
    forcePublished?: boolean
  ) => {
    e.preventDefault();
    if (!editingAct || (!editingAct.title && !editingAct.name) || !editingAct.destinationId) {
      notify('error', 'Por favor completa el nombre y el destino de la experiencia.');
      return;
    }

    const matchedDest = DESTINATIONS.find((d) => d.id === editingAct.destinationId);
    const titleVal = (editingAct.title || editingAct.name || '').trim();
    const publishedState = forcePublished !== undefined ? forcePublished : Boolean(editingAct.published);

    const completeAct: Activity = {
      id: editingAct.id || `act-${Date.now()}`,
      title: titleVal,
      name: titleVal,
      titleEn: editingAct.titleEn || titleVal,
      nameEn: editingAct.titleEn || titleVal,
      destinationId: editingAct.destinationId,
      destinationName: matchedDest ? matchedDest.name : editingAct.destinationName || '',
      country: matchedDest ? matchedDest.country : editingAct.country || 'Argentina',
      zone: matchedDest ? matchedDest.zone : editingAct.zone || 'argentina-norte',
      category: editingAct.category || 'trekking',
      categoryLabel: editingAct.categoryLabel || 'Excursión Guiada',
      duration: editingAct.duration || 'Medio día',
      durationEn: editingAct.durationEn || 'Half day',
      difficulty: editingAct.difficulty || 'Moderada',
      bestSeason: editingAct.bestSeason || 'Todo el año',
      indicativePrice:
        editingAct.indicativePrice || `${editingAct.currency || 'USD'} ${editingAct.price || 75}`,
      price: Number(editingAct.price) || 75,
      currency: editingAct.currency || 'USD',
      image:
        editingAct.image ||
        'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
      shortDescription: editingAct.shortDescription || '',
      description: editingAct.shortDescription || '',
      descriptionEn: editingAct.descriptionEn || '',
      fullDescription: editingAct.fullDescription || '',
      fullDescriptionEn: editingAct.fullDescriptionEn || '',
      included: Array.isArray(editingAct.included)
        ? editingAct.included
        : String(editingAct.included || '')
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
      includedEn: Array.isArray(editingAct.includedEn)
        ? editingAct.includedEn
        : String(editingAct.includedEn || '')
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
      whatToBring: Array.isArray(editingAct.whatToBring)
        ? editingAct.whatToBring
        : String(editingAct.whatToBring || '')
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
      operatorName: editingAct.operatorName || 'Operador Local Verificado',
      officialUrl: editingAct.officialUrl || '',
      affiliateUrl: editingAct.affiliateUrl || '',
      published: publishedState,
      demoNote: editingAct.demoNote || '',
      updatedAt: new Date().toISOString(),
    };

    try {
      await saveActivity(completeAct);
      setActivities((prev) => {
        const idx = prev.findIndex((a) => a.id === completeAct.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = completeAct;
          return next;
        }
        return [completeAct, ...prev];
      });
      setIsActModalOpen(false);
      setEditingAct(null);
      notify(
        'success',
        publishedState
          ? `Experiencia «${completeAct.title}» guardada y publicada en SURARIO.`
          : `Experiencia «${completeAct.title}» guardada como borrador privado.`
      );
    } catch (err) {
      console.error(err);
      notify('error', 'Error al guardar la experiencia en Firestore.');
    }
  };

  const handleRequestPublishAct = (act: Activity) => {
    setConfirmModalConfig({
      isOpen: true,
      type: 'publish',
      title: `¿Publicar «${act.title || act.name}» en SURARIO?`,
      itemName: act.title || act.name || '',
      onConfirm: async () => {
        try {
          await toggleActivityPublished(act.id, true);
          setActivities((prev) =>
            prev.map((a) =>
              a.id === act.id
                ? { ...a, published: true, updatedAt: new Date().toISOString() }
                : a
            )
          );
          setConfirmModalConfig(null);
          notify(
            'success',
            `«${act.title || act.name}» publicado con éxito en SURARIO.`
          );
        } catch {
          notify('error', 'No se pudo publicar la experiencia en Firestore.');
        }
      },
    });
  };

  const handleRequestUnpublishAct = (act: Activity) => {
    setConfirmModalConfig({
      isOpen: true,
      type: 'unpublish',
      title: `¿Despublicar «${act.title || act.name}»?`,
      itemName: act.title || act.name || '',
      onConfirm: async () => {
        try {
          await toggleActivityPublished(act.id, false);
          setActivities((prev) =>
            prev.map((a) =>
              a.id === act.id
                ? { ...a, published: false, updatedAt: new Date().toISOString() }
                : a
            )
          );
          setConfirmModalConfig(null);
          notify(
            'success',
            `«${act.title || act.name}» retirado de la web pública. Conservado como Borrador.`
          );
        } catch {
          notify('error', 'No se pudo despublicar la experiencia en Firestore.');
        }
      },
    });
  };

  const handleRequestDeleteAct = (act: Activity) => {
    setConfirmModalConfig({
      isOpen: true,
      type: 'delete',
      title: `¿Eliminar definitivamente «${act.title || act.name}»?`,
      itemName: act.title || act.name || '',
      onConfirm: async () => {
        try {
          await deleteActivity(act.id);
          setActivities((prev) => prev.filter((a) => a.id !== act.id));
          setConfirmModalConfig(null);
          notify('success', `Experiencia «${act.title || act.name}» eliminada de Firestore.`);
        } catch {
          notify('error', 'Error al eliminar la experiencia.');
        }
      },
    });
  };

  // =========================================================================
  // ACTIONS: SEMBRADO CONTROLADO Y MIGRACIÓN
  // =========================================================================

  const handleExecuteSeed = async () => {
    setIsSeeding(true);
    try {
      const res = await seedInitialDataToFirestore();
      setSeedDetails(res);
      await loadDashboardData();
      notify(
        'success',
        `Importación completada: ${res.totalCreated} creados como borrador (${res.accommodationsCreated} alojamientos, ${res.activitiesCreated} experiencias) y ${res.totalSkipped} omitidos.`
      );
    } catch (err: any) {
      notify('error', err.message || 'Error durante la importación inicial.');
    } finally {
      setIsSeeding(false);
    }
  };

  const handleMigrateLocalApps = async () => {
    try {
      const res = await migrateLocalApplicationsToFirestore();
      await loadDashboardData();
      notify(
        'success',
        `Migración completada: ${res.migrated} de ${res.total} solicitudes subidas a la nube.`
      );
    } catch (err: any) {
      notify('error', err.message || 'Error al migrar solicitudes locales.');
    }
  };

  // =========================================================================
  // CALCULATED METRICS & COUNTERS
  // =========================================================================

  const pendingAppsCount = applications.filter((a) => !a.status || a.status === 'pending').length;

  const accPubCount = accommodations.filter((a) => a.published === true).length;
  const accDraftCount = accommodations.filter((a) => a.published !== true).length;

  const actPubCount = activities.filter((a) => a.published === true).length;
  const actDraftCount = activities.filter((a) => a.published !== true).length;

  // Filtered lists
  const filteredAccommodations = accommodations.filter((acc) => {
    if (accFilter === 'published' && acc.published !== true) return false;
    if (accFilter === 'draft' && acc.published === true) return false;
    if (accSearch.trim()) {
      const q = accSearch.toLowerCase();
      const matchName = acc.name.toLowerCase().includes(q) || (acc.nameEn && acc.nameEn.toLowerCase().includes(q));
      const matchDest = (acc.destinationName || '').toLowerCase().includes(q);
      if (!matchName && !matchDest) return false;
    }
    return true;
  });

  const filteredActivities = activities.filter((act) => {
    if (actFilter === 'published' && act.published !== true) return false;
    if (actFilter === 'draft' && act.published === true) return false;
    if (actSearch.trim()) {
      const q = actSearch.toLowerCase();
      const title = act.title || act.name || '';
      const matchName = title.toLowerCase().includes(q) || (act.titleEn && act.titleEn.toLowerCase().includes(q));
      const matchDest = (act.destinationName || '').toLowerCase().includes(q);
      if (!matchName && !matchDest) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#111613] text-stone-100 flex flex-col font-sans selection:bg-amber-500 selection:text-stone-950">
      
      {/* Top Admin Header */}
      <header className="border-b border-stone-800 bg-[#161D18] sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 font-serif text-lg flex items-center justify-center font-bold">
            S
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif tracking-wider font-semibold text-stone-100 text-sm">SURARIO</span>
              <span className="text-[10px] uppercase font-mono tracking-widest bg-amber-900/40 text-amber-300 border border-amber-700/50 px-2 py-0.5 rounded-full font-bold">
                Admin Panel
              </span>
            </div>
            <p className="text-[11px] text-stone-400 font-mono">
              Sesión activa: <span className="text-stone-200 font-medium">{DESIGNATED_ADMIN_EMAIL}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onBackToPublic}
            className="px-3.5 py-1.5 rounded-xl border border-stone-700 bg-stone-800/80 hover:bg-stone-700 text-stone-200 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>🌐</span> Ver Web Pública
          </button>
          <button
            onClick={async () => {
              await logoutAdmin();
              onBackToPublic();
            }}
            className="px-3.5 py-1.5 rounded-xl border border-red-900/50 bg-red-950/30 hover:bg-red-900/50 text-red-300 text-xs font-medium transition-colors cursor-pointer"
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      {/* Action Notification Banner */}
      {actionNotice && (
        <div
          className={`px-4 sm:px-8 py-2.5 text-xs font-medium flex items-center justify-between transition-all ${
            actionNotice.type === 'success'
              ? 'bg-emerald-950/90 border-b border-emerald-800 text-emerald-200'
              : 'bg-red-950/90 border-b border-red-800 text-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <span>{actionNotice.type === 'success' ? '✓' : '✕'}</span>
            <span>{actionNotice.message}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-stone-400 hover:text-stone-200 text-xs">
            ✕
          </button>
        </div>
      )}

      {/* Main Nav Tabs */}
      <nav className="bg-[#141A15] border-b border-stone-800 px-4 sm:px-8 overflow-x-auto">
        <div className="flex items-center gap-1 sm:gap-2 min-w-max py-2">
          <button
            onClick={() => setActiveTab('resumen')}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'resumen'
                ? 'bg-stone-800 text-amber-400 border border-stone-700 shadow-sm'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/50'
            }`}
          >
            <span>📊</span> Resumen General
          </button>

          <button
            onClick={() => setActiveTab('solicitudes')}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'solicitudes'
                ? 'bg-stone-800 text-amber-400 border border-stone-700 shadow-sm'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/50'
            }`}
          >
            <span>📬</span> Solicitudes
            {pendingAppsCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 text-[10px] font-bold flex items-center justify-center">
                {pendingAppsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('alojamientos')}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'alojamientos'
                ? 'bg-stone-800 text-amber-400 border border-stone-700 shadow-sm'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/50'
            }`}
          >
            <span>🏡</span> Alojamientos
            <span className="px-1.5 py-0.5 rounded-md bg-stone-800 text-stone-400 text-[10px] font-mono">
              {accommodations.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('experiencias')}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'experiencias'
                ? 'bg-stone-800 text-amber-400 border border-stone-700 shadow-sm'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/50'
            }`}
          >
            <span>🧭</span> Tours & Experiencias
            <span className="px-1.5 py-0.5 rounded-md bg-stone-800 text-stone-400 text-[10px] font-mono">
              {activities.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('configuracion')}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'configuracion'
                ? 'bg-stone-800 text-amber-400 border border-stone-700 shadow-sm'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/50'
            }`}
          >
            <span>⚙️</span> Sembrado & Base de Datos
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
        {isLoading ? (
          <div className="py-24 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-stone-400 font-mono tracking-wider uppercase">
              Cargando datos de Firestore...
            </p>
          </div>
        ) : (
          <>
            {/* =========================================================
             * TAB 1: RESUMEN GENERAL
             * ========================================================= */}
            {activeTab === 'resumen' && (
              <div className="space-y-8">
                
                {/* Seed Prompt Banner if Firestore is not seeded */}
                {accommodations.length === 0 && (
                  <div className="p-6 rounded-3xl bg-amber-950/40 border border-amber-600/50 flex flex-wrap items-center justify-between gap-4 shadow-xl">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
                        Inicialización de Catálogo Editorial
                      </span>
                      <h3 className="font-serif text-lg font-bold text-amber-200">
                        Los 21 registros editoriales están listos para importarse a Firestore
                      </h3>
                      <p className="text-xs text-amber-200/80 leading-relaxed max-w-2xl">
                        Importa los 11 alojamientos y 10 experiencias con sus identificadores fijos y traducciones completas. Se importarán inicialmente como <strong>Borradores (published: false)</strong> para que puedas revisarlos y publicarlos manualmente uno a uno.
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={isSeeding}
                      onClick={handleExecuteSeed}
                      className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-all shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSeeding ? (
                        <>
                          <div className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                          <span>Importando a Firestore...</span>
                        </>
                      ) : (
                        <>
                          <span>🌱</span> Importar los 21 Registros como Borradores
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* KPI Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  
                  {/* Solicitudes */}
                  <div
                    onClick={() => setActiveTab('solicitudes')}
                    className="p-5 rounded-2xl bg-[#161D18] border border-stone-800 hover:border-amber-500/40 transition-all cursor-pointer space-y-2 shadow-md group"
                  >
                    <span className="text-xs text-stone-400 font-medium">Solicitudes Pendientes</span>
                    <div className="flex items-baseline justify-between">
                      <span className="text-3xl font-serif font-bold text-stone-100 group-hover:text-amber-400 transition-colors">
                        {pendingAppsCount}
                      </span>
                      <span className="text-[11px] font-mono text-stone-500">
                        {applications.length} totales
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 pt-1">
                      {pendingAppsCount === 0 ? 'Al día: sin pendientes' : 'Requieren revisión editorial'}
                    </p>
                  </div>

                  {/* Alojamientos */}
                  <div
                    onClick={() => setActiveTab('alojamientos')}
                    className="p-5 rounded-2xl bg-[#161D18] border border-stone-800 hover:border-amber-500/40 transition-all cursor-pointer space-y-2 shadow-md group"
                  >
                    <span className="text-xs text-stone-400 font-medium">Alojamientos</span>
                    <div className="flex items-baseline justify-between">
                      <span className="text-3xl font-serif font-bold text-stone-100 group-hover:text-amber-400 transition-colors">
                        {accommodations.length}
                      </span>
                      <div className="flex items-center gap-1.5 text-[11px] font-mono">
                        <span className="text-emerald-400 font-semibold">{accPubCount} pub.</span>
                        <span className="text-stone-600">·</span>
                        <span className="text-amber-400">{accDraftCount} borrador</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-stone-500 pt-1">
                      En 11 destinos de la Patagonia
                    </p>
                  </div>

                  {/* Experiencias */}
                  <div
                    onClick={() => setActiveTab('experiencias')}
                    className="p-5 rounded-2xl bg-[#161D18] border border-stone-800 hover:border-amber-500/40 transition-all cursor-pointer space-y-2 shadow-md group"
                  >
                    <span className="text-xs text-stone-400 font-medium">Tours y Experiencias</span>
                    <div className="flex items-baseline justify-between">
                      <span className="text-3xl font-serif font-bold text-stone-100 group-hover:text-amber-400 transition-colors">
                        {activities.length}
                      </span>
                      <div className="flex items-center gap-1.5 text-[11px] font-mono">
                        <span className="text-emerald-400 font-semibold">{actPubCount} pub.</span>
                        <span className="text-stone-600">·</span>
                        <span className="text-amber-400">{actDraftCount} borrador</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-stone-500 pt-1">
                      Trekking, glaciares, kayak y fauna
                    </p>
                  </div>

                  {/* Estado de Seguridad */}
                  <div
                    onClick={() => setActiveTab('configuracion')}
                    className="p-5 rounded-2xl bg-[#161D18] border border-stone-800 hover:border-amber-500/40 transition-all cursor-pointer space-y-2 shadow-md group"
                  >
                    <span className="text-xs text-stone-400 font-medium">Reglas de Seguridad</span>
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm font-mono text-emerald-400 font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        Activas en Prod
                      </span>
                      <span className="text-[10px] font-mono uppercase text-stone-500">
                        Spark 0€
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 pt-1">
                      RBAC verificado con email_verified
                    </p>
                  </div>

                </div>

                {/* Quick Action Bar */}
                <div className="p-6 rounded-2xl bg-[#161D18] border border-stone-800 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="font-serif text-base text-stone-100 font-medium">Acciones Rápidas de Publicación</h3>
                    <p className="text-xs text-stone-400">
                      Crea fichas nuevas, previsualiza borradores antes de publicarlos o gestiona solicitudes recibidas.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => {
                        setEditingAcc({
                          id: `acc-${Date.now()}`,
                          name: '',
                          destinationId: 'bariloche',
                          type: 'hotel',
                          pricePerNight: 120,
                          currency: 'USD',
                          published: false, // Borrador por defecto
                          amenities: ['Wifi', 'Calefacción'],
                        });
                        setIsAccModalOpen(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-medium text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Nuevo Alojamiento</span>
                    </button>
                    <button
                      onClick={() => {
                        setEditingAct({
                          id: `act-${Date.now()}`,
                          title: '',
                          destinationId: 'bariloche',
                          category: 'trekking',
                          difficulty: 'Moderada',
                          price: 80,
                          currency: 'USD',
                          published: false, // Borrador por defecto
                          duration: 'Día completo',
                        });
                        setIsActModalOpen(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 border border-amber-500/30 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Nueva Experiencia</span>
                    </button>
                  </div>
                </div>

                {/* Recent Provider Applications Preview */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-serif text-lg font-medium text-stone-100">
                      Solicitudes Recientes de Colaboradores
                    </h3>
                    <button
                      onClick={() => setActiveTab('solicitudes')}
                      className="text-xs text-amber-400 hover:underline"
                    >
                      Ver todas ({applications.length}) →
                    </button>
                  </div>

                  {applications.length === 0 ? (
                    <div className="p-8 rounded-2xl bg-[#161D18] border border-stone-800/80 text-center">
                      <p className="text-xs text-stone-400">No hay solicitudes en este momento.</p>
                      <p className="text-[11px] text-stone-500 mt-1">
                        Las solicitudes enviadas a través del formulario público de colaboradores aparecerán aquí.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {applications.slice(0, 4).map((app) => (
                        <div
                          key={app.id}
                          className="p-5 rounded-2xl bg-[#161D18] border border-stone-800 hover:border-stone-700 transition-all space-y-3"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="font-serif font-semibold text-stone-100 text-sm">{app.businessName}</h4>
                              <p className="text-xs text-stone-400">
                                {app.destination} · <span className="uppercase text-[11px] text-amber-400 font-mono">{app.businessType}</span>
                              </p>
                            </div>
                            <span
                              className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full ${
                                app.status === 'approved'
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                  : app.status === 'rejected'
                                  ? 'bg-red-950 text-red-300 border border-red-800'
                                  : 'bg-amber-950 text-amber-300 border border-amber-800'
                              }`}
                            >
                              {app.status || 'pendiente'}
                            </span>
                          </div>

                          <p className="text-xs text-stone-300 line-clamp-2 leading-relaxed bg-[#111613] p-2.5 rounded-xl border border-stone-800/60">
                            {app.description}
                          </p>

                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[11px] text-stone-500">
                              {app.contactPerson} ({app.email})
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleConvertAppToAccommodation(app)}
                                className="text-xs text-amber-400 hover:underline"
                              >
                                Convertir →
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* =========================================================
             * TAB 2: SOLICITUDES DE COLABORADORES
             * ========================================================= */}
            {activeTab === 'solicitudes' && (
              <div className="space-y-6">
                
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-serif font-semibold text-stone-100">
                      Bandeja de Solicitudes de Colaboradores
                    </h2>
                    <p className="text-xs text-stone-400 mt-0.5">
                      Empresas y guías locales que solicitan formar parte de la guía SURARIO.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <select
                      value={appStatusFilter}
                      onChange={(e) => setAppStatusFilter(e.target.value)}
                      className="px-3 py-1.5 rounded-xl bg-stone-800 border border-stone-700 text-stone-200 text-xs focus:outline-none"
                    >
                      <option value="all">Todas ({applications.length})</option>
                      <option value="pending">Pendientes ({applications.filter((a) => !a.status || a.status === 'pending').length})</option>
                      <option value="approved">Aprobadas ({applications.filter((a) => a.status === 'approved').length})</option>
                      <option value="rejected">Rechazadas ({applications.filter((a) => a.status === 'rejected').length})</option>
                    </select>
                  </div>
                </div>

                {applications.length === 0 ? (
                  <div className="p-12 rounded-3xl bg-[#161D18] border border-stone-800 text-center space-y-3">
                    <p className="text-sm text-stone-300">No hay solicitudes recibidas.</p>
                    <p className="text-xs text-stone-500 max-w-md mx-auto">
                      Cuando un alojamiento o guía turístico complete el formulario público de SURARIO, sus datos se registrarán automáticamente aquí.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {applications
                      .filter((app) => {
                        if (appStatusFilter === 'pending') return !app.status || app.status === 'pending';
                        if (appStatusFilter === 'approved') return app.status === 'approved';
                        if (appStatusFilter === 'rejected') return app.status === 'rejected';
                        return true;
                      })
                      .map((app) => (
                        <div
                          key={app.id}
                          className="p-5 sm:p-6 rounded-2xl bg-[#161D18] border border-stone-800 space-y-4"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-serif text-lg font-semibold text-stone-100">{app.businessName}</h3>
                                <span
                                  className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full font-bold ${
                                    app.status === 'approved'
                                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                      : app.status === 'rejected'
                                      ? 'bg-red-950 text-red-300 border border-red-800'
                                      : 'bg-amber-950 text-amber-300 border border-amber-800'
                                  }`}
                                >
                                  {app.status || 'pendiente'}
                                </span>
                              </div>
                              <p className="text-xs text-stone-400 mt-1">
                                {app.destination} · Tipo: <span className="uppercase text-amber-400 font-mono">{app.businessType}</span> · Recibido: {new Date(app.submittedAt).toLocaleDateString()}
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleUpdateAppStatus(app.id, 'approved')}
                                className="px-3 py-1 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 text-xs font-medium transition-colors cursor-pointer"
                              >
                                Aprobar
                              </button>
                              <button
                                onClick={() => handleUpdateAppStatus(app.id, 'rejected')}
                                className="px-3 py-1 rounded-lg bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 text-xs font-medium transition-colors cursor-pointer"
                              >
                                Rechazar
                              </button>
                              <button
                                onClick={() => handleDeleteApplication(app.id, app.businessName)}
                                className="px-2.5 py-1 rounded-lg hover:bg-red-900/30 text-stone-500 hover:text-red-400 text-xs transition-colors cursor-pointer"
                              >
                                Eliminar
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div className="p-3.5 rounded-xl bg-[#111613] border border-stone-800/80 space-y-1">
                              <span className="text-[10px] uppercase font-mono text-stone-500 block">Datos de Contacto (Privado)</span>
                              <p><strong className="text-stone-300">Contacto:</strong> {app.contactPerson}</p>
                              <p><strong className="text-stone-300">Email:</strong> {app.email}</p>
                              <p><strong className="text-stone-300">Teléfono:</strong> {app.phone}</p>
                              {app.website && (
                                <p>
                                  <strong className="text-stone-300">Web:</strong>{' '}
                                  <a href={app.website} target="_blank" rel="noreferrer" className="text-amber-400 underline">
                                    {app.website}
                                  </a>
                                </p>
                              )}
                            </div>

                            <div className="p-3.5 rounded-xl bg-[#111613] border border-stone-800/80 space-y-1">
                              <span className="text-[10px] uppercase font-mono text-stone-500 block">Descripción y Propuesta</span>
                              <p className="text-stone-300 line-clamp-3">{app.description}</p>
                              {app.servicesOffered && (
                                <p className="text-stone-400 pt-1">
                                  <strong className="text-stone-300">Servicios:</strong> {app.servicesOffered}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Conversion buttons */}
                          <div className="pt-2 flex flex-wrap items-center gap-3 border-t border-stone-800/60">
                            <span className="text-xs text-stone-400">Crear ficha a partir de esta solicitud:</span>
                            <button
                              onClick={() => handleConvertAppToAccommodation(app)}
                              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-medium text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                            >
                              <span>🏡</span> Convertir en Alojamiento (Borrador)
                            </button>
                            <button
                              onClick={() => handleConvertAppToActivity(app)}
                              className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 border border-amber-500/30 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5"
                            >
                              <span>🧭</span> Convertir en Tour (Borrador)
                            </button>
                          </div>

                        </div>
                      ))}
                  </div>
                )}

              </div>
            )}

            {/* =========================================================
             * TAB 3: GESTIÓN DE ALOJAMIENTOS (CRUD, PREVIEW, PUBLISH)
             * ========================================================= */}
            {activeTab === 'alojamientos' && (
              <div className="space-y-6">
                
                {/* Header & Controls */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-serif font-semibold text-stone-100 flex items-center gap-2">
                      <span>Catálogo de Alojamientos</span>
                      <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-stone-800 text-stone-300 border border-stone-700">
                        {accommodations.length} total
                      </span>
                    </h2>
                    <p className="text-xs text-stone-400 mt-0.5">
                      Gestiona borradores y publica manualmente en la web de SURARIO.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {/* Search */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={accSearch}
                        onChange={(e) => setAccSearch(e.target.value)}
                        placeholder="Buscar por nombre o destino..."
                        className="pl-8 pr-3 py-1.5 rounded-xl bg-stone-800/80 border border-stone-700 text-stone-200 text-xs focus:outline-none focus:border-amber-400 w-52 sm:w-64"
                      />
                    </div>

                    {/* Filter Tabs */}
                    <div className="inline-flex items-center bg-stone-800/90 p-1 rounded-xl border border-stone-700 text-xs font-medium">
                      <button
                        type="button"
                        onClick={() => setAccFilter('all')}
                        className={`px-3 py-1 rounded-lg transition-all ${
                          accFilter === 'all'
                            ? 'bg-amber-400 text-stone-950 font-bold shadow-sm'
                            : 'text-stone-300 hover:text-white'
                        }`}
                      >
                        Todos ({accommodations.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setAccFilter('draft')}
                        className={`px-3 py-1 rounded-lg transition-all ${
                          accFilter === 'draft'
                            ? 'bg-amber-400 text-stone-950 font-bold shadow-sm'
                            : 'text-stone-300 hover:text-white'
                        }`}
                      >
                        Borradores ({accDraftCount})
                      </button>
                      <button
                        type="button"
                        onClick={() => setAccFilter('published')}
                        className={`px-3 py-1 rounded-lg transition-all ${
                          accFilter === 'published'
                            ? 'bg-amber-400 text-stone-950 font-bold shadow-sm'
                            : 'text-stone-300 hover:text-white'
                        }`}
                      >
                        Publicados ({accPubCount})
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        setEditingAcc({
                          id: `acc-${Date.now()}`,
                          name: '',
                          destinationId: 'bariloche',
                          type: 'hotel',
                          pricePerNight: 120,
                          currency: 'USD',
                          published: false,
                          amenities: ['Wifi', 'Calefacción'],
                        });
                        setIsAccModalOpen(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-medium text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-md"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Nuevo Alojamiento</span>
                    </button>
                  </div>
                </div>

                {/* Accommodations Grid */}
                {filteredAccommodations.length === 0 ? (
                  <div className="p-12 rounded-3xl bg-[#161D18] border border-stone-800 text-center space-y-3">
                    <p className="text-sm text-stone-300">No se encontraron alojamientos con los filtros actuales.</p>
                    <p className="text-xs text-stone-500">
                      Prueba a cambiar el filtro de estado o el término de búsqueda.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredAccommodations.map((acc) => {
                      const isPub = acc.published === true;
                      const dateDisplay = acc.updatedAt || acc.createdAt;

                      return (
                        <div
                          key={acc.id}
                          className="rounded-2xl bg-[#161D18] border border-stone-800 overflow-hidden flex flex-col justify-between hover:border-stone-700 transition-all shadow-md group"
                        >
                          <div>
                            {/* Image Thumbnail */}
                            <div className="relative h-44 bg-stone-900 overflow-hidden">
                              <img
                                src={acc.image}
                                alt={acc.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80';
                                }}
                              />
                              
                              {/* Status Badge */}
                              <div className="absolute top-3 left-3 flex items-center gap-2">
                                <span
                                  className={`text-[10px] font-mono uppercase px-2.5 py-1 rounded-full font-bold shadow-lg flex items-center gap-1.5 ${
                                    isPub
                                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-600'
                                      : 'bg-amber-950 text-amber-300 border border-amber-600'
                                  }`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      isPub ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                                    }`}
                                  />
                                  {isPub ? 'Publicado' : 'Borrador'}
                                </span>

                                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-stone-900/80 text-stone-200 backdrop-blur-sm">
                                  {acc.type}
                                </span>
                              </div>

                              <div className="absolute bottom-3 right-3 bg-stone-950/85 backdrop-blur-sm text-amber-400 font-mono text-xs px-2.5 py-1 rounded-lg">
                                {acc.currency || 'USD'} {acc.pricePerNight || 120} / noche
                              </div>
                            </div>

                            {/* Info */}
                            <div className="p-4 space-y-2">
                              <h3 className="font-serif font-semibold text-stone-100 text-base leading-snug">
                                {acc.name}
                              </h3>
                              {acc.nameEn && acc.nameEn !== acc.name && (
                                <p className="text-[11px] text-stone-400 italic">
                                  EN: {acc.nameEn}
                                </p>
                              )}
                              <p className="text-xs text-stone-400 flex items-center justify-between">
                                <span>{acc.destinationName || acc.location} · {acc.country}</span>
                                {dateDisplay && (
                                  <span className="text-[10px] font-mono text-stone-500">
                                    Modif: {new Date(dateDisplay).toLocaleDateString()}
                                  </span>
                                )}
                              </p>
                              <p className="text-xs text-stone-300 line-clamp-2 leading-relaxed pt-1">
                                {acc.shortDescription || acc.longDescription}
                              </p>
                            </div>
                          </div>

                          {/* Actions Bar */}
                          <div className="p-4 pt-3 border-t border-stone-800/80 flex flex-wrap items-center justify-between gap-2 bg-[#141A15]">
                            
                            {/* Publish / Unpublish Main Button */}
                            {isPub ? (
                              <button
                                onClick={() => handleRequestUnpublishAcc(acc)}
                                className="text-xs px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 border border-stone-700 font-medium transition-colors cursor-pointer flex items-center gap-1.5"
                                title="Retirar de la web pública y conservar como borrador"
                              >
                                <EyeOff className="w-3.5 h-3.5" />
                                <span>Despublicar</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleRequestPublishAcc(acc)}
                                className="text-xs px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                                title="Hacer visible de inmediato en la web pública"
                              >
                                <Globe className="w-3.5 h-3.5" />
                                <span>Publicar en SURARIO</span>
                              </button>
                            )}

                            {/* Secondary Actions */}
                            <div className="flex items-center gap-1.5">
                              {/* Preview */}
                              <button
                                onClick={() =>
                                  setPreviewItem({
                                    type: 'accommodation',
                                    item: acc,
                                  })
                                }
                                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors cursor-pointer"
                                title="Previsualizar cómo se verá en la web pública (ES/EN)"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {/* Edit */}
                              <button
                                onClick={() => {
                                  setEditingAcc(acc);
                                  setIsAccModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg text-amber-300 hover:text-amber-200 hover:bg-stone-800 transition-colors cursor-pointer"
                                title="Editar ficha de alojamiento"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => handleRequestDeleteAcc(acc)}
                                className="p-1.5 rounded-lg text-stone-500 hover:text-red-400 hover:bg-red-950/40 transition-colors cursor-pointer"
                                title="Eliminar definitivamente"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                          </div>

                        </div>
                      );
                    })}
                  </div>
                )}

              </div>
            )}

            {/* =========================================================
             * TAB 4: GESTIÓN DE EXPERIENCIAS (CRUD, PREVIEW, PUBLISH)
             * ========================================================= */}
            {activeTab === 'experiencias' && (
              <div className="space-y-6">
                
                {/* Header & Controls */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-serif font-semibold text-stone-100 flex items-center gap-2">
                      <span>Catálogo de Experiencias y Tours</span>
                      <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-stone-800 text-stone-300 border border-stone-700">
                        {activities.length} total
                      </span>
                    </h2>
                    <p className="text-xs text-stone-400 mt-0.5">
                      Edita itinerarios, inclusiones y controla su publicación en SURARIO.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {/* Search */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={actSearch}
                        onChange={(e) => setActSearch(e.target.value)}
                        placeholder="Buscar por título o destino..."
                        className="pl-8 pr-3 py-1.5 rounded-xl bg-stone-800/80 border border-stone-700 text-stone-200 text-xs focus:outline-none focus:border-amber-400 w-52 sm:w-64"
                      />
                    </div>

                    {/* Filter Tabs */}
                    <div className="inline-flex items-center bg-stone-800/90 p-1 rounded-xl border border-stone-700 text-xs font-medium">
                      <button
                        type="button"
                        onClick={() => setActFilter('all')}
                        className={`px-3 py-1 rounded-lg transition-all ${
                          actFilter === 'all'
                            ? 'bg-amber-400 text-stone-950 font-bold shadow-sm'
                            : 'text-stone-300 hover:text-white'
                        }`}
                      >
                        Todos ({activities.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setActFilter('draft')}
                        className={`px-3 py-1 rounded-lg transition-all ${
                          actFilter === 'draft'
                            ? 'bg-amber-400 text-stone-950 font-bold shadow-sm'
                            : 'text-stone-300 hover:text-white'
                        }`}
                      >
                        Borradores ({actDraftCount})
                      </button>
                      <button
                        type="button"
                        onClick={() => setActFilter('published')}
                        className={`px-3 py-1 rounded-lg transition-all ${
                          actFilter === 'published'
                            ? 'bg-amber-400 text-stone-950 font-bold shadow-sm'
                            : 'text-stone-300 hover:text-white'
                        }`}
                      >
                        Publicados ({actPubCount})
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        setEditingAct({
                          id: `act-${Date.now()}`,
                          title: '',
                          destinationId: 'bariloche',
                          category: 'trekking',
                          difficulty: 'Moderada',
                          price: 80,
                          currency: 'USD',
                          published: false,
                          duration: 'Día completo',
                        });
                        setIsActModalOpen(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-medium text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-md"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Nueva Experiencia</span>
                    </button>
                  </div>
                </div>

                {/* Activities Grid */}
                {filteredActivities.length === 0 ? (
                  <div className="p-12 rounded-3xl bg-[#161D18] border border-stone-800 text-center space-y-3">
                    <p className="text-sm text-stone-300">No se encontraron experiencias con los filtros actuales.</p>
                    <p className="text-xs text-stone-500">
                      Prueba a cambiar el filtro de estado o el término de búsqueda.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredActivities.map((act) => {
                      const isPub = act.published === true;
                      const dateDisplay = act.updatedAt || act.createdAt;

                      return (
                        <div
                          key={act.id}
                          className="rounded-2xl bg-[#161D18] border border-stone-800 overflow-hidden flex flex-col justify-between hover:border-stone-700 transition-all shadow-md group"
                        >
                          <div>
                            {/* Image Thumbnail */}
                            <div className="relative h-44 bg-stone-900 overflow-hidden">
                              <img
                                src={act.image}
                                alt={act.title || act.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80';
                                }}
                              />
                              
                              {/* Status Badge */}
                              <div className="absolute top-3 left-3 flex items-center gap-2">
                                <span
                                  className={`text-[10px] font-mono uppercase px-2.5 py-1 rounded-full font-bold shadow-lg flex items-center gap-1.5 ${
                                    isPub
                                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-600'
                                      : 'bg-amber-950 text-amber-300 border border-amber-600'
                                  }`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      isPub ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                                    }`}
                                  />
                                  {isPub ? 'Publicado' : 'Borrador'}
                                </span>

                                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-stone-900/80 text-stone-200 backdrop-blur-sm">
                                  {act.difficulty}
                                </span>
                              </div>

                              <div className="absolute bottom-3 right-3 bg-stone-950/85 backdrop-blur-sm text-amber-400 font-mono text-xs px-2.5 py-1 rounded-lg">
                                {act.currency || 'USD'} {act.price || 75}
                              </div>
                            </div>

                            {/* Info */}
                            <div className="p-4 space-y-2">
                              <h3 className="font-serif font-semibold text-stone-100 text-base leading-snug">
                                {act.title || act.name}
                              </h3>
                              {act.titleEn && act.titleEn !== act.title && (
                                <p className="text-[11px] text-stone-400 italic">
                                  EN: {act.titleEn}
                                </p>
                              )}
                              <p className="text-xs text-stone-400 flex items-center justify-between">
                                <span>{act.destinationName} · {act.duration}</span>
                                {dateDisplay && (
                                  <span className="text-[10px] font-mono text-stone-500">
                                    Modif: {new Date(dateDisplay).toLocaleDateString()}
                                  </span>
                                )}
                              </p>
                              <p className="text-xs text-stone-300 line-clamp-2 leading-relaxed pt-1">
                                {act.shortDescription || act.fullDescription}
                              </p>
                            </div>
                          </div>

                          {/* Actions Bar */}
                          <div className="p-4 pt-3 border-t border-stone-800/80 flex flex-wrap items-center justify-between gap-2 bg-[#141A15]">
                            
                            {/* Publish / Unpublish Main Button */}
                            {isPub ? (
                              <button
                                onClick={() => handleRequestUnpublishAct(act)}
                                className="text-xs px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 border border-stone-700 font-medium transition-colors cursor-pointer flex items-center gap-1.5"
                                title="Retirar de la web pública y conservar como borrador"
                              >
                                <EyeOff className="w-3.5 h-3.5" />
                                <span>Despublicar</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleRequestPublishAct(act)}
                                className="text-xs px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                                title="Hacer visible de inmediato en la web pública"
                              >
                                <Globe className="w-3.5 h-3.5" />
                                <span>Publicar en SURARIO</span>
                              </button>
                            )}

                            {/* Secondary Actions */}
                            <div className="flex items-center gap-1.5">
                              {/* Preview */}
                              <button
                                onClick={() =>
                                  setPreviewItem({
                                    type: 'activity',
                                    item: act,
                                  })
                                }
                                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors cursor-pointer"
                                title="Previsualizar cómo se verá en la web pública (ES/EN)"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {/* Edit */}
                              <button
                                onClick={() => {
                                  setEditingAct(act);
                                  setIsActModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg text-amber-300 hover:text-amber-200 hover:bg-stone-800 transition-colors cursor-pointer"
                                title="Editar experiencia"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => handleRequestDeleteAct(act)}
                                className="p-1.5 rounded-lg text-stone-500 hover:text-red-400 hover:bg-red-950/40 transition-colors cursor-pointer"
                                title="Eliminar definitivamente"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                          </div>

                        </div>
                      );
                    })}
                  </div>
                )}

              </div>
            )}

            {/* =========================================================
             * TAB 5: SEMBRADO & BASE DE DATOS (IMPORTACIÓN Y ESTADO)
             * ========================================================= */}
            {activeTab === 'configuracion' && (
              <div className="max-w-4xl space-y-8">
                <div>
                  <h2 className="text-xl font-serif font-semibold text-stone-100">
                    Importación Editorial y Base de Datos Firestore
                  </h2>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Herramientas de sincronización controlada sin activación de servicios de pago.
                  </p>
                </div>

                {/* Status KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-5 rounded-2xl bg-[#161D18] border border-stone-800 space-y-1">
                    <span className="text-[10px] font-mono uppercase text-stone-500">Alojamientos en Firestore</span>
                    <p className="text-2xl font-serif font-bold text-stone-100">{accommodations.length}</p>
                    <p className="text-xs text-stone-400">
                      <span className="text-emerald-400 font-semibold">{accPubCount} publicados</span> · <span className="text-amber-400">{accDraftCount} borradores</span>
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#161D18] border border-stone-800 space-y-1">
                    <span className="text-[10px] font-mono uppercase text-stone-500">Experiencias en Firestore</span>
                    <p className="text-2xl font-serif font-bold text-stone-100">{activities.length}</p>
                    <p className="text-xs text-stone-400">
                      <span className="text-emerald-400 font-semibold">{actPubCount} publicadas</span> · <span className="text-amber-400">{actDraftCount} borradores</span>
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#161D18] border border-stone-800 space-y-1">
                    <span className="text-[10px] font-mono uppercase text-stone-500">Catálogo Maestro Local</span>
                    <p className="text-2xl font-serif font-bold text-amber-300">21 registros</p>
                    <p className="text-xs text-stone-400">
                      11 alojamientos + 10 experiencias fijas
                    </p>
                  </div>
                </div>

                {/* Seeding Action Box */}
                <div className="p-6 sm:p-7 rounded-3xl bg-[#161D18] border border-stone-800 space-y-5 shadow-xl">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-amber-400 font-mono text-xs uppercase tracking-wider font-bold">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      Fase 1: Importación Controlada a Firestore
                    </div>
                    <h3 className="font-serif text-lg font-bold text-stone-100">
                      Importar los 21 Registros del Catálogo Editorial
                    </h3>
                    <p className="text-xs text-stone-300 leading-relaxed max-w-2xl">
                      Carga las 11 fichas de alojamiento y las 10 actividades de <code>patagoniaData.ts</code> directamente en Cloud Firestore utilizando sus identificadores fijos (<code>acc-bariloche-1</code>, <code>act-chalten-tres</code>, etc.).
                    </p>
                    <ul className="text-xs text-stone-400 space-y-1 pt-1 list-disc list-inside">
                      <li><strong>Condición obligatoria:</strong> Todos los registros se importan inicialmente como <strong className="text-amber-300">Borrador privado (published: false)</strong>.</li>
                      <li><strong>Protección contra sobrescritura:</strong> Si un documento ya existe en Firestore, no será reemplazado.</li>
                      <li><strong>Conserva todos los campos:</strong> Nombres, traducciones ES/EN, servicios, imágenes y coordenadas.</li>
                    </ul>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      disabled={isSeeding}
                      onClick={handleExecuteSeed}
                      className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-all shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSeeding ? (
                        <>
                          <div className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                          <span>Importando a Firestore...</span>
                        </>
                      ) : (
                        <>
                          <span>🌱</span> Importar los 21 Registros a Firestore (como Borradores)
                        </>
                      )}
                    </button>
                  </div>

                  {/* Seed Result Details Box */}
                  {seedDetails && (
                    <div className="p-5 rounded-2xl bg-[#111613] border border-stone-700/80 space-y-3 animate-fade-in text-xs">
                      <div className="flex items-center gap-2 text-emerald-400 font-bold">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Informe de la Importación a Firestore:</span>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-stone-300">
                        <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800">
                          <span className="text-[10px] text-stone-500 block">Total Creados</span>
                          <span className="text-base font-bold text-emerald-400">{seedDetails.totalCreated}</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800">
                          <span className="text-[10px] text-stone-500 block">Alojamientos Creados</span>
                          <span className="text-base font-bold text-stone-100">{seedDetails.accommodationsCreated}</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800">
                          <span className="text-[10px] text-stone-500 block">Experiencias Creadas</span>
                          <span className="text-base font-bold text-stone-100">{seedDetails.activitiesCreated}</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800">
                          <span className="text-[10px] text-stone-500 block">Omitidos (Existentes)</span>
                          <span className="text-base font-bold text-amber-400">{seedDetails.totalSkipped}</span>
                        </div>
                      </div>

                      <p className="text-[11px] text-stone-400 pt-1">
                        ✓ Todos los registros nuevos se han creado con <code className="text-amber-300 font-mono">published: false</code>. Puedes ir a las pestañas «Alojamientos» y «Tours & Experiencias» para revisarlos, previsualizarlos en ES/EN y publicarlos cuando desees.
                      </p>
                    </div>
                  )}
                </div>

                {/* Cloud Status Box */}
                <div className="p-6 rounded-2xl bg-[#161D18] border border-stone-800 space-y-4">
                  <h3 className="font-serif text-sm font-semibold text-stone-200">
                    Infraestructura Activa
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                    <div className="p-3 rounded-xl bg-[#111613] border border-stone-800">
                      <span className="text-stone-500 block text-[10px] uppercase">Plan Firebase</span>
                      <span className="text-emerald-400 font-bold">Spark (100% Gratuito — 0 €)</span>
                    </div>

                    <div className="p-3 rounded-xl bg-[#111613] border border-stone-800">
                      <span className="text-stone-500 block text-[10px] uppercase">Administrador Autorizado</span>
                      <span className="text-amber-300">{DESIGNATED_ADMIN_EMAIL}</span>
                    </div>

                    <div className="p-3 rounded-xl bg-[#111613] border border-stone-800 sm:col-span-2">
                      <span className="text-stone-500 block text-[10px] uppercase">Firestore Database ID</span>
                      <span className="text-stone-300 break-all">
                        ai-studio-surariolapatagon-b54ff4ba-bb8c-49f9-a780-c8de955bca62
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            )}

          </>
        )}
      </main>

      {/* ===============================================================
       * MODAL: EDITOR DE ALOJAMIENTO
       * =============================================================== */}
      {isAccModalOpen && editingAcc && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#161D18] border border-stone-700 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 my-8 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-stone-800">
              <h3 className="font-serif text-lg font-semibold text-stone-100">
                {editingAcc.id && accommodations.some((a) => a.id === editingAcc.id)
                  ? 'Editar Alojamiento'
                  : 'Nuevo Alojamiento'}
              </h3>
              <button
                onClick={() => {
                  setIsAccModalOpen(false);
                  setEditingAcc(null);
                }}
                className="text-stone-400 hover:text-stone-200 text-xl cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={(e) => handleSaveAccommodation(e)} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-400 uppercase font-mono text-[10px] mb-1">
                    Nombre (Español) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingAcc.name || ''}
                    onChange={(e) => setEditingAcc({ ...editingAcc, name: e.target.value })}
                    placeholder="Ej. Hostería Peuma Hue"
                    className="w-full px-3 py-2 rounded-xl bg-[#111613] border border-stone-700 text-stone-100 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-stone-400 uppercase font-mono text-[10px] mb-1">
                    Nombre (Inglés)
                  </label>
                  <input
                    type="text"
                    value={editingAcc.nameEn || ''}
                    onChange={(e) => setEditingAcc({ ...editingAcc, nameEn: e.target.value })}
                    placeholder="Ej. Peuma Hue Eco-Lodge"
                    className="w-full px-3 py-2 rounded-xl bg-[#111613] border border-stone-700 text-stone-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-stone-400 uppercase font-mono text-[10px] mb-1">
                    Destino Oficial *
                  </label>
                  <select
                    value={editingAcc.destinationId || 'bariloche'}
                    onChange={(e) => {
                      const dest = DESTINATIONS.find((d) => d.id === e.target.value);
                      setEditingAcc({
                        ...editingAcc,
                        destinationId: e.target.value,
                        destinationName: dest ? dest.name : '',
                        country: dest ? dest.country : 'Argentina',
                        zone: dest ? dest.zone : 'argentina-norte',
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-[#111613] border border-stone-700 text-stone-100 focus:outline-none focus:border-amber-400"
                  >
                    {DESTINATIONS.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.country})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-stone-400 uppercase font-mono text-[10px] mb-1">
                    Tipo de Alojamiento
                  </label>
                  <select
                    value={editingAcc.type || 'hotel'}
                    onChange={(e) => setEditingAcc({ ...editingAcc, type: e.target.value as AccommodationType })}
                    className="w-full px-3 py-2 rounded-xl bg-[#111613] border border-stone-700 text-stone-100 focus:outline-none focus:border-amber-400"
                  >
                    <option value="hotel">Hotel</option>
                    <option value="hostal">Hostal</option>
                    <option value="cabana">Cabaña</option>
                    <option value="refugio">Refugio</option>
                    <option value="camping">Camping</option>
                    <option value="estancia">Estancia</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-400 uppercase font-mono text-[10px] mb-1">
                    Rango de Precio
                  </label>
                  <select
                    value={editingAcc.priceRange || 'Medio'}
                    onChange={(e) => setEditingAcc({ ...editingAcc, priceRange: e.target.value as PriceRange })}
                    className="w-full px-3 py-2 rounded-xl bg-[#111613] border border-stone-700 text-stone-100 focus:outline-none focus:border-amber-400"
                  >
                    <option value="Económico">Económico</option>
                    <option value="Medio">Medio</option>
                    <option value="Premium">Premium</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-400 uppercase font-mono text-[10px] mb-1">
                    Tarifa Base por Noche *
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      required
                      min={0}
                      value={editingAcc.pricePerNight || 120}
                      onChange={(e) => setEditingAcc({ ...editingAcc, pricePerNight: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-[#111613] border border-stone-700 text-stone-100 focus:outline-none focus:border-amber-400"
                    />
                    <select
                      value={editingAcc.currency || 'USD'}
                      onChange={(e) => setEditingAcc({ ...editingAcc, currency: e.target.value as Currency })}
                      className="px-3 py-2 rounded-xl bg-[#111613] border border-stone-700 text-stone-100 focus:outline-none"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="ARS">ARS</option>
                      <option value="CLP">CLP</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-stone-400 uppercase font-mono text-[10px] mb-1">
                    URL de Fotografía Principal
                  </label>
                  <input
                    type="url"
                    value={editingAcc.image || ''}
                    onChange={(e) => setEditingAcc({ ...editingAcc, image: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 rounded-xl bg-[#111613] border border-stone-700 text-stone-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-400 uppercase font-mono text-[10px] mb-1">
                  Descripción Corta (ES)
                </label>
                <input
                  type="text"
                  value={editingAcc.shortDescription || ''}
                  onChange={(e) => setEditingAcc({ ...editingAcc, shortDescription: e.target.value })}
                  placeholder="Resumen para tarjetas de listado..."
                  className="w-full px-3 py-2 rounded-xl bg-[#111613] border border-stone-700 text-stone-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-stone-400 uppercase font-mono text-[10px] mb-1">
                  Descripción Detallada (ES)
                </label>
                <textarea
                  rows={3}
                  value={editingAcc.longDescription || ''}
                  onChange={(e) => setEditingAcc({ ...editingAcc, longDescription: e.target.value })}
                  placeholder="Instalaciones, vistas panorámicas, entorno natural..."
                  className="w-full px-3 py-2 rounded-xl bg-[#111613] border border-stone-700 text-stone-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-400 uppercase font-mono text-[10px] mb-1">
                    Descripción Corta (EN)
                  </label>
                  <input
                    type="text"
                    value={editingAcc.shortDescriptionEn || ''}
                    onChange={(e) => setEditingAcc({ ...editingAcc, shortDescriptionEn: e.target.value })}
                    placeholder="Short summary in English..."
                    className="w-full px-3 py-2 rounded-xl bg-[#111613] border border-stone-700 text-stone-100 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-stone-400 uppercase font-mono text-[10px] mb-1">
                    Descripción Detallada (EN)
                  </label>
                  <input
                    type="text"
                    value={editingAcc.longDescriptionEn || ''}
                    onChange={(e) => setEditingAcc({ ...editingAcc, longDescriptionEn: e.target.value })}
                    placeholder="Detailed description in English..."
                    className="w-full px-3 py-2 rounded-xl bg-[#111613] border border-stone-700 text-stone-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-400 uppercase font-mono text-[10px] mb-1">
                  Servicios y Comodidades (Separados por coma)
                </label>
                <input
                  type="text"
                  value={Array.isArray(editingAcc.amenities) ? editingAcc.amenities.join(', ') : editingAcc.amenities || ''}
                  onChange={(e) => setEditingAcc({ ...editingAcc, amenities: e.target.value.split(',').map((s) => s.trim()) })}
                  placeholder="Wifi, Desayuno buffet, Calefacción por losa radiante, Estacionamiento"
                  className="w-full px-3 py-2 rounded-xl bg-[#111613] border border-stone-700 text-stone-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-400 uppercase font-mono text-[10px] mb-1">
                    Enlace Externo de Reserva / Afiliación
                  </label>
                  <input
                    type="url"
                    value={editingAcc.affiliateUrl || editingAcc.officialUrl || ''}
                    onChange={(e) => setEditingAcc({ ...editingAcc, affiliateUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-xl bg-[#111613] border border-stone-700 text-stone-100 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-stone-400 uppercase font-mono text-[10px] mb-1">
                    Proveedor o Modalidad
                  </label>
                  <input
                    type="text"
                    value={editingAcc.bookingProvider || ''}
                    onChange={(e) => setEditingAcc({ ...editingAcc, bookingProvider: e.target.value })}
                    placeholder="Ej. Directo / Booking / Afiliado"
                    className="w-full px-3 py-2 rounded-xl bg-[#111613] border border-stone-700 text-stone-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Published Toggle Notice */}
              <div className="p-3.5 rounded-xl bg-[#111613] border border-stone-800 flex items-center justify-between">
                <div>
                  <strong className="text-stone-200 block text-xs">Modo de Publicación</strong>
                  <span className="text-[11px] text-stone-500">
                    Puedes guardar la ficha como borrador privado o publicarla inmediatamente en SURARIO.
                  </span>
                </div>
                <span
                  className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full ${
                    editingAcc.published === true
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-amber-950 text-amber-300 border border-amber-800'
                  }`}
                >
                  {editingAcc.published === true ? 'Publicado' : 'Borrador'}
                </span>
              </div>

              {/* Modal Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsAccModalOpen(false);
                    setEditingAcc(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-stone-700 text-stone-300 hover:bg-stone-800 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => handleSaveAccommodation(e, false)}
                    className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 border border-stone-700 text-xs font-medium transition-colors cursor-pointer"
                  >
                    Guardar como Borrador
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleSaveAccommodation(e, true)}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-md cursor-pointer"
                  >
                    Guardar y Publicar en SURARIO
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ===============================================================
       * MODAL: EDITOR DE EXPERIENCIA / TOUR
       * =============================================================== */}
      {isActModalOpen && editingAct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#161D18] border border-stone-700 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 my-8 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-stone-800">
              <h3 className="font-serif text-lg font-semibold text-stone-100">
                {editingAct.id && activities.some((a) => a.id === editingAct.id)
                  ? 'Editar Experiencia'
                  : 'Nueva Experiencia / Tour'}
              </h3>
              <button
                onClick={() => {
                  setIsActModalOpen(false);
                  setEditingAct(null);
                }}
                className="text-stone-400 hover:text-stone-200 text-xl cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={(e) => handleSaveActivity(e)} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-400 uppercase font-mono text-[10px] mb-1">
                    Título (Español) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingAct.title || editingAct.name || ''}
                    onChange={(e) => setEditingAct({ ...editingAct, title: e.target.value, name: e.target.value })}
                    placeholder="Ej. Trekking Laguna de los Tres"
                    className="w-full px-3 py-2 rounded-xl bg-[#111613] border border-stone-700 text-stone-100 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-stone-400 uppercase font-mono text-[10px] mb-1">
                    Título (Inglés)
                  </label>
                  <input
                    type="text"
                    value={editingAct.titleEn || ''}
                    onChange={(e) => setEditingAct({ ...editingAct, titleEn: e.target.value })}
                    placeholder="Ej. Mount Fitz Roy Trek"
                    className="w-full px-3 py-2 rounded-xl bg-[#111613] border border-stone-700 text-stone-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-stone-400 uppercase font-mono text-[10px] mb-1">
                    Destino Oficial *
                  </label>
                  <select
                    value={editingAct.destinationId || 'bariloche'}
                    onChange={(e) => {
                      const dest = DESTINATIONS.find((d) => d.id === e.target.value);
                      setEditingAct({
                        ...editingAct,
                        destinationId: e.target.value,
                        destinationName: dest ? dest.name : '',
                        country: dest ? dest.country : 'Argentina',
                        zone: dest ? dest.zone : 'argentina-norte',
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-[#111613] border border-stone-700 text-stone-100 focus:outline-none focus:border-amber-400"
                  >
                    {DESTINATIONS.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.country})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-stone-400 uppercase font-mono text-[10px] mb-1">
                    Categoría
                  </label>
                  <select
                    value={editingAct.category || 'trekking'}
                    onChange={(e) => setEditingAct({ ...editingAct, category: e.target.value as ActivityCategory })}
                    className="w-full px-3 py-2 rounded-xl bg-[#111613] border border-stone-700 text-stone-100 focus:outline-none focus:border-amber-400"
                  >
                    <option value="trekking">Trekking</option>
                    <option value="glaciares">Glaciares</option>
                    <option value="navegacion">Navegación</option>
                    <option value="fauna">Fauna</option>
                    <option value="kayak">Kayak</option>
                    <option value="rutas">Rutas Escénicas</option>
                    <option value="termas">Termas</option>
                    <option value="cultura">Cultura & Estancias</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-400 uppercase font-mono text-[10px] mb-1">
                    Dificultad
                  </label>
                  <select
                    value={editingAct.difficulty || 'Moderada'}
                    onChange={(e) => setEditingAct({ ...editingAct, difficulty: e.target.value as Difficulty })}
                    className="w-full px-3 py-2 rounded-xl bg-[#111613] border border-stone-700 text-stone-100 focus:outline-none focus:border-amber-400"
                  >
                    <option value="Baja">Baja</option>
                    <option value="Moderada">Moderada</option>
                    <option value="Exigente">Exigente</option>
                    <option value="Muy Exigente">Muy Exigente</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-stone-400 uppercase font-mono text-[10px] mb-1">
                    Duración (ES)
                  </label>
                  <input
                    type="text"
                    value={editingAct.duration || ''}
                    onChange={(e) => setEditingAct({ ...editingAct, duration: e.target.value })}
                    placeholder="Ej. Día completo (8 hs)"
                    className="w-full px-3 py-2 rounded-xl bg-[#111613] border border-stone-700 text-stone-100 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-stone-400 uppercase font-mono text-[10px] mb-1">
                    Tarifa Base *
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      required
                      min={0}
                      value={editingAct.price || 85}
                      onChange={(e) => setEditingAct({ ...editingAct, price: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl bg-[#111613] border border-stone-700 text-stone-100 focus:outline-none focus:border-amber-400"
                    />
                    <select
                      value={editingAct.currency || 'USD'}
                      onChange={(e) => setEditingAct({ ...editingAct, currency: e.target.value as Currency })}
                      className="px-3 py-2 rounded-xl bg-[#111613] border border-stone-700 text-stone-100 focus:outline-none"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="ARS">ARS</option>
                      <option value="CLP">CLP</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-stone-400 uppercase font-mono text-[10px] mb-1">
                    Operador Responsable
                  </label>
                  <input
                    type="text"
                    value={editingAct.operatorName || ''}
                    onChange={(e) => setEditingAct({ ...editingAct, operatorName: e.target.value })}
                    placeholder="Nombre empresa guía"
                    className="w-full px-3 py-2 rounded-xl bg-[#111613] border border-stone-700 text-stone-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-400 uppercase font-mono text-[10px] mb-1">
                  URL de Fotografía
                </label>
                <input
                  type="url"
                  value={editingAct.image || ''}
                  onChange={(e) => setEditingAct({ ...editingAct, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-xl bg-[#111613] border border-stone-700 text-stone-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-stone-400 uppercase font-mono text-[10px] mb-1">
                  Descripción Corta (ES)
                </label>
                <input
                  type="text"
                  value={editingAct.shortDescription || ''}
                  onChange={(e) => setEditingAct({ ...editingAct, shortDescription: e.target.value })}
                  placeholder="Resumen atractivo para la guía..."
                  className="w-full px-3 py-2 rounded-xl bg-[#111613] border border-stone-700 text-stone-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-stone-400 uppercase font-mono text-[10px] mb-1">
                  Descripción Completa (ES)
                </label>
                <textarea
                  rows={3}
                  value={editingAct.fullDescription || ''}
                  onChange={(e) => setEditingAct({ ...editingAct, fullDescription: e.target.value })}
                  placeholder="Itinerario del tour, paradas, requerimientos físicos..."
                  className="w-full px-3 py-2 rounded-xl bg-[#111613] border border-stone-700 text-stone-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-400 uppercase font-mono text-[10px] mb-1">
                    Descripción Corta (EN)
                  </label>
                  <input
                    type="text"
                    value={editingAct.descriptionEn || ''}
                    onChange={(e) => setEditingAct({ ...editingAct, descriptionEn: e.target.value })}
                    placeholder="Short description in English..."
                    className="w-full px-3 py-2 rounded-xl bg-[#111613] border border-stone-700 text-stone-100 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-stone-400 uppercase font-mono text-[10px] mb-1">
                    Descripción Completa (EN)
                  </label>
                  <input
                    type="text"
                    value={editingAct.fullDescriptionEn || ''}
                    onChange={(e) => setEditingAct({ ...editingAct, fullDescriptionEn: e.target.value })}
                    placeholder="Full tour details in English..."
                    className="w-full px-3 py-2 rounded-xl bg-[#111613] border border-stone-700 text-stone-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-400 uppercase font-mono text-[10px] mb-1">
                  Servicios Incluidos (Separados por coma)
                </label>
                <input
                  type="text"
                  value={Array.isArray(editingAct.included) ? editingAct.included.join(', ') : editingAct.included || ''}
                  onChange={(e) => setEditingAct({ ...editingAct, included: e.target.value.split(',').map((s) => s.trim()) })}
                  placeholder="Guía bilingüe, Traslados desde hotel, Bastones de trekking"
                  className="w-full px-3 py-2 rounded-xl bg-[#111613] border border-stone-700 text-stone-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-stone-400 uppercase font-mono text-[10px] mb-1">
                  Enlace Externo de Reserva
                </label>
                <input
                  type="url"
                  value={editingAct.affiliateUrl || editingAct.officialUrl || ''}
                  onChange={(e) => setEditingAct({ ...editingAct, affiliateUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl bg-[#111613] border border-stone-700 text-stone-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Mode indicator */}
              <div className="p-3.5 rounded-xl bg-[#111613] border border-stone-800 flex items-center justify-between">
                <div>
                  <strong className="text-stone-200 block text-xs">Modo de Publicación</strong>
                  <span className="text-[11px] text-stone-500">
                    Guarda la ficha como borrador o hazla visible para todos los visitantes.
                  </span>
                </div>
                <span
                  className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full ${
                    editingAct.published === true
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : 'bg-amber-950 text-amber-300 border border-amber-800'
                  }`}
                >
                  {editingAct.published === true ? 'Publicado' : 'Borrador'}
                </span>
              </div>

              {/* Modal Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsActModalOpen(false);
                    setEditingAct(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-stone-700 text-stone-300 hover:bg-stone-800 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => handleSaveActivity(e, false)}
                    className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 border border-stone-700 text-xs font-medium transition-colors cursor-pointer"
                  >
                    Guardar como Borrador
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleSaveActivity(e, true)}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-md cursor-pointer"
                  >
                    Guardar y Publicar en SURARIO
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ===============================================================
       * MODAL: PREVISUALIZACIÓN EDITORIAL (ES / EN)
       * =============================================================== */}
      {previewItem && (
        <PreviewModal
          isOpen={Boolean(previewItem)}
          onClose={() => setPreviewItem(null)}
          type={previewItem.type}
          item={previewItem.item}
          onPublishClick={() => {
            if (previewItem.type === 'accommodation') {
              handleRequestPublishAcc(previewItem.item as Accommodation);
            } else {
              handleRequestPublishAct(previewItem.item as Activity);
            }
          }}
        />
      )}

      {/* ===============================================================
       * MODAL: CONFIRMACIÓN DE PUBLICACIÓN / DESPUBLICACIÓN / ELIMINACIÓN
       * =============================================================== */}
      {confirmModalConfig && (
        <PublicationConfirmModal
          isOpen={confirmModalConfig.isOpen}
          onClose={() => setConfirmModalConfig(null)}
          type={confirmModalConfig.type}
          title={confirmModalConfig.title}
          itemName={confirmModalConfig.itemName}
          onConfirm={confirmModalConfig.onConfirm}
        />
      )}

    </div>
  );
}
