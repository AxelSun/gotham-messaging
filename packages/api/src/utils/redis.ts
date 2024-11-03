import Redis from "ioredis";

export const redisSubscriber = new Redis({
  host: "localhost",
  port: 6379,
});

export const redisPublisher = new Redis({
  host: "localhost",
  port: 6379,
});

redisSubscriber.on("error", (error) => {
  console.error("Redis connection error:", error);
});

redisSubscriber.on("connect", () => {
  console.log("Successfully connected to Redis");
});

redisPublisher.on("error", (error) => {
  console.error("Redis connection error:", error);
});

redisPublisher.on("connect", () => {
  console.log("Successfully connected to Redis");
});
