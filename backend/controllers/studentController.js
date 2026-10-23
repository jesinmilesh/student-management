const Student = require('../models/Student');
const { sendSuccess, sendError } = require('../utils/apiResponse');

/**
 * Add a new student
 * POST /api/students (Admin only)
 */
const createStudent = async (req, res, next) => {
  try {
    const { studentId, name, email, phone, department, year, section } = req.body;

    const existingStudentId = await Student.findOne({ studentId: studentId.toUpperCase() });
    if (existingStudentId) {
      return sendError(res, 409, `Student with ID '${studentId}' already exists.`);
    }

    const existingEmail = await Student.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return sendError(res, 409, `Student with email '${email}' already exists.`);
    }

    const student = await Student.create({
      studentId: studentId.toUpperCase(),
      name,
      email: email.toLowerCase(),
      phone,
      department,
      year,
      section: section.toUpperCase()
    });

    return sendSuccess(res, 201, 'Student created successfully', student);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all students with optional search & filter
 * GET /api/students
 */
const getStudents = async (req, res, next) => {
  try {
    const { search, department, year, section } = req.query;
    const filter = {};

    if (department) {
      filter.department = new RegExp(department, 'i');
    }

    if (year) {
      filter.year = parseInt(year, 10);
    }

    if (section) {
      filter.section = section.toUpperCase();
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filter.$or = [
        { name: searchRegex },
        { studentId: searchRegex },
        { email: searchRegex },
        { department: searchRegex }
      ];
    }

    const students = await Student.find(filter).sort({ createdAt: -1 });

    return sendSuccess(res, 200, 'Students fetched successfully', {
      count: students.length,
      students
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get student by Mongo ID
 * GET /api/students/:id
 */
const getStudentById = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return sendError(res, 404, 'Student not found.');
    }

    return sendSuccess(res, 200, 'Student details fetched successfully', student);
  } catch (error) {
    next(error);
  }
};

/**
 * Update student
 * PUT /api/students/:id (Admin only)
 */
const updateStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    const student = await Student.findById(id);
    if (!student) {
      return sendError(res, 404, 'Student not found.');
    }

    if (updates.studentId) {
      updates.studentId = updates.studentId.toUpperCase();
      const existing = await Student.findOne({ studentId: updates.studentId, _id: { $ne: id } });
      if (existing) {
        return sendError(res, 409, `Student with ID '${updates.studentId}' already exists.`);
      }
    }

    if (updates.email) {
      updates.email = updates.email.toLowerCase();
      const existing = await Student.findOne({ email: updates.email, _id: { $ne: id } });
      if (existing) {
        return sendError(res, 409, `Student with email '${updates.email}' already exists.`);
      }
    }

    if (updates.section) {
      updates.section = updates.section.toUpperCase();
    }

    const updatedStudent = await Student.findByIdAndUpdate(id, updates, {
      returnDocument: 'after',
      runValidators: true
    });

    return sendSuccess(res, 200, 'Student updated successfully', updatedStudent);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete student
 * DELETE /api/students/:id (Admin only)
 */
const deleteStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const student = await Student.findByIdAndDelete(id);
    if (!student) {
      return sendError(res, 404, 'Student not found.');
    }

    return sendSuccess(res, 200, 'Student deleted successfully', {
      deletedId: id
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent
};
