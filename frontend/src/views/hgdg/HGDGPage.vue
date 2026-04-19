<template>
  <div class="hgdg-page">
    <div class="page-header">
      <h1>HGDG Assessment Dashboard</h1>
      <p>Evaluate project proposals for gender mainstreaming and VAWG prevention</p>
    </div>

    <div class="dashboard-content">
      <!-- Assessment List -->
      <div class="assessments-section">
        <div class="section-header">
          <h2>My Assessments</h2>
          <button @click="showCreateModal = true" class="btn-primary">
            <i class="fas fa-plus"></i> New Assessment
          </button>
        </div>

        <!-- Filters -->
        <div class="filters">
          <div class="filter-group">
            <label>Status:</label>
            <select v-model="filters.status" @change="loadAssessments">
              <option value="">All</option>
              <option value="draft">Draft</option>
              <option value="completed">Completed</option>
              <option value="reviewed">Reviewed</option>
            </select>
          </div>
          <div class="filter-group">
            <label>Search:</label>
            <input
              type="text"
              v-model="filters.search"
              @input="debounceSearch"
              placeholder="Search projects..."
            />
          </div>
        </div>

        <!-- Assessment Cards -->
        <div v-if="loading" class="loading">
          <p>Loading assessments...</p>
        </div>

        <div v-else-if="assessments.length === 0" class="no-assessments">
          <p>No assessments found. Create your first assessment to get started.</p>
        </div>

        <div v-else class="assessments-grid">
          <div
            v-for="assessment in assessments"
            :key="assessment.id"
            class="assessment-card"
            @click="openAssessment(assessment.id)"
          >
            <div class="card-header">
              <h3>{{ assessment.project_title }}</h3>
              <span class="status-badge" :class="`status-${assessment.status}`">
                {{ assessment.status }}
              </span>
            </div>

            <div class="card-content">
              <p v-if="assessment.project_description" class="description">
                {{ truncateText(assessment.project_description, 100) }}
              </p>

              <div class="card-meta">
                <div class="meta-item">
                  <i class="fas fa-user"></i>
                  <span>{{ assessment.evaluator?.name }}</span>
                </div>
                <div class="meta-item">
                  <i class="fas fa-calendar"></i>
                  <span>{{ formatDate(assessment.assessment_date) }}</span>
                </div>
              </div>

              <div class="score-display">
                <div class="score-item">
                  <span class="score-label">Total Score:</span>
                  <span class="score-value">{{ assessment.total_score }}/20</span>
                </div>
                <div class="score-item">
                  <span class="category-label">Category:</span>
                  <span class="category-value" :class="getCategoryClass(assessment.rating_category)">
                    {{ assessment.rating_category }}
                  </span>
                </div>
              </div>
            </div>

            <div class="card-actions">
              <button @click.stop="generateTemplatePDF(assessment.id)" class="btn-primary small">
                <i class="fas fa-file-pdf"></i> Template
              </button>
              <button @click.stop="generatePDF(assessment.id)" class="btn-secondary small">
                <i class="fas fa-download"></i> PDF
              </button>
              <button @click.stop="deleteAssessment(assessment.id)" class="btn-danger small">
                <i class="fas fa-trash"></i> Delete
              </button>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="pagination.pages > 1" class="pagination">
          <button
            @click="changePage(pagination.page - 1)"
            :disabled="pagination.page <= 1"
            class="btn-secondary"
          >
            Previous
          </button>

          <span class="page-info">
            Page {{ pagination.page }} of {{ pagination.pages }}
          </span>

          <button
            @click="changePage(pagination.page + 1)"
            :disabled="pagination.page >= pagination.pages"
            class="btn-secondary"
          >
            Next
          </button>
        </div>
      </div>
    </div>

    <!-- Create Assessment Modal -->
    <div v-if="showCreateModal" class="modal-overlay" @click="showCreateModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Create New Assessment</h3>
          <button @click="showCreateModal = false" class="close-btn">&times;</button>
        </div>

        <form @submit.prevent="createAssessment" class="create-form">
          <div class="form-group">
            <label for="project_title">Project Title *</label>
            <input
              type="text"
              id="project_title"
              v-model="newAssessment.project_title"
              required
              placeholder="Enter project title"
            />
          </div>

          <div class="form-group">
            <label for="project_description">Project Description</label>
            <textarea
              id="project_description"
              v-model="newAssessment.project_description"
              rows="4"
              placeholder="Describe the project..."
            ></textarea>
          </div>

          <div class="form-group">
            <label for="project_owner_id">Project Owner</label>
            <select v-model="newAssessment.project_owner_id">
              <option value="">Select project owner (optional)</option>
              <option v-for="user in users" :key="user.id" :value="user.id">
                {{ user.name }} ({{ user.email }})
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="proposal_file">Project Proposal Document</label>
            <input
              type="file"
              id="proposal_file"
              @change="handleFileUpload"
              accept=".pdf,.doc,.docx"
            />
            <small class="file-hint">Upload PDF or document file (optional)</small>
          </div>

          <div class="modal-actions">
            <button type="button" @click="showCreateModal = false" class="btn-secondary">
              Cancel
            </button>
            <button type="submit" :disabled="creating" class="btn-primary">
              {{ creating ? 'Creating...' : 'Create Assessment' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import HGDGAssessment from '@/components/hgdg/HGDGAssessment.vue';

export default {
  name: 'HGDGPage',
  components: {
    HGDGAssessment
  },
  data() {
    return {
      assessments: [],
      pagination: {
        page: 1,
        limit: 10,
        pages: 1,
        total: 0
      },
      filters: {
        status: '',
        search: ''
      },
      loading: false,
      showCreateModal: false,
      creating: false,
      newAssessment: {
        project_title: '',
        project_description: '',
        project_owner_id: '',
        proposal_file_key: null
      },
      users: [],
      searchTimeout: null
    };
  },
  mounted() {
    this.loadAssessments();
    this.loadUsers();
  },
  methods: {
    async loadAssessments() {
      this.loading = true;
      try {
        const params = {
          page: this.pagination.page,
          limit: this.pagination.limit,
          status: this.filters.status,
          search: this.filters.search
        };

        const response = await axios.get('/api/v1/hgdg', { params });
        this.assessments = response.data.data || [];
        this.pagination = response.data.pagination || this.pagination;
      } catch (error) {
        console.error('Error loading assessments:', error);
        this.$toast.error('Failed to load assessments');
        this.assessments = [];
      } finally {
        this.loading = false;
      }
    },

    async loadUsers() {
      try {
        // This would typically come from a users API endpoint
        // For now, we'll assume it's available or implement a basic version
        this.users = []; // Populate with actual users
      } catch (error) {
        console.error('Error loading users:', error);
      }
    },

    openAssessment(assessmentId) {
      this.$router.push(`/hgdg/assessment/${assessmentId}`);
    },

    async createAssessment() {
      this.creating = true;
      try {
        const response = await axios.post('/api/v1/hgdg', this.newAssessment);
        this.$toast.success('Assessment created successfully');
        this.showCreateModal = false;
        this.resetNewAssessment();
        this.loadAssessments();
      } catch (error) {
        console.error('Error creating assessment:', error);
        this.$toast.error('Failed to create assessment');
      } finally {
        this.creating = false;
      }
    },

    async deleteAssessment(assessmentId) {
      if (!confirm('Are you sure you want to delete this assessment?')) {
        return;
      }

      try {
        await axios.delete(`/api/v1/hgdg/${assessmentId}`);
        this.$toast.success('Assessment deleted successfully');
        this.loadAssessments();
      } catch (error) {
        console.error('Error deleting assessment:', error);
        this.$toast.error('Failed to delete assessment');
      }
    },

    async generatePDF(assessmentId) {
      try {
        const response = await axios.get(`/api/v1/hgdg/${assessmentId}/pdf`, {
          responseType: 'blob'
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `HGDG_Rating_Sheet_${assessmentId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error generating PDF:', error);
        this.$toast.error('Failed to generate PDF');
      }
    },

    async generateTemplatePDF(assessmentId) {
      try {
        const response = await axios.get(`/api/v1/hgdg/${assessmentId}/template`, {
          responseType: 'blob'
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error generating template PDF:', error);
        this.$toast.error('Failed to generate template PDF');
      }
    },

    async handleFileUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      // Here you would typically upload the file to your server
      // For now, we'll just store the file name
      this.newAssessment.proposal_file_key = file.name;
    },

    changePage(page) {
      this.pagination.page = page;
      this.loadAssessments();
    },

    debounceSearch() {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.pagination.page = 1;
        this.loadAssessments();
      }, 500);
    },

    resetNewAssessment() {
      this.newAssessment = {
        project_title: '',
        project_description: '',
        project_owner_id: '',
        proposal_file_key: null
      };
    },

    truncateText(text, maxLength) {
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength) + '...';
    },

    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString();
    },

    getCategoryClass(category) {
      const classes = {
        'Invisible': 'category-invisible',
        'Promising': 'category-promising',
        'Sensitive': 'category-sensitive',
        'Responsive': 'category-responsive'
      };
      return classes[category] || '';
    }
  }
};
</script>

<style scoped>
.hgdg-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-header h1 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.page-header p {
  color: #7f8c8d;
  font-size: 16px;
}

.dashboard-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  overflow: hidden;
}

.section-header {
  padding: 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-header h2 {
  margin: 0;
  color: #2c3e50;
}

.filters {
  padding: 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  gap: 20px;
  align-items: center;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-group label {
  font-weight: 500;
  color: #2c3e50;
}

.filter-group select, .filter-group input {
  padding: 8px 12px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 14px;
}

.assessments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  padding: 20px;
}

.assessment-card {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
}

.assessment-card:hover {
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  transform: translateY(-2px);
}

.card-header {
  padding: 15px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 16px;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
}

.status-draft { background: #ffc107; color: #212529; }
.status-completed { background: #28a745; color: white; }
.status-reviewed { background: #17a2b8; color: white; }

.card-content {
  padding: 15px;
}

.description {
  color: #6c757d;
  margin-bottom: 15px;
  font-size: 14px;
}

.card-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 15px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #6c757d;
}

.score-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 15px;
  border-top: 1px solid #e9ecef;
}

.score-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.score-label, .category-label {
  font-size: 12px;
  color: #6c757d;
  text-transform: uppercase;
  font-weight: 500;
}

.score-value {
  font-size: 18px;
  font-weight: bold;
  color: #007bff;
}

.category-value {
  font-size: 14px;
  font-weight: bold;
}

.category-invisible { color: #dc3545; }
.category-promising { color: #ffc107; }
.category-sensitive { color: #17a2b8; }
.category-responsive { color: #28a745; }

.card-actions {
  padding: 15px;
  background: #f8f9fa;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.btn-secondary.small, .btn-danger.small {
  padding: 6px 12px;
  font-size: 12px;
}

.no-assessments, .loading {
  text-align: center;
  padding: 60px 20px;
  color: #6c757d;
}

.pagination {
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  border-top: 1px solid #e9ecef;
}

.page-info {
  color: #6c757d;
  font-weight: 500;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  color: #2c3e50;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6c757d;
}

.create-form {
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #2c3e50;
}

.form-group input, .form-group select, .form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-family: inherit;
  font-size: 14px;
}

.form-group textarea {
  resize: vertical;
}

.file-hint {
  display: block;
  margin-top: 5px;
  color: #6c757d;
  font-size: 12px;
}

.modal-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
}

.btn-primary, .btn-secondary, .btn-danger {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #0056b3;
}

.btn-primary:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #545b62;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover {
  background: #c82333;
}

@media (max-width: 768px) {
  .assessments-grid {
    grid-template-columns: 1fr;
  }

  .filters {
    flex-direction: column;
    align-items: stretch;
  }

  .section-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }

  .modal-content {
    width: 95%;
    margin: 20px;
  }
}
</style>