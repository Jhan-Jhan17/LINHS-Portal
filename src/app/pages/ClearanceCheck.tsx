import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Search, CheckCircle2, XCircle, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../utils/api';

export default function ClearanceCheck() {
  const [lrn, setLrn] = useState('');
  const [loading, setLoading] = useState(false);
  const [clearanceData, setClearanceData] = useState<any>(null);

  const checkClearance = async () => {
    if (!lrn.trim()) {
      toast.error('Please enter your LRN number');
      return;
    }

    setLoading(true);
    try {
      const data = await api.checkClearance(lrn);
      
      // Mock student data for demo
      const mockStudent = {
        name: 'Juan Dela Cruz',
        lrn: lrn,
        section: 'Grade 11-A',
      };

      const liabilities = [];
      
      // Check each clearance item
      if (!data.items.library) {
        liabilities.push({
          type: 'Equipment',
          description: 'Unreturned Library Books',
          status: 'pending',
          date: new Date().toISOString(),
        });
      }
      if (!data.items.registrar) {
        liabilities.push({
          type: 'Grades',
          description: 'Incomplete Records at Registrar',
          status: 'pending',
          date: new Date().toISOString(),
        });
      }
      if (!data.items.guidance) {
        liabilities.push({
          type: 'Guidance',
          description: 'Pending Guidance Counseling Session',
          status: 'pending',
          date: new Date().toISOString(),
        });
      }
      if (!data.items.cashier) {
        liabilities.push({
          type: 'Facilities',
          description: 'Outstanding Balance at Cashier',
          status: 'pending',
          date: new Date().toISOString(),
        });
      }

      setClearanceData({
        student: mockStudent,
        isCleared: liabilities.length === 0,
        liabilities,
      });

      if (liabilities.length === 0) {
        toast.success('No pending liabilities found!');
      } else {
        toast.info(`Found ${liabilities.length} pending liability/ies`);
      }
    } catch (error) {
      console.error('Error checking clearance:', error);
      toast.error('Failed to check clearance');
    } finally {
      setLoading(false);
    }
  };

  const getLiabilityColor = (type: string) => {
    switch (type) {
      case 'Guidance':
        return 'destructive';
      case 'Facilities':
        return 'destructive';
      case 'Equipment':
        return 'destructive';
      case 'Grades':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            Student Clearance Check
          </h1>
          <p className="text-lg text-gray-300">
            Enter your LRN number to check your clearance status
          </p>
        </div>

        {/* Search Section */}
        <Card className="backdrop-blur-sm bg-white/10 border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Check Your Clearance</CardTitle>
            <CardDescription className="text-gray-300">
              Enter your 15-digit LRN number (e.g., LRN137000000000)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="LRN Number"
                value={lrn}
                onChange={(e) => setLrn(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && checkClearance()}
                className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              />
              <Button 
                onClick={checkClearance} 
                disabled={loading}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <Search className="w-4 h-4 mr-2" />
                {loading ? 'Checking...' : 'Check'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        {clearanceData && (
          <div className="space-y-6">
            {/* Student Info */}
            <Card className="backdrop-blur-sm bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Student Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Name</p>
                    <p className="text-lg font-semibold text-white">
                      {clearanceData.student.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">LRN</p>
                    <p className="text-lg font-semibold text-white">
                      {clearanceData.student.lrn}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Section</p>
                    <p className="text-lg font-semibold text-white">
                      {clearanceData.student.section}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Clearance Status */}
            <Alert 
              className={`backdrop-blur-sm ${
                clearanceData.isCleared
                  ? 'bg-green-500/20 border-green-500/50'
                  : 'bg-red-500/20 border-red-500/50'
              }`}
            >
              <div className="flex items-center gap-3">
                {clearanceData.isCleared ? (
                  <>
                    <CheckCircle2 className="w-6 h-6 text-green-400" />
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        Cleared!
                      </h3>
                      <AlertDescription className="text-gray-200">
                        No Liabilities on the Record
                      </AlertDescription>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="w-6 h-6 text-red-400" />
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        Not Cleared
                      </h3>
                      <AlertDescription className="text-gray-200">
                        You have {clearanceData.liabilities.length} pending liabilit
                        {clearanceData.liabilities.length === 1 ? 'y' : 'ies'}
                      </AlertDescription>
                    </div>
                  </>
                )}
              </div>
            </Alert>

            {/* Liabilities List */}
            {!clearanceData.isCleared && (
              <Card className="backdrop-blur-sm bg-white/10 border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Pending Liabilities
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    Please settle the following to get cleared
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {clearanceData.liabilities.map((liability: any, index: number) => (
                      <div
                        key={index}
                        className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-2"
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <Badge variant={getLiabilityColor(liability.type) as any}>
                                {liability.type}
                              </Badge>
                              <span className="text-xs text-gray-400">
                                {new Date(liability.date).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-white font-medium">
                              {liability.description}
                            </p>
                            <p className="text-sm text-gray-400">
                              Status: <span className="capitalize">{liability.status}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Instructions */}
            <Card className="backdrop-blur-sm bg-white/10 border-white/20">
              <CardHeader>
                <CardTitle className="text-white">What to do next?</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300 space-y-2">
                {clearanceData.isCleared ? (
                  <p>
                    Congratulations! You have no pending liabilities. You can proceed with
                    your clearance requirements.
                  </p>
                ) : (
                  <ul className="space-y-2 list-disc list-inside">
                    <li>For <strong>Guidance</strong> issues: Contact your adviser or the guidance counselor</li>
                    <li>For <strong>Facilities</strong> damage: See the facilities admin</li>
                    <li>For <strong>Equipment</strong> items: Return borrowed items or see the equipment admin</li>
                    <li>For <strong>Grades</strong>: Consult with your subject teacher or adviser</li>
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}