const { z } = require("zod");

const createJobSchema = z.object({
  title: z.string().min(3),
  company: z.string().min(2),
  type: z.enum(["Full-time", "Part-time", "Contract", "Internship", "Remote"]).optional(),
  location: z.string(),
  description: z.string(),
  salary: z.string(),
  status: z.enum(["Open", "Closed", "Paused"]).optional(),
  applyLink: z.string().url(),
});

const updateJobSchema = createJobSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

module.exports = {
  createJobSchema,
  updateJobSchema,
};
