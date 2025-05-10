import { useEffect } from "react";

export function Modal({
    isOpen,
    onClose,
    children,
  }: {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
  }) {

    useEffect(() => {
      console.log("Effect triggered");
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      if (isOpen) {
        document.addEventListener('keydown', handleEsc);
      }
  
      return () => {
        document.removeEventListener('keydown', handleEsc);
      };
    }, [isOpen, onClose]);

    if (!isOpen) return null;
  
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300">
        <div className="relative bg-white p-8 rounded-2xl shadow-2xl max-w-xl w-full mx-4 animate-fadeIn">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200 text-2xl"
            aria-label="Close modal"
          >
            &times;
          </button>
    
          {/* Modal Content */}
          <div className="mt-2 space-y-4">
            {children}
          </div>
        </div>
      </div>
    );
  }