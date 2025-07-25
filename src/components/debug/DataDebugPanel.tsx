import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useData } from '@/contexts/DataContext';
import { Badge } from '@/components/ui/badge';

export const DataDebugPanel: React.FC = () => {
  const { users, reloadData, rawProfileData, isLoading, loadError } = useData();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Data Debug Panel
          <Button onClick={reloadData} variant="outline" size="sm">
            Force Reload
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold">Status</h4>
            <Badge variant={isLoading ? "secondary" : loadError ? "destructive" : "default"}>
              {isLoading ? "Loading" : loadError ? "Error" : "Loaded"}
            </Badge>
          </div>
          <div>
            <h4 className="font-semibold">Users Count</h4>
            <p>{users.length} transformed / {rawProfileData?.length || 0} raw</p>
          </div>
        </div>
        
        {loadError && (
          <div className="p-3 bg-destructive/10 rounded-lg">
            <h4 className="font-semibold text-destructive">Error:</h4>
            <p className="text-sm">{loadError}</p>
          </div>
        )}
        
        <div>
          <h4 className="font-semibold mb-2">Sample Users</h4>
          <div className="space-y-2">
            {users.slice(0, 3).map(user => (
              <div key={user.id} className="p-2 bg-muted rounded text-sm">
                <strong>{user.firstName} {user.lastName}</strong> - {user.businessName}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};