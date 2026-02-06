const API_URL = import.meta.env.VITE_API_URL || '/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      };

      if (this.token) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`;
      }

      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || 'Request failed' };
      }

      return { data };
    } catch (error) {
      console.error('API error:', error);
      return { error: error instanceof Error ? error.message : 'Network error' };
    }
  }

  // Auth
  async signIn(email: string, password: string, role: 'applicant' | 'hr') {
    return this.request<{ user: any; session: any }>('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password, role }),
    });
  }

  async signUp(email: string, password: string, name: string, role: 'applicant' | 'hr') {
    return this.request<{ success: boolean; user: any }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, role }),
    });
  }

  async signOut() {
    return this.request('/auth/signout', { method: 'POST' });
  }

  async getMe() {
    return this.request<{ user: any }>('/auth/me');
  }

  async refreshSession(refreshToken: string) {
    return this.request<{ session: any }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  }

  // Jobs
  async getJobs() {
    return this.request<{ jobs: any[] }>('/jobs');
  }

  async getJob(id: string) {
    return this.request<{ job: any }>(`/jobs/${id}`);
  }

  async getMyJobs() {
    return this.request<{ jobs: any[] }>('/jobs/creator/me');
  }

  async createJob(job: {
    title: string;
    description: string;
    department: string;
    location: string;
    type: string;
    tech_stack: string[];
    requirements: string[];
    is_external?: boolean;
  }) {
    return this.request<{ job: any }>('/jobs', {
      method: 'POST',
      body: JSON.stringify(job),
    });
  }

  async updateJob(id: string, updates: Partial<{
    title: string;
    description: string;
    department: string;
    location: string;
    type: string;
    tech_stack: string[];
    requirements: string[];
  }>) {
    return this.request<{ job: any }>(`/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteJob(id: string) {
    return this.request<{ success: boolean }>(`/jobs/${id}`, {
      method: 'DELETE',
    });
  }

  // Applications
  async getApplications() {
    return this.request<{ applications: any[] }>('/applications');
  }

  async getMyApplications() {
    return this.request<{ applications: any[] }>('/applications/my');
  }

  async getApplicationsByJob(jobId: string) {
    return this.request<{ applications: any[] }>(`/applications/job/${jobId}`);
  }

  async getRankedApplicants(limit = 10) {
    return this.request<{ applications: any[] }>(`/applications/ranked?limit=${limit}`);
  }

  async createApplication(application: {
    job_id: string;
    applicant_name: string;
    applicant_email: string;
    resume_file_name: string;
    resume_text?: string;
    ai_score?: number;
    matched_skills?: string[];
  }) {
    return this.request<{ application: any }>('/applications', {
      method: 'POST',
      body: JSON.stringify(application),
    });
  }

  async updateApplicationStatus(id: string, status: 'pending' | 'reviewing' | 'accepted' | 'rejected') {
    return this.request<{ application: any }>(`/applications/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // Resume analysis
  async analyzeResume(fileBase64: string, fileType: string, fileName: string, techStack: string[]) {
    return this.request<{
      success: boolean;
      extractedText: string;
      matchedSkills: string[];
      score: number;
      totalSkillsRequired: number;
      skillsMatched: number;
    }>('/resume/analyze', {
      method: 'POST',
      body: JSON.stringify({ fileBase64, fileType, fileName, techStack }),
    });
  }
}

export const api = new ApiClient();
export default api;
