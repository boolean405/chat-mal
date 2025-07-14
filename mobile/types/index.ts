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
  role: "user" | "admin";
  verified: "verified" | "unverified" | "pending";
  lastOnlineAt: Date;
  createdAt: Date;
  updatedAt: Date;
  accessToken?: string;
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
  unreadInfos: {
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
  status: "pending" | "sent" | "delivered" | "seen" | "failed";
  createdAt: Date;
  updatedAt: Date;
};

export type DetailItem = {
  id: string;
  label: string;
  iconName: keyof typeof Ionicons.glyphMap;
  path: string;
};

export type MenuItem = {
  id: string;
  label: string;
  iconName: keyof typeof Ionicons.glyphMap;
  path: string;
};

export type SettingItem = {
  id: string;
  label: string;
  iconName: keyof typeof Ionicons.glyphMap;
  path: string;
};
