// Get API URL from environment with proper fallback handling
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
console.log('🔧 API_BASE_URL from env:', API_BASE_URL);

class TaskService {
  async getAllTasks() {
    // Construct URL with proper error handling for undefined
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const url = `${baseUrl}/api/tasks`;
    console.log('📡 Fetching tasks from:', url);
    
    try {
      const response = await fetch(url);
      
      console.log('📡 Response status:', response.status);
      console.log('📡 Response Content-Type:', response.headers.get('Content-Type'));
      
      // Check if we got HTML instead of JSON (common proxy/404 issue)
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        const html = await response.text();
        console.error('❌ Received HTML instead of JSON. First 200 chars:', html.substring(0, 200));
        throw new Error('Server returned HTML page instead of JSON data');
      }
      
      if (!response.ok) {
        // Try to get error message as JSON first, then text
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          const errorText = await response.text();
          console.error('❌ Error response text:', errorText.substring(0, 200));
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log('✅ Tasks data received:', data);
      return data;
      
    } catch (error) {
      console.error('❌ Error in getAllTasks:', {
        message: error.message,
        url: url,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  async createTask(taskData) {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const url = `${baseUrl}/api/tasks`;
    console.log('📝 Creating task at:', url, 'Data:', taskData);
    
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(taskData),
      });
      
      console.log('📝 Create task response status:', response.status);
      
      // Check for HTML response
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        const html = await response.text();
        console.error('❌ Received HTML instead of JSON. First 200 chars:', html.substring(0, 200));
        throw new Error('Server returned HTML page instead of JSON data');
      }
      
      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // If response is not JSON, get text
          const errorText = await response.text();
          console.error('❌ Error response text:', errorText.substring(0, 200));
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('✅ Task created successfully:', result);
      return result;
      
    } catch (error) {
      console.error('❌ Error in createTask:', {
        message: error.message,
        url: url,
        data: taskData,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  async deleteTask(taskId) {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const url = `${baseUrl}/api/tasks/${taskId}`;
    console.log('🗑️ Deleting task at:', url);
    
    try {
      const response = await fetch(url, {
        method: "DELETE",
      });
      
      console.log('🗑️ Delete task response status:', response.status);
      
      // Check for HTML response
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        const html = await response.text();
        console.error('❌ Received HTML instead of JSON. First 200 chars:', html.substring(0, 200));
        throw new Error('Server returned HTML page instead of JSON data');
      }
      
      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          const errorText = await response.text();
          console.error('❌ Error response text:', errorText.substring(0, 200));
        }
        throw new Error(errorMessage);
      }

      // For DELETE, the response might be empty, so handle both cases
      let result = {};
      try {
        result = await response.json();
        console.log('✅ Task deleted successfully:', result);
      } catch {
        // No JSON response is fine for DELETE
        console.log('✅ Task deleted successfully (no response body)');
        result = { success: true, id: taskId };
      }
      
      return result;
      
    } catch (error) {
      console.error('❌ Error in deleteTask:', {
        message: error.message,
        url: url,
        taskId: taskId,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  // Add a health check method for debugging
  async checkHealth() {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const url = `${baseUrl}/health`;
    console.log('🏥 Checking backend health at:', url);
    
    try {
      const response = await fetch(url);
      console.log('🏥 Health check status:', response.status);
      
      if (response.ok) {
        const health = await response.json();
        console.log('✅ Backend health:', health);
        return { healthy: true, ...health };
      } else {
        console.error('❌ Backend health check failed:', response.status);
        return { healthy: false, status: response.status };
      }
    } catch (error) {
      console.error('❌ Health check error:', error.message);
      return { healthy: false, error: error.message };
    }
  }
}

// Create and log the service instance
const taskService = new TaskService();
console.log('🚀 TaskService initialized with base URL:', 
  import.meta.env.VITE_API_URL || 'http://localhost:3000 (fallback)');

// Add a test method for debugging
taskService.debugConnection = async () => {
  console.log('🔍 === DEBUG CONNECTION TEST ===');
  console.log('🔍 VITE_API_URL from env:', import.meta.env.VITE_API_URL);
  console.log('🔍 Using base URL:', import.meta.env.VITE_API_URL || 'http://localhost:3000 (fallback)');
  
  try {
    const health = await taskService.checkHealth();
    console.log('🔍 Health check result:', health);
    
    if (health.healthy) {
      console.log('🔍 Testing tasks endpoint...');
      const tasks = await taskService.getAllTasks();
      console.log('🔍 Tasks test successful, count:', tasks.length);
      return { success: true, health, tasksCount: tasks.length };
    } else {
      console.error('🔍 Health check failed');
      return { success: false, health };
    }
  } catch (error) {
    console.error('🔍 Debug test failed:', error);
    return { success: false, error: error.message };
  }
};

export { taskService };