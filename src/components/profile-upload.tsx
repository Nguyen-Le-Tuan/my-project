'use client';

import type {ChangeEvent, FormEvent} from 'react';
import {useState, useRef} from 'react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {Card, CardContent, CardHeader, CardTitle, CardDescription} from '@/components/ui/card';
import {User} from 'lucide-react';
import {useToast} from '@/hooks/use-toast';

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {toast} = useToast();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Basic validation for image type and size (e.g., max 2MB)
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
    onProfileUpdate(name, preview);
    toast({
      title: 'Profile Updated',
      description: 'Your name and profile picture have been saved.',
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
              tabIndex={0} // Make it focusable
              onKeyDown={(e) => e.key === 'Enter' && handleAvatarClick()} // Allow keyboard activation
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
              className="hidden" // Hide the default input
              ref={fileInputRef}
              aria-hidden="true" // Hide from accessibility tree as the avatar handles interaction
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
                    fileInputRef.current.value = ''; // Reset file input
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

          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-md shadow-md transition duration-300 ease-in-out transform hover:scale-105">
            Save Profile
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
