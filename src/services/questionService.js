const API_URL = "http://localhost:5000/api/questions";

export const fetchPracticeQuestions = async () => {
  const response = await fetch(`${API_URL}/practice`);
  if (!response.ok) throw new Error("Network response was not ok");
  return await response.json();
};