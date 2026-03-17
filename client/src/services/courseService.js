import api from './api';

/**
 * Course Service - Handles all course-related API calls
 */

// Get all published courses with filters
export const getAllCourses = async (params = {}) => {
  const response = await api.get('/courses', { params });
  return response.data;
};

// Get single course by ID
export const getCourseById = async (id) => {
  const response = await api.get(`/courses/${id}`);
  return response.data;
};

// Get instructor's courses (for instructor dashboard)
export const getInstructorCourses = async () => {
  const response = await api.get('/courses/instructor/my-courses');
  return response.data;
};

// Get students enrolled in instructor's courses
export const getInstructorStudents = async (params = {}) => {
  const response = await api.get('/courses/instructor/students', { params });
  return response.data;
};

// Create new course (instructor)
export const createCourse = async (courseData) => {
  const response = await api.post('/courses', courseData);
  return response.data;
};

// Update course (instructor)
export const updateCourse = async (id, courseData) => {
  const response = await api.put(`/courses/${id}`, courseData);
  return response.data;
};

// Delete course (instructor)
export const deleteCourse = async (id) => {
  const response = await api.delete(`/courses/${id}`);
  return response.data;
};

// Upload course thumbnail
export const uploadCourseThumbnail = async (id, file) => {
  const formData = new FormData();
  formData.append('thumbnail', file);

  const response = await api.post(`/courses/${id}/thumbnail`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Publish/unpublish course
export const togglePublishCourse = async (id, status) => {
  const response = await api.put(`/courses/${id}/publish`, { status });
  return response.data;
};

// Get sections in a course
export const getSections = async (courseId) => {
  const response = await api.get(`/courses/${courseId}/sections`);
  return response.data;
};

// Create section
export const createSection = async (courseId, sectionData) => {
  const response = await api.post(`/courses/${courseId}/sections`, sectionData);
  return response.data;
};

// Update section
export const updateSection = async (courseId, sectionId, sectionData) => {
  const response = await api.put(`/courses/${courseId}/sections/${sectionId}`, sectionData);
  return response.data;
};

// Delete section
export const deleteSection = async (courseId, sectionId) => {
  const response = await api.delete(`/courses/${courseId}/sections/${sectionId}`);
  return response.data;
};

// Get lectures in a section
export const getLectures = async (courseId, sectionId) => {
  const response = await api.get(`/courses/${courseId}/sections/${sectionId}/lectures`);
  return response.data;
};

// Create lecture with video
export const createLecture = async (courseId, sectionId, formData) => {
  const response = await api.post(
    `/courses/${courseId}/sections/${sectionId}/lectures`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
};

// Update lecture
export const updateLecture = async (courseId, sectionId, lectureId, lectureData) => {
  const response = await api.put(
    `/courses/${courseId}/sections/${sectionId}/lectures/${lectureId}`,
    lectureData
  );
  return response.data;
};

// Get single lecture by ID (with enrollment access check on backend)
export const getLectureById = async (courseId, sectionId, lectureId) => {
  const response = await api.get(`/courses/${courseId}/sections/${sectionId}/lectures/${lectureId}`);
  return response.data;
};

// Delete lecture
export const deleteLecture = async (courseId, sectionId, lectureId) => {
  const response = await api.delete(
    `/courses/${courseId}/sections/${sectionId}/lectures/${lectureId}`
  );
  return response.data;
};
