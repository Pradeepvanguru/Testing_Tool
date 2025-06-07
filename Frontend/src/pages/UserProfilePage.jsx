
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Key, Save, ArrowLeft } from 'lucide-react';
// import * as api from '@/services/api'; // If you add update profile API

const UserProfilePage = () => {
  const { user, setUser, token } = useAuth(); // Assuming setUser can update context if profile changes
  const { toast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
  });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordEditing, setIsPasswordEditing] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
      });
    }
  }, [user]);

  if (!user) {
    return <div className="p-4 text-white">Loading user profile...</div>;
  }

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    toast({ title: "Info", description: "Profile update functionality is not yet connected to backend." });
    // Example:
    // try {
    //   const updatedUser = await api.updateUserProfile(formData); // You'd need this API call
    //   setUser(updatedUser); // Update context
    //   toast({ title: "Success", description: "Profile updated successfully!" });
    //   setIsEditing(false);
    // } catch (error) {
    //   toast({ title: "Error", description: error.message, variant: "destructive" });
    // }
  };
  
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      toast({ title: "Error", description: "New passwords do not match.", variant: "destructive" });
      return;
    }
    if (!currentPassword || !newPassword) {
        toast({ title: "Error", description: "All password fields are required.", variant: "destructive" });
        return;
    }
    toast({ title: "Info", description: "Password change functionality is not yet connected to backend." });
    // Example:
    // try {
    //   await api.changeUserPassword({ currentPassword, newPassword });
    //   toast({ title: "Success", description: "Password changed successfully!" });
    //   setIsPasswordEditing(false);
    //   setCurrentPassword(''); setNewPassword(''); setConfirmNewPassword('');
    // } catch (error) {
    //   toast({ title: "Error", description: error.message, variant: "destructive" });
    // }
  };


  return (
    <div className="min-h-screen bg-[#1e1e1e] p-4 md:p-8 vs-code-theme text-white">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 text-sm hover:bg-accent">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to App
      </Button>
      <div className="max-w-2xl mx-auto bg-[#2d2d30] p-6 rounded-lg shadow-xl border border-[#3e3e42]">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-[#007ACC] rounded-full flex items-center justify-center text-2xl font-semibold">
            {user.username ? user.username.charAt(0).toUpperCase() : <User size={32}/>}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{user.username || 'User Profile'}</h1>
            <p className="text-sm text-gray-400">{user.email}</p>
          </div>
        </div>

        <form onSubmit={handleProfileUpdate} className="space-y-4 mb-8">
          <h2 className="text-lg font-semibold border-b border-[#3e3e42] pb-2 mb-3">Account Information</h2>
          <div>
            <Label htmlFor="username" className="text-sm">Username</Label>
            <div className="flex items-center mt-1">
              <User className="w-4 h-4 mr-2 text-gray-400"/>
              <Input id="username" name="username" type="text" value={formData.username} onChange={handleInputChange} readOnly={!isEditing} className="input-field"/>
            </div>
          </div>
          <div>
            <Label htmlFor="email" className="text-sm">Email</Label>
             <div className="flex items-center mt-1">
              <Mail className="w-4 h-4 mr-2 text-gray-400"/>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} readOnly={!isEditing} className="input-field"/>
            </div>
          </div>
          {isEditing ? (
            <div className="flex space-x-2">
              <Button type="submit" className="btn-primary text-sm"><Save className="w-4 h-4 mr-1"/>Save Changes</Button>
              <Button type="button" variant="secondary" onClick={() => { setIsEditing(false); setFormData({ username: user.username, email: user.email });}} className="btn-secondary text-sm">Cancel</Button>
            </div>
          ) : (
            <Button type="button" onClick={() => setIsEditing(true)} className="btn-secondary text-sm">Edit Profile</Button>
          )}
        </form>
        
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <h2 className="text-lg font-semibold border-b border-[#3e3e42] pb-2 mb-3">Change Password</h2>
           <div>
            <Label htmlFor="currentPassword">Current Password</Label>
            <div className="flex items-center mt-1">
                <Key className="w-4 h-4 mr-2 text-gray-400"/>
                <Input id="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="input-field" readOnly={!isPasswordEditing} />
            </div>
          </div>
          <div>
            <Label htmlFor="newPassword">New Password</Label>
            <div className="flex items-center mt-1">
                <Key className="w-4 h-4 mr-2 text-gray-400"/>
                <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="input-field" readOnly={!isPasswordEditing} />
            </div>
          </div>
          <div>
            <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
            <div className="flex items-center mt-1">
                <Key className="w-4 h-4 mr-2 text-gray-400"/>
                <Input id="confirmNewPassword" type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} className="input-field" readOnly={!isPasswordEditing} />
            </div>
          </div>
           {isPasswordEditing ? (
            <div className="flex space-x-2">
              <Button type="submit" className="btn-primary text-sm"><Save className="w-4 h-4 mr-1"/>Update Password</Button>
              <Button type="button" variant="secondary" onClick={() => { setIsPasswordEditing(false); setCurrentPassword(''); setNewPassword(''); setConfirmNewPassword(''); }} className="btn-secondary text-sm">Cancel</Button>
            </div>
          ) : (
            <Button type="button" onClick={() => setIsPasswordEditing(true)} className="btn-secondary text-sm">Change Password</Button>
          )}
        </form>
      </div>
    </div>
  );
};

export default UserProfilePage;
