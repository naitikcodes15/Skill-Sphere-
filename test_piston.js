const axios = require("axios");
async function test() {
  const res = await axios.post("https://emacs.piston.rs/api/v2/execute", {
    language: "js",
    version: "*",
    files: [{ content: "console.log('hello piston')" }]
  });
  console.log(res.data);
}
test();
