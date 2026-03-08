const { StatusCodes } = require("http-status-codes");
const AppError = require("../utils/AppError");
const asyncHandler = require("express-async-handler");
const { createJobSchema, updateJobSchema } = require("../validators/job.validator");

// Jobs Model
const { createJob, deleteJob, getJobs, updateJob } = require("../services/jobs.services");

//Get Jobs controller
exports.getJobs = asyncHandler(async (req, res) => {
  // Get jobs from service Layer
  const jobs = await getJobs();
  if (!jobs || jobs.length === 0) {
    throw new AppError("No jobs found", StatusCodes.NOT_FOUND);
  }
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
  return res.status(StatusCodes.CREATED).json({
    success: true,
    message: "Job created successfully",
    data: createdJob,
  });
});

// Update Job Controller
exports.jobUpdate = asyncHandler( async (req, res) => {

  const jobId = req.params.id;
  const jobData = req.body;

  //JobID
  if (!jobId) {
    throw new AppError("Job ID not found", StatusCodes.BAD_REQUEST);
  }

  const updatedJob = await updateJob(jobId, jobData);
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
  return res.status(StatusCodes.OK).json({
    success: true,
    message: "Job deleted successfully",
    data: deletedJob,
  });
});
