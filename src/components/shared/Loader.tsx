import { Loader2 } from 'lucide-react';

const Loader = () => {
  return (
    <div className="flex-center h-[85vh] w-full">
      <Loader2 className="size-10 animate-spin text-purple-800" />
    </div>
  );
};

export default Loader;
