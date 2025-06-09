import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import * as api from '@/services/api';

const TestCaseExplorer = ({ selectedRelease, onRunSelect, onTestCaseSelect, selectedRun, selectedTestCase, panelRef }) => {
  const [runs, setRuns] = useState([]);
  const [testCases, setTestCases] = useState([]);
  const [showRunModal, setShowRunModal] = useState(false);
  const [showTestCaseModal, setShowTestCaseModal] = useState(false);
  const [newRunName, setNewRunName] = useState('');
  const [newTestCaseName, setNewTestCaseName] = useState('');
  const { toast } = useToast();

  const projectId = selectedRelease?.ProjectID;
  const releaseId = selectedRelease?.ReleaseID;

  useEffect(() => {
    const fetchRuns = async () => {
      if (projectId && releaseId) {
        try {
          const data = await api.getRunsByReleaseId(projectId, releaseId);
          setRuns(data.map((r) => ({ ...r, testCases: [], testCasesLoaded: false })));
        } catch (error) {
          toast({ title: 'Error fetching runs', description: error.message, variant: 'destructive' });
          setRuns([]);
        }
      } else {
        setRuns([]);
      }
      setTestCases([]);
    };

    fetchRuns();
  }, [projectId, releaseId, toast]);

  useEffect(() => {
    const fetchTestCases = async () => {
      if (selectedRun?.RunID) {
        try {
          const runId= selectedRun.RunID;
          const data = await api.getTestCasesByRunId(projectId,releaseId, runId);
          setTestCases(data);
        } catch (error) {
          toast({ title: 'Error fetching test cases', description: error.message, variant: 'destructive' });
          setTestCases([]);
        }
      } else {
        setTestCases([]);
      }
    };

    fetchTestCases();
  }, [selectedRun, projectId, releaseId, toast]);

  const handleCreateRun = async () => {
    if (newRunName.trim() && projectId && releaseId) {
      try {
        await api.createRun(releaseId, { RunName: newRunName }, projectId);
        toast({ title: 'Success', description: 'Run created successfully!' });
        setNewRunName('');
        setShowRunModal(false);
        const data = await api.getRunsByReleaseId(projectId, releaseId);
        setRuns(data.map((r) => ({ ...r, testCases: [], testCasesLoaded: false })));
      } catch (error) {
        toast({ title: 'Error creating run', description: error.message, variant: 'destructive' });
      }
    }
  };

  const handleCreateTestCase = async () => {
    if (!newTestCaseName.trim() || !selectedRun?.RunID || !projectId || !releaseId) {
      toast({ title: 'Error', description: 'Test case name and required IDs are missing', variant: 'destructive' });
      return;
    }

    const testCaseData = {
      TestCaseName: newTestCaseName,
      RunID: selectedRun.RunID,
      ProjectID: projectId,
      ReleaseID: releaseId
    };

    try {
      await api.createTestCase(testCaseData);
      toast({ title: 'Success', description: 'Test case created successfully!' });
      setNewTestCaseName('');
      setShowTestCaseModal(false);
      const runId = selectedRun.RunID;
      const data = await api.getTestCasesByRunId(projectId, releaseId,runId );
      setTestCases(data);
    } catch (error) {
      toast({ title: 'Error creating test case', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <div className="p-2 md:p-2.5 scrollbar overflow-y-auto h-full" ref={panelRef}>
      <div className="flex items-center justify-between mb-2.5">
        <h2 className="text-[11px] font-semibold text-white uppercase">Runs</h2>
        <Dialog open={showRunModal} onOpenChange={setShowRunModal}>
          <DialogTrigger asChild>
            <Button size="xs" className="btn-primary text-[11px] px-1.5 py-0.5 h-auto leading-tight" disabled={!selectedRelease}>
              + Add
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
              <Label htmlFor="runName" className="text-white text-[11px]">Run Name</Label>
              <Input id="runName" value={newRunName} onChange={(e) => setNewRunName(e.target.value)} className="input-field mt-0.5 text-[11px]" placeholder="Enter run name" type="text" required />
            </div>
            <DialogFooter className="mt-3.5">
              <Button onClick={() => setShowRunModal(false)} variant="outline" className="btn-secondary text-[11px] px-2 py-1 h-auto leading-tight">Cancel</Button>
              <Button onClick={handleCreateRun} className="btn-primary text-[11px] px-2 py-1 h-auto leading-tight">Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-0.5 mb-3.5">
        {selectedRelease ? (
          runs.length > 0 ? (
            runs.map((run) => (
              <div key={run.RunID} className={`test-case-item text-[11px] py-1 px-1.5 ${selectedRun?._id === run._id ? 'active' : ''}`} onClick={() => onRunSelect(run)}>
                <div className="font-medium truncate" title={run.RunName}>{run.RunName}</div>
              </div>
            ))
          ) : (
            <p className="text-[11px] text-gray-500">No runs for this release.</p>
          )
        ) : (
          <p className="text-[11px] text-gray-500">Select a release to see runs.</p>
        )}
      </div>

      <div className="flex items-center justify-between mb-2.5">
        <h2 className="text-[11px] font-semibold text-white uppercase">Test Cases</h2>
        <Dialog open={showTestCaseModal} onOpenChange={setShowTestCaseModal}>
          <DialogTrigger asChild>
            <Button size="xs" className="btn-primary text-[11px] px-1.5 py-0.5 h-auto leading-tight" disabled={!selectedRun}>
              + Add
            </Button>
          </DialogTrigger>
          <DialogContent className="modal-content sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white text-base">Create Test Case</DialogTitle>
              <DialogDescription className="text-sm text-gray-400">
                Enter test case name to create one under selected run.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2.5">
              <Label className="text-white text-[11px]">Test Case Name</Label>
              <Input value={newTestCaseName} onChange={(e) => setNewTestCaseName(e.target.value)} placeholder="Enter test case name" className="input-field text-[11px]" />
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
          <div key={tc.TestCaseID} className={`test-case-item text-[11px] py-1 px-1.5 ${selectedTestCase?._id === tc._id ? 'active' : ''}`} onClick={() => onTestCaseSelect(tc)}>
            <div className="font-medium truncate" title={tc.TestCaseName}>{tc.TestCaseName}</div>
          </div>
        ))}
        {!selectedRun && <p className="text-[11px] text-gray-500">Select a run to see test cases.</p>}
        {selectedRun && testCases.length === 0 && <p className="text-[11px] text-gray-500">No test cases for this run.</p>}
      </div>
    </div>
  );
};

export default TestCaseExplorer;
