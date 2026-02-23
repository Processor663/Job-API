//Jobs Model
const JobsModel = require("../models/jobs.model");


// Get Jobs
exports.getJobs = async () => {
  try {
    const jobs = await JobsModel.find({});
    return jobs;
  } catch (err) {
    throw new Error(err.message);
  }
};


// Create Job
exports.createJob = async (jobData, userId) => {
  const { title, company, location, type, description, salary, applyLink } =
    jobData;
  try {
    if (!title || !company || !location || !description) {
      throw new Error("Missing required fields");
    }
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

    const jobData = job.toObject();
    console.log(jobData)
    return jobData;
  } catch (err) {
    throw new Error(err.message);
  }
};


// Delete Job
exports.deleteJob = async (jobId) => {
  try {
    if (!jobId) {
      throw new Error("Job ID not provided");
    }

    const deletedJob = await JobsModel.findByIdAndDelete(jobId);

    if (!deletedJob) {
      throw new Error(`Job with ID ${jobId} not found`);
    }

    return deletedJob;
  } catch (err) {
    console.error("Delete Job Error:", err.message);
    throw new Error("Unable to delete Job");
  }
};