import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import projectService from '../services/projectService';

// Initial state
const initialState = {
  projects: [],
  project: null,
  pipelines: [],
  pipeline: null,
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: ''
};

// Get all projects for current user
export const getMyProjects = createAsyncThunk(
  'projects/getMyProjects',
  async (_, thunkAPI) => {
    try {
      return await projectService.getMyProjects();
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch projects';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get project by ID
export const getProjectById = createAsyncThunk(
  'projects/getProjectById',
  async (id, thunkAPI) => {
    try {
      return await projectService.getProjectById(id);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch project';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create new project
export const createProject = createAsyncThunk(
  'projects/createProject',
  async (projectData, thunkAPI) => {
    try {
      return await projectService.createProject(projectData);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to create project';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update project
export const updateProject = createAsyncThunk(
  'projects/updateProject',
  async ({ id, projectData }, thunkAPI) => {
    try {
      return await projectService.updateProject(id, projectData);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to update project';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete project
export const deleteProject = createAsyncThunk(
  'projects/deleteProject',
  async (id, thunkAPI) => {
    try {
      return await projectService.deleteProject(id);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to delete project';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get pipelines for a project
export const getProjectPipelines = createAsyncThunk(
  'projects/getProjectPipelines',
  async (projectId, thunkAPI) => {
    try {
      const response = await projectService.getProjectPipelines(projectId);
      return response;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch pipelines';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get pipeline by ID
export const getPipelineById = createAsyncThunk(
  'projects/getPipelineById',
  async ({ projectId, pipelineId }, thunkAPI) => {
    try {
      return await projectService.getPipelineById(projectId, pipelineId);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch pipeline';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create pipeline
export const createPipeline = createAsyncThunk(
  'projects/createPipeline',
  async ({ projectId, pipelineData }, thunkAPI) => {
    try {
      return await projectService.createPipeline(projectId, pipelineData);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to create pipeline';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update pipeline
export const updatePipeline = createAsyncThunk(
  'projects/updatePipeline',
  async ({ projectId, pipelineId, pipelineData }, thunkAPI) => {
    try {
      return await projectService.updatePipeline(projectId, pipelineId, pipelineData);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to update pipeline';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete pipeline
export const deletePipeline = createAsyncThunk(
  'projects/deletePipeline',
  async ({ projectId, pipelineId }, thunkAPI) => {
    try {
      return await projectService.deletePipeline(projectId, pipelineId);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to delete pipeline';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create stage
export const createStage = createAsyncThunk(
  'projects/createStage',
  async ({ projectId, pipelineId, stageData }, thunkAPI) => {
    try {
      return await projectService.createStage(projectId, pipelineId, stageData);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to create stage';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update stage
export const updateStage = createAsyncThunk(
  'projects/updateStage',
  async ({ projectId, pipelineId, stageId, stageData }, thunkAPI) => {
    try {
      return await projectService.updateStage(projectId, pipelineId, stageId, stageData);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to update stage';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete stage
export const deleteStage = createAsyncThunk(
  'projects/deleteStage',
  async ({ projectId, pipelineId, stageId }, thunkAPI) => {
    try {
      return await projectService.deleteStage(projectId, pipelineId, stageId);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to delete stage';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Reorder stages
export const reorderStages = createAsyncThunk(
  'projects/reorderStages',
  async ({ projectId, pipelineId, stageIdsInOrder }, thunkAPI) => {
    try {
      return await projectService.reorderStages(projectId, pipelineId, stageIdsInOrder);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to reorder stages';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Transfer project ownership
export const transferOwnership = createAsyncThunk(
  'projects/transferOwnership',
  async ({ projectId, newOwnerId }, thunkAPI) => {
    try {
      return await projectService.transferOwnership(projectId, newOwnerId);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to transfer ownership';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update project member
export const updateProjectMember = createAsyncThunk(
  'projects/updateProjectMember',
  async ({ projectId, memberId, memberData }, thunkAPI) => {
    try {
      return await projectService.updateProjectMember(projectId, memberId, memberData);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to update member';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Remove project member
export const removeProjectMember = createAsyncThunk(
  'projects/removeProjectMember',
  async ({ projectId, memberId }, thunkAPI) => {
    try {
      return await projectService.removeProjectMember(projectId, memberId);
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to remove member';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Project slice
const projectSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    clearProject: (state) => {
      state.project = null;
    },
    clearPipeline: (state) => {
      state.pipeline = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get my projects
      .addCase(getMyProjects.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMyProjects.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.projects = action.payload.data.projects;
      })
      .addCase(getMyProjects.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Get project by ID
      .addCase(getProjectById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getProjectById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.project = action.payload.data.project;
      })
      .addCase(getProjectById.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Create project
      .addCase(createProject.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.projects.push(action.payload.data.project);
      })
      .addCase(createProject.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Update project
      .addCase(updateProject.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.project = action.payload.data.project;
        state.projects = state.projects.map(project => 
          project._id === action.payload.data.project._id ? action.payload.data.project : project
        );
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Delete project
      .addCase(deleteProject.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.projects = state.projects.filter(project => project._id !== action.meta.arg);
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Get project pipelines
      .addCase(getProjectPipelines.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getProjectPipelines.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.pipelines = action.payload.data.pipelines;
      })
      .addCase(getProjectPipelines.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Get pipeline by ID
      .addCase(getPipelineById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getPipelineById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.pipeline = action.payload.data.pipeline;
      })
      .addCase(getPipelineById.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Create pipeline
      .addCase(createPipeline.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createPipeline.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.pipelines.push(action.payload.data.pipeline);
      })
      .addCase(createPipeline.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Update pipeline
      .addCase(updatePipeline.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updatePipeline.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.pipeline = action.payload.data.pipeline;
        state.pipelines = state.pipelines.map(pipeline => 
          pipeline._id === action.payload.data.pipeline._id ? action.payload.data.pipeline : pipeline
        );
      })
      .addCase(updatePipeline.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Delete pipeline
      .addCase(deletePipeline.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deletePipeline.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.pipelines = state.pipelines.filter(pipeline => pipeline._id !== action.meta.arg.pipelineId);
      })
      .addCase(deletePipeline.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Create stage
      .addCase(createStage.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createStage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        if (state.pipeline && state.pipeline._id === action.meta.arg.pipelineId) {
          state.pipeline.stages.push(action.payload.data.stage);
        }
      })
      .addCase(createStage.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Update stage
      .addCase(updateStage.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateStage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        if (state.pipeline && state.pipeline._id === action.meta.arg.pipelineId) {
          state.pipeline.stages = state.pipeline.stages.map(stage => 
            stage._id === action.meta.arg.stageId ? action.payload.data.stage : stage
          );
        }
      })
      .addCase(updateStage.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Delete stage
      .addCase(deleteStage.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteStage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        if (state.pipeline && state.pipeline._id === action.meta.arg.pipelineId) {
          state.pipeline.stages = state.pipeline.stages.filter(stage => 
            stage._id !== action.meta.arg.stageId
          );
        }
      })
      .addCase(deleteStage.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Reorder stages
      .addCase(reorderStages.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(reorderStages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        if (state.pipeline && state.pipeline._id === action.meta.arg.pipelineId) {
          state.pipeline.stages = action.payload.data.stages;
        }
      })
      .addCase(reorderStages.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Transfer ownership
      .addCase(transferOwnership.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(transferOwnership.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.project = action.payload.data.project;
        state.projects = state.projects.map(project => 
          project._id === action.payload.data.project._id ? action.payload.data.project : project
        );
      })
      .addCase(transferOwnership.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Update project member
      .addCase(updateProjectMember.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateProjectMember.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.project = action.payload.data.project;
      })
      .addCase(updateProjectMember.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Remove project member
      .addCase(removeProjectMember.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(removeProjectMember.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.project = action.payload.data.project;
      })
      .addCase(removeProjectMember.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  }
});

export const { reset, clearProject, clearPipeline } = projectSlice.actions;
export default projectSlice.reducer;