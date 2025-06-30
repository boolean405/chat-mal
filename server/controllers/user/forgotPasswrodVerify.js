import verifyDB from "../../models/verify.js";
import resJson from "../../utils/resJson.js";
import resError from "../../utils/resError.js";

const forgotPasswordVerify = async (req, res, next) => {
  try {
    const { email, code } = req.body;
    if (!(await verifyDB.findOne({ email })))
      throw resError(400, "Invalid email!");

    const record = await verifyDB.findOne({ code });
    if (!record) throw resError(400, "Invalid verification code!");

    if (record.expiresAt < new Date())
      throw resError(410, "Expired verification code!");

    await verifyDB.findByIdAndDelete(record._id);

    resJson(res, 200, "Success verify, now change your password.");
  } catch (error) {
    error.status = error.status;
    next(error);
  }
};

export default forgotPasswordVerify;
