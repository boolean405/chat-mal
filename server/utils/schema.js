import Joi from "joi";

export const UserSchema = {
  register: Joi.object({
    name: Joi.string()
      .pattern(/^[A-Za-z ]+$/)
      .min(1)
      .max(20)
      .required(),
    username: Joi.string()
      .pattern(/^[a-z0-9]+$/)
      .min(5)
      .max(20)
      .required(),
    email: Joi.string().email({ minDomainSegments: 2 }).lowercase().required(),
    password: Joi.string()
      .pattern(new RegExp('^[a-zA-Z0-9!@#$%^&*()_+={}|:"<>?\\,-.]{8,30}$'))
      .required(),
  }),

  login: Joi.object({
    email: Joi.string().email({ minDomainSegments: 2 }).lowercase().required(),
    password: Joi.string()
      .pattern(new RegExp('^[a-zA-Z0-9!@#$%^&*()_+={}|:"<>?\\,-.]{8,30}$'))
      .required(),
  }),

  changeName: Joi.object({
    name: Joi.string()
      .pattern(/^[A-Za-z ]+$/)
      .min(1)
      .max(20)
      .required(),
  }),

  changeUsername: Joi.object({
    username: Joi.string()
      .pattern(/^[a-z0-9]+$/)
      .min(5)
      .max(20)
      .required(),
  }),

  changePassword: Joi.object({
    oldPassword: Joi.string()
      .pattern(new RegExp('^[a-zA-Z0-9!@#$%^&*()_+={}|:"<>?\\,-.]{8,30}$'))
      .required(),
    newPassword: Joi.string()
      .pattern(new RegExp('^[a-zA-Z0-9!@#$%^&*()_+={}|:"<>?\\,-.]{8,30}$'))
      .required(),
  }),

  createLocalPassword: Joi.object({
    newPassword: Joi.string()
      .pattern(new RegExp('^[a-zA-Z0-9!@#$%^&*()_+={}|:"<>?\\,-.]{8,30}$'))
      .required(),
  }),

  deleteAccount: Joi.object({
    password: Joi.string()
      .pattern(new RegExp('^[a-zA-Z0-9!@#$%^&*()_+={}|:"<>?\\,-.]{8,30}$'))
      .required(),
  }),

  registerVerify: Joi.object({
    code: Joi.string().required(),
    email: Joi.string().email({ minDomainSegments: 2 }).lowercase().required(),
  }),

  uploadPhoto: Joi.object({
    profilePhoto: Joi.string(),
    coverPhoto: Joi.string(),
  }),

  deletePhoto: Joi.object({
    profilePhoto: Joi.string(),
    coverPhoto: Joi.string(),
  }),

  changeNames: Joi.object({
    name: Joi.string()
      .pattern(/^[\p{L}\p{M} ]+$/u)
      .min(1)
      .max(20),
    username: Joi.string()
      .pattern(/^[a-z0-9]+$/)
      .min(5)
      .max(20),
  }),

  existEmail: Joi.object({
    email: Joi.string().email({ minDomainSegments: 2 }).lowercase().required(),
  }),

  existUsername: Joi.object({
    username: Joi.string()
      .pattern(/^[a-z0-9]+$/)
      .min(5)
      .max(20)
      .required(),
  }),

  forgotPassword: Joi.object({
    email: Joi.string().email({ minDomainSegments: 2 }).lowercase().required(),
  }),

  forgotPasswordVerify: Joi.object({
    code: Joi.string().required(),
    email: Joi.string().email({ minDomainSegments: 2 }).lowercase().required(),
  }),

  updatePushToken: Joi.object({
    pushToken: Joi.string().required(),
  }),

  loginGoogle: Joi.object({
    name: Joi.string().required(),
    profilePhoto: Joi.string().required(),
    googleId: Joi.string().required(),
    email: Joi.string().email({ minDomainSegments: 2 }).lowercase().required(),
  }),

  resetPassword: Joi.object({
    email: Joi.string().email({ minDomainSegments: 2 }).lowercase().required(),
    newPassword: Joi.string()
      .pattern(new RegExp('^[a-zA-Z0-9!@#$%^&*()_+={}|:"<>?\\,-.]{8,30}$'))
      .required(),
  }),

  follow: Joi.object({
    userId: Joi.string().length(24).hex().required(),
  }),

  block: Joi.object({
    userId: Joi.string().length(24).hex().required(),
  }),

  params: {
    userId: Joi.object({
      userId: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .required(),
    }),
    pageNum: Joi.object({
      pageNum: Joi.string().min(1).required(),
    }),
    type: Joi.object({
      type: Joi.string()
        .valid("friends", "followers", "following")
        .default("Friends")
        .required(),
    }),
    sort: Joi.object({
      sort: Joi.string()
        .valid("online", "a-z", "z-a", "newest", "oldest")
        .default("online")
        .required(),
    }),
  },
};

