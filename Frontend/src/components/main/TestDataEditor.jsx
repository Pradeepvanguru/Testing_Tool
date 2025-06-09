import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Code, Plus, Play, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import * as api from '@/services/api';

const DEFAULT_ROWS = 0;

const TestDataEditor = ({ selectedTestCase, onRunTest }) => {
  const [testSteps, setTestSteps] = useState([]);
  const [editingCell, setEditingCell] = useState(null); 
  const [editBuffer, setEditBuffer] = useState({});
  const { toast } = useToast();

   

  const locatorTypes = [
    'id', 'className', 'cssSelector', 'xpath', 'linkText',
    'name', 'partialLinkText', 'tagName', 'NA'
  ];

  const browserActions = [
    'OPEN_BROWSER', 'CLOSE_BROWSER', 'CLOSE', 'ENTER_URL', 'WAIT',
    'IMPLICITLYWAIT', 'EXPLICITWAIT', 'ENTER', 'ISDISPLAYED', 'CLICK',
    'VERIFYTEXT', 'NAVIGATION_TO', 'NAVIGATE_BACK', 'NAVIGATE_FORWARD',
    'NAVIGATE_REFRESH', 'RIGHT_CLICK', 'DOUBLE_CLICK', 'SELECTBYVISIBILETEXT',
    'SELECTBYVALUE', 'SELECTBYINDEX', 'ALERT_WITH_OK', 'ALERT_CONFIRMBOX_WITH_OK',
    'ALERT_CONFIRMBOX_WITH_CANCEL', 'MOUSE_HOVER', 'MOUSE_HOVER_CLICK',
    'DRAG', 'DROP', 'FRAME', 'WINDOW_HANDLES_TO_CHILD', 'SCREENSHOT',
    'ELEMENT_SCREENSHOT'
  ];

  const executionStatuses = ['PASS', 'FAIL', 'BLOCKED', 'NOT RUN'];

  const initializeDefaultSteps = () => {
    const defaultSteps = [];
    for (let i = 0; i < DEFAULT_ROWS; i++) {
      defaultSteps.push({ 
        _id: `default-${i}`, 
        isDefault: true,
        stepNumber: i + 1,
        description: '',
        testSteps: '',
        expectedResult: '',
        actualResult: '',
        locatorType: 'NA',
        locatorValue: '',
        browserActions: 'CLICK',
        testdata: '',
        executionStatus: 'NOT RUN'
      });
    }
    setTestSteps(defaultSteps);
  };

  const fetchTestSteps = async () => {
  if (selectedTestCase?.TestCaseID) {
    const ProjectID = selectedTestCase.projectID || selectedTestCase.ProjectID;
    const ReleaseID = selectedTestCase.releaseID || selectedTestCase.ReleaseID;
    const RunID = selectedTestCase.runID || selectedTestCase.RunID;
    const TestCaseID = selectedTestCase.TestCaseID;

    // Log values to debug
    // console.log("Fetching Test Steps for:", { ProjectID, ReleaseID, RunID, TestCaseID });

    try {
      const data = await api.getTestStepsByTestCaseId(ProjectID, ReleaseID, RunID, TestCaseID);
      
      
      if (!data || (data?.steps || []) || data.steps.length === 0) {
        // initializeDefaultSteps();
      } else {
        const transformedSteps = data.steps.map((step, index) => ({
          ...step,
          _id: step._id || `step-${index}`,
          isDefault: false,
          stepNumber: index + 1
        }));
        setTestSteps(transformedSteps);
      }
    } catch (error) {
      toast({
        title: "Error fetching test steps",
        description: error.message || "Something went wrong",
        variant: "destructive"
      });
      initializeDefaultSteps();
    }
  } else {
    setTestSteps([]);
  }
};


  useEffect(() => {
    fetchTestSteps();
  }, [selectedTestCase]);

  const handleAddTestStep = () => {
    const newStep = {
      _id: `new-${Date.now()}`,
      isDefault: false,
      stepNumber: testSteps.filter(s => !s.isDefault).length + 1,
      description: '',
      testSteps: 'New Step',
      expectedResult: 'Expected result',
      actualResult: '',
      locatorType: 'NA',
      locatorValue: '',
      browserActions: 'CLICK',
      testdata: '',
      executionStatus: 'NOT RUN'
    };
    
    setTestSteps(prev => [...prev, newStep]);
    toast({ title: "Info", description: "New step added. Remember to save!" });
  };

  const handleDeleteTestStep = (stepId, isDefaultStep) => {
    if (isDefaultStep) {
      setTestSteps(prev => prev.filter(s => s._id !== stepId));
      toast({title: "Info", description: "Default row removed from view."});
      return;
    }
    
    setTestSteps(prev => prev.filter(s => s._id !== stepId));
    toast({ title: "Info", description: "Step removed. Remember to save!" });
  };

 

  const handleSaveTestSteps = async () => {
    if (!selectedTestCase?.TestCaseID) {
      toast({ title: "Error", description: "No test case selected", variant: "destructive" });
      return;
    }

    const validSteps = testSteps.filter(step => 
      !step.isDefault && 
      (step.testSteps?.trim() || step.expectedResult?.trim())
    );

    if (validSteps.length === 0) {
      toast({ title: "Warning", description: "No valid steps to save", variant: "destructive" });
      return;
    }

    const testCaseData = {
      ProjectID: selectedTestCase.projectID || selectedTestCase.ProjectID,
      ReleaseID: selectedTestCase.releaseID || selectedTestCase.ReleaseID,
      RunID: selectedTestCase.runID || selectedTestCase.RunID,
      TestCaseID: selectedTestCase.TestCaseID,
      TestCaseName: selectedTestCase.TestCaseName,
      steps: validSteps.map(step => ({
        description: step.description || '',
        testSteps: step.testSteps || '',
        expectedResult: step.expectedResult || '',
        actualResult: step.actualResult || '',
        locatorType: step.locatorType || 'NA',
        locatorValue: step.locatorValue || '',
        browserActions: step.browserActions || 'CLICK',
        testdata: step.testdata || '',
        executionStatus: step.executionStatus || 'NOT RUN'
      }))
    };

    try {
      await api.saveTestCaseWithSteps(testCaseData);
      toast({ title: "Success", description: "Test steps saved successfully!" });
      fetchTestSteps();
    } catch (error) {
      toast({ title: "Error saving test steps", description: error.message, variant: "destructive" });
    }
  };

   const handleCellEdit = (stepId, field, value) => {
    setEditBuffer(prev => ({ ...prev, [stepId]: { ...prev[stepId], [field]: value } }));
    setTestSteps(prevSteps => prevSteps.map(step => 
        step._id === stepId ? {...step, [field]: value, isDefault: false } : step
    ));
  };

  const startEditing = (stepId, field, currentValue) => {
    setEditingCell(`${stepId}-${field}`);
    setEditBuffer(prev => ({ ...prev, [stepId]: { ...prev[stepId], [field]: currentValue } }));
  };

  const stopEditing = () => {
    setEditingCell(null);
  };

  const renderDropdownCell = (step, field, options) => {
    if (editingCell === `${step._id}-${field}`) {
      return (
        <Select
          value={editBuffer[step._id]?.[field] ?? step[field]}
          onValueChange={(value) => handleCellEdit(step._id, field, value)}
          onOpenChange={(open) => { if (!open) stopEditing(); }}
        >
          <SelectTrigger className="h-6 text-[8px] md:text-xs bg-gray-700 border-gray-600 overflow-hidden">
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem
                key={option}
                value={option}
                className="text-[8px] md:text-xs text-black hover:bg-gray-100 "
              >
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    return (
      <span
        className="cursor-pointer hover:bg-[#2a2d2e] p-0.5 rounded block w-full min-h-[1.25em]"
        onClick={() => startEditing(step._id, field, step[field])}
      >
        {step[field] || <span className="text-gray-500 italic text-[10px]">Click to select...</span>}
      </span>
    );
  };

  const renderInputCell = (step, field, placeholder = '') => {
    if (editingCell === `${step._id}-${field}`) {
      return (
        <Input
          value={editBuffer[step._id]?.[field] ?? step[field]}
          onChange={(e) => handleCellEdit(step._id, field, e.target.value)}
          onBlur={stopEditing}
          onKeyPress={(e) => { if (e.key === 'Enter') stopEditing(); }}
          className="input-field text-[11px] md:text-xs p-0.5 h-auto w-full bg-gray-700 min-h-[1.25em]"
          placeholder={placeholder}
          autoFocus
        />
      );
    }

    return (
      <span
        className="cursor-pointer hover:bg-[#2a2d2e] p-0.5 rounded block w-full min-h-[1.25em] overflow-hidden"
        onClick={() => startEditing(step._id, field, step[field])}
      >
        {step[field] || <span className="text-gray-500 italic text-[10px]">{placeholder || 'Click to add...'}</span>}
      </span>
    );
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
        <p className="text-xs  font-semibold text-white truncate " title={selectedTestCase.TestCaseName}>
         Test Steps :<span className="text-yellow-600 text-xs"> {selectedTestCase.TestCaseName}</span> 
       </p>
        <div className="flex space-x-2">
        
        <Button onClick={onRunTest} className="bg-yellow-800 hover:bg-orange-700 text-white text-[11px] md:text-xs px-1.5 py-0.5 h-auto">
          <Play className="w-3 h-3 mr-1"/> Run  
        </Button>
      
          <Button onClick={handleAddTestStep} className="btn-primary text-[11px] md:text-xs px-1.5 py-0.5 h-auto">
            <Plus className="w-2.5 h-2.5 mr-0.5"/> Step
          </Button>
          <Button onClick={handleSaveTestSteps} className="bg-green-800 hover:bg-green-700 text-white text-[11px] md:text-xs px-1.5 py-0.5 h-auto">
            <Save className="w-2.5 h-2.5 mr-0.5"/> Save
          </Button>
        </div>
      </div>

      <div className="table-container flex-1 overflow-auto scrollbar">
        <div className="table-header grid grid-cols-9 sticky top-0 z-10">
          <div className="table-cell font-semibold text-white text-[11px] md:text-xs">Sl No</div>
          <div className="table-cell font-semibold text-white text-[11px] md:text-xs">Description</div>
          <div className="table-cell font-semibold text-white text-[11px] md:text-xs">Test Steps</div>
          <div className="table-cell font-semibold text-white text-[11px] md:text-xs">Expected Result</div>
          <div className="table-cell font-semibold text-white text-[11px] md:text-xs">Locator Type</div>
          <div className="table-cell font-semibold text-white text-[11px] md:text-xs">Locator Value</div>
          <div className="table-cell font-semibold text-white text-[11px] md:text-xs">Browser Actions</div>
          <div className="table-cell font-semibold text-white text-[11px] md:text-xs">Test Data</div>
          <div className="table-cell font-semibold text-white text-[11px] md:text-xs">Actions</div>
        </div>  

        {testSteps.length === 0 && (
          <p className="text-center text-xs text-gray-500 py-3">
            No test steps yet. Add one or start typing in default rows!
          </p>
        )}

        
        {testSteps.map((step, index) => (
          <div key={step._id} className="table-row grid grid-cols-9">
            <div className="table-cell text-[11px] md:text-xs">{step.stepNumber || index + 1}</div>
            
            <div className="table-cell text-[11px] md:text-xs">
              {renderInputCell(step, 'description', 'Describe step...') || step.description}
            </div>
            
            <div className="table-cell text-[11px] md:text-xs">
              {renderInputCell(step, 'testSteps', 'Test step details...') || step.testSteps}
            </div>
            
            <div className="table-cell text-[11px] md:text-xs">
              {renderInputCell(step, 'expectedResult', 'Expected outcome...') || step.expectedResult}
            </div>
            
            <div className="table-cell text-[11px] md:text-xs overflow-auto">
              {renderDropdownCell(step, 'locatorType', locatorTypes) || step.locatorType}
            </div>
            
            <div className="table-cell text-[11px] md:text-xs">
              {renderInputCell(step, 'locatorValue', 'Locator value...') || step.locatorValue}
            </div>
            
            <div className="table-cell text-[11px] md:text-xs overflow-auto  scrollbar-track scrollbar-thumb-gray-600 scrollbar-thumb-rounded">
              {renderDropdownCell(step, 'browserActions', browserActions) || step.browserActions}
            </div>
            
            <div className="table-cell text-[11px] md:text-xs">
              {renderInputCell(step, 'testdata', 'Test data...') || step.testdata}
            </div>
            
            <div className="table-cell">
              <div className="flex space-x-0.5">
                <button
                  onClick={() => startEditing(step._id, 'testSteps', step.testSteps)}
                  className="icon-button p-0.5"
                  title="Edit"
                >
                  <Edit className="w-2   h-2" />
                </button>
                <button
                  onClick={() => handleDeleteTestStep(step._id, step.isDefault)}
                  className="icon-button p-0.5 hover:text-red-400"
                  title="Delete"
                >
                  <Trash2 className="w-2 h-2 " />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestDataEditor;