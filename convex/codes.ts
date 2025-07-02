import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getCode = query({
  args: { meetingId: v.string() },
  handler: async (ctx, args) => {
    const codeDoc = await ctx.db
      .query("codes")
      .withIndex("by_meetingId", (q) => q.eq("meetingId", args.meetingId))
      .first();
    return codeDoc ? codeDoc.code : "";
  },
});

export const updateCode = mutation({
  args: { meetingId: v.string(), code: v.string(), language: v.string() },
  handler: async (ctx, args) => {
    const codeDoc = await ctx.db
      .query("codes")
      .withIndex("by_meetingId", (q) => q.eq("meetingId", args.meetingId))
      .first();
    if (codeDoc) {
      await ctx.db.patch(codeDoc._id, { code: args.code, language: args.language });
    } else {
      await ctx.db.insert("codes", { meetingId: args.meetingId, code: args.code, language: args.language });
    }
  },
});

export const getOutput = query({
  args: { meetingId: v.string() },
  handler: async (ctx, args) => {
    const codeDoc = await ctx.db
      .query("codes")
      .withIndex("by_meetingId", (q) => q.eq("meetingId", args.meetingId))
      .first();
    return codeDoc ? codeDoc.output || "" : "";
  },
});

export const updateOutput = mutation({
  args: { meetingId: v.string(), output: v.string() },
  handler: async (ctx, args) => {
    const codeDoc = await ctx.db
      .query("codes")
      .withIndex("by_meetingId", (q) => q.eq("meetingId", args.meetingId))
      .first();
    if (codeDoc) {
      await ctx.db.patch(codeDoc._id, { output: args.output });
    } else {
      await ctx.db.insert("codes", { meetingId: args.meetingId, code: "", language: "", output: args.output });
    }
  },
});

export const getLanguage = query({
  args: { meetingId: v.string() },
  handler: async (ctx, args) => {
    const codeDoc = await ctx.db
      .query("codes")
      .withIndex("by_meetingId", (q) => q.eq("meetingId", args.meetingId))
      .first();
    return codeDoc ? codeDoc.language || "javascript" : "javascript";
  },
});

export const updateLanguage = mutation({
  args: { meetingId: v.string(), language: v.string() },
  handler: async (ctx, args) => {
    const codeDoc = await ctx.db
      .query("codes")
      .withIndex("by_meetingId", (q) => q.eq("meetingId", args.meetingId))
      .first();
    if (codeDoc) {
      await ctx.db.patch(codeDoc._id, { language: args.language });
    } else {
      await ctx.db.insert("codes", { meetingId: args.meetingId, code: "", language: args.language });
    }
  },
});
