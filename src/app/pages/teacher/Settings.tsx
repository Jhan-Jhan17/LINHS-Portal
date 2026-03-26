import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api, adminApi } from '../../utils/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { toast } from 'sonner';
import { Settings as SettingsIcon, Save, School, Mail, Phone, MapPin } from 'lucide-react';

export default function Settings() {
  const { user, accessToken } = useAuth();
  const [schoolInfo, setSchoolInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [schoolInfoForm, setSchoolInfoForm] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    principal: '',
    mission: '',
    vision: '',
    description: '',
  });

  useEffect(() => {
    fetchSchoolInfo();
  }, []);

  const fetchSchoolInfo = async () => {
    try {
      const data = await api.getSchoolInfo();
      setSchoolInfo(data);
      setSchoolInfoForm({
        name: data.name || '',
        address: data.address || '',
        phone: data.phone || '',
        email: data.email || '',
        principal: data.principal || '',
        mission: data.mission || '',
        vision: data.vision || '',
        description: data.description || '',
      });
    } catch (error) {
      toast.error('Failed to load school information');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSchoolInfo = async () => {
    if (!accessToken) return;
    setSaving(true);
    try {
      await adminApi.updateSchoolInfo(schoolInfoForm, accessToken);
      toast.success('School information updated successfully');
      fetchSchoolInfo();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update school information');
    } finally {
      setSaving(false);
    }
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#d4af37]"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="p-4 md:p-8">
        <Card className="glass-card border-[#1a472a]/30">
          <CardContent className="py-12 text-center">
            <SettingsIcon className="h-12 w-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">You don't have permission to access settings</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-gray-400">Manage school information and system settings</p>
      </div>

      {/* School Information */}
      <Card className="glass-card border-[#1a472a]/30 mb-6">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <School className="h-5 w-5" />
            School Information
          </CardTitle>
          <CardDescription className="text-gray-400">
            Update basic school details and contact information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="name" className="text-gray-300">School Name</Label>
            <Input
              id="name"
              value={schoolInfoForm.name}
              onChange={(e) => setSchoolInfoForm({ ...schoolInfoForm, name: e.target.value })}
              className="bg-white/5 border-white/10 text-white"
              placeholder="Lumbang Integrated National High School"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email" className="text-gray-300 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={schoolInfoForm.email}
                onChange={(e) => setSchoolInfoForm({ ...schoolInfoForm, email: e.target.value })}
                className="bg-white/5 border-white/10 text-white"
                placeholder="info@linhs.edu.ph"
              />
            </div>
            <div>
              <Label htmlFor="phone" className="text-gray-300 flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone
              </Label>
              <Input
                id="phone"
                type="tel"
                value={schoolInfoForm.phone}
                onChange={(e) => setSchoolInfoForm({ ...schoolInfoForm, phone: e.target.value })}
                className="bg-white/5 border-white/10 text-white"
                placeholder="(123) 456-7890"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address" className="text-gray-300 flex items-center gap-2">
              
              Address
            </Label>
            <Textarea
              id="address"
              value={schoolInfoForm.address}
              onChange={(e) => setSchoolInfoForm({ ...schoolInfoForm, address: e.target.value })}
              className="bg-white/5 border-white/10 text-white"
              placeholder="School address"
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="principal" className="text-gray-300">Principal</Label>
            <Input
              id="principal"
              value={schoolInfoForm.principal}
              onChange={(e) => setSchoolInfoForm({ ...schoolInfoForm, principal: e.target.value })}
              className="bg-white/5 border-white/10 text-white"
              placeholder="Principal's name"
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-gray-300">Description</Label>
            <Textarea
              id="description"
              value={schoolInfoForm.description}
              onChange={(e) => setSchoolInfoForm({ ...schoolInfoForm, description: e.target.value })}
              className="bg-white/5 border-white/10 text-white"
              placeholder="School description"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="mission" className="text-gray-300">Mission</Label>
            <Textarea
              id="mission"
              value={schoolInfoForm.mission}
              onChange={(e) => setSchoolInfoForm({ ...schoolInfoForm, mission: e.target.value })}
              className="bg-white/5 border-white/10 text-white"
              placeholder="School mission statement"
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="vision" className="text-gray-300">Vision</Label>
            <Textarea
              id="vision"
              value={schoolInfoForm.vision}
              onChange={(e) => setSchoolInfoForm({ ...schoolInfoForm, vision: e.target.value })}
              className="bg-white/5 border-white/10 text-white"
              placeholder="School vision statement"
              rows={4}
            />
          </div>

          <Button
            onClick={handleUpdateSchoolInfo}
            disabled={saving}
            className="w-full md:w-auto bg-gradient-to-r from-[#1a472a] to-[#2d5f3f] hover:from-[#2d5f3f] hover:to-[#1a472a] text-white"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* User Info Card */}
      <Card className="glass-card border-[#1a472a]/30">
        <CardHeader>
          <CardTitle className="text-white">Account Information</CardTitle>
          <CardDescription className="text-gray-400">
            Your current account details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-gray-400">Name</Label>
            <p className="text-white mt-1">{user?.name || 'N/A'}</p>
          </div>
          <div>
            <Label className="text-gray-400">Email</Label>
            <p className="text-white mt-1">{user?.email || 'N/A'}</p>
          </div>
          <div>
            <Label className="text-gray-400">Role</Label>
            <p className="text-white mt-1 capitalize">{user?.role?.replace('_', ' ') || 'N/A'}</p>
          </div>
          {user?.section && (
            <div>
              <Label className="text-gray-400">Section</Label>
              <p className="text-white mt-1">{user.section}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
