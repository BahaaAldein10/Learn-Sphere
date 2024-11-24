import { SignedIn, UserButton } from '@clerk/clerk-react';
import { SignedOut } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '../ui/button';

const HomeNavbar = () => {
  return (
    <nav className="flex-between container size-full h-16 text-purple-900 sm:h-20">
      <Link href="/" className="block w-fit">
        <div className="flex items-center gap-2">
          <Image
            src={'/assets/logo.png'}
            alt="logo"
            width={40}
            height={40}
          />
          <h6 className="text-xl font-semibold">LearnSphere</h6>
        </div>
      </Link>

      <SignedOut>
        <Button asChild>
          <Link href="/sign-in">Sign In</Link>
        </Button>
      </SignedOut>

      <SignedIn>
        <div className="size-10">
          <UserButton />
        </div>
      </SignedIn>
    </nav>
  );
};

export default HomeNavbar;
