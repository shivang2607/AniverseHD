import axios from "axios"
import { LRUCache } from "lru-cache";
import { NextResponse } from "next/server";

const notificationCache = new LRUCache({
  max: 50, // Maximum number of items in the cache    
  ttl: 1000 * 60 * 20, // Time to live in milliseconds (20 minutes) 
});


export async function GET(req) {
  const userId = req.headers.get("user-id");
  const limit = req.nextUrl.searchParams.get("limit") || 50; //all the checks and || conditions are also handled in the worker
  const offset = req.nextUrl.searchParams.get("offset") || 0;
  const getAll = req.nextUrl.searchParams.get("getAll") === "true";
  const isRead = req.nextUrl.searchParams.get("isRead") === "true";

  //validate userId
  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  try {
    const data = {
      getAll,
      isRead,
      limit: parseInt(limit, 10),  //here 10 is not the limit but the decimal base for parseInt also known as radix
      offset: parseInt(offset, 10),
    };

    if (notificationCache.has(`${userId}`)) {
        console.log("Cache hit for notifications");
        return NextResponse.json(notificationCache.get(`${userId}`));
    }

    const res = await axios.get(
      `${process.env.WORKER_URL}/api/${process.env.WORKER_VERSION}/notifications`,
      { params: data, headers: { "user-id": userId } }
    );
    // ony Cache the response when getAll is false
    if (!getAll) {
    notificationCache.set(`${userId}`, res?.data);
    }

return NextResponse.json(res?.data);


  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: `Error -> ${error?.response?.data}` },
      { status: error.response?.status || 500 }
    );
  }
}

//* IMP INFO : In the caching we using, we are only considering the userId as the key, this is because at the time of read notifcation we wont have the other params except the userid, so we wouldn't be able to invalidate the cache based on other params like isRead, getAll, limit, offset etc. So we are only caching the response based on userId and invalidating it when the user marks notifications as read.

// !below method will only be used for marking notifications as read
export async function PUT(req) {
  const userId = req.headers.get("user-id");
  const payload = await req.json(); //payload has only one thing which is notificationId, if not provided then all the notifications will be marked as read

  //validate userId
  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  try {
    const res = await axios.put(
      `${process.env.WORKER_URL}/api/${process.env.WORKER_VERSION}/mark-read-notifications`,
        payload,
      { headers: { "user-id": userId } }
    );

    // Invalidate cache for this user
    notificationCache.delete(`${userId}`);

    return NextResponse.json(res?.data);
  } catch (error) {
    console.error("Error updating notifications:", error);
    return NextResponse.json(
      { error: `Error -> ${error?.response?.data}` },
      { status: error.response?.status || 500 }
    );
  }
}

