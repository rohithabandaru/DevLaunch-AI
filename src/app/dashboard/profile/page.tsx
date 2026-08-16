'use client';

import React, { useState } from 'react';
import { User as UserIcon, Shield, Lock, Bell, Trash2, Check, Sparkles, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/providers/app-provider';

export default function ProfilePage() {
  const { user, updateProfile, deleteAccount } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [photo, setPhoto] = useState(user?.photo || '');
  const [website, setWebsite] = useState(user?.website || '');
  const [linkedin, setLinkedin] = useState(user?.linkedin || '');
  const [github, setGithub] = useState(user?.github || '');
  const [twitter, setTwitter] = useState(user?.twitter || '');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      bio,
      photo,
      website,
      linkedin,
      github,
      twitter,
      ...(password ? { password } : {}),
    });
    setMessage('Profile updated successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 backdrop-blur-xl space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs text-violet-300">
          <UserIcon className="h-3.5 w-3.5" /> Account Settings
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">User Profile</h1>
        <p className="text-xs text-slate-400">Manage your profile information, links, avatar, and security settings.</p>
      </div>

      {/* Main Profile Form */}
      <form onSubmit={handleSave} className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 sm:p-8 backdrop-blur-xl space-y-6">
        {/* Avatar section */}
        <div className="flex items-center gap-4 border-b border-white/10 pb-6">
          <div className="h-16 w-16 overflow-hidden rounded-2xl border border-white/20 bg-slate-900">
            {photo ? (
              <img src={photo} alt={name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xl font-bold text-violet-300">
                {name.slice(0, 2).toUpperCase() || 'US'}
              </div>
            )}
          </div>
          <div className="flex-1 space-y-1">
            <label className="text-xs font-medium text-slate-300">Avatar Image URL</label>
            <input
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white outline-none"
              placeholder="https://..."
              value={photo}
              onChange={(e) => setPhoto(e.target.value)}
            />
          </div>
        </div>

        {/* Basic Details */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs text-slate-300">Full Name</label>
            <input
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs text-white outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs text-slate-300">Email Address (Read only)</label>
            <input
              disabled
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs text-slate-400 outline-none cursor-not-allowed opacity-75"
              value={user?.email || ''}
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-slate-300">Bio</label>
          <textarea
            rows={3}
            className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white outline-none leading-relaxed"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </div>

        {/* Social Links */}
        <div className="space-y-3 border-t border-white/10 pt-6">
          <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Social Links</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs text-slate-400">GitHub</label>
              <input
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs text-white outline-none"
                value={github}
                onChange={(e) => setGithub(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-slate-400">LinkedIn</label>
              <input
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs text-white outline-none"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-slate-400">Portfolio Website</label>
              <input
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs text-white outline-none"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-slate-400">Twitter / X</label>
              <input
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs text-white outline-none"
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Security Password */}
        <div className="space-y-3 border-t border-white/10 pt-6">
          <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-2">
            <Lock className="h-3.5 w-3.5 text-violet-400" /> Password Security
          </h3>
          <div>
            <label className="text-xs text-slate-400">Update Password (Leave blank to keep current)</label>
            <input
              type="password"
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs text-white outline-none"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-4">
          <Button type="submit" className="rounded-xl bg-violet-600 px-5 text-xs font-semibold text-white hover:bg-violet-500">
            Save Changes
          </Button>

          {message && <span className="text-xs font-medium text-emerald-400 flex items-center gap-1"><Check className="h-4 w-4" /> {message}</span>}
        </div>
      </form>

      {/* Delete Account Modal Trigger */}
      <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-6 backdrop-blur-xl flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-red-300">Danger Zone</h3>
          <p className="text-xs text-slate-400 mt-0.5">Permanently remove your account, resumes, and portfolios.</p>
        </div>
        <Button
          onClick={() => {
            if (confirm('Are you sure you want to delete your account? This action is non-reversible.')) {
              deleteAccount();
            }
          }}
          className="rounded-xl border border-red-500/30 bg-red-500/20 text-xs font-semibold text-red-200 hover:bg-red-500/30"
        >
          <Trash2 className="mr-1.5 h-4 w-4" /> Delete Account
        </Button>
      </div>
    </div>
  );
}
