import { EventDB } from "../../models/event.js";
import resError from "../../utils/resError.js";
import resJson from "../../utils/resJson.js";

export const createEvent = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { title, description, startAt } = req.body;

    const event = await EventDB.create({
      user: userId,
      title,
      description,
      startAt,
    });

    return resJson(res, 201, "Successfully created event.", { event });
  } catch (error) {
    next(error);
  }
};

export const getPaginatedEvents = async (req, res, next) => {
  try {
    const user = req.user;
    const page = parseInt(req.params.pageNum);
    const sort = req.params.sort;
    const keyword = req.query.keyword?.trim();
    const withinDays = req.query.withinDays
      ? parseInt(req.query.withinDays, 10)
      : null;

    if (isNaN(page)) {
      throw resError(400, "Page number must be a valid number!");
    }
    if (page <= 0) {
      throw resError(400, "Page number must be greater than 0!");
    }

    if (withinDays !== null && (isNaN(withinDays) || withinDays <= 0)) {
      throw resError(400, "withinDays must be a positive number!");
    }

    const limit = Number(process.env.PAGINATE_LIMIT) || 15;
    const skipCount = limit * (page - 1);

    // Filter: only this user's events
    const eventFilter = { user: user._id };

    // Keyword filter (title or description)
    if (keyword) {
      eventFilter.$or = [
        { title: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ];
    }

    // Sort
    const now = new Date();
    let sortSpec = { startAt: 1 }; // default
    if (sort === "upcoming") {
      eventFilter.startAt = { $gte: now }; // only future (or now)
      if (withinDays) {
        const end = new Date(now);
        end.setDate(end.getDate() + withinDays);
        eventFilter.startAt.$lte = end; // now <= startAt <= end
      }
      sortSpec = { startAt: 1 }; // earliest upcoming first
    } else if (sort === "ended") {
      eventFilter.startAt = { $lt: now }; // only past
      sortSpec = { startAt: -1 }; // most recent past first
    }

    // Fetch events & total count simultaneously
    const [events, totalCount] = await Promise.all([
      EventDB.find(eventFilter)
        .sort(sortSpec)
        .skip(skipCount)
        .limit(limit)
        // .populate({
        //   path: "user",
        //   select: "-password",
        // })
        .lean(),
      EventDB.countDocuments(eventFilter),
    ]);

    const totalPage = Math.ceil(totalCount / limit);

    return resJson(
      res,
      200,
      `${events.length} events returned from page ${page} of ${totalPage}.`,
      {
        totalCount,
        totalPage,
        currentCount: events.length,
        currentPage: page,
        events,
      }
    );
  } catch (error) {
    next(error);
  }
};
