import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,DialogDescription  } from '@/components/ui/dialog';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import * as api from '@/services/api';

const TestCaseExplorer = ({selectedRelease,onRunSelect,onTestCaseSelect,selectedRun,selectedTestCase,panelRef,}) => {
  const [runs, setRuns] = useState([]);
  const [testCases, setTestCases] = useState([]);
  const [showRunModal, setShowRunModal] = useState(false);
  const [showTestCaseModal, setShowTestCaseModal] = useState(false);
  const [newRunName, setNewRunName] = useState('');
  const [newTestCaseName, setNewTestCaseName] = useState('');
  const { toast } = useToast();
  const [step, setStep] = useState('');
const [expected, setExpected] = useState('');
const [selectedAction, setSelectedAction] = useState('');


    // Get consistent IDs regardless of property name
  const projectId = selectedRelease?.ProjectID
  const releaseId = selectedRelease?.ReleaseID 

  // Fetch Runs when release changes
  useEffect(() => {
    const fetchRuns = async () => {
      if (projectId && releaseId) {
        try {
          const data = await api.getRunsByReleaseId( projectId,releaseId);
          setRuns(data.map((r) => ({ ...r, testCases: [], testCasesLoaded: false })));
        } catch (error) {
          toast({
            title: 'Error fetching runs',
            description: error.message,
            variant: 'destructive',
          });
          setRuns([]);
        }
      } else {
        setRuns([]);
      }
      setTestCases([]);
    };

    fetchRuns();
  }, [projectId,releaseId, toast]);

  // Fetch Test Cases when run changes
  useEffect(() => {
    const fetchTestCases = async () => {
      if (selectedRun?._id) {
        try {
          const data = await api.getTestCasesByRunId(selectedRun.RunID);
          setTestCases(data);
        } catch (error) {
          toast({
            title: 'Error fetching test cases',
            description: error.message,
            variant: 'destructive',
          });
          setTestCases([]);
        }
      } else {
        setTestCases([]);
      }
    };

    fetchTestCases();
  }, [selectedRun, toast]);

  // Create new run
  const handleCreateRun = async () => {
   
    if (!newRunName.trim() || !projectId || !releaseId) {
      toast({
        title: 'Debug',
        description: `RunName: ${newRunName}, ProjectID: ${projectId}, ReleaseID: ${releaseId}`,
      });
      
      return;
    }

    try {
      await api.createRun(releaseId, { RunName: newRunName }, projectId);
      console.log("TestData: ",releaseId, { RunName: newRunName },projectId);
      toast({ title: 'Success', description: 'Run created successfully!' });
      setNewRunName('');
      setShowRunModal(false);

      const data = await api.getRunsByReleaseId(releaseId,projectId);
      setRuns(data.map((r) => ({ ...r, testCases: [], testCasesLoaded: false })));
    } catch (error) {
      toast({ title: 'Error creating run', description: error.message, variant: 'destructive' });
    }
  };

  // Create new test case
 const handleCreateTestCase = async () => {
  if (
    !newTestCaseName.trim() ||
    !step.trim() ||
    !expected.trim() ||
    !selectedAction ||
    !selectedRun?.RunID
  ) {
    toast({
      title: 'Error',
      description: 'All fields are required',
      variant: 'destructive',
    });
    return;
  }

  const testCaseData = {
    TestCaseName: newTestCaseName,
    RunID: selectedRun.RunID,
    step,
    expected,
    actions: selectedAction,
  };

  try {
    await api.createTestCase(selectedRun.RunID, testCaseData);
    toast({ title: 'Success', description: 'Test case created successfully!' });

    setNewTestCaseName('');
    setStep('');
    setExpected('');
    setSelectedAction('');
    setShowTestCaseModal(false);

    const data = await api.getTestCasesByRunId(selectedRun.RunID);
    setTestCases(data);
  } catch (error) {
    toast({
      title: 'Error creating test case',
      description: error.message,
      variant: 'destructive',
    });
  }
};


  return (
    <div className="p-2 md:p-2.5 scrollbar overflow-y-auto h-full" ref={panelRef}>
      {/* Runs Section */}
      <div className="flex items-center justify-between mb-2.5">
        <h2 className="text-[11px] font-semibold text-white uppercase">Runs</h2>
        <Dialog open={showRunModal} onOpenChange={setShowRunModal}>
          <DialogTrigger asChild>
            <Button size="xs" className="btn-primary text-[11px] px-1.5 py-0.5 h-auto leading-tight" disabled={!selectedRelease}>
              + Run
            </Button>
          </DialogTrigger>
          <DialogContent className="modal-content sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white text-base">Create New Run</DialogTitle>
              <DialogDescription className="text-sm text-gray-400">
                Enter a name to create a new test run under the selected release.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2.5">
              <Label htmlFor="runName" className="text-white text-[11px]">
                Run Name
              </Label>
              <Input
                id="runName"
                value={newRunName}
                onChange={(e) => setNewRunName(e.target.value)}
                className="input-field mt-0.5 text-[11px]"
                placeholder="Enter run name"
                type="text"
                required
              />
            </div>
            <DialogFooter className="mt-3.5">
              <Button onClick={() => setShowRunModal(false)} variant="outline" className="btn-secondary text-[11px] px-2 py-1 h-auto leading-tight">
                Cancel
              </Button>
              <Button onClick={handleCreateRun} className="btn-primary text-[11px] px-2 py-1 h-auto leading-tight">
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

     <div className="space-y-0.5 mb-3.5">
  {selectedRelease ? (
    runs.length > 0 ? (
      runs.map((run) => (
        <div
          key={run.RunID}
          className={`test-case-item text-[11px] py-1 px-1.5 ${selectedRun?.RunID === run.RunID ? 'active' : ''}`}
          onClick={() => onRunSelect(run)}
        >
          <div className="font-medium truncate" title={run.RunName}>
            {run.RunName}
          </div>
        </div>
      ))
    ) : (
      <p className="text-[11px] text-gray-500">No runs for this release.</p>
    )
  ) : (
    <p className="text-[11px] text-gray-500">Select a release to see runs.</p>
  )}
</div>


      {/* Test Cases Section */}
      <div className="flex items-center justify-between mb-2.5">
        <h2 className="text-[11px] font-semibold text-white uppercase">Test Cases</h2>
        <Dialog open={showTestCaseModal} onOpenChange={setShowTestCaseModal}>
          <DialogTrigger asChild>
            <Button size="xs" className="btn-primary text-[11px] px-1.5 py-0.5 h-auto leading-tight" disabled={!selectedRun}>
              + TC
            </Button>
          </DialogTrigger>
         <DialogContent className="modal-content sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white text-base">Create Test Case</DialogTitle>
              <DialogDescription className="text-sm text-gray-400">
                Fill the details to create a new test case under the selected run.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2.5">
              <Label className="text-white text-[11px]">Test Case Name</Label>
              <Input value={newTestCaseName} onChange={(e) => setNewTestCaseName(e.target.value)} placeholder="Enter test case name" className="input-field text-[11px]" />

              <Label className="text-white text-[11px]">Step</Label>
              <Input value={step} onChange={(e) => setStep(e.target.value)} placeholder="Enter test step" className="input-field text-[11px]" />

              <Label className="text-white text-[11px]">Expected Result</Label>
              <Input value={expected} onChange={(e) => setExpected(e.target.value)} placeholder="Enter expected result" className="input-field text-[11px]" />

              <Label className="text-white text-[11px]">Action</Label>
              <select value={selectedAction} onChange={(e) => setSelectedAction(e.target.value)} className="input-field w-full p-1 text-[11px] rounded bg-black border border-gray-600 text-white">
                <option value="">Select action</option>
                <option value="LAUNCHBROWSER">Launch Browser</option>
                <option value="CLICK">Click</option>
                <option value="ENTERTEXT">Enter Text</option>
                <option value="SELECTDROPDOWN">Select Dropdown</option>
                <option value="VERIFYTEXT">Verify Text</option>
                <option value="NAVIGATETO">Navigate To</option>
              </select>
            </div>

            <DialogFooter className="mt-3.5">
              <Button onClick={() => setShowTestCaseModal(false)} variant="outline" className="btn-secondary text-[11px] px-2 py-1 h-auto leading-tight">Cancel</Button>
              <Button onClick={handleCreateTestCase} className="btn-primary text-[11px] px-2 py-1 h-auto leading-tight">Create</Button>
            </DialogFooter>
          </DialogContent>

                  </Dialog>
                </div>

      <div className="space-y-0.5">
        {testCases.map((tc) => (
          <div
            key={tc.TestCaseID}
            className={`test-case-item text-[11px] py-1 px-1.5 ${selectedTestCase?.TestCaseID === tc.TestCaseID ? 'active' : ''}`}
            onClick={() => onTestCaseSelect(tc)}
          >
            <div className="font-medium truncate" title={tc.TestCaseName}>
              {tc.TestCaseName}
            </div>
          </div>
        ))}
        {!selectedRun && <p className="text-[11px] text-gray-500">Select a run to see test cases.</p>}
        {selectedRun && testCases.length === 0 && <p className="text-[11px] text-gray-500">No test cases for this run.</p>}
      </div>
    </div>
  );
};

export default TestCaseExplorer;