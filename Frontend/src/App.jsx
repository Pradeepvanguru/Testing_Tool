import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Trash2, Plus, Folder, FolderOpen, File, Settings, Search,MoreHorizontal,Edit,Save,X,Code,TestTube,Database
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/toaster';

function App() {
  const [projects, setProjects] = useState([]);
  const [testCases, setTestCases] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedTestCase, setSelectedTestCase] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);
  const [showNewTestCaseDialog, setShowNewTestCaseDialog] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newTestCaseName, setNewTestCaseName] = useState('');
  const [tableData, setTableData] = useState([]);
  const [editingCell, setEditingCell] = useState(null);

  useEffect(() => {
    const savedProjects = localStorage.getItem('testingTool_projects');
    const savedTestCases = localStorage.getItem('testingTool_testCases');
    const savedTableData = localStorage.getItem('testingTool_tableData');

    if (savedProjects) setProjects(JSON.parse(savedProjects));
    if (savedTestCases) setTestCases(JSON.parse(savedTestCases));
    if (savedTableData) setTableData(JSON.parse(savedTableData));
  }, []);

  useEffect(() => {
    localStorage.setItem('testingTool_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('testingTool_testCases', JSON.stringify(testCases));
  }, [testCases]);

  useEffect(() => {
    localStorage.setItem('testingTool_tableData', JSON.stringify(tableData));
  }, [tableData]);

  useEffect(() => {
    if (projects.length === 0) {
      const dummyProjects = [
        { id: 1, name: 'E-Commerce Testing', isReleased: false, files: ['login.test.js', 'checkout.test.js'] },
        { id: 2, name: 'API Testing Suite', isReleased: false, files: ['auth.test.js', 'users.test.js'] }
      ];
      setProjects(dummyProjects);
    }

    if (testCases.length === 0) {
      const dummyTestCases = [
        { id: 1, name: 'TC1-Login Validation', projectId: 1 },
        { id: 2, name: 'TC2-Payment Processing', projectId: 1 },
        { id: 3, name: 'TC1-User Authentication', projectId: 2 },
        { id: 4, name: 'TC2-Data Retrieval', projectId: 2 }
      ];
      setTestCases(dummyTestCases);
    }

    if (tableData.length === 0) {
      const dummyTableData = [
        { id: 1, testStep: 'Navigate to login page', expectedResult: 'Login form displayed', actualResult: 'Pass', status: 'Pass' },
        { id: 2, testStep: 'Enter valid credentials', expectedResult: 'User logged in', actualResult: 'Pass', status: 'Pass' },
        { id: 3, testStep: 'Click login button', expectedResult: 'Redirect to dashboard', actualResult: 'Pending', status: 'Pending' }
      ];
      setTableData(dummyTableData);
    }
  }, [projects.length, testCases.length, tableData.length]);

  const createProject = () => {
    if (!newProjectName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a project name",
        variant: "destructive"
      });
      return;
    }

    const newProject = {
      id: Date.now(),
      name: newProjectName,
      isReleased: false,
      files: ['main.test.js']
    };

    setProjects([...projects, newProject]);
    setNewProjectName('');
    setShowNewProjectDialog(false);
    
    toast({
      title: "Success",
      description: `Project "${newProjectName}" created successfully!`
    });
  };

  const releaseProject = (projectId) => {
    setProjects(projects.map(project => 
      project.id === projectId 
        ? { ...project, isReleased: true }
        : project
    ));
    
    toast({
      title: "Success",
      description: "Project released successfully!"
    });
  };

  const runProject = (project) => {
    setSelectedProject(project);
    setIsRunning(true);
    
    toast({
      title: "Running",
      description: `Running tests for ${project.name}...`
    });

    setTimeout(() => {
      setIsRunning(false);
      toast({
        title: "Complete",
        description: "Test execution completed!"
      });
    }, 3000);
  };

  const createTestCase = () => {
    if (!newTestCaseName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a test case name",
        variant: "destructive"
      });
      return;
    }

    if (!selectedProject) {
      toast({
        title: "Error",
        description: "Please select a project first",
        variant: "destructive"
      });
      return;
    }

    const newTestCase = {
      id: Date.now(),
      name: newTestCaseName,
      projectId: selectedProject.id
    };

    setTestCases([...testCases, newTestCase]);
    setNewTestCaseName('');
    setShowNewTestCaseDialog(false);
    
    toast({
      title: "Success",
      description: `Test case "${newTestCaseName}" created successfully!`
    });
  };

  const selectTestCase = (testCase) => {
    setSelectedTestCase(testCase);
    toast({
      title: "Test Case Selected",
      description: `Now viewing: ${testCase.name}`
    });
  };

  const addTableRow = () => {
    const newRow = {
      id: Date.now(),
      testStep: 'New test step',
      expectedResult: 'Expected result',
      actualResult: 'Pending',
      status: 'Pending'
    };
    setTableData([...tableData, newRow]);
  };

  const updateTableCell = (rowId, field, value) => {
    if (!value.trim()) {
      toast({
        title: "Error",
        description: "Field cannot be empty",
        variant: "destructive"
      });
      return;
    }

    setTableData(tableData.map(row => 
      row.id === rowId 
        ? { ...row, [field]: value }
        : row
    ));
    setEditingCell(null);
  };

  const handleKeyPress = (e, rowId, field, value) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      updateTableCell(rowId, field, value);
    } else if (e.key === 'Escape') {
      setEditingCell(null);
    }
  };

  const deleteTableRow = (rowId) => {
    setTableData(tableData.filter(row => row.id !== rowId));
    toast({
      title: "Deleted",
      description: "Test step removed successfully!"
    });
  };

  const filteredTestCases = selectedProject 
    ? testCases.filter(tc => tc.projectId === selectedProject.id)
    : [];

  return (
    <div className="h-screen flex flex-col vscode-theme">
      <Toaster />
      
      <header className="border-b border-gray-600">
        <div className="h-12 bg-[#2d2d30] flex items-center px-4 border-b border-gray-600">
          <div className="flex items-center space-x-2">
            <TestTube className="h-6 w-6 text-[#007ACC]" />
            <span className="text-lg font-semibold text-dark">Testing Tool</span>
          </div>
          <div className="ml-auto flex items-center space-x-4">
            <Search className="h-4 w-4 text-gray-400 cursor-pointer hover:text-white" />
            <Settings className="h-4 w-4 text-gray-400 cursor-pointer hover:text-white" />
          </div>
        </div>

        <div className="h-10 bg-[#383838] flex items-center px-4 border-b border-gray-600">
          <nav className="flex space-x-6">
            <span className="text-xs text-white cursor-pointer hover:text-[#007ACC]">File</span>
            <span className="text-xs text-white cursor-pointer hover:text-[#007ACC]">Edit</span>
            <span className="text-xs text-white cursor-pointer hover:text-[#007ACC]">View</span>
            <span className="text-xs text-white cursor-pointer hover:text-[#007ACC]">Run</span>
            <span className="text-xs text-white cursor-pointer hover:text-[#007ACC]">Help</span>
          </nav>
        </div>

        <div className="h-12 bg-[#3c3c3c] flex items-center px-4 space-x-4">
          <Button
            onClick={() => selectedProject && runProject(selectedProject)}
            disabled={!selectedProject || isRunning}
            className="vscode-button h-7 px-2"
          >
            {isRunning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            <span className="ml-2 text-xs">{isRunning ? 'Running...' : 'Run'}</span>
          </Button>
          <Button
            onClick={() => setIsRunning(false)}
            disabled={!isRunning}
            variant="outline"
            className="h-7 px-2 border-gray-500 text-gray-300 hover:bg-gray-600"
          >
            <Pause className="h-3.5 w-3.5" />
          </Button>
          <Button
            onClick={() => {
              setSelectedProject(null);
              setSelectedTestCase(null);
              toast({ title: "Reset", description: "Workspace cleared!" });
            }}
            variant="outline"
            className="h-7 px-2 bg-gray-500 text-gray-300 hover:bg-gray-600"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </header>

      <div className="flex-1 flex">
        <div className="w-1/5 vscode-sidebar p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold text-white uppercase tracking-wide">Projects</h2>
            <Dialog open={showNewProjectDialog} onOpenChange={setShowNewProjectDialog}>
              <DialogTrigger asChild>
                <Button size="sm" className="vscode-button h-6 px-2">
                  <Plus className="h-3 w-3" />
                  <span className="ml-1 text-2xs">New</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="vscode-theme border-gray-600">
                <DialogHeader>
                  <DialogTitle className="text-grey-300 text-sm">Create New Project</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="projectName" className="text-gray-500 text-xs">Project Name</Label>
                    <Input
                      id="projectName"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      className="vscode-input mt-1 h-7 text-xs"
                      placeholder="Enter project name..."
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      onClick={() => setShowNewProjectDialog(false)}
                      variant="outline"
                      className="h-7 px-2 border-gray-500 text-gray-300 text-xs"
                    >
                      Cancel
                    </Button>
                    <Button onClick={createProject} className="vscode-button h-7 px-2 text-xs">
                      Create
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-1">
            <AnimatePresence>
              {projects.map((project) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className={`project-folder p-2 rounded cursor-pointer ${
                    selectedProject?.id === project.id ? 'bg-[#007ACC]/20 border-l-2 border-[#007ACC]' : ''
                  }`}
                  onClick={() => setSelectedProject(project)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {selectedProject?.id === project.id ? 
                        <FolderOpen className="h-3.5 w-3.5 text-[#007ACC]" /> : 
                        <Folder className="h-3.5 w-3.5 text-gray-400" />
                      }
                      <span className="text-xs text-white">{project.name}</span>
                    </div>
                    {!project.isReleased && (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          releaseProject(project.id);
                        }}
                        size="sm"
                        className="h-5 px-2 text-2xs vscode-button"
                      >
                        Release
                      </Button>
                    )}
                    {project.isReleased && (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          runProject(project);
                        }}
                        size="sm"
                        className="h-5 px-2 text-2xs bg-green-600 hover:bg-green-700"
                      >
                        <Play className="h-2.5 w-2.5" />
                      </Button>
                    )}
                  </div>
                  {selectedProject?.id === project.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-2 ml-6 space-y-1"
                    >
                      {project.files.map((file, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <File className="h-3 w-3 text-gray-500" />
                          <span className="text-2xs text-gray-400">{file}</span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <div className="w-[15%] bg-[#2d2d30] border-r border-gray-600 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold text-white uppercase tracking-wide">Test Cases</h2>
            <Dialog open={showNewTestCaseDialog} onOpenChange={setShowNewTestCaseDialog}>
              <DialogTrigger asChild>
                <Button 
                  size="sm" 
                  className="vscode-button h-6 px-2"
                  disabled={!selectedProject}
                >
                  <Plus className="h-3 w-3" />
                  <span className="ml-1 text-2xs">Add TC</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="vscode-theme border-gray-600">
                <DialogHeader>
                  <DialogTitle className="text-grey-300 text-sm">Create Test Case</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="testCaseName" className="text-gray-500 text-xs">Test Case Name</Label>
                    <Input
                      id="testCaseName"
                      value={newTestCaseName}
                      onChange={(e) => setNewTestCaseName(e.target.value)}
                      className="vscode-input mt-1 h-7 text-xs"
                      placeholder="Enter test case name..."
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      onClick={() => setShowNewTestCaseDialog(false)}
                      variant="outline"
                      className="h-7 px-2 border-gray-500 text-gray-300 text-xs"
                    >
                      Cancel
                    </Button>
                    <Button onClick={createTestCase} className="vscode-button h-7 px-2 text-xs">
                      Create
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-1">
            <AnimatePresence>
              {filteredTestCases.map((testCase) => (
                <motion.div
                  key={testCase.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className={`test-case-item p-2 rounded cursor-pointer ${
                    selectedTestCase?.id === testCase.id ? 'active' : ''
                  }`}
                  onClick={() => selectTestCase(testCase)}
                >
                  <div className="flex items-center space-x-2">
                    <Code className="h-3 w-3 text-[#007ACC]" />
                    <span className="text-2xs text-white truncate">{testCase.name}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex-1 vscode-editor p-4">
          {selectedTestCase ? (
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-sm font-semibold text-white">{selectedTestCase.name}</h1>
                <Button onClick={addTableRow} className="vscode-button h-7 px-2">
                  <Plus className="h-3 w-3" />
                  <span className="ml-2 text-2xs">Add</span>
                </Button>
              </div>

              <div className="flex-1 overflow-auto">
                <div className="bg-[#252526] rounded-lg border border-gray-600">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-600">
                        <th className="text-left p-2 table-header">Step</th>
                        <th className="text-left p-2 table-header">Expected</th>
                        <th className="text-left p-2 table-header">Actual</th>
                        <th className="text-left p-2 table-header">Status</th>
                        <th className="text-left p-2 table-header w-20">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <AnimatePresence>
                        {tableData.map((row) => (
                          <motion.tr
                            key={row.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="table-row border-b border-gray-700"
                          >
                            {['testStep', 'expectedResult', 'actualResult', 'status'].map((field) => (
                              <td key={field} className="p-2">
                                {editingCell === `${row.id}-${field}` ? (
                                  <div className="table-cell-editing">
                                    <Input
                                      value={row[field]}
                                      onChange={(e) => {
                                        const newTableData = [...tableData];
                                        const rowIndex = newTableData.findIndex(r => r.id === row.id);
                                        newTableData[rowIndex] = { ...row, [field]: e.target.value };
                                        setTableData(newTableData);
                                      }}
                                      onBlur={(e) => updateTableCell(row.id, field, e.target.value)}
                                      onKeyDown={(e) => handleKeyPress(e, row.id, field, row[field])}
                                      className="vscode-input h-7 text-xs py-1"
                                      autoFocus
                                    />
                                  </div>
                                ) : (
                                  <div
                                    className="table-cell"
                                    onClick={() => setEditingCell(`${row.id}-${field}`)}
                                  >
                                    {row[field]}
                                  </div>
                                )}
                              </td>
                            ))}
                            <td className="p-2">
                              <div className="flex space-x-1">
                                <button
                                  className="icon-btn"
                                  onClick={() => setEditingCell(`${row.id}-testStep`)}
                                  title="Edit"
                                >
                                  <Edit className="text-gray-400 hover:text-[#007ACC]" />
                                </button>
                                <button
                                  className="icon-btn"
                                  onClick={() => deleteTableRow(row.id)}
                                  title="Delete"
                                >
                                  <Trash2 className="text-red-400 hover:text-red-300" />
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Database className="h-12 w-12 text-gray-500 mx-auto mb-3" />
                <h2 className="text-sm font-semibold text-gray-400 mb-2">No Test Case Selected</h2>
                <p className="text-xs text-gray-500">Select a test case from the left panel to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;