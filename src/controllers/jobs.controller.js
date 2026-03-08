const { StatusCodes } = require("http-status-codes");
const AppError = require("../utils/AppError");
const asyncHandler = require("express-async-handler");

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
  const userId = req.user.id;
  const { title, company, location, type, description, salary, applyLink } =
    req.body;

  if (!userId) {
    throw new Error("User ID is required");
  }

  // Validate job input
  if (
    !title ||
    !company ||
    !location ||
    !description ||
    !salary ||
    !applyLink ||
    !userId
  ) {
    throw new AppError(
      "Job data is required",
      StatusCodes.BAD_REQUEST,
    );
  }

  const jobData = {
    title,
    company,
    location,
    description,
    salary,
    applyLink,
  };

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
  const { title, company, location, description, salary, status, applyLink } =
    req.body;

  const jobId = req.params.id;

  //JobID
  if (!jobId) {
    throw new AppError("Job ID not found", StatusCodes.BAD_REQUEST);
  }

  // Validate job input
  if (
    !title &&
    !company &&
    !location &&
    !description &&
    !salary &&
    !applyLink
   
  ) {
    throw new AppError("At least one field must be provided", StatusCodes.BAD_REQUEST);
  }

  const jobData = {
    title,
    company,
    location,
    description,
    salary,
    status,
    applyLink,
  };

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
