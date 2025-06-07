import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import AppHeader from '@/components/layout/Header';
import ProjectExplorer from '@/components/sidebar/ProjectExplorer';
import TestCaseExplorer from '@/components/sidebar/TestCaseExplorer';
import TestDataEditor from '@/components/main/TestDataEditor';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';

const MainAppPage = () => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedRelease, setSelectedRelease] = useState(null);
  const [selectedRun, setSelectedRun] = useState(null);
  const [selectedTestCase, setSelectedTestCase] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleProjectSelect = (project) => {
    setSelectedProject(project);
    setSelectedRelease(null);
    setSelectedRun(null);
    setSelectedTestCase(null);
  };

  const handleReleaseSelect = (project, release) => {
    setSelectedProject(project); 
    setSelectedRelease(release);
    setSelectedRun(null);
    setSelectedTestCase(null);
  };

  const handleRunSelect = (run) => {
    setSelectedRun(run);
    setSelectedTestCase(null);
  };

  const handleTestCaseSelect = (testCase) => {
    setSelectedTestCase(testCase);
  };
  
  const handleRunTest = () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to run tests.",
        variant: "destructive",
        action: <Button onClick={() => navigate('/login')} className="btn-primary text-xs">Login</Button>,
      });
      return;
    }
    if (!selectedTestCase && !selectedRun) { // Allow running all TCs in a Run
      toast({
        title: "No Test Case or Run Selected",
        description: "Please select a test case or a run to execute.",
        variant: "destructive",
      });
      return;
    }
    
    const target = selectedTestCase ? selectedTestCase.TestCaseName : selectedRun.RunName;
    const type = selectedTestCase ? "Test Case" : "Run";

    toast({
      title: `Running ${type}`,
      description: `Executing ${target}... (Simulation)`,
    });
  };

  const selectedItemsForHeader = {
    project: selectedProject,
    release: selectedRelease,
    run: selectedRun,
    testCase: selectedTestCase,
  };

  return (
    <div className="vs-code-theme h-screen flex flex-col text-xs">
      <AppHeader selectedItems={selectedItemsForHeader} onRunTest={handleRunTest} />
      <PanelGroup direction="horizontal" className="flex-1 flex overflow-hidden">
        <Panel defaultSize={20} minSize={10} className="sidebar">
          <ProjectExplorer 
            onProjectSelect={handleProjectSelect}
            onReleaseSelect={handleReleaseSelect}
            selectedProject={selectedProject}
            selectedRelease={selectedRelease}
          />
        </Panel>
        <PanelResizeHandle />
        <Panel defaultSize={15} minSize={10} className="sidebar border-l border-r border-[#3e3e42]">
          <TestCaseExplorer 
            selectedRelease={selectedRelease}
            onRunSelect={handleRunSelect}
            onTestCaseSelect={handleTestCaseSelect}
            selectedRun={selectedRun}
            selectedTestCase={selectedTestCase}
          />
        </Panel>
        <PanelResizeHandle />
        <Panel defaultSize={65} minSize={20}>
          <TestDataEditor selectedTestCase={selectedTestCase} onRunTest={handleRunTest} />
        </Panel>
      </PanelGroup>
    </div>
  );
};

export default MainAppPage;
