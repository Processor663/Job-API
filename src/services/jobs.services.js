//Jobs Model
const JobsModel = require("../models/jobs.model");

const asyncHandler = require("express-async-handler");

const AppError = require("../utils/AppError");

// Get Jobs
exports.getJobs = asyncHandler(async () => {
  const jobs = await JobsModel.find({});
  return jobs;
});

// Create Job
exports.createJob = asyncHandler(async (jobData, userId) => {
  const { title, company, location, type, description, salary, applyLink } =
    jobData;

  const job = await JobsModel.create({
    title,
    company,
    location,
    type,
    description,
    salary,
    applyLink,
    postedBy: userId,
  });

  const createdJob = job.toObject();
  return createdJob;
});

// Delete Job
exports.deleteJob = asyncHandler(async (jobId) => {

  const deletedJob = await JobsModel.findByIdAndDelete(jobId);

  if (!deletedJob) {
    throw new AppError(`Job with ID ${jobId} not found`, StatusCodes.NOT_FOUND);
  }

  return deletedJob;
});
