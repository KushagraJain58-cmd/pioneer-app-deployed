import axiosInstance from './axiosInstance';

// Auth
export const studentLogin = (payload: { studentId?: string; phone?: string; password: string }) =>
  axiosInstance.post('api/students/login', payload);

export const verifyOtpLogin = (payload: { otp: string; [key: string]: string }) =>
  axiosInstance.post('api/users/verify-otp-login', payload);

export const requestResetPassword = (email: string) =>
  axiosInstance.post('api/users/auth/requestResetPassword', { email });

// User
export const getUserInfo = (userId: string) =>
  axiosInstance.get(`api/users/info/${userId}`);

export const updateUserProfile = (userId: string, data: object) =>
  axiosInstance.put(`api/users/info/profile/${userId}`, data);

// Student self-profile (matches pioneer-client-deploy Profile section)
export const getMyProfile = () => axiosInstance.get('api/students/profile/me');

export const updateMyProfile = (payload: object) =>
  axiosInstance.put('api/students/profile/me', payload);

export const changeMyPassword = (payload: { currentPassword: string; newPassword: string }) =>
  axiosInstance.put('api/students/profile/me/password', payload);

// Careers
export const getCareers = (params?: {
  keyword?: string;
  industry?: string;
  page?: number;
  limit?: number;
}) => axiosInstance.get('api/careers', { params });

export const getShortlist = () => axiosInstance.get('api/student-shortlist');

export const toggleCareerShortlist = (careerId: string) =>
  axiosInstance.post('api/student-shortlist/careers/toggle', { careerId });

// University
export const getUniversities = (params?: {
  keyword?: string;
  state?: string;
  page?: number;
  limit?: number;
}) => axiosInstance.get('api/university', { params });

export const toggleUniversityShortlist = (universityId: string) =>
  axiosInstance.post('api/student-shortlist/universities/toggle', { universityId });

// Skill Readiness
export const getSkillByMonthYear = (year: number, month: number) =>
  axiosInstance.get(`api/skillReadiness/skill?year=${year}&month=${month}`);

export const getSkillWeeks = (skillId: string, weekNumber: number) =>
  axiosInstance.get(`api/skillReadiness/weeks?skillId=${skillId}&weekNumber=${weekNumber}`);

export interface SkillAnswerPayload {
  assessmentId: string;
  answers: { questionId: string; selectedOptionIds: string[]; writtenAnswer: string | null }[];
}

export const submitSkillAssignment = (payload: SkillAnswerPayload) =>
  axiosInstance.post('api/skillReadiness/submitAssignment', payload);

export const getSkillAssessmentResult = (assessmentId: string) =>
  axiosInstance.get('api/skillReadiness/getAssessmentResult', { params: { assessmentId } });

export const getSkillFinalAssessment = (skillId: string) =>
  axiosInstance.get(`api/skillReadiness/finalAssessment?skillId=${skillId}`);

export const submitSkillFinalAssessment = (payload: SkillAnswerPayload) =>
  axiosInstance.post('api/skillReadiness/submitFinalAssessment', payload);

export const getSkillFinalAssessmentResult = (assessmentId: string) =>
  axiosInstance.get('api/skillReadiness/getFinalAssessmentResult', { params: { assessmentId } });

// Psychometric
export const getAcademicQuestions = () =>
  axiosInstance.get('api/psychometric/academicQuestions');

export const getCareerQuestions = () =>
  axiosInstance.get('api/psychometric/careerQuestions');

export const getRiasecQuestions = () =>
  axiosInstance.get('api/psychometric/riasecQuestions');

export const getMbtiQuestions = () =>
  axiosInstance.get('api/psychometric/mbtiQuestions');

export const submitMbtiAssessment = (data: object) =>
  axiosInstance.post('api/psychometric/mbtiAssessment', data);

export const submitAcademicAssessment = (data: object) =>
  axiosInstance.post('api/psychometric/academicAssessment', data);

export const submitCareerAssessment = (data: object) =>
  axiosInstance.post('api/psychometric/careerAssessment', data);

export const submitRiasecAssessment = (data: object) =>
  axiosInstance.post('api/psychometric/riasecAssessment', data);

export const getAcademicResult = (userId: string) =>
  axiosInstance.get(`api/psychometric/academicResult/${userId}`);

export const getMbtiResult = (userId: string) =>
  axiosInstance.get(`api/psychometric/mbtiResult/${userId}`);

export const getCareerResult = (userId: string) =>
  axiosInstance.get(`api/psychometric/careerResult/${userId}`);

export const getRiasecResult = (userId: string) =>
  axiosInstance.get(`api/psychometric/riasecResult/${userId}`);

// DISHA — Test 1 (flagship)
export const getDishaQuestions = () =>
  axiosInstance.get('api/psychometric/dishaQuestions');

export const submitDishaAssessment = (data: object) =>
  axiosInstance.post('api/psychometric/dishaAssessment', data);

