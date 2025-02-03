import Navbar from '@/components/shared/Navbar';
import Sidebar from '@/components/shared/Sidebar';
import { RedirectToSignIn, SignedIn, SignedOut } from '@clerk/nextjs';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Admin Dashboard | LearnSphere',
  description:
    'Manage courses, users, roles, and permissions on LearnSphere. Admins can update and remove courses, oversee user accounts, and control access levels.',
  keywords:
    'admin dashboard, course management, user roles, permissions, account management, course administration, LearnSphere admin panel',
};

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <SignedIn>
        <div className="h-full">
          <div className="fixed inset-y-0 z-10 h-20 w-full md:pl-56">
            <Navbar />
          </div>

          <div className="fixed inset-y-0 z-10 hidden h-full w-56 flex-col md:flex">
            <Sidebar />
          </div>

          <main className="mt-20 h-full md:pl-56">{children}</main>
        </div>
      </SignedIn>

      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
