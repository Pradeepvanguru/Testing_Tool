import React, { useState, useEffect } from 'react';
import { Plus, FolderPlus, ChevronRight, ChevronDown, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import * as api from '@/services/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ProjectExplorer = ({ onProjectSelect, onReleaseSelect, selectedProject, selectedRelease }) => {
  const [projects, setProjects] = useState([]);
  const [showNewItemModal, setShowNewItemModal] = useState(false);
  const [showReleaseModal, setShowReleaseModal] = useState(false);
  const [currentProjectForModal, setCurrentProjectForModal] = useState(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [newReleaseName, setNewReleaseName] = useState('');
  
  const { toast } = useToast();


// Fix the release selection handler
const handleReleaseClick = (project, release) => {
  const releaseData = {
    _id: release.ReleaseID,
    ReleaseID: release.ReleaseID,
    ReleaseName: release.ReleaseName,
    ProjectID: project.ProjectID // Ensure ProjectID is included
  };
  onReleaseSelect(releaseData);
  onProjectSelect(releaseData);
};




  const fetchProjects = async () => {
    try {
      const data = await api.getProjects();
      setProjects(data.map(p => ({ ...p, expanded: false, releases: [], releasesLoaded: false })));
    } catch (error) {
      toast({ title: "Error fetching projects", description: error.message, variant: "destructive" });
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      toast({ title: "Error", description: "Project name is required", variant: "destructive" });
      return;
    }
    try {
      const projectData = { ProjectName: newProjectName };
      await api.createProject(projectData);
      toast({ title: "Success", description: "Project created successfully!" });
      setNewProjectName('');
      setShowNewItemModal(false);
      fetchProjects(); 
    } catch (error) {
      toast({ title: "Error creating project", description: error.message, variant: "destructive" });
    }
  };

 const fetchReleasesForProject = async (projectId) => {
  const releases = await api.getReleasesByProjectId(projectId); // This is okay
  setProjects(prevProjects =>
    prevProjects.map(p =>
      p.ProjectID === projectId
        ? { ...p, releases, releasesLoaded: true, expanded: !p.expanded }
        : p
    )
  );
};


 const toggleProjectExpansion = (projectId) => {
  const project = projects.find(p => p.ProjectID === projectId);
  
  if (project && !project.releasesLoaded) {
    fetchReleasesForProject(projectId);
  } else {
    setProjects(prevProjects => prevProjects.map(p => 
      p.ProjectID === projectId ? { ...p, expanded: !p.expanded } : p
    ));
  }
};

  
  const handleCreateRelease = async () => {
    if (!newReleaseName.trim() || !currentProjectForModal) {
      toast({ title: "Error", description: "Release name and project selection are required.", variant: "destructive" });
      return;
    }
    try {
       await api.createRelease(currentProjectForModal.ProjectID, { ReleaseName: newReleaseName });
      toast({ title: "Success", description: `Release "${newReleaseName}" created for project "${currentProjectForModal.ProjectName}"!` });
      setNewReleaseName('');
      setShowReleaseModal(false);
      fetchReleasesForProject(currentProjectForModal.ProjectID);
      setProjects(prev => prev.map(p => p.ProjectID === currentProjectForModal.ProjectID ? {...p, expanded: true} : p));
    } catch (error) {
      toast({ title: "Error creating release", description: error.message, variant: "destructive" });
    }
  };

  const openReleaseModal = (project) => {
    setCurrentProjectForModal(project);
    setShowReleaseModal(true);
  };

  return (
    <div className="p-1.5 md:p-2 scrollbar overflow-y-auto h-full">
      <div className="flex items-center justify-between mb-2.5">
        <h2 className="text-[11px] md:text-xs font-semibold text-white uppercase">Explorer</h2>
        <Dialog open={showNewItemModal} onOpenChange={setShowNewItemModal}>
          <DialogTrigger asChild>
            <button className="icon-button" title="New Item"><Plus className="w-3 h-3" /></button>
          </DialogTrigger>
          <DialogContent className="modal-content sm:max-w-md">
            <DialogHeader><DialogTitle className="text-white text-sm">Add New Project</DialogTitle></DialogHeader>
            <Tabs defaultValue="project" className="w-full">
              {/* <TabsList className="grid w-full grid-cols-1">
                <TabsTrigger value="project" className="text-xs">New Project</TabsTrigger>
              </TabsList> */}
              <TabsContent value="project" className="pt-3">
                <div className="space-y-2.5">
                  <div>
                    <Label htmlFor="projectName" className="text-white text-[11px] md:text-xs">Project Name</Label>
                    <Input id="projectName" value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} className="input-field mt-0.5" placeholder="Enter project name" />
                  </div>
                </div>
                <DialogFooter className="mt-3.5">
                  <Button onClick={handleCreateProject} className="btn-primary text-[11px] md:text-xs w-full">Create Project</Button>
                </DialogFooter>
              </TabsContent>
            </Tabs>
            <Button onClick={() => setShowNewItemModal(false)} variant="outline" className="btn-secondary text-[11px] md:text-xs mt-3 w-full">Cancel</Button>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-0.5">
        {projects.map((project) => (
          <div key={project.ProjectID} className="fade-in">
            <div className={`folder-item flex items-center justify-between rounded-sm ${selectedProject?._id === project._id ? 'bg-gray-700' : ''}`} >
              <div className="flex items-center space-x-1 flex-grow min-w-0" onClick={() => onProjectSelect(project)}>
                <button onClick={(e) => { e.stopPropagation(); toggleProjectExpansion(project.ProjectID); }} className="icon-button p-0">
                  {project.expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                </button>
                <FolderPlus className="w-3 h-3 text-[#007ACC] shrink-0" />
                <span className="text-[11px] md:text-xs text-white truncate" title={project.ProjectName}>{project.ProjectName}</span>
              </div>
              <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); openReleaseModal(project); }} className="release-button p-0.5 h-auto text-[5px] ">
                + Add Release
              </Button>
            </div>
            {project.expanded && project.releasesLoaded && (
              <div className="ml-3.5 mt-0.5 space-y-0.5 slide-in">
                {project.releases.length === 0 && <p className="text-[10px] md:text-xs text-gray-500 pl-1.5 py-0.5">No releases yet.</p>}
                {project.releases.map((release) => (
                  <div
                    key={release.ReleaseID}
                    className={`folder-item flex items-center justify-between rounded-sm ${selectedRelease?._id === release._id ? 'selected' : ''}`}
                    onClick={() => onReleaseSelect(project, release)}
                  >
                    <span className="text-[11px] md:text-xs text-gray-300 truncate" title={release.ReleaseName}>{release.ReleaseName}</span>
                    <button className="icon-button p-0.5" title="Select/Run Release">
                      <Play className="w-2.5 h-2.5" onClick={()=>{handleReleaseClick(project,release)}}/>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <Dialog open={showReleaseModal} onOpenChange={setShowReleaseModal}>
        <DialogContent className="modal-content sm:max-w-md">
        
          <DialogHeader><DialogTitle className="text-white text-sm">Create New Release for {currentProjectForModal?.ProjectName}</DialogTitle></DialogHeader>
          <DialogDescription className="text-sm text-gray-600">
                        Enter a name to create a new Release Name.
        </DialogDescription>
          <div className="space-y-2.5">
            <div>
              <Label htmlFor="releaseName" className="text-white text-[11px] md:text-xs">Release Name</Label>
              <Input id="releaseName" value={newReleaseName} onChange={(e) => setNewReleaseName(e.target.value)} className="input-field mt-0.5" placeholder="Enter release name" />
            </div>
          </div>
          <DialogFooter className="mt-3.5">
            <Button onClick={() => setShowReleaseModal(false)} variant="outline" className="btn-secondary text-[11px] md:text-xs">Cancel</Button>
            <Button onClick={handleCreateRelease} className="btn-primary text-[11px] md:text-xs">Create Release</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectExplorer;