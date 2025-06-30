import { Post, User } from "@/types";

export async function fetchUser(): Promise<User> {
  await new Promise((res) => setTimeout(res, 800));

  const user: User = {
    _id: "1",
    name: "Jane Doe",
    username: "boolean",
    email: "jane@example.com", // add missing fields
    password: "securepassword", // add missing fields
    profilePhoto: "https://randomuser.me/api/portraits/women/44.jpg",
    coverPhoto: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
    bio: "Welcome to my profile! Love to share thoughts, photos, and videos.",
    followers: 1280,
    following: 342,
  };

  const userForPost = { ...user };
  delete userForPost.posts; // ensure posts is excluded (optional, but safe)

  const posts: Post[] = [
    {
      _id: "p1",
      type: "text",
      content: "Hello world! My first post!",
      createdAt: "2025-06-07T10:00:00Z",
      loved: false,
      loveCount: 3,
      commentCount: 2,
      shareCount: 1,
      user: userForPost,
    },
    {
      _id: "p2",
      type: "photo",
      content: "Check out this cool place I visited.",
      imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
      createdAt: "2025-06-06T15:30:00Z",
      loved: false,
      loveCount: 10,
      commentCount: 5,
      shareCount: 0,
      user: userForPost,
    },
    {
      _id: "p3",
      type: "video",
      content: "Funny moment from my trip 😂",
      videoUrl:
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      createdAt: "2025-06-05T12:10:00Z",
      loved: false,
      loveCount: 7,
      commentCount: 3,
      shareCount: 2,
      user: userForPost,
    },
  ];

  return { ...user, posts };
}
