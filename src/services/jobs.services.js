//Jobs Model
const JobsModel = require("../models/jobs.model");

const asyncHandler = require("express-async-handler");

const AppError = require("../utils/AppError");

// Get Jobs
exports.getJobs = async () => {
  const jobs = await JobsModel.find({});
  return jobs;
};

// Create Job
exports.createJob = async (jobData, userId) => {
 
  const job = await JobsModel.create({
    ...jobData,
    postedBy: userId,
  });

  const createdJob = job.toObject();
  return createdJob;
};

// update Job 
exports.updateJob = async (jobId, jobData) => {
  const updatedJob = await JobsModel.findByIdAndUpdate(jobId, jobData, {
    returnDocument: "after",
    runValidators: true,
  }).lean();

  if (!updatedJob) {
    throw new AppError("Job not found", StatusCodes.NOT_FOUND);
  }

  return updatedJob;
};

// Delete Job
exports.deleteJob = async (jobId) => {

  const deletedJob = await JobsModel.findByIdAndDelete(jobId);

  if (!deletedJob) {
    throw new AppError(`Job with ID ${jobId} not found`, StatusCodes.NOT_FOUND);
  }

  return deletedJob;
};
