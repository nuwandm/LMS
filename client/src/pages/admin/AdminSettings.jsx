import { Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminSettings() {
  return (
    <div className="p-8 bg-muted/30 min-h-full">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Settings className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Platform configuration and preferences</p>
          </div>
        </div>

        <Card>
          <CardHeader className="border-b py-4">
            <CardTitle className="text-base">Coming Soon</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">
              Platform settings will be available in a future update. This will include email configuration,
              payment settings, and general platform preferences.
            </p>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
