import { BACKEND_URL } from "../utils/api";

const API_URL = `${BACKEND_URL}/api/questions`;

export const fetchPracticeQuestions = async () => {
  const response = await fetch(`${API_URL}/practice`);
  if (!response.ok) throw new Error("Network response was not ok");
  return await response.json();
};