const { z } = require("zod");

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(6).max(100),
}).strict();

module.exports = { registerSchema };
