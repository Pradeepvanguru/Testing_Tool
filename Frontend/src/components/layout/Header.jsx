import React, { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Code, Settings, Search, User, LogOut, Play, Pause, Trash2, LogIn, UserPlus, File as FileIcon, Folder, Save, Edit3, MoreHorizontal, UploadCloud } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {DropdownMenu,DropdownMenuContent,DropdownMenuItem,DropdownMenuLabel,DropdownMenuSeparator,DropdownMenuTrigger,DropdownMenuGroup,DropdownMenuSub,DropdownMenuSubTrigger,DropdownMenuSubContent,DropdownMenuPortal
} from "@/components/ui/dropdown-menu";
import { useToast } from '@/components/ui/use-toast';

const AppHeader = ({ selectedItems, onRunTest }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);

  const getInitials = (name) => {
    if (!name) return '';
    const names = name.split(' ');
    if (names.length === 1) return names[0].substring(0, 2).toUpperCase();
    return names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase();
  };
  
  const userInitials = user?.username ? getInitials(user.username) : (user?.email ? user.email.charAt(0).toUpperCase() : null);

  const handleLogout = () => {
    logout();
    navigate('/'); 
  };

  const handleRunClick = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in or sign up to run test cases.",
        variant: "destructive",
        action: <Button onClick={() => navigate('/login')} className="btn-primary text-xs">Login</Button>,
      });
    } else {
      if (onRunTest) {
        onRunTest();
      } else {
        toast({ title: "Info", description: "Run functionality not fully implemented yet."});
      }
    }
  };

  const handleFileAction = (action) => {
    toast({ title: "File Action", description: `${action} clicked. Functionality to be implemented.`, variant: "default" });
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      toast({ title: "File Selected", description: `File: ${file.name}. Upload logic to be implemented.`, variant: "default" });
    }
    event.target.value = null; 
  };

  const handleFolderUpload = (event) => {
    const files = event.target.files;
    if (files.length > 0) {
      toast({ title: "Folder Selected", description: `Folder: ${files[0].webkitRelativePath.split('/')[0]}. Upload logic to be implemented.`, variant: "default" });
    }
    event.target.value = null;
  };


  return (
    <>
      <input type="file" ref={fileInputRef} onChange={handleFileUpload} style={{ display: 'none' }} />
      <input type="file" ref={folderInputRef} onChange={handleFolderUpload} style={{ display: 'none' }} webkitdirectory="" directory="" />

      <div className="header-layer h-7 flex items-center px-1.5 md:px-3 text-xs">
        <Link to="/" className="flex items-center space-x-1 md:space-x-1.5">
          <Code className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#007ACC]" />
          <span className="font-semibold text-white hidden sm:inline text-[11px] md:text-xs">Testing Tool</span>
        </Link>
        <div className="ml-auto flex items-center space-x-1.5 md:space-x-3">
          <Search className="w-3 h-3 md:w-3.5 md:h-3.5 text-gray-400 cursor-pointer hover:text-white" />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-6 w-6 md:h-7 md:w-7 rounded-sm p-0">
                <Settings className="h-3.5 w-3.5 md:h-4 md:w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-52 modal-content" align="end" forceMount>
              {user ? (
                <>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex items-center space-x-2">
                       <div className="w-7 h-7 bg-[#007ACC] rounded-full flex items-center justify-center text-xs font-semibold text-white">
                        {userInitials || <User className="h-4 w-4"/>}
                      </div>
                      <div className="flex flex-col space-y-0.5">
                        <p className="text-xs font-medium leading-none text-white">{user.username || user.email}</p>
                        {user.username && <p className="text-[10px] leading-none text-gray-400">{user.email}</p>}
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer hover:bg-accent text-xs">
                    <User className="mr-1.5 h-3.5 w-3.5" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer hover:bg-accent text-xs">
                    <LogOut className="mr-1.5 h-3.5 w-3.5" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem onClick={() => navigate('/login')} className="cursor-pointer hover:bg-accent text-xs">
                    <LogIn className="mr-1.5 h-3.5 w-3.5" />
                    <span>Login</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/signup')} className="cursor-pointer hover:bg-accent text-xs">
                    <UserPlus className="mr-1.5 h-3.5 w-3.5" />
                    <span>Sign Up</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </div>

      <div className="navbar-layer h-8 flex items-center px-1.5 md:px-3 text-[11px] md:text-xs">
        <nav className="flex space-x-2.5 md:space-x-3.5">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <span className="text-white cursor-pointer hover:text-[#007ACC]">File</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="modal-content text-xs w-48">
              <DropdownMenuItem onClick={() => fileInputRef.current?.click()} className="cursor-pointer hover:bg-accent">
                <FileIcon className="mr-1.5 h-3.5 w-3.5" /> Open File...
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => folderInputRef.current?.click()} className="cursor-pointer hover:bg-accent">
                <Folder className="mr-1.5 h-3.5 w-3.5" /> Open Folder...
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleFileAction('Save')} className="cursor-pointer hover:bg-accent">
                <Save className="mr-1.5 h-3.5 w-3.5" /> Save
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFileAction('Save As')} className="cursor-pointer hover:bg-accent">
                <Save className="mr-1.5 h-3.5 w-3.5" /> Save As...
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleFileAction('Rename')} className="cursor-pointer hover:bg-accent">
                <Edit3 className="mr-1.5 h-3.5 w-3.5" /> Rename...
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="cursor-pointer hover:bg-accent">
                  <MoreHorizontal className="mr-1.5 h-3.5 w-3.5" /> More
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className="modal-content text-xs w-40">
                    <DropdownMenuItem onClick={() => handleFileAction('Upload to Cloud')} className="cursor-pointer hover:bg-accent">
                      <UploadCloud className="mr-1.5 h-3.5 w-3.5" /> Upload to Cloud
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>
          <span className="text-white cursor-pointer hover:text-[#007ACC]">Edit</span>
          <span className="text-white cursor-pointer hover:text-[#007ACC]">View</span>
          <span className="text-white cursor-pointer hover:text-[#007ACC]">Run</span>
          <span className="text-white cursor-pointer hover:text-[#007ACC]">Help</span>
        </nav>
      </div>

      <div className="operation-layer h-9 flex items-center px-1.5 md:px-3 space-x-1 md:space-x-1.5">
        <button className="icon-button" title="Run Test Cases" onClick={handleRunClick}><Play /></button>
        <button className="icon-button" title="Pause"><Pause /></button>
        <button className="icon-button" title="Delete"><Trash2 /></button>
        <div className="ml-1.5 md:ml-3 text-[11px] md:text-xs text-gray-400 truncate">
          {selectedItems && (
            <span>
              {selectedItems.project?.ProjectName || selectedItems.project?.name}
              {selectedItems.release && ` → ${selectedItems.release?.ReleaseName || selectedItems.release?.name}`}
              {selectedItems.run && ` → ${selectedItems.run?.RunName || selectedItems.run?.name}`}
              {selectedItems.testCase && ` → ${selectedItems.testCase?.TestCaseName || selectedItems.testCase?.name}`}
            </span>
          )}
        </div>
      </div>
    </>
  );
};

export default AppHeader;