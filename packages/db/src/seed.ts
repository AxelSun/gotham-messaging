import { db } from "./client";
import { messages, threads, users } from "./schema";

function minutesAgo(min: number) {
  const date = new Date();
  date.setMinutes(date.getMinutes() - min);
  return date;
}

async function seedDb() {
  try {
    // Insert users
    const insertedUsers = (await db
      .insert(users)
      .values([
        { username: "Batman", password: "Bat" },
        { username: "Robin", password: "Rob" },
        { username: "Alfred", password: "Alf" },
        { username: "Bane", password: "Venom" },
        { username: "Joker", password: "HaHaHa" },
        { username: "HarveyDent", password: "TwoFace" },
        { username: "Penguin", password: "Quack" },
      ])
      .returning()) as {
      id: number;
      username: string;
      password: string;
      createdAt: Date;
    }[];

    // Create a user map for easy access
    const userMap = new Map<string, number>();
    insertedUsers.forEach((user) => {
      userMap.set(user.username, user.id);
    });

    // Insert threads
    const insertedThreads = (await db
      .insert(threads)
      .values([
        {
          user1Id: userMap.get("Batman") ?? 0,
          user2Id: userMap.get("Robin") ?? 0,
        },
        {
          user1Id: userMap.get("Batman") ?? 0,
          user2Id: userMap.get("Alfred") ?? 0,
        },
        {
          user1Id: userMap.get("Batman") ?? 0,
          user2Id: userMap.get("Bane") ?? 0,
        },
        {
          user1Id: userMap.get("Batman") ?? 0,
          user2Id: userMap.get("Joker") ?? 0,
        },
        {
          user1Id: userMap.get("Batman") ?? 0,
          user2Id: userMap.get("HarveyDent") ?? 0,
        },
        {
          user1Id: userMap.get("Batman") ?? 0,
          user2Id: userMap.get("Penguin") ?? 0,
        },
        {
          user1Id: userMap.get("Joker") ?? 0,
          user2Id: userMap.get("HarveyDent") ?? 0,
        },
        {
          user1Id: userMap.get("Bane") ?? 0,
          user2Id: userMap.get("Joker") ?? 0,
        },
      ])
      .returning()) as {
      id: number;
      user1Id: number;
      user2Id: number;
      createdAt: Date;
    }[];

    // Prepare conversations
    const batmanJokerConversation = [
      { sender: "Joker", content: "Why so serious?" },
      { sender: "Batman", content: "What do you want?" },
      { sender: "Joker", content: "I want to see the world burn!" },
      { sender: "Batman", content: "I'm going to stop you." },
      {
        sender: "Joker",
        content:
          "You can't stop me. This city deserves a better class of criminal.",
      },
      { sender: "Batman", content: "You'll never win." },
      { sender: "Joker", content: "Oh, you think darkness is your ally?" },
      { sender: "Batman", content: "That's Bane's line." },
      { sender: "Joker", content: "Oops, wrong script." },
      { sender: "Batman", content: "Tell me where Harvey is." },
      {
        sender: "Joker",
        content: "You have nothing, nothing to threaten me with!",
      },
      {
        sender: "Batman",
        content: "I'm not going to kill you, but I don't have to save you.",
      },
      { sender: "Joker", content: "We're destined to do this forever." },
      { sender: "Batman", content: "Not if I can help it." },
      {
        sender: "Joker",
        content: "See, I'm not a monster. I'm just ahead of the curve.",
      },
      { sender: "Batman", content: "Then you'll be the first to fall." },
      { sender: "Joker", content: "Let's put a smile on that face!" },
      { sender: "Batman", content: "Enough games." },
      {
        sender: "Joker",
        content: "Madness is like gravity. All it takes is a little push.",
      },
      { sender: "Batman", content: "This ends now." },
    ];

    const batmanBaneConversation = [
      { sender: "Bane", content: "Ah, you think darkness is your ally?" },
      { sender: "Batman", content: "Bane." },
      { sender: "Bane", content: "I was born in it, molded by it." },
      { sender: "Batman", content: "What are you?" },
      { sender: "Bane", content: "I'm Gotham's reckoning." },
      { sender: "Batman", content: "You'll never get away with this." },
      { sender: "Bane", content: "Do you feel in charge?" },
      { sender: "Batman", content: "I'm not afraid of you." },
      { sender: "Bane", content: "Your punishment must be more severe." },
      { sender: "Batman", content: "I'm the hero this city needs." },
      {
        sender: "Bane",
        content: "When Gotham is ashes, you have my permission to die.",
      },
      { sender: "Batman", content: "Not today." },
      {
        sender: "Bane",
        content: "Peace has cost you your strength. Victory has defeated you.",
      },
      { sender: "Batman", content: "I will stop you." },
      { sender: "Bane", content: "Impossible." },
      { sender: "Batman", content: "Nothing is impossible." },
      { sender: "Bane", content: "We will see." },
      { sender: "Batman", content: "Yes, we will." },
      { sender: "Bane", content: "Let the games begin!" },
      { sender: "Batman", content: "Bring it on." },
    ];

    const harveyDentConversation = [
      { sender: "Batman", content: "Harvey, you need to calm down." },
      {
        sender: "HarveyDent",
        content:
          "You either die a hero or live long enough to see yourself become the villain.",
      },
      { sender: "Batman", content: "Don't let anger consume you." },
      { sender: "HarveyDent", content: "My name is Two-Face now." },
      { sender: "Batman", content: "This isn't you, Harvey." },
      { sender: "HarveyDent", content: "Why should I hide who I am?" },
      { sender: "Batman", content: "Gotham needs you." },
      {
        sender: "HarveyDent",
        content: "Gotham needs a better class of criminal.",
      },
      { sender: "Batman", content: "Don't do this." },
      { sender: "HarveyDent", content: "Let's flip a coin." },
      { sender: "Batman", content: "Chance isn't justice." },
      { sender: "HarveyDent", content: "It's fair." },
      { sender: "Batman", content: "I'm sorry." },
      { sender: "HarveyDent", content: "You will be." },
    ];

    const penguinConversation = [
      { sender: "Penguin", content: "Quack quack!" },
      { sender: "Batman", content: "Penguin, stop this madness." },
      { sender: "Penguin", content: "Gotham is mine for the taking!" },
      { sender: "Batman", content: "Not while I'm here." },
      { sender: "Penguin", content: "We'll see about that, Batman." },
      { sender: "Batman", content: "Surrender now." },
      { sender: "Penguin", content: "Never!" },
    ];

    function generateMessages(
      conversation: { sender: string; content: string }[],
      threadIndex: number,
      startMinutesAgo: number,
    ) {
      return conversation.map((message, index) => ({
        threadId: insertedThreads[threadIndex]?.id ?? 0,
        senderId: userMap.get(message.sender) ?? 0,
        content: message.content,
        timestamp: minutesAgo(startMinutesAgo - index),
      }));
    }

    const batmanJokerMessages = generateMessages(
      batmanJokerConversation,
      3,
      120,
    );
    const batmanBaneMessages = generateMessages(batmanBaneConversation, 2, 200);
    const harveyDentMessages = generateMessages(harveyDentConversation, 4, 300);
    const penguinMessages = generateMessages(penguinConversation, 5, 400);

    await db.insert(messages).values([
      {
        threadId: insertedThreads[0]?.id ?? 0,
        senderId: userMap.get("Batman") ?? 0,
        content: "To the Batcave!",
        timestamp: minutesAgo(14),
      },
      {
        threadId: insertedThreads[0]?.id ?? 0,
        senderId: userMap.get("Robin") ?? 0,
        content: "Holy seeds, Batman!",
        timestamp: minutesAgo(2),
      },
      {
        threadId: insertedThreads[1]?.id ?? 0,
        senderId: userMap.get("Alfred") ?? 0,
        content: "Dinner is served, sir.",
        timestamp: minutesAgo(305),
      },
      {
        threadId: insertedThreads[1]?.id ?? 0,
        senderId: userMap.get("Batman") ?? 0,
        content: "Thank you, Alfred.",
        timestamp: minutesAgo(45),
      },
      ...batmanJokerMessages,
      ...batmanBaneMessages,
      ...harveyDentMessages,
      ...penguinMessages,
    ]);

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}

seedDb()
  .catch((error) => {
    console.error("Failed to seed database:", error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
