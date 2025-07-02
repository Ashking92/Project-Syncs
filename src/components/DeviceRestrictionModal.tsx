
import { Smartphone, AlertTriangle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface DeviceRestrictionModalProps {
  deviceInfo: {
    registered_at: string;
    ip_address: string;
  } | null;
  onLogout: () => void;
}

const DeviceRestrictionModal = ({ deviceInfo, onLogout }: DeviceRestrictionModalProps) => {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white">
        <CardHeader className="text-center pb-3">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-xl text-red-700">Device Access Restricted</CardTitle>
        </CardHeader>
        
        <CardContent className="text-center space-y-4">
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center justify-center mb-2">
              <Smartphone className="h-5 w-5 text-red-600 mr-2" />
              <p className="font-medium text-red-800">Security Alert</p>
            </div>
            <p className="text-sm text-red-700">
              आपका account पहले से किसी और device पर registered है।
              Security के लिए एक ID केवल एक device पर ही काम करती है।
            </p>
          </div>

          {deviceInfo && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-4 w-4 text-gray-600 mr-2" />
                <p className="font-medium text-gray-700">Registered Device Info</p>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <p>Registered: {new Date(deviceInfo.registered_at).toLocaleDateString('hi-IN')}</p>
                <p>IP: {deviceInfo.ip_address}</p>
              </div>
            </div>
          )}

          <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800">
              <strong>क्या करें?</strong><br />
              अगर यह आपका पुराना device है, तो admin से contact करें।
              नया device register करने के लिए admin approval चाहिए।
            </p>
          </div>

          <Button
            onClick={onLogout}
            className="w-full bg-red-500 hover:bg-red-600 text-white"
          >
            Logout & Go Back
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeviceRestrictionModal;
