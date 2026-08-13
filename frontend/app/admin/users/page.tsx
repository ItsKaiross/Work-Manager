"use client";
import { useEffect, useState } from "react";
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  User,
  CreateUserData,
} from "@/lib/admin-api";
import { UsersTable } from "./UsersTable";
import { CreateUserModal } from "./CreateUserModal";

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setLoading(true);
      const data = await getAllUsers();
      setUsers(data);
      setError("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateUser(data: CreateUserData) {
    try {
      await createUser(data);
      await loadUsers();
      setShowCreateModal(false);
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function handleToggleActive(user: User) {
    try {
      await updateUser(user.id, { is_active: !user.is_active });
      await loadUsers();
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function handleToggleAdmin(user: User) {
    try {
      await updateUser(user.id, { is_admin: !user.is_admin });
      await loadUsers();
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function handleDeleteUser(userId: number) {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      await deleteUser(userId);
      await loadUsers();
    } catch (err: any) {
      alert(err.message);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-gray-600 dark:text-gray-400">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">User Management</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          + Create User
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <UsersTable
        users={users}
        onToggleActive={handleToggleActive}
        onToggleAdmin={handleToggleAdmin}
        onDelete={handleDeleteUser}
      />

      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateUser}
        />
      )}
    </div>
  );
}
