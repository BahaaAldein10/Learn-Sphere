'use client';

import { useConfettiStore } from '@/store/confettiStore';
import Confetti from 'react-confetti';

const ConfettiProvider = () => {
  const { isOpen, onClose } = useConfettiStore();

  if (!isOpen) return null;

  return (
    <Confetti
      className="pointer-events-none z-50"
      numberOfPieces={500}
      recycle={false}
      onConfettiComplete={onClose}
    />
  );
};

export default ConfettiProvider;
