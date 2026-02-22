const { StatusCodes } = require("http-status-codes");

// Jobs Model
const { createJob, deleteJob } = require("../services/jobs.services");


exports.JobCreate = async (req, res) => {
  try {
    const userId = req.user.id;
    const jobData = req.body;
    console.log(jobData)

    // Validate input
    if (!jobData || Object.keys(jobData).length === 0 || !userId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Job data is required",
      });
    }

    // Create job
    const createdJob = await createJob(jobData, userId);
    return res.status(StatusCodes.CREATED).json({
      success: true,
      message: "Job created successfully",
      data: createdJob,
    });

  } catch (err) {
    console.error("Job creation error:", err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to create job",
    });
  }
};

// Delete Job
exports.deleteJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    // Validate input
    if (!jobId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Job ID is required",
      });
    }

    // Delete job
    const deletedJob = await deleteJob(jobId);
    return res.status(StatusCodes.OK).json({
      success: true,
      message: "Job deleted successfully",
      data: deletedJob,
    });

  } catch (err) {
    console.error("Job creation error:", err);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to create job",
    });
  }
};