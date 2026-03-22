// frontend/src/stores/quiz.js
import { defineStore } from 'pinia';
import api from '@/utils/api';

export const useQuizStore = defineStore('quiz', {
  actions: {
    async createQuiz(quizData) {
      // Change from '/quizzes' to:
      const response = await api.post('/api/v1/quizzes', quizData);
      return response.data;
    },

    async fetchQuizzesByModule(moduleId) {
      // Change from '/quizzes/module/${moduleId}' to:
      const response = await api.get(`/api/v1/quizzes/module/${moduleId}`);
      return response.data.quizzes;
    }
  }
});