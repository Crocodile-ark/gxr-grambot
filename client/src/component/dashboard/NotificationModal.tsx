import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import type { NotificationData } from "@/types";

interface NotificationModalProps {
  data: NotificationData | null;
  onClose: () => void;
}

export default function NotificationModal({ data, onClose }: NotificationModalProps) {
  useEffect(() => {
    if (data) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000); // Auto close after 5 seconds

      return () => clearTimeout(timer);
    }
  }, [data, onClose]);

  if (!data) return null;

  const getIcon = () => {
    switch (data.type) {
      case 'success':
        return 'fas fa-check';
      case 'error':
        return 'fas fa-times';
      case 'info':
      default:
        return 'fas fa-info';
    }
  };

  const getColor = () => {
    switch (data.type) {
      case 'success':
        return 'text-gxr-success bg-gxr-success/20';
      case 'error':
        return 'text-red-400 bg-red-400/20';
      case 'info':
      default:
        return 'text-gxr-blue bg-gxr-blue/20';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gxr-dark-secondary rounded-xl p-6 border border-green-500/30 max-w-sm mx-4 slide-up-animation">
        <div className="text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 pulse-glow-animation ${getColor()}`}>
            <i className={`${getIcon()} text-2xl`}></i>
          </div>
          <h3 className={`text-xl font-bold mb-2 ${data.type === 'success' ? 'text-gxr-success' : data.type === 'error' ? 'text-red-400' : 'text-gxr-blue'}`}>
            {data.title}
          </h3>
          <p className="text-gxr-text-secondary mb-4">{data.message}</p>
          <Button
            onClick={onClose}
            className={`font-medium transition-all duration-200 ${
              data.type === 'success'
                ? 'bg-gxr-success hover:bg-gxr-success/80 text-white'
                : data.type === 'error'
                ? 'bg-red-500 hover:bg-red-500/80 text-white'
                : 'bg-gxr-blue hover:bg-gxr-blue/80 text-white'
            }`}
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
