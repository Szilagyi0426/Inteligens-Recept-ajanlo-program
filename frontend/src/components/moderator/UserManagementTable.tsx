'use client';
import { useState } from 'react';
import { UserListItem } from '@/lib/api/moderator';
import { Search, MoreVertical, User, Shield, Ban, Trash2 } from 'lucide-react';

interface UserManagementTableProps {
  users: UserListItem[];
  onViewDetails: (user: UserListItem) => void;
  onChangeRole: (user: UserListItem) => void;
  onToggleStatus: (user: UserListItem) => void;
  onDelete: (user: UserListItem) => void;
}

export default function UserManagementTable({
  users,
  onViewDetails,
  onChangeRole,
  onToggleStatus,
  onDelete,
}: UserManagementTableProps) {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<number | 'all'>('all');
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.username.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      (user.full_name && user.full_name.toLowerCase().includes(search.toLowerCase()));
    
    const matchesRole = roleFilter === 'all' || user.role_id === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (roleId: number) => {
    switch (roleId) {
      case 0:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">User</span>;
      case 1:
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">Moderator</span>;
      case 2:
        return <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">Admin</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">Unknown</span>;
    }
  };

  return (
    <div className="w-full">
      {/* Keresés és szűrés */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Keresés felhasználónév, email vagy név alapján..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
          className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
        >
          <option value="all">Összes szerepkör</option>
          <option value="0">User</option>
          <option value="1">Moderator</option>
          <option value="2">Admin</option>
        </select>
      </div>

      {/* Táblázat */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Felhasználó
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Szerepkör
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Létrehozva
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Műveletek
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-950 divide-y divide-gray-200 dark:divide-gray-800">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  Nincs találat
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                        <User className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{user.username}</div>
                        {user.full_name && (
                          <div className="text-sm text-gray-500">{user.full_name}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getRoleBadge(user.role_id)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(user.created_at).toLocaleDateString('hu-HU')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="relative inline-block">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === user.id ? null : user.id)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                      >
                        <MoreVertical className="h-5 w-5 text-gray-500" />
                      </button>
                      
                      {openMenuId === user.id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setOpenMenuId(null)}
                          />
                          <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 z-20">
                            <button
                              onClick={() => {
                                onViewDetails(user);
                                setOpenMenuId(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2 rounded-t-lg"
                            >
                              <User className="h-4 w-4" />
                              Részletek
                            </button>
                            <button
                              onClick={() => {
                                onChangeRole(user);
                                setOpenMenuId(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2"
                            >
                              <Shield className="h-4 w-4" />
                              Szerepkör módosítása
                            </button>
                            <button
                              onClick={() => {
                                onToggleStatus(user);
                                setOpenMenuId(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2"
                            >
                              <Ban className="h-4 w-4" />
                              Tiltás/Engedélyezés
                            </button>
                            <button
                              onClick={() => {
                                onDelete(user);
                                setOpenMenuId(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center gap-2 rounded-b-lg"
                            >
                              <Trash2 className="h-4 w-4" />
                              Törlés
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Találatok száma */}
      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        Összesen {filteredUsers.length} felhasználó {search || roleFilter !== 'all' ? `(${users.length}-ból szűrve)` : ''}
      </div>
    </div>
  );
}
