import React, { useState } from 'react';
import { Button } from './ui/button.tsx';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card.tsx';
import { Badge } from './ui/badge.tsx';
import { apiCall } from '../../utils/supabase/client.ts';
import { Loader2, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

export function ApiDebugger() {
  const [results, setResults] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const testEndpoint = async (endpoint: string, options: any = {}) => {
    setLoading(prev => ({ ...prev, [endpoint]: true }));
    try {
      const result = await apiCall(endpoint, options);
      setResults(prev => ({ 
        ...prev, 
        [endpoint]: { 
          success: true, 
          data: result, 
          timestamp: new Date().toISOString() 
        } 
      }));
    } catch (error: any) {
      setResults(prev => ({ 
        ...prev, 
        [endpoint]: { 
          success: false, 
          error: error.message, 
          timestamp: new Date().toISOString() 
        } 
      }));
    } finally {
      setLoading(prev => ({ ...prev, [endpoint]: false }));
    }
  };

  const endpoints = [
    { name: '/health', path: '/health', method: 'GET' },
    { name: '/test', path: '/test', method: 'GET' },
    { name: '/auth/signup (test)', path: '/auth/signup', method: 'POST', body: {
      email: 'test@example.com',
      password: 'testpassword123',
      name: 'Test User'
    }},
  ];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5" />
          API Debugger
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {endpoints.map((endpoint) => (
          <div key={endpoint.name} className="p-4 space-y-2 border rounded">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{endpoint.method}</Badge>
                <code className="text-sm">{endpoint.path}</code>
              </div>
              <Button
                size="sm"
                onClick={() => testEndpoint(endpoint.path, {
                  method: endpoint.method,
                  ...(endpoint.body && { body: JSON.stringify(endpoint.body) })
                })}
                disabled={loading[endpoint.path]}
              >
                {loading[endpoint.path] ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Test'
                )}
              </Button>
            </div>
            
            {results[endpoint.path] && (
              <div className="mt-2">
                <div className="flex items-center gap-2 mb-2">
                  {results[endpoint.path].success ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                  <Badge variant={results[endpoint.path].success ? 'default' : 'destructive'}>
                    {results[endpoint.path].success ? 'Success' : 'Failed'}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {new Date(results[endpoint.path].timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <pre className="p-2 overflow-auto text-xs bg-gray-100 rounded dark:bg-gray-800 max-h-32">
                  {JSON.stringify(
                    results[endpoint.path].success 
                      ? results[endpoint.path].data 
                      : results[endpoint.path].error, 
                    null, 
                    2
                  )}
                </pre>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}