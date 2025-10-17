"use client";

import { set, get } from "idb-keyval";

const LAST_LESSON_KEY = "coursecraft:last-lesson";

export const rememberLastLesson = async (
  courseId: string,
  lessonId: string
) => {
  await set(`${LAST_LESSON_KEY}:${courseId}`, lessonId);
};

export const getLastLesson = async (courseId: string) => {
  return get<string>(`${LAST_LESSON_KEY}:${courseId}`);
};

export const cacheVideoForOffline = async (url: string) => {
  if (!("caches" in window)) return;

  try {
    const cache = await caches.open("coursecraft-videos");
    const response = await fetch(url, { credentials: "include" });
    if (response.ok) {
      await cache.put(url, response.clone());
    }
  } catch (error) {
    console.error("Unable to cache video", error);
  }
};
