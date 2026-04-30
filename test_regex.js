const code1 = `
class Solution:
    def isPalindrome(self, x: int) -> bool:
        return True
`;

const pyMatchClass = code1.match(/class\s+([a-zA-Z0-9_]+)[\s\S]*?def\s+([a-zA-Z0-9_]+)\s*\(/);
console.log("Class Match:", pyMatchClass ? pyMatchClass[1] + "()." + pyMatchClass[2] : null);

const code2 = `
def isAnagram(s, t):
    return True
`;
const pyMatchFunc = code2.match(/def\s+([a-zA-Z0-9_]+)\s*\(/);
console.log("Func Match:", pyMatchFunc ? pyMatchFunc[1] : null);