export const ChatSchema = {
  createOrOpen: Joi.object({
    userId: Joi.string().length(24).hex(),
    chatId: Joi.string().length(24).hex(),
  }).xor("userId", "chatId"),

  createGroup: Joi.object({
    name: Joi.string().min(1).max(30),
    groupPhoto: Joi.string(),
    userIds: Joi.array()
      .items(Joi.string().length(24).hex().required())
      .min(1)
      .required(),
  }),

  changeName: Joi.object({
    name: Joi.string().min(1).max(30).required(),
    chatId: Joi.string().length(24).hex().required(),
  }),

  addUsersToGroup: Joi.object({
    groupId: Joi.string().length(24).hex().required(),
    userIds: Joi.array()
      .items(Joi.string().length(24).hex().required())
      .min(1)
      .required(),
  }),

  addAdminToGroup: Joi.object({
    groupId: Joi.string().length(24).hex().required(),
    userId: Joi.string().length(24).hex().required(),
  }),

  removeAdminFromGroup: Joi.object({
    groupId: Joi.string().length(24).hex().required(),
    userId: Joi.string().length(24).hex().required(),
  }),

  removeUserFromGroup: Joi.object({
    groupId: Joi.string().length(24).hex().required(),
    userId: Joi.string().length(24).hex().required(),
  }),

  deleteChat: Joi.object({
    chatId: Joi.string().length(24).hex().required(),
  }),

  leaveGroup: Joi.object({
    groupId: Joi.string().length(24).hex().required(),
  }),

  acceptChatRequest: Joi.object({
    chatId: Joi.string().length(24).hex().required(),
  }),

  readChat: Joi.object({
    chatId: Joi.string().length(24).hex().required(),
  }),

  archiveChat: Joi.object({
    chatId: Joi.string().length(24).hex().required(),
  }),

  unarchiveChat: Joi.object({
    chatId: Joi.string().length(24).hex().required(),
  }),

  params: {
    pageNum: Joi.object({
      pageNum: Joi.string().min(1).required(),
    }),

    chatId: Joi.object({
      chatId: Joi.string().length(24).hex().required(),
    }),

    groupType: Joi.object({
      type: Joi.string()
        .lowercase()
        .valid("all", "my", "recommend")
        .default("all")
        .required(),
    }),

    sort: Joi.object({
      sort: Joi.string()
        .lowercase()
        .valid("popular", "new", "a-z", "z-a", "active")
        .default("active")
        .required(),
    }),
  },
};

export const MessageSchema = {
  createMessage: Joi.object({
    chatId: Joi.string().length(24).hex().required(),
    type: Joi.string().valid("text", "image", "video").default("text"),
    content: Joi.when("type", {
      is: "text",
      then: Joi.string().min(1).required(),
      otherwise: Joi.string().uri().required(),
    }),
  }),

  messageDelivered: Joi.object({
    chatId: Joi.string().length(24).hex().required(),
  }),

  params: {
    pageNum: Joi.object({
      pageNum: Joi.string().min(1).required(),
    }),
    chatId: Joi.object({
      chatId: Joi.string().length(24).hex().required(),
    }),
  },
};

export const BeenTogetherSchema = {
  edit: Joi.object({
    lovedAt: Joi.date().optional(),
    eventsDayCount: Joi.number().optional(),
    title: Joi.string().min(1).max(50).optional(),
    partner: Joi.alternatives()
      .try(Joi.string().length(24).hex(), Joi.valid(null))
      .optional(),
  }),
};

export const EventSchema = {
  create: Joi.object({
    title: Joi.string().min(1).max(50).required(),
    description: Joi.string().min(1).max(500).optional(),
    startAt: Joi.date().required(),
  }),

  params: {
    pageNum: Joi.object({
      pageNum: Joi.string().min(1).required(),
    }),
    sort: Joi.object({
      sort: Joi.string()
        .lowercase()
        .valid("upcoming", "ended")
        .default("upcoming")
        .required(),
    }),
  },
};
