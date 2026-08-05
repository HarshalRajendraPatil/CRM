import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { updateLeadStatus, getProjectLeads } from '../../../store/leadSlice';
import { getProjectPipelines, clearPipelines } from '../../../store/projectSlice';
import { useNavigate } from 'react-router-dom';
import { 
  CheckSquare, Square, Mail, Briefcase, Tag as TagIcon, 
  MoreHorizontal, ChevronRight, GripVertical
} from 'lucide-react';

const LeadKanban = ({ projectId }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { leads, isLoading } = useSelector((state) => state.leads);
  const { pipelines, currentProjectId } = useSelector((state) => state.projects);
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [optimisticLeads, setOptimisticLeads] = useState([]);

  useEffect(() => {
    if (projectId && projectId !== currentProjectId) {
      dispatch(clearPipelines());
      dispatch(getProjectPipelines(projectId));
    }
    dispatch(getProjectLeads({ projectId }));
  }, [dispatch, projectId, currentProjectId]);

  const leadPipeline = pipelines?.filter(p => p.type === 'lead') || [];
  const defaultPipeline = leadPipeline.find(p => p.isDefault) || leadPipeline[0];
  const dynamicStages = defaultPipeline?.stages || [];

  const stages = dynamicStages.length > 0 ? dynamicStages.slice().sort((a,b) => a.order - b.order).map(stage => ({
    id: stage._id,
    name: stage.name,
    color: stage.color || '#6366f1' // indigo-500
  })) : [];

  const firstStageId = stages.length > 0 ? stages[0].id : null;

  useEffect(() => {
    setOptimisticLeads(leads);
  }, [leads]);

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;
    if (source.droppableId === destination.droppableId) return;

    const newStatus = destination.droppableId;
    const leadId = draggableId;
    const leadToUpdate = optimisticLeads.find(lead => lead._id === leadId);
    if (!leadToUpdate) return;

    const updatedLead = { ...leadToUpdate, status: newStatus, stage: newStatus };
    const newOptimisticLeads = optimisticLeads.map(lead =>
      lead._id === leadId ? updatedLead : lead
    );
    setOptimisticLeads(newOptimisticLeads);

    try {
      await dispatch(updateLeadStatus({ projectId, id: leadId, status: newStatus })).unwrap();
    } catch (error) {
      console.error('Failed to update lead status:', error);
      setOptimisticLeads(leads);
    }
  };

  const getLeadsByStage = (stageId) => {
    return optimisticLeads.filter(lead => {
      const status = lead.stage || lead.status;
      const matchesStage = status === stageId;
      if (matchesStage) return true;
      const isUnmapped = !stages.some(s => s.id === status);
      return isUnmapped && stageId === firstStageId;
    });
  };

  const handleLeadSelect = (e, leadId) => {
    e.stopPropagation();
    setSelectedLeads(prev =>
      prev.includes(leadId) ? prev.filter(id => id !== leadId) : [...prev, leadId]
    );
  };

  const handleSelectAll = () => {
    if (selectedLeads.length === optimisticLeads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(optimisticLeads.map(lead => lead._id));
    }
  };

  const handleBulkStatusUpdate = async (newStatus) => {
    try {
      for (const leadId of selectedLeads) {
        await dispatch(updateLeadStatus({ projectId, id: leadId, status: newStatus })).unwrap();
      }
      setSelectedLeads([]);
      setShowBulkActions(false);
    } catch (error) {
      console.error('Failed to update leads:', error);
    }
  };

  const LeadCard = ({ lead, index }) => {
    const isSelected = selectedLeads.includes(lead._id);
    
    return (
      <Draggable draggableId={lead._id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            onClick={() => navigate(`/crm/${projectId}/leads/${lead._id}`)}
            className={`group bg-white rounded-xl border p-4 mb-3 cursor-pointer transition-all duration-200
              ${snapshot.isDragging ? 'shadow-xl ring-2 ring-indigo-500/50 scale-[1.02] rotate-1 z-50' : 'shadow-sm hover:shadow-md hover:border-indigo-300'}
              ${isSelected ? 'border-indigo-500 ring-1 ring-indigo-500 bg-indigo-50/10' : 'border-slate-200'}
            `}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => handleLeadSelect(e, lead._id)}
                  className={`flex-shrink-0 transition-colors ${isSelected ? 'text-indigo-600' : 'text-slate-300 hover:text-slate-400 opacity-0 group-hover:opacity-100'}`}
                >
                  {isSelected ? <CheckSquare size={18} /> : <Square size={18} />}
                </button>
                <h4 className="font-semibold text-slate-800 truncate" title={lead.name}>
                  {lead.name}
                </h4>
              </div>
              <GripVertical size={16} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            <div className="space-y-2 mb-3">
              {lead.email && (
                <div className="flex items-center text-xs text-slate-500">
                  <Mail size={12} className="mr-1.5" />
                  <span className="truncate">{lead.email}</span>
                </div>
              )}
              {lead.jobTitle && (
                <div className="flex items-center text-xs text-slate-500">
                  <Briefcase size={12} className="mr-1.5" />
                  <span className="truncate">{lead.jobTitle}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center">
                {lead.assignedTo ? (
                  <div 
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-sm"
                    style={{ backgroundColor: '#6366f1' }}
                    title={`Assigned to: ${lead.assignedTo.name}`}
                  >
                    {lead.assignedTo.name.charAt(0).toUpperCase()}
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full border border-dashed border-slate-300 flex items-center justify-center text-slate-400 bg-slate-50 text-[10px]" title="Unassigned">
                    ?
                  </div>
                )}
                {lead.score > 0 && (
                  <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] font-semibold
                    ${lead.score >= 75 ? 'bg-emerald-100 text-emerald-700' : 
                      lead.score >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}
                  >
                    ★ {lead.score}
                  </span>
                )}
              </div>

              {lead.tags?.length > 0 && (
                <div className="flex items-center text-slate-400">
                  <TagIcon size={12} className="mr-1" />
                  <span className="text-[10px] font-medium">{lead.tags.length}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </Draggable>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Dynamic grid cols based on stage count (max 5 for tailwind default, though we can use flex)
  return (
    <div className="h-[calc(100vh-200px)] flex flex-col">
      {/* Header with bulk actions */}
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSelectAll}
              className={`flex items-center justify-center transition-colors ${selectedLeads.length === optimisticLeads.length && optimisticLeads.length > 0 ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {selectedLeads.length === optimisticLeads.length && optimisticLeads.length > 0 ? <CheckSquare size={20} /> : <Square size={20} />}
            </button>
            <span className="text-sm font-medium text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
              {selectedLeads.length} selected
            </span>
          </div>
        </div>

        {selectedLeads.length > 0 && (
          <div className="flex items-center gap-2 relative">
            <button
              onClick={() => setShowBulkActions(!showBulkActions)}
              className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm flex items-center"
            >
              Move {selectedLeads.length} leads <ChevronRight size={16} className={`ml-2 transition-transform ${showBulkActions ? 'rotate-90' : ''}`} />
            </button>
            {showBulkActions && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden py-1">
                <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50 border-b border-slate-100">
                  Move to Stage
                </div>
                {stages.map(stage => (
                  <button
                    key={stage.id}
                    onClick={() => handleBulkStatusUpdate(stage.id)}
                    className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors flex items-center"
                  >
                    <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: stage.color }}></div>
                    {stage.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Kanban Board Container */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-6 h-full items-start pb-4 px-1" style={{ minWidth: 'min-content' }}>
            {stages.map(stage => {
              const columnLeads = getLeadsByStage(stage.id);
              return (
                <div key={stage.id} className="flex flex-col w-80 h-full flex-shrink-0">
                  {/* Column Header */}
                  <div className="flex items-center justify-between mb-4 px-1">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: stage.color }}></div>
                      <h3 className="font-semibold text-slate-800">{stage.name}</h3>
                    </div>
                    <span className="bg-slate-200 text-slate-700 py-0.5 px-2.5 rounded-full text-xs font-semibold">
                      {columnLeads.length}
                    </span>
                  </div>

                  {/* Droppable Area */}
                  <Droppable droppableId={stage.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 overflow-y-auto rounded-2xl p-3 transition-colors duration-200 
                          ${snapshot.isDraggingOver ? 'bg-indigo-50/50 ring-2 ring-indigo-200 ring-inset' : 'bg-slate-100/50'}`}
                      >
                        {columnLeads.map((lead, index) => (
                          <LeadCard key={lead._id} lead={lead} index={index} />
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
};

export default LeadKanban;

