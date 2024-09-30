import Navbar from '@/components/shared/Navbar';
import Sidebar from '@/components/shared/Sidebar';
import { RedirectToSignIn, SignedIn, SignedOut } from '@clerk/nextjs';
import React from 'react';

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <SignedIn>
        <div className="h-full">
          <div className="fixed inset-y-0 z-50 h-20 w-full md:pl-56">
            <Navbar />
          </div>

          <div className="fixed inset-y-0 z-50 hidden h-full w-56 flex-col md:flex">
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
