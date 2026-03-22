import { defineStore } from 'pinia';
import api from '@/utils/api';

export const useClassroomStore = defineStore('classroom', {
    state: () => ({
        classrooms: [], // Listahan ng lahat ng sinalihang/ginawang classrooms
        currentClassroom: null, // Detalye ng kasalukuyang tinitingnang classroom (kasama ang modules)
        loading: false,
        error: null
    }),
    
    actions: {
        /**
         * Kunin ang lahat ng classrooms na may kaugnayan sa user.
         * Ginagamit para sa Dashboard list view.
         */
        async fetchMyClassrooms() {
            this.loading = true;
            this.error = null;
            try {
                const response = await api.get('/api/v1/classrooms/my-classrooms'); 
                this.classrooms = response.data.classrooms || [];
            } catch (error) {
                this.error = error.response?.data?.message || 'Failed to fetch classrooms';
                console.error('Error fetching classrooms:', this.error);
            } finally {
                this.loading = false;
            }
        },

        /**
         * Facilitator: Gumawa ng bagong classroom.
         * Pagkatapos magawa, idadagdag ito sa unahan ng classrooms array.
         */
        async createClassroom(payload) {
            this.loading = true;
            this.error = null;
            try {
                const response = await api.post('/api/v1/classrooms/create', payload);
                if (response.data.classroom) {
                    this.classrooms.unshift(response.data.classroom);
                }
                return response.data;
            } catch (error) {
                const msg = error.response?.data?.message || "Failed to create classroom";
                this.error = msg;
                console.error("Store error (Create):", msg);
                throw error; 
            } finally {
                this.loading = false;
            }
        },

        /**
         * Student: Mag-join sa isang classroom gamit ang 6-character code.
         * Naka-sanitize ang code (uppercase at trimmed) para iwas mismatch.
         */
        async joinClassroom(code) {
            this.loading = true;
            this.error = null;
            try {
                const response = await api.post('/api/v1/classrooms/join', { 
                    join_code: code.toUpperCase().trim() 
                });
                // I-refresh ang listahan para makita ang bagong sinalihang klase
                await this.fetchMyClassrooms(); 
                return response.data;
            } catch (error) {
                const msg = error.response?.data?.message || "Error joining classroom";
                this.error = msg;
                console.error("Join Error Detail:", msg);
                throw new Error(msg); 
            } finally {
                this.loading = false;
            }
        },

        /**
         * Kunin ang buong detalye ng isang specific classroom gamit ang ID.
         * Kasama dito ang facilitator info, student list, at mga modules nito.
         */
        async fetchClassroomDetails(id) {
            this.loading = true;
            try {
                const response = await api.get(`/classrooms/${id}`);
                // Dito mai-save ang classroom kasama ang modules at students array
                this.currentClassroom = response.data.classroom; 
            } catch (err) {
                this.error = err.response?.data?.message || 'Failed to load classroom';
            } finally {
                this.loading = false;
            }
        },
        clearCurrentClassroom() {
            this.currentClassroom = null;
            this.error = null;
        }
    }
});