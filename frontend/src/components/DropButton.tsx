
import React from 'react';
import { Button } from '@/components/ui/button';
interface DropButtonProps {
  onClick: () => void;
}

const DropButton: React.FC<DropButtonProps> = ({ onClick }) => {
  return (
    <Button 
      className="bg-purple-DEFAULT hover:bg-purple-dark text-white font-semibold px-6 py-2 rounded-lg shadow-lg transition-all"
      onClick={onClick}
    >
      Drop
    </Button>
  );
};

export default DropButton;
