import { BeenTogetherDB } from "../../models/beenTogether.js";
import resError from "../../utils/resError.js";
import resJson from "../../utils/resJson.js";

export const createOrOpenBeenTogether = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // 1) Pure GET, does not modify timestamps
    const doc = await BeenTogetherDB.findOne({ user: userId }).populate({
      path: "partner",
      select: "-password",
    });
    if (doc) return resJson(res, 200, "Succcessfully fetched.", doc);

    // 2) Create if missing
    try {
      const newDoc = await BeenTogetherDB.create({ user: userId });
      await newDoc.populate({
        path: "partner",
        select: "-password",
      });
      return resJson(res, 201, "Successfully created.", newDoc.toObject());
    } catch (err) {
      if (err && err.code === 11000) {
        const doc = await BeenTogetherDB.findOne({ user: userId })
          .populate({
            path: "partner",
            select: "-password",
          })
          .lean();
        if (doc) return resJson(res, 200, "Successfully fetched.", doc);
      }
      throw resError(err.code || 400, err.message);
    }
  } catch (error) {
    next(error);
  }
};

export const editBeenTogether = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const bt = await BeenTogetherDB.findOneAndUpdate(
      { user: userId },
      req.body,
      { new: true }
    )
      .populate({
        path: "partner",
        select: "-password",
      })
      .lean();

    return resJson(res, 200, "Successfully edited.", bt);
  } catch (error) {
    next(error);
  }
};
