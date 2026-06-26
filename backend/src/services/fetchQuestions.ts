import axios from "axios";

const fetchQuestions = async (): Promise<any> => {
  const res = await axios.get("https://quizapi.io/api/v1/questions", {
    headers: {
      "X-Api-Key": process.env.QUIZ_API_KEY || "",
    },
    params: {
      limit: 10,
    },
  });

  return res.data;
};

export default fetchQuestions;
