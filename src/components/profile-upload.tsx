'use client';

import type { ChangeEvent, FormEvent } from 'react';
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProfileUploadProps {
  onProfileUpdate: (name: string, picture: string | null) => void;
  initialName: string;
  initialPicture: string | null;
}

export default function ProfileUpload({
  onProfileUpdate,
  initialName,
  initialPicture,
}: ProfileUploadProps) {
  const [name, setName] = useState<string>(initialName || 'Student');
  const [preview, setPreview] = useState<string | null>(initialPicture);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [email, setEmail] = useState<string>('');
  const [mobile, setMobile] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid File Type',
          description: 'Please select an image file.',
          variant: 'destructive',
        });
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: 'File Too Large',
          description: 'Please select an image smaller than 2MB.',
          variant: 'destructive',
        });
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      toast({
        title: 'Name Required',
        description: 'Please enter your name.',
        variant: 'destructive',
      });
      return;
    }

    // Example: Extend onProfileUpdate or save all data
    onProfileUpdate(name, preview);

    toast({
      title: 'Profile Updated',
      description: 'Your profile information has been saved.',
    });
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg rounded-lg">
      <CardHeader>
        <CardTitle>Your Profile</CardTitle>
        <CardDescription>Update your name and profile picture.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <Avatar
              className="h-24 w-24 cursor-pointer ring-2 ring-offset-2 ring-primary hover:ring-accent transition-all duration-300"
              onClick={handleAvatarClick}
              aria-label="Upload profile picture"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleAvatarClick()}
            >
              <AvatarImage src={preview ?? undefined} alt="Profile Preview" />
              <AvatarFallback>
                <User className="h-12 w-12" />
              </AvatarFallback>
            </Avatar>
            <Input
              type="file"
              id="profilePicture"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              ref={fileInputRef}
              aria-hidden="true"
            />
            <Button type="button" variant="outline" size="sm" onClick={handleAvatarClick}>
              {preview ? 'Change Picture' : 'Upload Picture'}
            </Button>
            {preview && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive/80"
                onClick={() => {
                  setPreview(null);
                  setSelectedFile(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
              >
                Remove Picture
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
              className="rounded-md shadow-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email account</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="yourname@example.com"
              className="rounded-md shadow-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mobile">Mobile number</Label>
            <Input
              id="mobile"
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="Add number"
              className="rounded-md shadow-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="USA"
              className="rounded-md shadow-sm"
            />
          </div>

          <Button
            type="submit"
           className="w-full bg-primary hover:bg-[#2489FF] bg-primary/90 text-primary-foreground hover:text-white rounded-md shadow-md transition duration-300 ease-in-out transform hover:scale-105"
          >
            Save Profile
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
