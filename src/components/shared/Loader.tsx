import { Loader2 } from 'lucide-react';

const Loader = () => {
  return (
    <div className="flex-center size-full h-screen gap-2">
      <Loader2 className="size-10 animate-spin text-purple-800" />
      Loading...
    </div>
  );
};

export default Loader;
