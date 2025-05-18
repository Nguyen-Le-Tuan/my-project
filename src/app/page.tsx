'use client';

import type {ReactNode} from 'react';
import {useState, useEffect} from 'react';
import Image from 'next/image'; // Import next/image
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button'; // Ensure Button is imported if used outside sidebar
import { Toaster } from '@/components/ui/toaster';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent
} from '@/components/ui/card'; // Import Card components from shadcn
import ProfileUpload from '@/components/profile-upload';
import QuestionGenerator from '@/components/question-generator';
import ProgressTracker from '@/components/progress-tracker';
import {
  LayoutDashboard,
  HelpCircle,
  BookOpen,
  Settings,
  User,
} from 'lucide-react';

type SidebarMenuItemType = {
  href: string;
  icon: ReactNode;
  label: string;
  component: ReactNode;
};

export default function Home() {
  const [studentName, setStudentName] = useState<string>('Student');
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>('dashboard');

  // Load state from local storage on mount
  useEffect(() => {
    const storedName = localStorage.getItem('studentName');
    const storedPic = localStorage.getItem('profilePicture');
    if (storedName) setStudentName(storedName);
    if (storedPic) setProfilePicture(storedPic);
  }, []);

  // Save state to local storage when it changes
  useEffect(() => {
    localStorage.setItem('studentName', studentName);
    if (profilePicture) {
      localStorage.setItem('profilePicture', profilePicture);
    } else {
      localStorage.removeItem('profilePicture');
    }
  }, [studentName, profilePicture]);

  const handleProfileUpdate = (name: string, picture: string | null) => {
    setStudentName(name);
    setProfilePicture(picture);
  };

  const menuItems: SidebarMenuItemType[] = [
    {
      href: '#dashboard',
      icon: <LayoutDashboard />,
      label: 'Dashboard',
      component: <ProgressTracker />,
    },
    {
      href: '#practice',
      icon: <HelpCircle />,
      label: 'Practice',
      component: <QuestionGenerator profilePicture={profilePicture} />, // Pass profile picture here
    },
    {
      href: '#profile',
      icon: <User />,
      label: 'Profile',
      component: (
        <ProfileUpload
          onProfileUpdate={handleProfileUpdate}
          initialName={studentName}
          initialPicture={profilePicture}
        />
      ),
    },
  ];

  const renderContent = () => {
    const activeItem = menuItems.find(
      (item) => item.href === `#${activeSection}`
    );
    return activeItem ? activeItem.component : menuItems[0].component; // Default to Dashboard
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold">StudyPark</h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  onClick={() => setActiveSection(item.href.substring(1))}
                  isActive={activeSection === item.href.substring(1)}
                  tooltip={item.label}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setActiveSection('settings')}
                isActive={activeSection === 'settings'}
                tooltip="Settings"
              >
                <Settings />
                <span>Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background px-4 shadow-sm sm:justify-end">
          <SidebarTrigger className="sm:hidden" />
          <div className="flex items-center gap-4">
            <span className="font-medium">Welcome, {studentName}!</span>
            {profilePicture ? (
              // Use next/image for optimized profile picture
              <Image
                src={profilePicture}
                alt="Profile"
                width={32} // Set appropriate width
                height={32} // Set appropriate height
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <User className="h-8 w-8 rounded-full bg-muted p-1 text-muted-foreground" />
            )}
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {renderContent()}
          {activeSection === 'settings' && (
             <Card className="shadow-lg rounded-lg">
              <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>Manage your application settings.</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Settings section is under construction.</p>
                 {/* Example button usage within settings */}
                 {/* <Button variant="outline">Reset Progress</Button> */}
              </CardContent>
             </Card>
          )}
        </main>
      </SidebarInset>
      <Toaster />
    </SidebarProvider>
  );
}

// Removed dummy Card components as they are now imported from shadcn/ui

// import React from 'react';

// const HomePage = () => {
//   return (
//     <div className="bg-red-500 text-white p-4">
//       <h1 className="text-2xl font-bold">Hello, Tailwind!</h1>
//       <p>This should be styled with Tailwind CSS.</p>
//     </div>
//   );
// };

// export default HomePage;