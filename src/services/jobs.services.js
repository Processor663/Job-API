//Jobs Model
const JobsModel = require("../models/jobs.model");

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



exports.deleteJob = async (jobId) => {

  try {
    if (!jobId) {
      throw new Error("delete ID not found");
    }
    // const deletedJob = await JobsModel.findByIdAndDelete({id:jobId}, newValidation: true, new:true);
    const deletedJob = await JobsModel.findByIdAndDelete({id:jobId});
    return deletedJob
  } catch (err) {
    console.log(err.message)
    throw new Error(" unabe to delete Job ");
  }
};
