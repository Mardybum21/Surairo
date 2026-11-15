import React, { useState } from 'react';
import {
  loginAdmin,
  initializeAdminAccount,
  sendAdminPasswordReset,
  sendAdminVerificationEmail,
  reloadAndVerifyAdmin,
  logoutAdmin,
  DESIGNATED_ADMIN_EMAIL,
} from '../../services/authService';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onBackToPublic: () => void;
}

export function AdminLogin({ onLoginSuccess, onBackToPublic }: AdminLoginProps) {
  const [email, setEmail] = useState(DESIGNATED_ADMIN_EMAIL);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<'login' | 'first-time' | 'reset' | 'verify-pending'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [verificationFeedback, setVerificationFeedback] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      if (mode === 'login') {
        const result = await loginAdmin(email, password);
        if (result.isEmailVerified) {
          onLoginSuccess();
        } else {
          setMode('verify-pending');
          setVerificationFeedback(
            `Tu contraseña es correcta, pero el correo ${DESIGNATED_ADMIN_EMAIL} aún no ha sido verificado. Revisa tu bandeja de entrada o carpeta de spam y haz clic en el enlace enviado.`
          );
        }
      } else if (mode === 'first-time') {
        await initializeAdminAccount(email, password);
        setMode('verify-pending');
        setVerificationFeedback(
          `¡Cuenta inicializada con éxito! Se ha enviado un correo de verificación a ${DESIGNATED_ADMIN_EMAIL}. Abre tu correo y haz clic en el enlace de verificación antes de acceder al panel.`
        );
      } else if (mode === 'reset') {
        await sendAdminPasswordReset(email);
        setSuccessMessage(
          `Si el correo ${email} está registrado, se habrá enviado un enlace de recuperación. Revisa tu bandeja de entrada y la carpeta de spam.`
        );
      }
    } catch (err: any) {
      console.error('[AdminLogin] Error:', err);
      let msg = err.message || 'Error en la autenticación';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        msg =
          'Credenciales no válidas. Si aún no has inicializado la cuenta en Firebase, utiliza la pestaña "Primer Acceso".';
      } else if (err.code === 'auth/email-already-in-use') {
        msg =
          'Esta cuenta ya está registrada en Firebase. Por favor introduce tu contraseña en la pestaña "Iniciar Sesión" o utiliza "Recuperar Clave" si no la recuerdas.';
        setMode('login');
      } else if (err.code === 'auth/weak-password') {
        msg = 'La contraseña debe contener al menos 8 caracteres.';
      } else if (err.code === 'auth/too-many-requests') {
        msg = 'Demasiados intentos fallidos. Por favor espera unos minutos antes de volver a intentar.';
      }
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Comprobar si el usuario ya verificó el correo pulsando el enlace
  const handleCheckVerification = async () => {
    setIsLoading(true);
    setError(null);
    setVerificationFeedback(null);
    try {
      const { isVerified } = await reloadAndVerifyAdmin();
      if (isVerified) {
        setSuccessMessage('¡Correo verificado con éxito! Concediendo acceso al panel...');
        setTimeout(() => {
          onLoginSuccess();
        }, 1000);
      } else {
        setError(
          'El correo todavía no figura como verificado en Firebase. Si acabas de pulsar el enlace, espera unos segundos y vuelve a pulsar este botón.'
        );
      }
    } catch (err: any) {
      setError(err.message || 'Error comprobando el estado de verificación.');
    } finally {
      setIsLoading(false);
    }
  };

  // Reenviar correo de verificación
  const handleResendVerification = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await sendAdminVerificationEmail();
      setVerificationFeedback(
        `Se ha reenviado un nuevo correo de verificación a ${DESIGNATED_ADMIN_EMAIL}. Comprueba tu buzón de correo.`
      );
    } catch (err: any) {
      if (err.code === 'auth/too-many-requests') {
        setError('Ya se ha enviado un correo recientemente. Por favor espera un momento antes de solicitar otro.');
      } else {
        setError(err.message || 'No se pudo reenviar el correo de verificación.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Cancelar y volver
  const handleCancelVerification = async () => {
    await logoutAdmin();
    setMode('login');
    setError(null);
    setVerificationFeedback(null);
    setSuccessMessage(null);
  };

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 flex flex-col justify-center items-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-md">
        
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={onBackToPublic}
            className="inline-flex items-center gap-2 text-stone-400 hover:text-amber-400 text-xs font-mono tracking-widest uppercase mb-4 transition-colors"
          >
            ← Volver a SURARIO Público
          </button>
          
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-600/20 border border-amber-500/30 text-amber-400 text-2xl font-serif mb-4 shadow-inner">
            S
          </div>
          <h1 className="text-2xl font-serif font-medium text-stone-100 tracking-wide">
            Panel de Administración
          </h1>
          <p className="text-xs text-stone-400 mt-1 uppercase tracking-widest font-mono">
            Acceso Privado Blindado
          </p>
        </div>

        {/* Card */}
        <div className="bg-stone-800/90 border border-stone-700/60 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-sm">
          
          {/* Tabs (Hidden in verify-pending mode) */}
          {mode !== 'verify-pending' && (
            <div className="flex border-b border-stone-700 pb-3 mb-6 gap-4 text-xs font-medium">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                  setSuccessMessage(null);
                }}
                className={`pb-2 border-b-2 transition-all ${
                  mode === 'login'
                    ? 'border-amber-400 text-amber-300 font-semibold'
                    : 'border-transparent text-stone-400 hover:text-stone-200'
                }`}
              >
                Iniciar Sesión
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('first-time');
                  setError(null);
                  setSuccessMessage(null);
                }}
                className={`pb-2 border-b-2 transition-all ${
                  mode === 'first-time'
                    ? 'border-amber-400 text-amber-300 font-semibold'
                    : 'border-transparent text-stone-400 hover:text-stone-200'
                }`}
              >
                Primer Acceso
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('reset');
                  setError(null);
                  setSuccessMessage(null);
                }}
                className={`pb-2 border-b-2 transition-all ${
                  mode === 'reset'
                    ? 'border-amber-400 text-amber-300 font-semibold'
                    : 'border-transparent text-stone-400 hover:text-stone-200'
                }`}
              >
                Recuperar Clave
              </button>
            </div>
          )}

          {/* Verification Pending Screen */}
          {mode === 'verify-pending' ? (
            <div className="space-y-5">
              <div className="text-center pb-2">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 text-2xl mb-3">
                  ✉️
                </div>
                <h2 className="text-lg font-serif font-medium text-stone-100">
                  Verificación de Correo Requerida
                </h2>
                <p className="text-xs text-stone-400 mt-1">
                  Protección anti-suplantación activa
                </p>
              </div>

              {verificationFeedback && (
                <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-200 text-xs leading-relaxed">
                  {verificationFeedback}
                </div>
              )}

              {error && (
                <div className="p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-xs flex items-start gap-2">
                  <span className="text-red-400 font-bold">✕</span>
                  <p className="flex-1 leading-relaxed">{error}</p>
                </div>
              )}

              {successMessage && (
                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-200 text-xs flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <p className="flex-1 leading-relaxed">{successMessage}</p>
                </div>
              )}

              <div className="p-3.5 rounded-xl bg-stone-900/60 border border-stone-700/60 text-stone-300 text-xs space-y-2">
                <p className="font-semibold text-stone-200">Pasos para acceder:</p>
                <ol className="list-decimal list-inside space-y-1 text-stone-400">
                  <li>Abre tu bandeja de entrada en <code className="text-amber-300 font-mono">{DESIGNATED_ADMIN_EMAIL}</code>.</li>
                  <li>Busca el correo de Firebase y pulsa en el enlace de verificación.</li>
                  <li>Vuelve aquí y pulsa el botón inferior para validar tu acceso.</li>
                </ol>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={handleCheckVerification}
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:bg-stone-700 text-stone-950 font-medium text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                      <span>Comprobando verificación...</span>
                    </>
                  ) : (
                    'Ya he verificado mi correo (Acceder)'
                  )}
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={isLoading}
                    className="flex-1 py-2 px-3 rounded-xl bg-stone-700/60 hover:bg-stone-700 text-stone-200 text-xs transition-colors cursor-pointer"
                  >
                    Reenviar correo
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelVerification}
                    disabled={isLoading}
                    className="py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 text-xs transition-colors cursor-pointer"
                  >
                    Volver
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Mode explanation */}
              {mode === 'first-time' && (
                <div className="mb-5 p-3 rounded-xl bg-amber-950/40 border border-amber-800/50 text-amber-200/90 text-xs leading-relaxed">
                  <strong>Primer acceso:</strong> Define tu contraseña inicial para <code>{DESIGNATED_ADMIN_EMAIL}</code>. Al pulsar el botón, Firebase te enviará un correo de verificación para asegurar que nadie suplante tu identidad.
                </div>
              )}

              {mode === 'reset' && (
                <div className="mb-5 p-3 rounded-xl bg-stone-700/40 border border-stone-600/50 text-stone-300 text-xs leading-relaxed">
                  Introduce el correo oficial para recibir un enlace de recuperación de contraseña de Firebase.
                </div>
              )}

              {error && (
                <div className="mb-5 p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-xs flex items-start gap-2">
                  <span className="text-red-400 font-bold">✕</span>
                  <p className="flex-1 leading-relaxed">{error}</p>
                </div>
              )}

              {successMessage && (
                <div className="mb-5 p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-200 text-xs flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <p className="flex-1 leading-relaxed">{successMessage}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-stone-300 mb-1 tracking-wider">
                    Correo Administrador
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="joansagales@gmail.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900/80 border border-stone-700 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 text-stone-100 text-sm font-sans placeholder:text-stone-600"
                  />
                  <p className="text-[11px] text-stone-500 mt-1">
                    Acceso exclusivo restringido a {DESIGNATED_ADMIN_EMAIL}
                  </p>
                </div>

                {mode !== 'reset' && (
                  <div>
                    <label className="block text-xs font-mono uppercase text-stone-300 mb-1 tracking-wider flex justify-between items-center">
                      <span>Contraseña</span>
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-[11px] text-stone-400 hover:text-stone-200 lowercase font-normal"
                      >
                        {showPassword ? 'Ocultar' : 'Mostrar'}
                      </button>
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={mode === 'first-time' ? 'Define una clave segura (min 8 car.)' : '••••••••'}
                      minLength={8}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-900/80 border border-stone-700 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 text-stone-100 text-sm font-sans placeholder:text-stone-600"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:bg-stone-700 text-stone-950 font-medium text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-stone-950 border-t-transparent rounded-full animate-spin" />
                      <span>Procesando...</span>
                    </>
                  ) : mode === 'login' ? (
                    'Acceder al Panel'
                  ) : mode === 'first-time' ? (
                    'Inicializar Clave y Enviar Verificación'
                  ) : (
                    'Enviar Enlace de Recuperación'
                  )}
                </button>
              </form>
            </>
          )}

          {/* Security footnote */}
          <div className="mt-6 pt-5 border-t border-stone-700/60 text-center">
            <p className="text-[11px] text-stone-500 flex items-center justify-center gap-1.5">
              <span>🔒</span> Cifrado Firebase Auth con verificación de identidad por correo
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
