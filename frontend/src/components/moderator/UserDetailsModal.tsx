'use client';
import { X, Mail, Phone, Calendar, Shield, Heart, AlertTriangle } from 'lucide-react';
import { UserDetails } from '@/lib/api/moderator';

interface UserDetailsModalProps {
  user: UserDetails;
  onClose: () => void;
}

export default function UserDetailsModal({ user, onClose }: UserDetailsModalProps) {
  const getRoleLabel = (roleId: number) => {
    switch (roleId) {
      case 0: return 'User';
      case 1: return 'Moderator';
      case 2: return 'Admin';
      default: return 'Unknown';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Felhasználó részletei</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Alapadatok */}
          <section>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Alapadatok
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center shrink-0">
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">{user.username}</div>
                  {user.full_name && (
                    <div className="text-sm text-gray-500 dark:text-gray-400">{user.full_name}</div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-300">{user.email}</span>
                </div>
                
                {user.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-300">{user.phone}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-300">
                    Létrehozva: {user.created_at 
                      ? new Date(user.created_at).toLocaleDateString('hu-HU', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : 'Nem elérhető'}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Shield className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-300">
                    Szerepkör: {getRoleLabel(user.role_id)}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Preferenciák */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Heart className="h-4 w-4 text-emerald-600" />
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Étkezési preferenciák
              </h3>
            </div>
            {user.preferences.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {user.preferences.map((pref) => (
                  <span
                    key={pref}
                    className="px-3 py-1 text-sm rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
                  >
                    {pref}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                Nincs megadva
              </p>
            )}
          </section>

          {/* Érzékenységek */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Ételérzékenységek
              </h3>
            </div>
            {user.sensitivities.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {user.sensitivities.map((sens) => (
                  <span
                    key={sens}
                    className="px-3 py-1 text-sm rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
                  >
                    {sens}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                Nincs megadva
              </p>
            )}
          </section>

          {/* Statisztikák */}
          <section>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Statisztikák
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {user.preferences.length}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Preferencia
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {user.sensitivities.length}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Érzékenység
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {user.created_at 
                    ? Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24))
                    : 0}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Napja tag
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition font-medium"
          >
            Bezárás
          </button>
        </div>
      </div>
    </div>
  );
}
