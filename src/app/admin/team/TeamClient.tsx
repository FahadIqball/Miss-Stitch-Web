'use client';

import React, { useState } from 'react';
import { TeamMember, UserRole } from '@/types';
import {
  getTeamMembersAction,
  updateUserRoleAction,
  assignStaffByEmailAction,
} from '@/app/actions/teamActions';
import {
  Users,
  ShieldCheck,
  Scissors,
  User,
  Search,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  X,
  ChevronDown,
  RefreshCw,
  Lock,
} from 'lucide-react';

interface Props {
  initialMembers: TeamMember[];
}

export const TeamClient: React.FC<Props> = ({ initialMembers }) => {
  const [members, setMembers] = useState<TeamMember[]>(initialMembers);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Status banners
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Role change confirmation modal state
  const [confirmTarget, setConfirmTarget] = useState<{
    member: TeamMember;
    newRole: UserRole;
  } | null>(null);

  // Elevate staff by email modal state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('tailor');
  const [isSubmittingInvite, setIsSubmittingInvite] = useState(false);

  // Counts
  const totalCount = members.length;
  const adminCount = members.filter((m) => m.role === 'admin').length;
  const tailorCount = members.filter((m) => m.role === 'tailor').length;
  const customerCount = members.filter((m) => m.role === 'customer').length;

  const refreshList = async () => {
    setIsRefreshing(true);
    const updated = await getTeamMembersAction();
    setMembers(updated);
    setIsRefreshing(false);
  };

  const handleExecuteRoleChange = async () => {
    if (!confirmTarget) return;
    const { member, newRole } = confirmTarget;
    setActionLoadingId(member.id);
    setErrorMessage(null);
    setSuccessMessage(null);

    const res = await updateUserRoleAction(member.id, newRole);
    setActionLoadingId(null);
    setConfirmTarget(null);

    if (res.success) {
      setMembers((prev) =>
        prev.map((m) => (m.id === member.id ? { ...m, role: newRole } : m))
      );
      setSuccessMessage(
        `Privileges updated: ${member.fullName} is now assigned as ${
          newRole === 'admin'
            ? 'Workshop Administrator'
            : newRole === 'tailor'
            ? 'Master Tailor'
            : 'Standard Customer'
        }.`
      );
    } else {
      setErrorMessage(res.error || 'Failed to update user role.');
    }
  };

  const handleAssignStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setIsSubmittingInvite(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const res = await assignStaffByEmailAction(inviteEmail, inviteRole);
    setIsSubmittingInvite(false);

    if (res.success) {
      setShowInviteModal(false);
      setInviteEmail('');
      setSuccessMessage(res.message || 'Staff role assigned successfully.');
      await refreshList();
    } else {
      setErrorMessage(res.error || 'Failed to assign staff.');
    }
  };

  // Filtered members list
  const filteredMembers = members.filter((m) => {
    if (roleFilter !== 'all' && m.role !== roleFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      m.fullName.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      (m.phone && m.phone.includes(q))
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 bg-[#D4AF37]/10 text-[#8F741C] border border-[#D4AF37]/30 text-[10px] uppercase font-bold tracking-wider rounded">
              Access & Governance
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1F1F24]">
            Workshop Team & Roles
          </h1>
          <p className="text-xs text-[#66666E] mt-0.5">
            Manage administrative privileges, assign Master Tailors, and govern atelier access.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={refreshList}
            disabled={isRefreshing}
            className="p-2.5 bg-white border border-[#E5E2DC] rounded-lg text-xs font-semibold text-[#1F1F24] hover:bg-[#FAF8F5] transition-colors flex items-center gap-1.5 shadow-xs"
            title="Refresh team list"
          >
            <RefreshCw className={`w-4 h-4 text-[#66666E] ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => setShowInviteModal(true)}
            className="btn-rani px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm"
          >
            <UserPlus className="w-4 h-4" />
            <span>Elevate Staff Member</span>
          </button>
        </div>
      </div>

      {/* Alerts */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center gap-3 text-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="flex-1 font-semibold">{successMessage}</span>
          <button type="button" onClick={() => setSuccessMessage(null)} className="text-emerald-500 hover:text-emerald-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg flex items-center gap-3 text-xs">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span className="flex-1 font-semibold">{errorMessage}</span>
          <button type="button" onClick={() => setErrorMessage(null)} className="text-red-500 hover:text-red-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Accounts */}
        <div className="bg-white border border-[#E5E2DC] rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#66666E]">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Registered Users</span>
            <Users className="w-4 h-4 text-[#8E8E98]" />
          </div>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-[#1F1F24] mt-2">
            {totalCount}
          </p>
          <span className="text-[10px] text-[#8E8E98] mt-1 block">Active across platform</span>
        </div>

        {/* Administrators */}
        <div className="bg-white border border-[#E5E2DC] rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#66666E]">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Administrators</span>
            <ShieldCheck className="w-4 h-4 text-[#E61A6B]" />
          </div>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-[#E61A6B] mt-2">
            {adminCount}
          </p>
          <span className="text-[10px] text-[#8E8E98] mt-1 block">Full atelier governance</span>
        </div>

        {/* Master Tailors */}
        <div className="bg-white border border-[#E5E2DC] rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#66666E]">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Master Tailors</span>
            <Scissors className="w-4 h-4 text-[#0A5C36]" />
          </div>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-[#0A5C36] mt-2">
            {tailorCount}
          </p>
          <span className="text-[10px] text-[#8E8E98] mt-1 block">Silai & cutting stations</span>
        </div>

        {/* Customers */}
        <div className="bg-white border border-[#E5E2DC] rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#66666E]">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Customers</span>
            <User className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-[#1F1F24] mt-2">
            {customerCount}
          </p>
          <span className="text-[10px] text-[#8E8E98] mt-1 block">Standard buyer accounts</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#E5E2DC] rounded-xl p-4 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#8E8E98] absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#FAF8F5] border border-[#E5E2DC] rounded-lg pl-9 pr-4 py-2 text-xs text-[#1F1F24] focus:outline-none focus:border-[#D4AF37]"
          />
        </div>

        {/* Role Filter Pills */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto text-xs">
          {[
            { id: 'all', label: 'All Staff' },
            { id: 'admin', label: 'Admins' },
            { id: 'tailor', label: 'Tailors' },
            { id: 'customer', label: 'Customers' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setRoleFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors whitespace-nowrap text-xs ${
                roleFilter === tab.id
                  ? 'bg-[#1F1F24] text-white shadow-xs'
                  : 'bg-[#FAF8F5] text-[#66666E] hover:text-[#1F1F24]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-xl border border-[#E5E2DC] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] text-[#66666E] uppercase font-bold text-[10px] tracking-wider border-b border-[#E5E2DC]">
              <tr>
                <th className="py-3.5 px-4">Member</th>
                <th className="py-3.5 px-4">Role & Access</th>
                <th className="py-3.5 px-4">Contact Phone</th>
                <th className="py-3.5 px-4">Member Since</th>
                <th className="py-3.5 px-4 text-right">Assign / Change Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E2DC]">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-[#66666E]">
                    No members match your search criteria.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                    {/* Member Info */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs uppercase shadow-xs shrink-0 ${
                            member.role === 'admin'
                              ? 'bg-[#E61A6B] text-white'
                              : member.role === 'tailor'
                              ? 'bg-[#0A5C36] text-white'
                              : 'bg-[#FAF5E6] text-[#8F741C] border border-[#D4AF37]/40'
                          }`}
                        >
                          {member.fullName.slice(0, 2) || 'MS'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#1F1F24] text-xs">
                              {member.fullName}
                            </span>
                            {member.isCurrentUser && (
                              <span className="px-1.5 py-0.2 bg-[#FAF5E6] text-[#8F741C] border border-[#D4AF37]/50 text-[9px] font-bold uppercase rounded">
                                You
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-[#66666E] block font-mono">
                            {member.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Role Badge */}
                    <td className="py-3.5 px-4">
                      {member.role === 'admin' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#E61A6B]/10 text-[#E61A6B] font-bold text-[11px] border border-[#E61A6B]/20">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Administrator</span>
                        </span>
                      )}
                      {member.role === 'tailor' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#0A5C36]/10 text-[#0A5C36] font-bold text-[11px] border border-[#0A5C36]/20">
                          <Scissors className="w-3.5 h-3.5" />
                          <span>Master Tailor</span>
                        </span>
                      )}
                      {member.role === 'customer' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#FAF5E6] text-[#8F741C] font-semibold text-[11px] border border-[#D4AF37]/30">
                          <User className="w-3.5 h-3.5" />
                          <span>Customer</span>
                        </span>
                      )}
                    </td>

                    {/* Phone */}
                    <td className="py-3.5 px-4 font-mono text-[#1F1F24]">
                      {member.phone || <span className="text-[#8E8E98] italic">Unassigned</span>}
                    </td>

                    {/* Created Date */}
                    <td className="py-3.5 px-4 text-[#66666E] font-mono text-[11px]">
                      {member.createdAt}
                    </td>

                    {/* Role Change Actions */}
                    <td className="py-3.5 px-4 text-right">
                      {actionLoadingId === member.id ? (
                        <span className="text-xs text-[#8E8E98] font-medium">Updating...</span>
                      ) : member.isCurrentUser ? (
                        <span className="text-[11px] text-[#8E8E98] italic flex items-center justify-end gap-1">
                          <Lock className="w-3 h-3" />
                          <span>Self-protected</span>
                        </span>
                      ) : (
                        <div className="inline-flex items-center gap-1.5">
                          {member.role !== 'admin' && (
                            <button
                              type="button"
                              onClick={() => setConfirmTarget({ member, newRole: 'admin' })}
                              className="px-2.5 py-1 rounded bg-white hover:bg-[#FAF8F5] border border-[#E5E2DC] text-[#E61A6B] hover:border-[#E61A6B] font-semibold text-[11px] transition-colors"
                            >
                              Make Admin
                            </button>
                          )}
                          {member.role !== 'tailor' && (
                            <button
                              type="button"
                              onClick={() => setConfirmTarget({ member, newRole: 'tailor' })}
                              className="px-2.5 py-1 rounded bg-white hover:bg-[#FAF8F5] border border-[#E5E2DC] text-[#0A5C36] hover:border-[#0A5C36] font-semibold text-[11px] transition-colors"
                            >
                              Make Tailor
                            </button>
                          )}
                          {member.role !== 'customer' && (
                            <button
                              type="button"
                              onClick={() => setConfirmTarget({ member, newRole: 'customer' })}
                              className="px-2.5 py-1 rounded bg-white hover:bg-[#FAF8F5] border border-[#E5E2DC] text-[#66666E] hover:text-[#1F1F24] font-semibold text-[11px] transition-colors"
                            >
                              Revoke
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Confirmation Dialog for Role Modification */}
      {confirmTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-[#E5E2DC]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E2DC]">
              <h3 className="font-serif text-lg font-bold text-[#1F1F24] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#E61A6B]" />
                <span>Confirm Privilege Change</span>
              </h3>
              <button
                type="button"
                onClick={() => setConfirmTarget(null)}
                className="text-[#66666E] hover:text-[#1F1F24]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#66666E] leading-relaxed">
              Are you sure you want to change the privileges for{' '}
              <strong className="text-[#1F1F24]">{confirmTarget.member.fullName}</strong> (
              <span className="font-mono text-[#1F1F24]">{confirmTarget.member.email}</span>) to{' '}
              <strong className="text-[#E61A6B] uppercase font-bold">
                {confirmTarget.newRole === 'admin'
                  ? 'Administrator'
                  : confirmTarget.newRole === 'tailor'
                  ? 'Master Tailor'
                  : 'Customer'}
              </strong>
              ?
            </p>

            <div className="bg-[#FAF8F5] p-3 rounded-lg border border-[#E5E2DC] text-[11px] text-[#66666E] space-y-1">
              {confirmTarget.newRole === 'admin' && (
                <p>
                  • Grants full workshop atelier access, order verification, inventory controls, CMS visual
                  editing, and team management privileges.
                </p>
              )}
              {confirmTarget.newRole === 'tailor' && (
                <p>
                  • Grants workshop access to view orders, inspect measurement job cards, and advance the
                  5-step silai stitching progress.
                </p>
              )}
              {confirmTarget.newRole === 'customer' && (
                <p>
                  • Revokes all atelier management privileges. The user will only see standard customer shopping
                  features.
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3">
              <button
                type="button"
                onClick={() => setConfirmTarget(null)}
                className="px-4 py-2 rounded-lg border border-[#E5E2DC] text-xs font-semibold text-[#66666E] hover:text-[#1F1F24] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteRoleChange}
                className="btn-rani px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm"
              >
                Confirm Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Elevate Staff by Email */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-[#E5E2DC]">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E2DC]">
              <h3 className="font-serif text-lg font-bold text-[#1F1F24] flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#E61A6B]" />
                <span>Elevate Staff Member</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowInviteModal(false)}
                className="text-[#66666E] hover:text-[#1F1F24]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAssignStaff} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#1F1F24] mb-1">
                  Staff Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. tailor.ahmed@example.pk"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#E5E2DC] rounded-lg p-2.5 text-xs text-[#1F1F24] focus:outline-none focus:border-[#D4AF37]"
                />
                <span className="text-[10px] text-[#8E8E98] mt-1 block">
                  Must be the email they registered with or will use to sign in.
                </span>
              </div>

              <div>
                <label className="block font-bold text-[#1F1F24] mb-1">
                  Designated Workshop Role *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all flex flex-col justify-between ${
                      inviteRole === 'tailor'
                        ? 'border-[#0A5C36] bg-[#0A5C36]/5'
                        : 'border-[#E5E2DC] hover:border-[#0A5C36]'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <input
                        type="radio"
                        name="assignRole"
                        checked={inviteRole === 'tailor'}
                        onChange={() => setInviteRole('tailor')}
                        className="accent-[#0A5C36]"
                      />
                      <span className="font-bold text-xs text-[#1F1F24]">Master Tailor</span>
                    </div>
                    <span className="text-[10px] text-[#66666E]">
                      Job cards, silai pipeline, and measurements.
                    </span>
                  </label>

                  <label
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all flex flex-col justify-between ${
                      inviteRole === 'admin'
                        ? 'border-[#E61A6B] bg-[#E61A6B]/5'
                        : 'border-[#E5E2DC] hover:border-[#E61A6B]'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <input
                        type="radio"
                        name="assignRole"
                        checked={inviteRole === 'admin'}
                        onChange={() => setInviteRole('admin')}
                        className="accent-[#E61A6B]"
                      />
                      <span className="font-bold text-xs text-[#1F1F24]">Administrator</span>
                    </div>
                    <span className="text-[10px] text-[#66666E]">
                      Full governance, CMS, inventory & finance.
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E5E2DC]">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 rounded-lg border border-[#E5E2DC] text-xs font-semibold text-[#66666E] hover:text-[#1F1F24] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingInvite}
                  className="btn-rani px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-2"
                >
                  {isSubmittingInvite ? 'Assigning...' : 'Assign Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
