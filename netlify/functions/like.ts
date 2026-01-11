import { getStore } from "@netlify/blobs";

interface LikeData {
  count: number;
  liked: string[];
}

function getDeviceId(req: Request): { deviceId: string; isNew: boolean } {
  const cookieHeader = req.headers.get("cookie") ?? "";
  const match = cookieHeader.match(/device_id=([^;]+)/);

  if (match) {
    return { deviceId: match[1], isNew: false };
  }
  return { deviceId: crypto.randomUUID(), isNew: true };
}

export default async (req: Request) => {
  const url = new URL(req.url);
  const slug = url.searchParams.get("post");

  const store = getStore("likes");
  const key = `post:${slug}`;
  const data = await store.get(key, { type: "json" });

  const { deviceId, isNew } = getDeviceId(req);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // set cookie for new device
  if (isNew) {
    headers["Set-Cookie"] =
      `device_id=${deviceId};Path=/; Max-Age=63072000; SameSite=Lax`;
  }

  const likeData = (data ?? { count: 0, liked: [] }) as LikeData;
  const likedByUser = likeData.liked.includes(deviceId);

  if (req.method === "POST") {
    if (likedByUser) {
      likeData.liked = likeData.liked.filter((id) => id !== deviceId);
      likeData.count -= 1;
    } else {
      likeData.liked.push(deviceId);
      likeData.count += 1;
    }
    await store.setJSON(key, likeData);
  }

  return new Response(
    JSON.stringify({
      count: likeData.count,
      likedByUser: likeData.liked.includes(deviceId),
    }),
    { headers }
  );
};
