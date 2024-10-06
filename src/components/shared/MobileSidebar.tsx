import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';

export const MobileSidebar = () => {
  return (
    <Sheet>
      <SheetTrigger className="block w-fit pr-4 transition hover:opacity-75 md:hidden">
        <Menu size={30} className="text-gray-900" />
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <Sidebar />
      </SheetContent>
    </Sheet>
  );
};
