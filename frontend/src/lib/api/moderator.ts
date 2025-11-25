import { apiClient } from './client';

export interface UserListItem {
  id: number;
  username: string;
  email: string;
  full_name?: string;
  phone?: string;
  role_id: number;
  created_at: string;
  updated_at: string;
}

export interface UserDetails extends UserListItem {
  preferences: string[];
  sensitivities: string[];
}

const API_BASE = 'http://127.0.0.1:8000';

// Felhasználók listázása (moderátor)
export async function getAllUsers(): Promise<UserListItem[]> {
  const res = await apiClient.get(`${API_BASE}/api/v1/moderator/users`);
  return res.data;
}

// Felhasználó részletes adatai
export async function getUserDetails(userId: number): Promise<UserDetails> {
  const [userRes, prefsRes, sensRes] = await Promise.all([
    apiClient.get(`${API_BASE}/api/v1/users/${userId}`),
    apiClient.get(`${API_BASE}/api/v1/users/${userId}/preferences/`),
    apiClient.get(`${API_BASE}/api/v1/users/${userId}/sensitivities/`),
  ]);
  
  return {
    ...userRes.data,
    preferences: prefsRes.data,
    sensitivities: sensRes.data,
  };
}

// Szerepkör módosítása
export async function updateUserRole(userId: number, roleId: number): Promise<void> {
  await apiClient.patch(`${API_BASE}/api/v1/moderator/users/${userId}/role`, { role_id: roleId });
}

// Felhasználó tiltása/engedélyezése
export async function toggleUserStatus(userId: number, disabled: boolean): Promise<void> {
  await apiClient.patch(`${API_BASE}/api/v1/moderator/users/${userId}/status`, { disabled });
}

// Felhasználó törlése
export async function deleteUser(userId: number): Promise<void> {
  await apiClient.delete(`${API_BASE}/api/v1/moderator/users/${userId}`);
}
