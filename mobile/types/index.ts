import { Ionicons } from "@expo/vector-icons";

export type User = {
  _id: string;
  name: string;
  username: string;
  email: string;
  profilePhoto: string;
  coverPhoto?: string;
  isOnline: boolean;
  gender?: "male" | "female" | "other";
  birthday?: Date;
  bio?: string;
  verified: "verified" | "unverified" | "pending";
  lastOnlineAt: Date;
  authProviders: {
    provider: "google" | "facebook" | "local";
    providerId: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
  accessToken?: string;
};

export type Chat = {
  _id: string;
  name: string;
  isGroupChat: boolean;
  isPrivate: boolean;
  isPending: boolean;
  initiator: User;
  users: {
    user: User;
    role: "leader" | "admin" | "member";
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
  archivedInfos: {
    user: User;
    archivedAt: Date;
  }[];
  latestMessage?: Message;
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
  type: "text" | "image" | "video" | "call";
  content: string;
  chat: Chat;
  status: "pending" | "sent" | "delivered" | "seen" | "failed";
  createdAt: Date;
  updatedAt: Date;
};

export type DetailItem = {
  id: string;
  label: string;
  path: string;
  iconName: keyof typeof Ionicons.glyphMap;
};

export type MenuItem = {
  id: string;
  label: string;
  path: string;
  iconName: keyof typeof Ionicons.glyphMap;
};

export type ServiceItem = {
  id: string;
  label: string;
  path: string;
  color: string;
  iconName: keyof typeof Ionicons.glyphMap;
};

export type SettingItem = {
  id: string;
  label: string;
  path: string;
  iconName: keyof typeof Ionicons.glyphMap;
};

export type SettingMenuItem = {
  id: string;
  title: string;
  desc?: string;
  children?: SettingMenuChildItem[];
  iconName: keyof typeof Ionicons.glyphMap;
};

export type SettingMenuChildItem = {
  id: string;
  title: string;
  path: string;
  iconName: keyof typeof Ionicons.glyphMap;
};

export type BeenTogether = {
  _id: string;
  title: string;
  withinEventsCount: number;
  user: User;
  partner: User;
  lovedAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type UpcomingEvent = {
  _id: string;
  title: string;
  startAt: Date | string;
  description?: string;
  icon?: keyof typeof Ionicons.glyphMap; // optional per-row icon
};
