'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Users, AlertCircle, Loader2 } from 'lucide-react';
import UserManagementTable from '@/components/moderator/UserManagementTable';
import UserDetailsModal from '@/components/moderator/UserDetailsModal';
import RoleEditorModal from '@/components/moderator/RoleEditorModal';
import { 
  getAllUsers, 
  getUserDetails, 
  updateUserRole, 
  toggleUserStatus, 
  deleteUser,
  type UserListItem,
  type UserDetails 
} from '@/lib/api/moderator';

export default function ModeratorDashboard() {
  const router = useRouter();
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<number>(0);
  
  // Modal states
  const [selectedUserForDetails, setSelectedUserForDetails] = useState<UserDetails | null>(null);
  const [selectedUserForRole, setSelectedUserForRole] = useState<UserListItem | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Felhasználók betöltése
  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || 'Hiba a felhasználók betöltése során');
      console.error('Load users error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Ellenőrizzük, hogy van-e token és szerepkör
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('user_role');
    if (!token) {
      router.push('/');
      return;
    }
    setCurrentUserRole(role ? parseInt(role) : 0);
    loadUsers();
  }, [router]);

  // Részletek megjelenítése
  const handleViewDetails = async (user: UserListItem) => {
    try {
      setLoadingDetails(true);
      const details = await getUserDetails(user.id);
      setSelectedUserForDetails(details);
    } catch (err: any) {
      alert('Hiba a részletek betöltése során: ' + (err.message || 'Ismeretlen hiba'));
    } finally {
      setLoadingDetails(false);
    }
  };

  // Szerepkör módosítása
  const handleChangeRole = (user: UserListItem) => {
    setSelectedUserForRole(user);
  };

  const handleConfirmRoleChange = async (newRole: number) => {
    if (!selectedUserForRole) return;
    
    try {
      await updateUserRole(selectedUserForRole.id, newRole);
      alert('Szerepkör sikeresen módosítva!');
      loadUsers(); // Frissítjük a listát
    } catch (err: any) {
      alert('Hiba a szerepkör módosítása során: ' + (err.message || 'Ismeretlen hiba'));
    }
  };

  // Felhasználó tiltása/engedélyezése
  const handleToggleStatus = async (user: UserListItem) => {
    const confirmed = confirm(
      `Biztosan ${user.role_id === -1 ? 'engedélyezni' : 'tiltani'} szeretnéd a következő felhasználót: ${user.username}?`
    );
    
    if (!confirmed) return;
    
    try {
      await toggleUserStatus(user.id, user.role_id !== -1);
      alert('Felhasználó státusza módosítva!');
      loadUsers();
    } catch (err: any) {
      alert('Hiba a státusz módosítása során: ' + (err.message || 'Ismeretlen hiba'));
    }
  };

  // Felhasználó törlése
  const handleDelete = async (user: UserListItem) => {
    const confirmed = confirm(
      `Biztosan törölni szeretnéd a következő felhasználót: ${user.username}?\n\nEz a művelet visszavonhatatlan!`
    );
    
    if (!confirmed) return;
    
    const doubleConfirm = prompt(
      `A törlés megerősítéséhez írd be a felhasználónevet: ${user.username}`
    );
    
    if (doubleConfirm !== user.username) {
      alert('A felhasználónév nem egyezik. Törlés megszakítva.');
      return;
    }
    
    try {
      await deleteUser(user.id);
      alert('Felhasználó sikeresen törölve!');
      loadUsers();
    } catch (err: any) {
      alert('Hiba a törlés során: ' + (err.message || 'Ismeretlen hiba'));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Felhasználók betöltése...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-xl bg-emerald-600 flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Moderátor vezérlőpult
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Felhasználók kezelése és moderálása
              </p>
            </div>
          </div>
        </div>

        {/* Statisztikák */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Összes felhasználó</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {users.length}
                </p>
              </div>
              <Users className="h-10 w-10 text-emerald-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Moderátorok</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {users.filter(u => u.role_id === 1).length}
                </p>
              </div>
              <Shield className="h-10 w-10 text-blue-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Adminisztrátorok</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {users.filter(u => u.role_id === 2).length}
                </p>
              </div>
              <AlertCircle className="h-10 w-10 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Hibaüzenet */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-red-900 dark:text-red-200">Hiba</h3>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Felhasználók táblázat */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <UserManagementTable
            users={users}
            onViewDetails={handleViewDetails}
            onChangeRole={handleChangeRole}
            onToggleStatus={handleToggleStatus}
            onDelete={handleDelete}
          />
        </div>
      </div>

      {/* Modálok */}
      {loadingDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Részletek betöltése...</p>
          </div>
        </div>
      )}

      {selectedUserForDetails && (
        <UserDetailsModal
          user={selectedUserForDetails}
          onClose={() => setSelectedUserForDetails(null)}
        />
      )}

      {selectedUserForRole && (
        <RoleEditorModal
          username={selectedUserForRole.username}
          currentRole={selectedUserForRole.role_id}
          currentUserRole={currentUserRole}
          onConfirm={handleConfirmRoleChange}
          onClose={() => setSelectedUserForRole(null)}
        />
      )}
    </div>
  );
}
