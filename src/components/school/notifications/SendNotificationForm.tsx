'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowPathIcon, PaperAirplaneIcon, ExclamationCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function SendNotificationForm() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  // Target audience
  const [sendToAll, setSendToAll] = useState(true);
  const [sendToSpecificParent, setSendToSpecificParent] = useState(false);
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
  const [selectedParentId, setSelectedParentId] = useState<string>('');
  const [availableGrades, setAvailableGrades] = useState<Array<{
    value: string;
    label: string;
    level: string;
    order: number;
  }>>([]);
  const [availableParents, setAvailableParents] = useState<Array<{
    id: string;
    first_name: string;
    last_name: string;
    email: string | null;
    phone: string | null;
    students: Array<{
      first_name: string;
      last_name: string;
    }>;
  }>>([]);
  const [parentSearch, setParentSearch] = useState('');

  // Channel
  const [channel, setChannel] = useState<'in_app' | 'push' | 'all'>('in_app');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load available levels/grades
  useEffect(() => {
    // Load available grades from school settings
    fetch('/api/students/levels')
      .then(res => res.json())
      .then(data => {
        setAvailableGrades(data.grades || []);
      })
      .catch(err => {
        console.error('Error loading grades:', err);
      });
  }, []);

  // Load parents when searching
  useEffect(() => {
    if (parentSearch.length >= 2) {
      console.log('🔍 Searching for parents:', parentSearch);
      const timeoutId = setTimeout(() => {
        fetch(`/api/school/parents?search=${encodeURIComponent(parentSearch)}`)
          .then(res => res.json())
          .then(data => {
            console.log('📥 Parents API response:', data);
            if (data.success) {
              setAvailableParents(data.parents || []);
              console.log(`✅ Loaded ${data.parents?.length || 0} parents`);
            } else {
              console.error('❌ API returned error:', data.error);
            }
          })
          .catch(err => {
            console.error('❌ Error loading parents:', err);
          });
      }, 300); // Debounce search

      return () => clearTimeout(timeoutId);
    } else {
      setAvailableParents([]);
    }
  }, [parentSearch]);

  const insertVariable = (variable: string) => {
    setMessage(prev => prev + `{${variable}}`);
  };

  const handleSend = async () => {
    setError(null);
    setSuccess(null);

    // Validation
    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }
    if (!message.trim()) {
      setError('Please enter a message');
      return;
    }

    setLoading(true);

    try {
      let targetAudience = {};
      
      if (sendToSpecificParent && selectedParentId) {
        targetAudience = {
          parentIds: [selectedParentId]
        };
      } else if (!sendToAll) {
        targetAudience = {
          gradeLevels: selectedGrades,
        };
      }

      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          message,
          targetAudience,
          channel,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to send notification');
      }

      setSuccess(`Notification sent successfully to ${result.recipientCount} parent(s)!`);

      // Reset form after success
      setTimeout(() => {
        setTitle('');
        setMessage('');
        setSendToAll(true);
        setSendToSpecificParent(false);
        setSelectedGrades([]);
        setSelectedParentId('');
        setParentSearch('');
        setChannel('in_app');
        setSuccess(null);
      }, 3000);

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  const availableVariables = [
    { name: 'student_name', description: "Student's full name" },
    { name: 'student_first_name', description: "Student's first name" },
    { name: 'parent_name', description: "Parent's full name" },
    { name: 'parent_first_name', description: "Parent's first name" },
    { name: 'student_level', description: "Student's level (e.g., Form 1)" },
    { name: 'student_grade', description: "Student's grade level" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Form */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Compose Notification</CardTitle>
            <CardDescription>
              Send a notification to parents about their students
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Fee Payment Reminder"
                maxLength={255}
              />
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message here..."
                rows={8}
                className="resize-none"
              />
              <p className="text-sm text-gray-500">
                Use variables like {'{student_name}'} for personalization
              </p>
            </div>

            {/* Target Audience */}
            <div className="space-y-4">
              <Label>Send To</Label>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="all"
                    checked={sendToAll && !sendToSpecificParent}
                    onCheckedChange={(checked) => {
                      setSendToAll(checked as boolean);
                      if (checked) {
                        setSendToSpecificParent(false);
                        setSelectedParentId('');
                        setParentSearch('');
                      }
                    }}
                  />
                  <Label htmlFor="all" className="cursor-pointer">
                    All Students & Parents
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="specific-parent"
                    checked={sendToSpecificParent}
                    onCheckedChange={(checked) => {
                      setSendToSpecificParent(checked as boolean);
                      if (checked) {
                        setSendToAll(false);
                        setSelectedGrades([]);
                      } else {
                        setSendToAll(true);
                        setSelectedParentId('');
                        setParentSearch('');
                      }
                    }}
                  />
                  <Label htmlFor="specific-parent" className="cursor-pointer">
                    Specific Parent
                  </Label>
                </div>

                {sendToSpecificParent && (
                  <div className="ml-6 space-y-4 border-l-2 pl-4">
                    <div>
                      <Label className="text-sm">Search Parent</Label>
                      <Input
                        type="text"
                        placeholder="Search by name, email, or phone..."
                        value={parentSearch}
                        onChange={(e) => setParentSearch(e.target.value)}
                        className="mt-2"
                      />
                      {availableParents.length > 0 && (
                        <div className="mt-2 max-h-60 overflow-y-auto border rounded-md">
                          {availableParents.map(parent => (
                            <div
                              key={parent.id}
                              onClick={() => {
                                setSelectedParentId(parent.id);
                                setParentSearch(`${parent.first_name} ${parent.last_name}`);
                                setAvailableParents([]);
                              }}
                              className={`p-3 cursor-pointer hover:bg-gray-100 border-b last:border-b-0 ${
                                selectedParentId === parent.id ? 'bg-green-50' : ''
                              }`}
                            >
                              <div className="font-medium">
                                {parent.first_name} {parent.last_name}
                              </div>
                              {parent.email && (
                                <div className="text-sm text-gray-500">{parent.email}</div>
                              )}
                              {parent.phone && (
                                <div className="text-sm text-gray-500">{parent.phone}</div>
                              )}
                              {parent.students && parent.students.length > 0 && (
                                <div className="text-xs text-gray-400 mt-1">
                                  Students: {parent.students.map(s => `${s.first_name} ${s.last_name}`).join(', ')}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      {selectedParentId && (
                        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md text-sm">
                          ✓ Parent selected
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {!sendToAll && !sendToSpecificParent && (
                  <div className="ml-6 space-y-4 border-l-2 pl-4">
                    {availableGrades.length > 0 ? (
                      <div>
                        <Label className="text-sm">Filter by Grade</Label>
                        <div className="mt-2 grid grid-cols-2 gap-2">
                          {availableGrades.map(grade => (
                            <div key={grade.value} className="flex items-center space-x-2">
                              <Checkbox
                                id={`grade-${grade.value}`}
                                checked={selectedGrades.includes(grade.value)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedGrades([...selectedGrades, grade.value]);
                                  } else {
                                    setSelectedGrades(selectedGrades.filter(g => g !== grade.value));
                                  }
                                }}
                              />
                              <Label htmlFor={`grade-${grade.value}`} className="cursor-pointer text-sm">
                                {grade.label}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">
                        No grades configured for this school. Please configure grade levels in school settings.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Channel */}
            <div className="space-y-2">
              <Label htmlFor="channel">Delivery Channel</Label>
              <Select value={channel} onValueChange={(val) => setChannel(val as 'in_app' | 'push' | 'all')}>
                <SelectTrigger id="channel">
                  <SelectValue placeholder="Select delivery method" />
                  <SelectContent>
                    <SelectItem value="in_app">In-App Only (Shows in notifications page)</SelectItem>
                    <SelectItem value="push">Push Notification Only (Mobile alert)</SelectItem>
                    <SelectItem value="all">Both In-App & Push</SelectItem>
                  </SelectContent>
                </SelectTrigger>
              </Select>
            </div>

            {/* Alerts */}
            {error && (
              <Alert variant="destructive">
                <ExclamationCircleIcon className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-500 bg-green-50">
                <CheckCircleIcon className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}

            {/* Send Button */}
            <Button
              onClick={handleSend}
              disabled={loading || !title || !message || (sendToSpecificParent && !selectedParentId)}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <ArrowPathIcon className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <PaperAirplaneIcon className="mr-2 h-4 w-4" />
                  Send Notification
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar - Variables Helper */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Available Variables</CardTitle>
            <CardDescription>
              Click to insert into your message
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {availableVariables.map(variable => (
              <button
                key={variable.name}
                onClick={() => insertVariable(variable.name)}
                className="w-full text-left p-3 rounded-md hover:bg-gray-100 transition-colors border"
              >
                <div className="font-mono text-sm text-blue-600">
                  {`{${variable.name}}`}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {variable.description}
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="text-xs text-gray-500 uppercase mb-1">Title</div>
                <div className="font-semibold">{title || 'No title yet'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase mb-1">Message</div>
                <div className="text-sm whitespace-pre-wrap">
                  {message || 'No message yet'}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase mb-1">Audience</div>
                <div className="text-sm">
                  {sendToAll 
                    ? 'All students' 
                    : sendToSpecificParent && selectedParentId
                    ? '1 specific parent'
                    : `${selectedGrades.length} grade(s) selected`}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
