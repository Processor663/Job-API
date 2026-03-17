const { StatusCodes } = require("http-status-codes");
const AppError = require("../utils/AppError");
const asyncHandler = require("express-async-handler");
const {
  createJobSchema,
  updateJobSchema,
} = require("../validators/job.validator");
const logger = require("../config/logger");


// Jobs Model
const {
  createJob,
  deleteJob,
  getJobs,
  updateJob,
} = require("../services/jobs.services");

//Get Jobs controller
exports.getJobs = asyncHandler(async (req, res) => {
  // Get jobs from service Layer
  const jobs = await getJobs();
  return res.status(StatusCodes.OK).json({
    success: true,
    count: jobs.length,
    data: jobs,
  });
});

//Create Job Controller
exports.JobCreate = asyncHandler(async (req, res) => {
  // Validate job data usind Zod schema
  const result = createJobSchema.safeParse(req.body);
  if (!result.success) {
    const firstError = result.error?.errors?.[0]?.message || "Invalid input";
    throw new AppError(firstError, StatusCodes.BAD_REQUEST);
  }
  const jobData = result.data;

  // Get user ID from authenticated request
  const userId = req.user.id;
  if (!userId) {
    throw new AppError("User ID is required", StatusCodes.BAD_REQUEST);
  }

  // Create job from service Layer
  const createdJob = await createJob(jobData, userId);
  logger.info("Job created successfully", { jobId: createdJob._id, postedBy: userId });
  return res.status(StatusCodes.CREATED).json({
    success: true,
    message: "Job created successfully",
    data: createdJob,
  });
});

// Update Job Controller
exports.jobUpdate = asyncHandler(async (req, res) => {
  // Validate job data usind Zod schema
  const result = updateJobSchema.safeParse(req.body);
  if (!result.success) {
    const firstError = result.error?.errors?.[0]?.message || "Invalid input";
    throw new AppError(firstError, StatusCodes.BAD_REQUEST);
  }

  // Extract validated data and job ID
  const jobData = result.data;
  const jobId = req.params.id;

  if (!jobId) {
    throw new AppError("Job ID not found", StatusCodes.BAD_REQUEST);
  }

  const updatedJob = await updateJob(jobId, jobData);
  logger.info("Job updated successfully", { jobId: updatedJob._id, updatedBy: req.user.id });
  res.status(StatusCodes.OK).json(updatedJob);
});

// Delete Job Controller
exports.deleteJob = asyncHandler(async (req, res) => {
  const jobId = req.params.id;
  // Validate input
  if (!jobId) {
    throw new AppError("Job ID is required", StatusCodes.BAD_REQUEST);
  }

  // Delete Job from Service Layer
  const deletedJob = await deleteJob(jobId);
  if (!deletedJob) {
    throw new AppError(`Job with ID ${jobId} not found`, StatusCodes.NOT_FOUND);
  }
  logger.info("Job deleted successfully", { jobId: deletedJob._id, deletedBy: req.user.id });
  return res.status(StatusCodes.NO_CONTENT).json({
    success: true,
    message: "Job deleted successfully",
    data: deletedJob,
  });
});
