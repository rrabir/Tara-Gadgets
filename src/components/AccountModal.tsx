import React from 'react';
import { X, ShieldCheck, LogOut, CheckCircle2, User, Key, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useToast } from '../context/ToastContext.tsx';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAdmin: () => void;
  onOpenTracking: () => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  onOpenAdmin,
  onOpenTracking
}) => {
  const { currentUser, firebaseUser, loginWithGoogle, logout, isOwner, isAdmin } = useAuth();
  const toast = useToast();

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      toast.success('Signed In with Google', 'Firebase Authentication verified successfully.');
    } catch (err: any) {
      toast.error('Sign In Failed', err.message || 'Could not complete Google sign-in.');
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.info('Signed Out', 'You have been logged out of Firebase Auth.');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Firebase Account</h3>
              <p className="text-xs text-slate-500">Authentication & Cloud Identity</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card */}
        {firebaseUser ? (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              {firebaseUser.photoURL ? (
                <img
                  src={firebaseUser.photoURL}
                  alt={firebaseUser.displayName || 'User'}
                  className="w-12 h-12 rounded-full border border-slate-300 object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-bold text-base flex items-center justify-center">
                  {(firebaseUser.displayName || firebaseUser.email || 'U')[0].toUpperCase()}
                </div>
              )}
              <div className="overflow-hidden">
                <div className="text-sm font-bold text-slate-900 truncate">
                  {firebaseUser.displayName || 'Authenticated User'}
                </div>
                <div className="text-xs text-slate-500 truncate">{firebaseUser.email}</div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isOwner
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-blue-100 text-blue-800 border border-blue-200'
                    }`}
                  >
                    {isOwner ? '👑 Verified Store Owner' : 'Customer Account'}
                  </span>
                  {firebaseUser.emailVerified && (
                    <span className="text-[10px] text-emerald-600 flex items-center gap-0.5 font-semibold">
                      <CheckCircle2 className="w-3 h-3" /> Verified
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/80 text-[11px] text-slate-500 space-y-1">
              <div className="flex justify-between">
                <span>Firebase UID:</span>
                <span className="font-mono text-slate-700 truncate max-w-[180px]">{firebaseUser.uid}</span>
              </div>
              <div className="flex justify-between">
                <span>Cloud Project:</span>
                <span className="font-mono text-slate-700">gen-lang-client-0548158462</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 space-y-3">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
              <Key className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">Sign in to Tara Gadgets BD</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                Use your verified Google Account to save addresses, track orders, or access the store owner dashboard.
              </p>
            </div>
            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-2.5 px-4 rounded-xl transition-colors cursor-pointer shadow-xs"
            >
              <Globe className="w-4 h-4 text-blue-400" />
              <span>Continue with Google Account</span>
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          {isAdmin && (
            <button
              onClick={() => {
                onClose();
                onOpenAdmin();
              }}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Launch Store Admin Dashboard</span>
            </button>
          )}

          <button
            onClick={() => {
              onClose();
              onOpenTracking();
            }}
            className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs py-2.5 px-4 rounded-xl transition-colors cursor-pointer"
          >
            <span>Track My Recent Order</span>
          </button>

          {firebaseUser && (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 text-rose-600 hover:bg-rose-50 font-semibold text-xs py-2 px-4 rounded-xl transition-colors cursor-pointer border border-rose-200 mt-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out of Firebase</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
