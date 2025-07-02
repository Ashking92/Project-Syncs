
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DeviceInfo {
  id: string;
  user_agent: string;
  ip_address: string;
  registered_at: string;
}

const useDeviceRestriction = (rollNumber: string | null) => {
  const [isDeviceAllowed, setIsDeviceAllowed] = useState<boolean | null>(null);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getCurrentDeviceFingerprint = () => {
    return btoa(navigator.userAgent + screen.width + screen.height + (navigator.language || ''));
  };

  const checkDeviceRestriction = async () => {
    if (!rollNumber) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const currentFingerprint = getCurrentDeviceFingerprint();
      
      // Check if profile exists and get device info
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('device_id, ip_address, created_at')
        .eq('roll_number', rollNumber)
        .single();

      if (profileError) {
        console.error('Device check error:', profileError);
        setIsDeviceAllowed(false);
        setIsLoading(false);
        return;
      }

      // If no device registered yet, allow and register this device
      if (!profile.device_id) {
        await registerCurrentDevice(rollNumber, currentFingerprint);
        setIsDeviceAllowed(true);
        setIsLoading(false);
        return;
      }

      // Check if current device matches registered device
      if (profile.device_id === currentFingerprint) {
        setIsDeviceAllowed(true);
        setDeviceInfo({
          id: profile.device_id,
          user_agent: navigator.userAgent,
          ip_address: profile.ip_address || 'Unknown',
          registered_at: profile.created_at
        });
      } else {
        setIsDeviceAllowed(false);
        // Get registered device info for display
        setDeviceInfo({
          id: profile.device_id,
          user_agent: 'Registered Device',
          ip_address: profile.ip_address || 'Unknown',
          registered_at: profile.created_at
        });
      }
    } catch (error) {
      console.error('Device restriction check failed:', error);
      setIsDeviceAllowed(false);
    } finally {
      setIsLoading(false);
    }
  };

  const registerCurrentDevice = async (rollNumber: string, fingerprint: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          device_id: fingerprint,
          ip_address: 'web-login',
          updated_at: new Date().toISOString()
        })
        .eq('roll_number', rollNumber);

      if (error) throw error;
      
      console.log('Device registered successfully');
    } catch (error) {
      console.error('Failed to register device:', error);
    }
  };

  useEffect(() => {
    checkDeviceRestriction();
  }, [rollNumber]);

  return {
    isDeviceAllowed,
    deviceInfo,
    isLoading,
    recheckDevice: checkDeviceRestriction
  };
};

export default useDeviceRestriction;
