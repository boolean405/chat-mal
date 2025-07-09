import { Ionicons } from "@expo/vector-icons";

export type User = {
  _id: string;
  name: string;
  username: string;
  email: string;
  profilePhoto: string;
  coverPhoto?: string;
  gender?: "male" | "female";
  birthday?: Date;
  bio?: string;
  followers: string[]; // IDs of users who follow this user
  following: string[]; // IDs of users this user follows
  role: "user" | "admin";
  verified: "verified" | "unverified" | "pending";
  lastOnlineAt: Date;
  createdAt: Date;
  updatedAt: Date;
  accessToken?: string;
};

export type Post = {
  _id: string;
  type: "text" | "photo" | "video";
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  createdAt: string;
  loved?: boolean;
  loveCount?: number;
  commentCount?: number;
  shareCount?: number;
  user: Omit<User, "posts">;
};

export type Chat = {
  _id: string;
  name: string;
  isGroupChat: boolean;
  isPending: boolean;
  initiator: User;
  users: {
    user: User;
    joinedAt: Date;
  }[];
  groupPhoto?: string;
  unreadCounts: {
    user: User;
    count: number;
  }[];
  deletedInfos: {
    user: User;
    deletedAt: Date;
  }[];
  latestMessage?: Message;
  groupAdmins: {
    user: User;
    joinedAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
};

export type Story = {
  _id: string;
  name: string;
  storyUri: string;
  hasStory: boolean;
  user?: User;
};

export type BottomSheetOption = {
  _id: string;
  name: string;
  icon: string;
  path: string;
};

export type Message = {
  _id: string;
  sender: User;
  type: "text" | "image";
  content: string;
  chat: Chat;
  status: "sent" | "delivered" | "seen";
  createdAt: Date;
  updatedAt: Date;
};

export type DetailItem = {
  id: string;
  label: string;
  iconName: keyof typeof Ionicons.glyphMap;
  path: string;
};
