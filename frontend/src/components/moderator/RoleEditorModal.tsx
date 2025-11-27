'use client';
import { useState } from 'react';
import { X } from 'lucide-react';

interface RoleEditorModalProps {
  username: string;
  currentRole: number;
  currentUserRole: number;
  onConfirm: (newRole: number) => void;
  onClose: () => void;
}

export default function RoleEditorModal({
  username,
  currentRole,
  currentUserRole,
  onConfirm,
  onClose,
}: RoleEditorModalProps) {
  const [selectedRole, setSelectedRole] = useState(currentRole);

  // Szerepkörök - Admin opció csak adminok számára
  const allRoles = [
    { id: 0, name: 'User', description: 'Alap felhasználó - receptek böngészése', color: 'gray' },
    { id: 1, name: 'Moderator', description: 'Felhasználók kezelése, tartalom moderálása', color: 'blue' },
    { id: 2, name: 'Admin', description: 'Teljes rendszer hozzáférés', color: 'purple' },
  ];
  
  // Ha a felhasználó nem admin, szűrjük ki az Admin szerepkört
  const roles = currentUserRole >= 2 ? allRoles : allRoles.filter(r => r.id < 2);

  const handleConfirm = () => {
    if (selectedRole !== currentRole) {
      onConfirm(selectedRole);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Szerepkör módosítása</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Felhasználó: <span className="font-medium text-gray-900 dark:text-white">{username}</span>
            </p>
          </div>

          {/* Figyelmeztetés ha admin felhasználót próbál módosítani moderátor */}
          {currentRole >= 2 && currentUserRole < 2 && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-200">
                ⚠️ Csak admin módosíthat admin felhasználókat!
              </p>
            </div>
          )}

          <div className="space-y-3">
            {roles.map((role) => (
              <label
                key={role.id}
                className={`block p-4 border-2 rounded-lg cursor-pointer transition ${
                  selectedRole === role.id
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="role"
                    value={role.id}
                    checked={selectedRole === role.id}
                    onChange={() => setSelectedRole(role.id)}
                    className="mt-1 h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-white">{role.name}</span>
                      {role.id === currentRole && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                          Jelenlegi
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {role.description}
                    </p>
                  </div>
                </div>
              </label>
            ))}
          </div>

          {selectedRole !== currentRole && (
            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                ⚠️ A szerepkör módosítása azonnal érvénybe lép.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-800 px-6 py-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg transition font-medium"
          >
            Mégse
          </button>
          <button
            onClick={handleConfirm}
            disabled={selectedRole === currentRole}
            className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition font-medium"
          >
            Mentés
          </button>
        </div>
      </div>
    </div>
  );
}
