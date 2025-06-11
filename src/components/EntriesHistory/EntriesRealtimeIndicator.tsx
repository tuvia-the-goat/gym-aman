// src/components/EntriesHistory/EntriesRealtimeIndicator.tsx

import React, { useState, useEffect } from 'react';
import { WifiIcon, WifiOffIcon } from 'lucide-react';
import { socketService } from '../../services/socket';
import { cn } from '@/lib/utils';

interface EntriesRealtimeIndicatorProps {
  className?: string;
}

const EntriesRealtimeIndicator: React.FC<EntriesRealtimeIndicatorProps> = ({ className }) => {
  const [isConnected, setIsConnected] = useState(socketService.isConnected());
  const [newEntryCount, setNewEntryCount] = useState(0);
  const [showBadge, setShowBadge] = useState(false);

  useEffect(() => {
    // Check connection status periodically
    const intervalId = setInterval(() => {
      setIsConnected(socketService.isConnected());
    }, 3000);

    // Handle new entries
    const cleanup = socketService.onNewEntry(() => {
      setNewEntryCount(prev => prev + 1);
      setShowBadge(true);

      // Hide the badge after 5 seconds
      setTimeout(() => {
        setShowBadge(false);
      }, 5000);
    });

    return () => {
      clearInterval(intervalId);
      cleanup();
    };
  }, []);

  // Reset counter on click
  const handleClick = () => {
    setNewEntryCount(0);
    setShowBadge(false);
  };

  return (
<></>
  );
};

export default EntriesRealtimeIndicator;