
import { useState } from 'react';
import { X, Smartphone, Download, Home, Share } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface InstallGuideProps {
  onClose: () => void;
}

const InstallGuide = ({ onClose }: InstallGuideProps) => {
  const [step, setStep] = useState(1);
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);

  const AndroidSteps = () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">1</div>
        <div>
          <p className="font-medium">Chrome में Menu खोलें</p>
          <p className="text-sm text-gray-600">⋮ (तीन dots) पर tap करें</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">2</div>
        <div>
          <p className="font-medium">"Add to Home screen" select करें</p>
          <p className="text-sm text-gray-600">या "Install app" option दिखेगा</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">3</div>
        <div>
          <p className="font-medium">"Add" या "Install" पर tap करें</p>
          <p className="text-sm text-gray-600">App home screen पर install हो जाएगी</p>
        </div>
      </div>
    </div>
  );

  const IOSSteps = () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">1</div>
        <div>
          <p className="font-medium">Safari में Share button दबाएं</p>
          <div className="flex items-center mt-1">
            <Share className="h-4 w-4 mr-1" />
            <p className="text-sm text-gray-600">(नीचे middle में)</p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">2</div>
        <div>
          <p className="font-medium">"Add to Home Screen" find करें</p>
          <div className="flex items-center mt-1">
            <Home className="h-4 w-4 mr-1" />
            <p className="text-sm text-gray-600">नीचे scroll करें</p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">3</div>
        <div>
          <p className="font-medium">"Add" पर tap करें</p>
          <p className="text-sm text-gray-600">App home screen पर add हो जाएगी</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <Download className="h-5 w-5 mr-2 text-blue-500" />
              App Install करें
            </CardTitle>
            <button onClick={onClose} className="p-1">
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center mb-2">
              <Smartphone className="h-5 w-5 text-yellow-600 mr-2" />
              <p className="font-medium text-yellow-800">क्यों Install करें?</p>
            </div>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• तेज़ access</li>
              <li>• Offline भी काम करेगा</li>
              <li>• Native app जैसा experience</li>
            </ul>
          </div>

          {isAndroid && <AndroidSteps />}
          {isIOS && <IOSSteps />}
          
          {!isAndroid && !isIOS && (
            <div className="text-center py-6">
              <p className="text-gray-600">Desktop browser में PWA install support limited है</p>
              <p className="text-sm text-gray-500 mt-2">Mobile browser में खोलें बेहतर experience के लिए</p>
            </div>
          )}
          
          <div className="mt-6 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 text-center">
              <strong>Note:</strong> एक बार install करने के बाद, यह आपके device पर registered हो जाएगा
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InstallGuide;
