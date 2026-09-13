export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  studentId?: string;
  profileImage?: string;
  role?: string;
  schoolId?: string;
  grade?: string;
  interests?: string[];
}

export interface Career {
  _id: string;
  title: string;
  industry?: string;
  description?: string;
  progression?: string;
  educationPath?: string;
  keySkills?: string[];
  topInstitutionsIndia?: string[];
  globalPathways?: string[];
  whatYouActuallyDo?: string[];
  exposure?: string[];
  entranceExams?: string[];
  scholarships?: string[];
  lateralOptions?: string[];
  adjacentRoles?: string[];
  whoShouldNotChoose?: string;
  // legacy/optional
  category?: string;
  skills?: string[];
  salary?: string;
  growth?: string;
  education?: string;
  image?: string;
}

export interface University {
  _id: string;
  name: string;
  city?: string;
  state?: string;
  country?: string;
  rankAccreditation?: string;
  type?: string;
  establishedYear?: string;
  coursesOffered?: string[];
  specializations?: string[];
  feesRange?: string;
  averagePackage?: string;
  highestPackage?: string;
  facilities?: string[];
  modeOfEntry?: string;
  acceptanceRate?: string;
  cutOffTrend?: string;
  entranceExams?: string[];
  officialWebsite?: string;
  // legacy
  location?: string;
  ranking?: number;
  courses?: string[];
  website?: string;
  description?: string;
  fees?: string;
}

export interface PsychometricQuestion {
  _id: string;
  question: string;
  options?: string[];
  type?: string;
}

export interface BlogPost {
  _id: string;
  title: string;
  content?: string;
  author?: string;
  createdAt?: string;
  image?: string;
  tags?: string[];
}

// Student blog (matches pioneer-client-deploy / backend studentBlog shape)
export interface BlogMedia {
  guid?: string;
  key?: string;
  name?: string;
  url?: string;
  publicUrl?: string;
  mimetype?: string;
}

export interface StudentBlog {
  _id: string;
  title: string;
  description?: string;
  createdAt?: string;
  isApproved?: boolean;
  imageUrls?: BlogMedia[];
  studentId?: { personalInfo?: { fullName?: string } } | string;
}

export interface BlogPagination {
  totalBlogs?: number;
  currentPage?: number;
  totalPages?: number;
  limit?: number;
}

export interface Counsellor {
  id: string;
  name: string;
  specialization: string;
  experience: string;
  rating: number;
  slots?: string[];
}
