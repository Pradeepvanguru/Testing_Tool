import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Code, Plus, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import * as api from '@/services/api';

const DEFAULT_ROWS = 5;

const TestDataEditor = ({ selectedTestCase, onRunTest }) => {
  const [testSteps, setTestSteps] = useState([]);
  const [editingCell, setEditingCell] = useState(null); 
  const [editBuffer, setEditBuffer] = useState({});
  const { toast } = useToast();

  const initializeDefaultSteps = () => {
    const defaultSteps = [];
    for (let i = 0; i < DEFAULT_ROWS; i++) {
      defaultSteps.push({ 
        _id: `default-${i}`, 
        isDefault: true,
        stepNumber: i + 1,
        testStep: '',
        expectedResult: '',
        actualResult: 'Pending',
        status: 'Pending'
      });
    }
    setTestSteps(defaultSteps);
  };

  const fetchTestSteps = async () => {
    // console.log(selectedTestCase?.TestCaseID, "selectedTestCase?.TestCaseID");
    if (selectedTestCase?.TestCaseID) {

      try {
        const data = await api.getTestStepsByTestCaseId(selectedTestCase.TestCaseID);
        if (data.length === 0) {
          initializeDefaultSteps();
        } else {
          setTestSteps(data.map(step => ({...step, isDefault: false})));
        }
      } catch (error) {
        toast({ title: "Error fetching test steps", description: error.message, variant: "destructive" });
        setTestSteps([]);
      }
    } else {
      setTestSteps([]);
    }
  };

  useEffect(() => {
    fetchTestSteps();
  }, [selectedTestCase]);

  const handleAddTestStep = async () => {
    if (!selectedTestCase?.TestCaseID) return;

    const actualSteps = testSteps.filter(s => !s.isDefault);
    const newStepData = {
      testCaseId: selectedTestCase._id,
      stepNumber: actualSteps.length + 1,
      testStep: 'New Step',
      expectedResult: 'Expected result',
      actualResult: 'Pending',
      status: 'Pending'
    };
    try {
      await api.createTestStep(selectedTestCase._id, newStepData);
      toast({ title: "Success", description: "Test step added." });
      fetchTestSteps();
    } catch (error) {
      toast({ title: "Error adding step", description: error.message, variant: "destructive" });
    }
  };

  const handleDeleteTestStep = async (stepId, isDefaultStep) => {
    if (isDefaultStep) {
       setTestSteps(prev => prev.filter(s => s._id !== stepId || !s.isDefault));
       toast({title: "Info", description: "Default row removed from view."});
       return;
    }
    try {
      await api.deleteTestStep(stepId);
      toast({ title: "Success", description: "Test step deleted." });
      fetchTestSteps();
    } catch (error) {
      toast({ title: "Error deleting step", description: error.message, variant: "destructive" });
    }
  };

  const handleCellEdit = (stepId, field, value) => {
    setEditBuffer(prev => ({ ...prev, [stepId]: { ...prev[stepId], [field]: value } }));
    setTestSteps(prevSteps => prevSteps.map(step => 
        step._id === stepId ? {...step, [field]: value, isDefault: false } : step
    ));
  };

  const saveCellEdit = async (stepId, field) => {
    const stepToUpdate = testSteps.find(s => s._id === stepId);
    if (!stepToUpdate || stepToUpdate.isDefault) {
        if (stepToUpdate && (stepToUpdate.testStep?.trim() || stepToUpdate.expectedResult?.trim())) {
            // If a default row has content, treat it as a new step to be created
            const newStepData = {
                testCaseId: selectedTestCase._id,
                stepNumber: testSteps.filter(s => !s.isDefault).length + 1, // Recalculate based on actual steps
                testStep: stepToUpdate.testStep,
                expectedResult: stepToUpdate.expectedResult,
                actualResult: stepToUpdate.actualResult,
                status: stepToUpdate.status
            };
            try {
                await api.createTestStep(selectedTestCase.TestCaseID, newStepData);
                toast({ title: "Success", description: "New test step saved." });
                fetchTestSteps(); // Re-fetch to get proper _id and update UI
            } catch (error) {
                toast({ title: "Error saving new step", description: error.message, variant: "destructive" });
            }
        }
        setEditingCell(null);
        setEditBuffer(prev => { const newBuffer = { ...prev }; delete newBuffer[stepId]; return newBuffer; });
        return;
    }

    const updatedData = { ...stepToUpdate, [field]: editBuffer[stepId]?.[field] ?? stepToUpdate[field] };
    const { _id, createdAt, updatedAt, __v, isDefault, ...payload } = updatedData;

    try {
      await api.updateTestStep(stepId, payload);
      toast({ title: "Success", description: "Test step updated." });
      fetchTestSteps();
    } catch (error) {
      toast({ title: "Error updating step", description: error.message, variant: "destructive" });
    } finally {
      setEditingCell(null);
      setEditBuffer(prev => { const newBuffer = { ...prev }; delete newBuffer[stepId]; return newBuffer; });
    }
  };
  

  const startEditing = (stepId, field, currentValue) => {
    setEditingCell(`${stepId}-${field}`);
    setEditBuffer(prev => ({ ...prev, [stepId]: { ...prev[stepId], [field]: currentValue } }));
  };


  if (!selectedTestCase) {
    return (
      <div className="main-content flex-1 p-2 md:p-3 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <Code className="w-10 h-10 md:w-14 md:h-14 mx-auto mb-2 md:mb-3 opacity-50" />
          <p className="text-sm md:text-base mb-1">Select a Test Case</p>
          <p className="text-xs">Choose a project, release, run, and then a test case to view its steps.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content flex-1 p-2 md:p-3 flex flex-col h-full">
      <div className="flex items-center justify-between mb-2 md:mb-3">
        <h2 className="text-sm md:text-base font-semibold text-white truncate" title={selectedTestCase.TestCaseName}>
          {selectedTestCase.TestCaseName}
        </h2>
        <Button onClick={handleAddTestStep} className="btn-primary text-[11px] md:text-xs px-1.5 py-0.5 h-auto">
          <Plus className="w-2.5 h-2.5 mr-0.5"/> Add Step
        </Button>
      </div>

      <div className="table-container flex-1 overflow-auto scrollbar">
        <div className="table-header grid grid-cols-5 sticky top-0 z-10">
          <div className="table-cell font-semibold text-white text-[11px] md:text-xs">Step #</div>
          <div className="table-cell font-semibold text-white text-[11px] md:text-xs">Test Step</div>
          <div className="table-cell font-semibold text-white text-[11px] md:text-xs">Expected Result</div>
          <div className="table-cell font-semibold text-white text-[11px] md:text-xs">Actual Result</div>
          <div className="table-cell font-semibold text-white text-[11px] md:text-xs">Actions</div>
        </div>

        {testSteps.length === 0 && selectedTestCase?.TestCaseID && !testSteps.some(s => s.isDefault) && (
            <p className="text-center text-xs text-gray-500 py-3">No test steps yet. Add one or start typing in default rows!</p>
        )}
        
        {testSteps.map((step, index) => (
          <div key={step.TestCaseID} className="table-row grid grid-cols-5">
            <div className="table-cell text-[11px] md:text-xs">{step.stepNumber || index + 1}</div>
            {[ 'testStep', 'expectedResult', 'actualResult'].map(field => (
              <div key={field} className="table-cell text-[11px] md:text-xs">
                {editingCell === `${step._id}-${field}` ? (
                  <Input
                    value={editBuffer[step._id]?.[field] ?? step[field]}
                    onChange={(e) => handleCellEdit(step._id, field, e.target.value)}
                    onBlur={() => saveCellEdit(step._id, field)}
                    onKeyPress={(e) => { if (e.key === 'Enter') saveCellEdit(step._id, field); }}
                    className="input-field text-[11px] md:text-xs p-0.5 h-auto w-full bg-gray-700"
                    placeholder={step.isDefault ? (field === 'testStep' ? 'Describe step...' : 'Expected outcome...') : ''}
                    autoFocus
                  />
                ) : (
                  <span
                    className="cursor-pointer hover:bg-[#2a2d2e] p-0.5 rounded block w-full min-h-[1.25em]"
                    onClick={() => startEditing(step._id, field, step[field])}
                  >
                    {step[field] || <span className="text-gray-500 italic text-[10px]"> {step.isDefault ? (field === 'testStep' ? 'Click to add step...' : 'Click to add expected...') : 'N/A'}</span>}
                  </span>
                )}
              </div>
            ))}
            <div className="table-cell">
              <div className="flex space-x-0.5">
                <button
                  onClick={() => startEditing(step._id, 'testStep', step.testStep)}
                  className="icon-button p-0.5"
                  title="Edit"
                >
                  <Edit className="w-2.5 h-2.5" />
                </button>
                <button
                  onClick={() => handleDeleteTestStep(step._id, step.isDefault)}
                  className="icon-button p-0.5 hover:text-red-400"
                  title="Delete"
                >
                  <Trash2 className="w-2.5 h-2.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="pt-2 md:pt-3 border-t border-[#3e3e42]">
        <Button onClick={onRunTest} className="btn-primary text-[11px] md:text-xs px-2 py-1 h-auto w-full">
          <Play className="w-3 h-3 mr-1"/> Run Test Case Steps
        </Button>
      </div>
    </div>
  );
};

export default TestDataEditor;