export const getDishaResult = (userId: string) =>
  axiosInstance.get(`api/psychometric/dishaResult/${userId}`);

// DISHA — Test 2 (Interests, Work Values, Motivations)
export const getDisha2Questions = () =>
  axiosInstance.get('api/psychometric/disha2Questions');

export const submitDisha2Assessment = (data: object) =>
  axiosInstance.post('api/psychometric/disha2Assessment', data);

export const getDisha2Result = (userId: string) =>
  axiosInstance.get(`api/psychometric/disha2Result/${userId}`);

// DISHA — Test 3 (Academic Performance, Learning Styles, Study Habits)
export const getDisha3Questions = () =>
  axiosInstance.get('api/psychometric/disha3Questions');

export const submitDisha3Assessment = (data: object) =>
  axiosInstance.post('api/psychometric/disha3Assessment', data);

export const getDisha3Result = (userId: string) =>
  axiosInstance.get(`api/psychometric/disha3Result/${userId}`);

// DISHA — Test 4 (Emotional Intelligence, Resilience, Interpersonal Fit)
export const getDisha4Questions = () =>
  axiosInstance.get('api/psychometric/disha4Questions');

export const submitDisha4Assessment = (data: object) =>
  axiosInstance.post('api/psychometric/disha4Assessment', data);

export const getDisha4Result = (userId: string) =>
  axiosInstance.get(`api/psychometric/disha4Result/${userId}`);

// DISHA — Test 5 (Career Adaptability, Decision Style, Future-Readiness)
export const getDisha5Questions = () =>
  axiosInstance.get('api/psychometric/disha5Questions');

export const submitDisha5Assessment = (data: object) =>
  axiosInstance.post('api/psychometric/disha5Assessment', data);

export const getDisha5Result = (userId: string) =>
  axiosInstance.get(`api/psychometric/disha5Result/${userId}`);

// DISHA — Test 6 (Creativity, Innovation & Entrepreneurial Potential)
export const getDisha6Questions = () =>
  axiosInstance.get('api/psychometric/disha6Questions');

export const submitDisha6Assessment = (data: object) =>
  axiosInstance.post('api/psychometric/disha6Assessment', data);

export const getDisha6Result = (userId: string) =>
  axiosInstance.get(`api/psychometric/disha6Result/${userId}`);

// DISHA — Test 7 (Leadership, Management, Teamwork & Organisational Fit)
export const getDisha7Questions = () =>
  axiosInstance.get('api/psychometric/disha7Questions');

export const submitDisha7Assessment = (data: object) =>
  axiosInstance.post('api/psychometric/disha7Assessment', data);

export const getDisha7Result = (userId: string) =>
  axiosInstance.get(`api/psychometric/disha7Result/${userId}`);

// DISHA — Test 8 (Life Values, Work-Life Balance & Career Satisfaction — capstone)
export const getDisha8Questions = () =>
  axiosInstance.get('api/psychometric/disha8Questions');

export const submitDisha8Assessment = (data: object) =>
  axiosInstance.post('api/psychometric/disha8Assessment', data);

export const getDisha8Result = (userId: string) =>
  axiosInstance.get(`api/psychometric/disha8Result/${userId}`);

// DISHA — Class 10 Stream Selection Test (restricted to Class 10 students)
export const getDishaC10Questions = () =>
  axiosInstance.get('api/psychometric/dishaC10Questions');

export const submitDishaC10Assessment = (data: object) =>
  axiosInstance.post('api/psychometric/dishaC10Assessment', data);

export const getDishaC10Result = (userId: string) =>
  axiosInstance.get(`api/psychometric/dishaC10Result/${userId}`);

// DISHA — Class 12 Career Selection Test (restricted to Class 12 students)
export const getDishaC12Questions = () =>
  axiosInstance.get('api/psychometric/dishaC12Questions');

export const submitDishaC12Assessment = (data: object) =>
  axiosInstance.post('api/psychometric/dishaC12Assessment', data);

export const getDishaC12Result = (userId: string) =>
  axiosInstance.get(`api/psychometric/dishaC12Result/${userId}`);

// Blog
export const getBlogs = () => axiosInstance.get('api/studentBlog');

export const getBlogById = (id: string) => axiosInstance.get(`api/studentBlog/${id}`);

export const getApprovedBlogs = (page = 1, limit = 6) =>
  axiosInstance.get(`api/studentBlog/approvedBlogs?page=${page}&limit=${limit}`);

export const getPersonalBlogs = (page = 1, limit = 6) =>
  axiosInstance.get(`api/studentBlog/personalBlogs?page=${page}&limit=${limit}`);

export const createBlog = (payload: { title: string; description: string; media: any[] }) =>
  axiosInstance.post('api/studentBlog/createBlog', payload);

export const uploadBlogMedia = (formData: FormData) =>
  axiosInstance.post('api/studentBlog/mediaUpload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

// Student Experience (resources, events etc.)
export const getStudentExperience = (params: object) =>
  axiosInstance.get('api/student-experience', { params });
