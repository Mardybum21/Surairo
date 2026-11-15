import React from 'react';
import { AlertTriangle, Globe, EyeOff, Trash2 } from 'lucide-react';

export type ConfirmationType = 'publish' | 'unpublish' | 'delete';

interface PublicationConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: ConfirmationType;
  title: string;
  itemName: string;
  onConfirm: () => Promise<void> | void;
  isLoading?: boolean;
}

export function PublicationConfirmModal({
  isOpen,
  onClose,
  type,
  title,
  itemName,
  onConfirm,
  isLoading = false,
}: PublicationConfirmModalProps) {
  if (!isOpen) return null;

  const isPublish = type === 'publish';
  const isUnpublish = type === 'unpublish';
  const isDelete = type === 'delete';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in font-sans">
      <div className="bg-[#161D18] border border-stone-700 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl text-stone-100 space-y-5">
        
        {/* Header Icon */}
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner ${
              isPublish
                ? 'bg-emerald-950/80 border border-emerald-700/60 text-emerald-400'
                : isUnpublish
                ? 'bg-amber-950/80 border border-amber-700/60 text-amber-400'
                : 'bg-red-950/80 border border-red-700/60 text-red-400'
            }`}
          >
            {isPublish ? <Globe className="w-6 h-6" /> : isUnpublish ? <EyeOff className="w-6 h-6" /> : <Trash2 className="w-6 h-6" />}
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-stone-400 block">
              {isPublish ? 'Publicación en SURARIO' : isUnpublish ? 'Retiro de Publicación' : 'Eliminación Permanente'}
            </span>
            <h3 className="text-base font-serif font-bold text-stone-100">
              {title}
            </h3>
          </div>
        </div>

        {/* Content explanation */}
        <div className="p-4 rounded-2xl bg-[#111613] border border-stone-800 text-xs text-stone-300 space-y-2 leading-relaxed">
          <p>
            Ficha seleccionada: <strong className="text-amber-300 font-semibold">{itemName}</strong>
          </p>

          {isPublish && (
            <p className="text-stone-300">
              Al confirmar, este registro actualizará su estado a <strong className="text-emerald-400">Publicado</strong> en Firestore y pasará a ser <strong className="text-stone-100">visible de inmediato</strong> para todos los visitantes del portal público de SURARIO en los listados y mapas.
            </p>
          )}

          {isUnpublish && (
            <p className="text-stone-300">
              Al despublicar, la ficha cambiará su estado a <strong className="text-amber-400">Borrador Privado</strong> en Firestore. Dejará de ser visible para los visitantes en la web pública, pero se conservará intacta en este panel de administración para futuras modificaciones.
            </p>
          )}

          {isDelete && (
            <div className="p-2.5 rounded-xl bg-red-950/40 border border-red-900/60 text-red-200 space-y-1">
              <p className="font-semibold flex items-center gap-1.5 text-red-300">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                Segunda confirmación de seguridad requerida:
              </p>
              <p className="text-[11px] leading-relaxed">
                Esta acción eliminará definitivamente el documento de Firestore. La operación es irreversible y no se puede recuperar una vez ejecutada.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-stone-700 bg-stone-800/80 hover:bg-stone-700 text-stone-300 text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancelar
          </button>
          
          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={`px-5 py-2.5 rounded-xl text-xs font-semibold transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50 ${
              isPublish
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : isUnpublish
                ? 'bg-amber-500 hover:bg-amber-400 text-stone-950'
                : 'bg-red-600 hover:bg-red-500 text-white'
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>Procesando...</span>
              </>
            ) : isPublish ? (
              'Confirmar y Publicar en SURARIO'
            ) : isUnpublish ? (
              'Pasar a Borrador'
            ) : (
              'Sí, Eliminar Definitivamente'
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
