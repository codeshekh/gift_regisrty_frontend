'use client'

import { useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import Input from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Settings, User, Upload, Trash2 } from "lucide-react"
import { toast } from 'react-toastify'
import { useSession } from '@/context/SessionContext';
import { useRouter } from 'next/navigation';  // Use the correct router import for Next.js 13+

interface ProfileProps {
  id: number
  name: string
  email: string
  profilePic?: string
}

export default function ProfilePopover({ id, name, email, profilePic }: ProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(name);
  const [editedEmail, setEditedEmail] = useState(email);
  const [editedProfilePic, setEditedProfilePic] = useState(profilePic);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const session = useSession();
  const userId = session?.user?.id;

  const router = useRouter();  // Use useRouter from next/navigation directly

  const handleSave = async () => {
    try {
      const response = await fetch(`http://localhost:4000/v1/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: editedName,
          email: editedEmail,
          profilePic: editedProfilePic,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user details');
      }

      const updatedUser = await response.json();
      // Update the local state with the new values
      name = updatedUser.username;
      email = updatedUser.email;
      profilePic = updatedUser.profilePic;

      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        const response = await fetch(`http://localhost:4000/v1/users/${userId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete user');
        }

        toast.success('Account deleted successfully');
        router.push('/');  // Use the router to redirect after deletion
      } catch (error) {
        console.error('Error deleting account:', error);
        toast.error('Failed to delete account');
      }
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditedProfilePic(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="h-10 w-10 rounded-full">
          <Avatar>
            <AvatarImage src={profilePic} alt={name} />
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profilePic} alt={name} />
            <AvatarFallback>
              <User className="h-8 w-8" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h4 className="text-lg font-semibold">{name}</h4>
            <p className="text-sm text-muted-foreground">{email}</p>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-white bg-black border-white">
                <Settings className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-black text-white">
              <DialogHeader>
                <DialogTitle className="text-white">Edit Profile</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right text-white">Name</Label>
                  <Input
                    id="name"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="col-span-3 bg-gray-800 text-white border-gray-600"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right text-white">Email</Label>
                  <Input
                    id="email"
                    value={editedEmail}
                    onChange={(e) => setEditedEmail(e.target.value)}
                    className="col-span-3 bg-gray-800 text-white border-gray-600"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="profilePic" className="text-right text-white">Profile Picture</Label>
                  <div className="col-span-3 flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-white bg-gray-800 border-white"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Image
                    </Button>
                    <Input
                      id="profilePic"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      ref={fileInputRef}
                    />
                    {editedProfilePic && (
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={editedProfilePic} alt="Preview" />
                      </Avatar>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex justify-between">
                <Button variant="destructive" onClick={handleDelete} className="text-white bg-red-600 border-white">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
                <Button onClick={handleSave} className="text-white bg-gray-800 border-white">
                  Save Changes
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </PopoverContent>
    </Popover>
  );
}
