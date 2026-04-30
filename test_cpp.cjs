const { exec } = require('child_process');
const util = require('util');
const fs = require('fs').promises;
const execPromise = util.promisify(exec);

async function run() {
  const code = `
#include <iostream>
#include <string>
using namespace std;

string solve(string n) {
  return "true";
}

int main() {
    cout << solve("\"121\"") << endl;
    return 0;
}
  `;
  await fs.writeFile("temp.cpp", code);
  try {
    const { stdout, stderr } = await execPromise("g++ temp.cpp -o temp.out && ./temp.out");
    console.log("STDOUT:", stdout);
    console.log("STDERR:", stderr);
  } catch (e) {
    console.log("ERROR:", e);
  }
}
run();
