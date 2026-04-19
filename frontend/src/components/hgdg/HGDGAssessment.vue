<template>
  <div class="hgdg-assessment-container">
    <div class="assessment-header">
      <h1>HGDG Project Assessment</h1>
      <div class="assessment-info">
        <h2>{{ assessment.project_title }}</h2>
        <p v-if="assessment.project_description">{{ assessment.project_description }}</p>
        <div class="assessment-meta">
          <span>Evaluator: {{ assessment.evaluator?.name }}</span>
          <span>Status: {{ assessment.status }}</span>
          <span>Total Score: {{ assessment.total_score }}/20</span>
          <span>Category: {{ assessment.rating_category }}</span>
        </div>
      </div>
    </div>

    <div class="dual-view-container">
      <!-- Left Panel: Project Proposal Viewer -->
      <div class="proposal-viewer">
        <div class="viewer-header">
          <h3>Project Proposal</h3>
          <div class="viewer-controls">
            <button @click="zoomIn" class="btn-secondary">Zoom In</button>
            <button @click="zoomOut" class="btn-secondary">Zoom Out</button>
            <button @click="resetZoom" class="btn-secondary">Reset</button>
          </div>
        </div>
        <div class="pdf-container" ref="pdfContainer">
          <iframe
            v-if="proposalUrl"
            :src="proposalUrl"
            class="pdf-viewer"
            :style="{ transform: `scale(${zoomLevel})` }"
            frameborder="0"
          ></iframe>
          <div v-else class="no-proposal">
            <p>No proposal document available</p>
          </div>
        </div>
      </div>

      <!-- Right Panel: Assessment Form -->
      <div class="assessment-form">
        <div class="form-header">
          <h3>HGDG Assessment Form</h3>
          <div class="score-summary">
            <div class="total-score">
              <span class="score-label">Total Score:</span>
              <span class="score-value">{{ totalScore }}/20</span>
            </div>
            <div class="rating-category">
              <span class="category-label">Category:</span>
              <span class="category-value" :class="getCategoryClass()">{{ ratingCategory }}</span>
            </div>
          </div>
        </div>

        <form @submit.prevent="saveAssessment" class="scoring-form">
          <div class="assessment-elements">
            <div
              v-for="(element, index) in assessmentElements"
              :key="index"
              class="element-item"
            >
              <div class="element-header">
                <h4>{{ index + 1 }}. {{ element.name }}</h4>
                <span class="element-score">Score: {{ scores[index] || 0 }}/2</span>
              </div>
              <p class="element-description">{{ element.description }}</p>

              <div class="score-options">
                <label class="score-option">
                  <input
                    type="radio"
                    :name="`element_${index + 1}`"
                    value="0"
                    v-model="scores[index]"
                    @change="updateScore"
                  />
                  <span class="option-text">No (0)</span>
                </label>
                <label class="score-option">
                  <input
                    type="radio"
                    :name="`element_${index + 1}`"
                    value="0.5"
                    v-model="scores[index]"
                    @change="updateScore"
                  />
                  <span class="option-text">Partly Yes (0.5)</span>
                </label>
                <label class="score-option">
                  <input
                    type="radio"
                    :name="`element_${index + 1}`"
                    value="1.0"
                    v-model="scores[index]"
                    @change="updateScore"
                  />
                  <span class="option-text">Partly Yes (1.0)</span>
                </label>
                <label class="score-option">
                  <input
                    type="radio"
                    :name="`element_${index + 1}`"
                    value="2.0"
                    v-model="scores[index]"
                    @change="updateScore"
                  />
                  <span class="option-text">Yes (2.0)</span>
                </label>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <div class="comments-section">
              <label for="comments">Evaluator Comments:</label>
              <textarea
                id="comments"
                v-model="comments"
                placeholder="Add your comments about the assessment..."
                rows="4"
              ></textarea>
            </div>

            <div class="signature-section">
              <label for="signature">Evaluator Signature:</label>
              <input
                type="text"
                id="signature"
                v-model="signature"
                placeholder="Enter your signature"
              />
            </div>

            <div class="action-buttons">
              <button type="button" @click="generatePDF" class="btn-secondary">
                Generate PDF Report
              </button>
              <button type="submit" class="btn-primary" :disabled="saving">
                {{ saving ? 'Saving...' : 'Save Assessment' }}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'HGDGAssessment',
  props: {
    assessmentId: {
      type: [String, Number],
      required: true
    }
  },
  data() {
    return {
      assessment: {},
      scores: [],
      comments: '',
      signature: '',
      zoomLevel: 1,
      saving: false,
      totalScore: 0,
      ratingCategory: 'Invisible',
      proposalUrl: null,
      assessmentElements: [
        {
          name: 'Gender Analysis Integration',
          description: 'The project demonstrates understanding of gender dynamics and integrates gender analysis into project design and implementation.'
        },
        {
          name: 'VAWG Prevention Strategies',
          description: 'The project includes specific strategies to prevent violence against women and girls (VAWG) and addresses related risks.'
        },
        {
          name: 'Stakeholder Engagement',
          description: 'The project engages diverse stakeholders including women, marginalized groups, and gender experts in planning and implementation.'
        },
        {
          name: 'Capacity Building',
          description: 'The project includes capacity building activities for staff and partners on gender equality and women\'s empowerment.'
        },
        {
          name: 'Monitoring & Evaluation',
          description: 'The project has gender-sensitive indicators and monitoring mechanisms to track progress on gender equality outcomes.'
        },
        {
          name: 'Risk Assessment',
          description: 'The project conducts gender-sensitive risk assessments and has mitigation strategies for potential negative impacts.'
        },
        {
          name: 'Partnership Development',
          description: 'The project collaborates with women\'s organizations, gender specialists, and other relevant partners.'
        },
        {
          name: 'Resource Allocation',
          description: 'The project allocates adequate resources (budget, time, personnel) for gender equality activities and women\'s participation.'
        },
        {
          name: 'Policy Integration',
          description: 'The project links with national gender policies, frameworks, and commitments to gender equality.'
        },
        {
          name: 'Sustainability Planning',
          description: 'The project includes strategies to ensure long-term sustainability of gender equality outcomes beyond project duration.'
        }
      ]
    };
  },
  mounted() {
    this.loadAssessment();
  },
  methods: {
    async loadAssessment() {
      try {
        const response = await axios.get(`/api/v1/hgdg/${this.assessmentId}`);
        this.assessment = response.data.data;

        // Initialize scores array
        this.scores = [];
        for (let i = 1; i <= 10; i++) {
          this.scores.push(this.assessment[`element_${i}_score`] || 0);
        }

        this.comments = this.assessment.evaluator_comments || '';
        this.signature = this.assessment.evaluator_signature || '';
        this.totalScore = this.assessment.total_score || 0;
        this.ratingCategory = this.assessment.rating_category || 'Invisible';

        // Set proposal URL if available
        if (this.assessment.proposal_file_key) {
          // Assuming you have a service to get file URLs
          this.proposalUrl = `/api/files/${this.assessment.proposal_file_key}`;
        }

        this.updateScore();
      } catch (error) {
        console.error('Error loading assessment:', error);
        this.$toast.error('Failed to load assessment');
      }
    },

    updateScore() {
      // Calculate total score
      this.totalScore = this.scores.reduce((sum, score) => {
        return sum + (parseFloat(score) || 0);
      }, 0);

      // Determine rating category
      if (this.totalScore >= 15.0) {
        this.ratingCategory = 'Responsive';
      } else if (this.totalScore >= 8.0) {
        this.ratingCategory = 'Sensitive';
      } else if (this.totalScore >= 4.0) {
        this.ratingCategory = 'Promising';
      } else {
        this.ratingCategory = 'Invisible';
      }
    },

    getCategoryClass() {
      const classes = {
        'Invisible': 'category-invisible',
        'Promising': 'category-promising',
        'Sensitive': 'category-sensitive',
        'Responsive': 'category-responsive'
      };
      return classes[this.ratingCategory] || '';
    },

    async saveAssessment() {
      this.saving = true;
      try {
        const updateData = {
          evaluator_comments: this.comments,
          evaluator_signature: this.signature,
          status: 'completed'
        };

        // Add scores to update data
        for (let i = 1; i <= 10; i++) {
          updateData[`element_${i}_score`] = parseFloat(this.scores[i - 1]) || 0;
        }

        await axios.put(`/api/v1/hgdg/${this.assessmentId}`, updateData);

        this.$toast.success('Assessment saved successfully');
        this.loadAssessment(); // Reload to get updated data
      } catch (error) {
        console.error('Error saving assessment:', error);
        this.$toast.error('Failed to save assessment');
      } finally {
        this.saving = false;
      }
    },

    async generatePDF() {
      try {
        const response = await axios.get(`/api/v1/hgdg/${this.assessmentId}/pdf`, {
          responseType: 'blob'
        });

        // Create download link
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `HGDG_Rating_Sheet_${this.assessmentId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        this.$toast.success('PDF generated successfully');
      } catch (error) {
        console.error('Error generating PDF:', error);
        this.$toast.error('Failed to generate PDF');
      }
    },

    zoomIn() {
      this.zoomLevel = Math.min(this.zoomLevel + 0.25, 2);
    },

    zoomOut() {
      this.zoomLevel = Math.max(this.zoomLevel - 0.25, 0.5);
    },

    resetZoom() {
      this.zoomLevel = 1;
    }
  }
};
</script>

<style scoped>
.hgdg-assessment-container {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.assessment-header {
  margin-bottom: 30px;
}

.assessment-header h1 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.assessment-info h2 {
  color: #34495e;
  margin-bottom: 8px;
}

.assessment-info p {
  color: #7f8c8d;
  margin-bottom: 15px;
}

.assessment-meta {
  display: flex;
  gap: 20px;
  font-size: 14px;
  color: #555;
}

.dual-view-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  height: calc(100vh - 200px);
}

.proposal-viewer, .assessment-form {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  overflow: hidden;
}

.viewer-header, .form-header {
  padding: 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.viewer-controls {
  display: flex;
  gap: 10px;
}

.pdf-container {
  height: calc(100% - 80px);
  overflow: auto;
  background: #f5f5f5;
}

.pdf-viewer {
  width: 100%;
  height: 100%;
  border: none;
  transform-origin: top left;
  transition: transform 0.2s ease;
}

.no-proposal {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #6c757d;
}

.score-summary {
  display: flex;
  gap: 20px;
  align-items: center;
}

.total-score, .rating-category {
  display: flex;
  align-items: center;
  gap: 8px;
}

.score-value, .category-value {
  font-weight: bold;
  font-size: 18px;
}

.category-invisible { color: #dc3545; }
.category-promising { color: #ffc107; }
.category-sensitive { color: #17a2b8; }
.category-responsive { color: #28a745; }

.scoring-form {
  height: calc(100% - 80px);
  overflow-y: auto;
  padding: 20px;
}

.assessment-elements {
  margin-bottom: 30px;
}

.element-item {
  margin-bottom: 25px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid #007bff;
}

.element-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.element-header h4 {
  margin: 0;
  color: #2c3e50;
}

.element-score {
  font-weight: bold;
  color: #007bff;
}

.element-description {
  color: #6c757d;
  margin-bottom: 15px;
  font-size: 14px;
}

.score-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
}

.score-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.score-option:hover {
  background: #e9ecef;
}

.score-option input[type="radio"] {
  margin: 0;
}

.option-text {
  font-size: 14px;
  color: #495057;
}

.form-actions {
  border-top: 1px solid #e9ecef;
  padding-top: 20px;
}

.comments-section, .signature-section {
  margin-bottom: 20px;
}

.comments-section label, .signature-section label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #2c3e50;
}

.comments-section textarea, .signature-section input {
  width: 100%;
  padding: 10px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-family: inherit;
}

.action-buttons {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
}

.btn-primary, .btn-secondary {
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

@media (max-width: 1024px) {
  .dual-view-container {
    grid-template-columns: 1fr;
    height: auto;
  }

  .pdf-container {
    height: 600px;
  }

  .scoring-form {
    height: auto;
  }
}
</style>