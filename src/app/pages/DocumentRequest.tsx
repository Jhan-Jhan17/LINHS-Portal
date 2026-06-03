import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { FileText, Send, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../utils/api';

export default function DocumentRequest() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    lrn: '',
    studentName: '',
    email: '',
    contactNumber: '',
    documentType: '',
    purpose: '',
    notes: ''
  });

  const documentTypes = [
    'Form 137 (Permanent Record)',
    'Certificate of Good Moral Character',
    'Certificate of Enrollment',
    'Transcript of Records',
    'Honorable Dismissal',
    'Certificate of Transfer Credentials',
    'Other'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.lrn || !formData.studentName || !formData.email || !formData.documentType) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await api.createDocumentRequest({
        ...formData,
        requestDate: new Date().toISOString()
      });

      setSubmitted(true);
      toast.success('Document request submitted successfully!');
    } catch (error) {
      console.error('Error submitting request:', error);
      toast.error('Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      lrn: '',
      studentName: '',
      email: '',
      contactNumber: '',
      documentType: '',
      purpose: '',
      notes: ''
    });
    setSubmitted(false);
  };

  if (submitted) {
    return (
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="backdrop-blur-sm bg-white/10 border-white/20">
            <CardContent className="py-16 text-center space-y-6">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-12 h-12 text-green-400" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-white">Request Submitted!</h2>
                <p className="text-gray-300 text-lg">
                  Your document request has been sent to the registrar's office.
                </p>
                <p className="text-gray-400">
                  You will be contacted via email or phone once your request is processed.
                </p>
              </div>
              <Button
                onClick={resetForm}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                Submit Another Request
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto">
            <FileText className="w-8 h-8 text-purple-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            Document Request
          </h1>
          <p className="text-lg text-gray-300">
            Request official documents from the registrar's office
          </p>
        </div>

        {/* Form */}
        <Card className="backdrop-blur-sm bg-white/10 border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Request Form</CardTitle>
            <CardDescription className="text-gray-300">
              Fill in the details below to request documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Student Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Student Information</h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="lrn" className="text-gray-300">
                      LRN Number *
                    </Label>
                    <Input
                      id="lrn"
                      placeholder="LRN137000000000"
                      value={formData.lrn}
                      onChange={(e) => setFormData({ ...formData, lrn: e.target.value })}
                      required
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="studentName" className="text-gray-300">
                      Full Name *
                    </Label>
                    <Input
                      id="studentName"
                      placeholder="Juan Dela Cruz"
                      value={formData.studentName}
                      onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                      required
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-300">
                      Email Address *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="student@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactNumber" className="text-gray-300">
                      Contact Number *
                    </Label>
                    <Input
                      id="contactNumber"
                      placeholder="09123456789"
                      value={formData.contactNumber}
                      onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                      required
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    />
                  </div>
                </div>
              </div>

              {/* Document Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Document Details</h3>

                <div className="space-y-2">
                  <Label htmlFor="documentType" className="text-gray-300">
                    Document Type *
                  </Label>
                  <Select
                    value={formData.documentType}
                    onValueChange={(value) => setFormData({ ...formData, documentType: value })}
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent>
                      {documentTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purpose" className="text-gray-300">
                    Purpose *
                  </Label>
                  <Input
                    id="purpose"
                    placeholder="e.g., College application, transfer, employment"
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    required
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-gray-300">
                    Additional Notes
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Any special instructions or additional information..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={4}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <Send className="w-4 h-4 mr-2" />
                {loading ? 'Submitting...' : 'Submit Request'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Information Card */}
        <Card className="backdrop-blur-sm bg-white/10 border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Processing Information</CardTitle>
          </CardHeader>
          <CardContent className="text-gray-300 space-y-2">
            <ul className="space-y-2 list-disc list-inside">
              <li>Document requests are processed within 3-5 business days</li>
              <li>You will receive an email confirmation once your request is received</li>
              <li>The registrar's office will contact you when your documents are ready for pickup</li>
              <li>Please bring a valid ID when claiming your documents</li>
              <li>Processing fees may apply for certain documents</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}