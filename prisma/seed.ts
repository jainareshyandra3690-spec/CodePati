import { PrismaClient, Difficulty, ProgramStatus, Role } from "@prisma/client";

const prisma = new PrismaClient();

const initialLanguages = [
  { name: "C", slug: "c", fileExtension: ".c" },
  { name: "C++", slug: "cpp", fileExtension: ".cpp" },
  { name: "Java", slug: "java", fileExtension: ".java" },
  { name: "Python", slug: "python", fileExtension: ".py" },
];

const initialCategories = [
  { name: "Numbers", slug: "numbers", description: "Programs and algorithms focused on number properties and arithmetic." },
  { name: "Strings", slug: "strings", description: "String manipulation, text processing, and parsing algorithms." },
  { name: "Arrays", slug: "arrays", description: "Operations, traversals, and algorithms on arrays and matrices." },
  { name: "Loops", slug: "loops", description: "Iterative logic, loop constructs, and nested iteration problems." },
  { name: "Conditional Statements", slug: "conditional-statements", description: "Branching logic, decision making, and conditional execution." },
  { name: "Functions", slug: "functions", description: "Modular code, function definitions, parameters, and return types." },
  { name: "Patterns", slug: "patterns", description: "Star patterns, number pyramids, and visual console outputs." },
  { name: "Searching", slug: "searching", description: "Linear search, binary search, and search optimization techniques." },
  { name: "Sorting", slug: "sorting", description: "Bubble, selection, insertion, merge, quick, and heap sort algorithms." },
  { name: "Data Structures", slug: "data-structures", description: "Stacks, queues, linked lists, trees, graphs, and hash maps." },
  { name: "Algorithms", slug: "algorithms", description: "Core algorithmic concepts, greedy techniques, and dynamic programming." },
  { name: "Mathematics", slug: "mathematics", description: "Mathematical computations, geometry, combinatorics, and series." },
  { name: "Recursion", slug: "recursion", description: "Recursive functions, base cases, and divide-and-conquer strategies." },
];

interface ProgramSeedItem {
  title: string;
  slug: string;
  categorySlug: string;
  difficulty: Difficulty;
  problemStatement: string;
  inputDescription: string;
  outputDescription: string;
  examples: string;
  explanation: string;
  algorithm: string;
  timeComplexity: string;
  spaceComplexity: string;
  implementations: {
    languageSlug: "c" | "cpp" | "java" | "python";
    fileName: string;
    code: string;
  }[];
}

const initialPrograms: ProgramSeedItem[] = [
  {
    title: "Sum of Two Numbers",
    slug: "sum-of-two-numbers",
    categorySlug: "numbers",
    difficulty: Difficulty.BEGINNER,
    problemStatement:
      "Write a program that reads two integers from the user and calculates their sum.",
    inputDescription:
      "Two space-separated or newline-separated integers a and b.",
    outputDescription:
      "A single integer representing the sum of a and b (i.e., a + b).",
    examples: `Example 1:
Input: 12 25
Output: Sum = 37
Explanation: Adding 12 and 25 produces 37.

Example 2:
Input: -8 15
Output: Sum = 7
Explanation: Adding -8 and 15 produces 7.`,
    explanation:
      "Addition is the most fundamental arithmetic operation in programming. By storing two integer inputs in variables and applying the addition operator (+), we compute their total and print the result to standard output.",
    algorithm: `1. Start the program.
2. Declare integer variables a, b, and sum.
3. Read the two integer values a and b.
4. Compute sum = a + b.
5. Display the calculated sum.
6. End the program.`,
    timeComplexity: "O(1)",
    spaceComplexity: "O(1)",
    implementations: [
      {
        languageSlug: "c",
        fileName: "sum_of_two_numbers.c",
        code: `#include <stdio.h>

int main() {
    int a = 12, b = 25;
    int sum = a + b;

    printf("Sum = %d\\n", sum);
    return 0;
}`,
      },
      {
        languageSlug: "cpp",
        fileName: "sum_of_two_numbers.cpp",
        code: `#include <iostream>
using namespace std;

int main() {
    int a = 12, b = 25;
    int sum = a + b;

    cout << "Sum = " << sum << endl;
    return 0;
}`,
      },
      {
        languageSlug: "java",
        fileName: "sum_of_two_numbers.java",
        code: `public class SumOfTwoNumbers {
    public static void main(String[] args) {
        int a = 12;
        int b = 25;
        int sum = a + b;

        System.out.println("Sum = " + sum);
    }
}`,
      },
      {
        languageSlug: "python",
        fileName: "sum_of_two_numbers.py",
        code: `a = 12
b = 25
total_sum = a + b

print(f"Sum = {total_sum}")`,
      },
    ],
  },
  {
    title: "Even or Odd Number",
    slug: "even-or-odd",
    categorySlug: "conditional-statements",
    difficulty: Difficulty.BEGINNER,
    problemStatement:
      "Write a program to determine whether a given integer is an even number or an odd number.",
    inputDescription:
      "A single integer n.",
    outputDescription:
      "Print whether the integer n is Even or Odd.",
    examples: `Example 1:
Input: 18
Output: 18 is Even
Explanation: 18 divided by 2 leaves a remainder of 0, so it is even.

Example 2:
Input: 27
Output: 27 is Odd
Explanation: 27 divided by 2 leaves a remainder of 1, so it is odd.`,
    explanation:
      "An integer is even if it is exactly divisible by 2 (meaning the remainder when divided by 2 is 0). Otherwise, it is odd. The modulo operator (%) gives the remainder of integer division, allowing us to check n % 2 == 0 in constant time.",
    algorithm: `1. Read or initialize the integer n.
2. Compute the remainder of n divided by 2 using n % 2.
3. If the remainder equals 0, print that n is Even.
4. Otherwise, print that n is Odd.`,
    timeComplexity: "O(1)",
    spaceComplexity: "O(1)",
    implementations: [
      {
        languageSlug: "c",
        fileName: "even_or_odd.c",
        code: `#include <stdio.h>

int main() {
    int n = 18;

    if (n % 2 == 0) {
        printf("%d is Even\\n", n);
    } else {
        printf("%d is Odd\\n", n);
    }

    return 0;
}`,
      },
      {
        languageSlug: "cpp",
        fileName: "even_or_odd.cpp",
        code: `#include <iostream>
using namespace std;

int main() {
    int n = 18;

    if (n % 2 == 0) {
        cout << n << " is Even" << endl;
    } else {
        cout << n << " is Odd" << endl;
    }

    return 0;
}`,
      },
      {
        languageSlug: "java",
        fileName: "even_or_odd.java",
        code: `public class EvenOrOdd {
    public static void main(String[] args) {
        int n = 18;

        if (n % 2 == 0) {
            System.out.println(n + " is Even");
        } else {
            System.out.println(n + " is Odd");
        }
    }
}`,
      },
      {
        languageSlug: "python",
        fileName: "even_or_odd.py",
        code: `n = 18

if n % 2 == 0:
    print(f"{n} is Even")
else:
    print(f"{n} is Odd")`,
      },
    ],
  },
  {
    title: "Largest of Two Numbers",
    slug: "largest-of-two-numbers",
    categorySlug: "conditional-statements",
    difficulty: Difficulty.BEGINNER,
    problemStatement:
      "Write a program to compare two integers and find the larger number between them.",
    inputDescription:
      "Two integers a and b.",
    outputDescription:
      "Print the larger of the two numbers, or state that both numbers are equal.",
    examples: `Example 1:
Input: a = 42, b = 19
Output: Largest number is 42
Explanation: Since 42 > 19, 42 is the largest number.

Example 2:
Input: a = 10, b = 10
Output: Both numbers are equal (10)
Explanation: Both inputs have the same value.`,
    explanation:
      "Using an if-else ladder, we compare two integers with relational operators (> and <). If the first integer is greater than the second, it is the maximum; if the second is greater, the second is the maximum; otherwise both values are equal.",
    algorithm: `1. Initialize or read two integers a and b.
2. Check if a > b. If true, report a as the largest.
3. Else check if b > a. If true, report b as the largest.
4. Otherwise, report that both numbers are equal.`,
    timeComplexity: "O(1)",
    spaceComplexity: "O(1)",
    implementations: [
      {
        languageSlug: "c",
        fileName: "largest_of_two_numbers.c",
        code: `#include <stdio.h>

int main() {
    int a = 42, b = 19;

    if (a > b) {
        printf("Largest number is %d\\n", a);
    } else if (b > a) {
        printf("Largest number is %d\\n", b);
    } else {
        printf("Both numbers are equal (%d)\\n", a);
    }

    return 0;
}`,
      },
      {
        languageSlug: "cpp",
        fileName: "largest_of_two_numbers.cpp",
        code: `#include <iostream>
using namespace std;

int main() {
    int a = 42, b = 19;

    if (a > b) {
        cout << "Largest number is " << a << endl;
    } else if (b > a) {
        cout << "Largest number is " << b << endl;
    } else {
        cout << "Both numbers are equal (" << a << ")" << endl;
    }

    return 0;
}`,
      },
      {
        languageSlug: "java",
        fileName: "largest_of_two_numbers.java",
        code: `public class LargestOfTwoNumbers {
    public static void main(String[] args) {
        int a = 42;
        int b = 19;

        if (a > b) {
            System.out.println("Largest number is " + a);
        } else if (b > a) {
            System.out.println("Largest number is " + b);
        } else {
            System.out.println("Both numbers are equal (" + a + ")");
        }
    }
}`,
      },
      {
        languageSlug: "python",
        fileName: "largest_of_two_numbers.py",
        code: `a = 42
b = 19

if a > b:
    print(f"Largest number is {a}")
elif b > a:
    print(f"Largest number is {b}")
else:
    print(f"Both numbers are equal ({a})")`,
      },
    ],
  },
  {
    title: "Positive, Negative or Zero",
    slug: "positive-negative-zero",
    categorySlug: "conditional-statements",
    difficulty: Difficulty.BEGINNER,
    problemStatement:
      "Write a program to check whether a given number is positive, negative, or zero.",
    inputDescription:
      "A single integer n.",
    outputDescription:
      "Print whether the number is Positive, Negative, or Zero.",
    examples: `Example 1:
Input: 25
Output: 25 is Positive
Explanation: Numbers greater than 0 are positive.

Example 2:
Input: -14
Output: -14 is Negative
Explanation: Numbers less than 0 are negative.

Example 3:
Input: 0
Output: The number is Zero
Explanation: The value is exactly 0.`,
    explanation:
      "Any real number falls into one of three mutually exclusive cases relative to zero: greater than zero (positive), less than zero (negative), or equal to zero. A three-way conditional statement evaluates this in O(1) time.",
    algorithm: `1. Read or initialize the number n.
2. If n > 0, print that the number is Positive.
3. Else if n < 0, print that the number is Negative.
4. Otherwise, print that the number is Zero.`,
    timeComplexity: "O(1)",
    spaceComplexity: "O(1)",
    implementations: [
      {
        languageSlug: "c",
        fileName: "positive_negative_zero.c",
        code: `#include <stdio.h>

int main() {
    int n = -14;

    if (n > 0) {
        printf("%d is Positive\\n", n);
    } else if (n < 0) {
        printf("%d is Negative\\n", n);
    } else {
        printf("The number is Zero\\n");
    }

    return 0;
}`,
      },
      {
        languageSlug: "cpp",
        fileName: "positive_negative_zero.cpp",
        code: `#include <iostream>
using namespace std;

int main() {
    int n = -14;

    if (n > 0) {
        cout << n << " is Positive" << endl;
    } else if (n < 0) {
        cout << n << " is Negative" << endl;
    } else {
        cout << "The number is Zero" << endl;
    }

    return 0;
}`,
      },
      {
        languageSlug: "java",
        fileName: "positive_negative_zero.java",
        code: `public class PositiveNegativeZero {
    public static void main(String[] args) {
        int n = -14;

        if (n > 0) {
            System.out.println(n + " is Positive");
        } else if (n < 0) {
            System.out.println(n + " is Negative");
        } else {
            System.out.println("The number is Zero");
        }
    }
}`,
      },
      {
        languageSlug: "python",
        fileName: "positive_negative_zero.py",
        code: `n = -14

if n > 0:
    print(f"{n} is Positive")
elif n < 0:
    print(f"{n} is Negative")
else:
    print("The number is Zero")`,
      },
    ],
  },
  {
    title: "Reverse a Number",
    slug: "reverse-a-number",
    categorySlug: "numbers",
    difficulty: Difficulty.BEGINNER,
    problemStatement:
      "Write a program to reverse the digits of a given positive integer.",
    inputDescription:
      "A positive integer n (e.g., 12345).",
    outputDescription:
      "An integer formed by reversing the digits of n (e.g., 54321).",
    examples: `Example 1:
Input: 12345
Output: Reversed Number = 54321
Explanation: Extracting digits from right to left (5, 4, 3, 2, 1) constructs 54321.

Example 2:
Input: 908
Output: Reversed Number = 809
Explanation: The digits of 908 reversed produce 809.`,
    explanation:
      "To reverse a number mathematically without converting it to a string, we repeatedly extract its last digit using modulo 10 (n % 10), shift our accumulated reversed number left by multiplying by 10, add the extracted digit, and discard the last digit using integer division by 10 (n / 10).",
    algorithm: `1. Initialize reversed = 0 and read the integer n.
2. Repeat while n > 0:
   a. Extract the last digit: digit = n % 10.
   b. Append digit to reversed: reversed = reversed * 10 + digit.
   c. Remove the last digit from n: n = n / 10.
3. Print the reversed integer.`,
    timeComplexity: "O(log10(n))",
    spaceComplexity: "O(1)",
    implementations: [
      {
        languageSlug: "c",
        fileName: "reverse_a_number.c",
        code: `#include <stdio.h>

int main() {
    int n = 12345;
    int reversed = 0;

    while (n > 0) {
        int digit = n % 10;
        reversed = reversed * 10 + digit;
        n = n / 10;
    }

    printf("Reversed Number = %d\\n", reversed);
    return 0;
}`,
      },
      {
        languageSlug: "cpp",
        fileName: "reverse_a_number.cpp",
        code: `#include <iostream>
using namespace std;

int main() {
    int n = 12345;
    int reversed = 0;

    while (n > 0) {
        int digit = n % 10;
        reversed = reversed * 10 + digit;
        n = n / 10;
    }

    cout << "Reversed Number = " << reversed << endl;
    return 0;
}`,
      },
      {
        languageSlug: "java",
        fileName: "reverse_a_number.java",
        code: `public class ReverseANumber {
    public static void main(String[] args) {
        int n = 12345;
        int reversed = 0;

        while (n > 0) {
            int digit = n % 10;
            reversed = reversed * 10 + digit;
            n = n / 10;
        }

        System.out.println("Reversed Number = " + reversed);
    }
}`,
      },
      {
        languageSlug: "python",
        fileName: "reverse_a_number.py",
        code: `n = 12345
reversed_num = 0

while n > 0:
    digit = n % 10
    reversed_num = reversed_num * 10 + digit
    n //= 10

print(f"Reversed Number = {reversed_num}")`,
      },
    ],
  },
  {
    title: "Palindrome Number",
    slug: "palindrome-number",
    categorySlug: "numbers",
    difficulty: Difficulty.BEGINNER,
    problemStatement:
      "Write a program to check whether a given integer is a palindrome number (reads the same forwards and backwards).",
    inputDescription:
      "A non-negative integer n.",
    outputDescription:
      "Print whether the given number is a Palindrome or not.",
    examples: `Example 1:
Input: 12321
Output: 12321 is a Palindrome Number
Explanation: Reversing 12321 gives 12321, which equals the original number.

Example 2:
Input: 1234
Output: 1234 is not a Palindrome Number
Explanation: Reversing 1234 gives 4321, which is not equal to 1234.`,
    explanation:
      "A palindrome number remains identical when its digits are reversed. By saving a copy of the original number, reversing the digits using modulo and division by 10, and comparing the reversed result with the original copy, we determine whether the number is a palindrome.",
    algorithm: `1. Read the number n and store a copy in original = n.
2. Initialize reversed = 0.
3. Repeat while n > 0:
   a. Extract the last digit: digit = n % 10.
   b. Update reversed = reversed * 10 + digit.
   c. Remove the last digit: n = n / 10.
4. Compare original and reversed.
5. If original == reversed, print Palindrome; otherwise print Not a Palindrome.`,
    timeComplexity: "O(log10(n))",
    spaceComplexity: "O(1)",
    implementations: [
      {
        languageSlug: "c",
        fileName: "palindrome_number.c",
        code: `#include <stdio.h>

int main() {
    int n = 12321;
    int original = n;
    int reversed = 0;

    while (n > 0) {
        int digit = n % 10;
        reversed = reversed * 10 + digit;
        n = n / 10;
    }

    if (original == reversed) {
        printf("%d is a Palindrome Number\\n", original);
    } else {
        printf("%d is not a Palindrome Number\\n", original);
    }

    return 0;
}`,
      },
      {
        languageSlug: "cpp",
        fileName: "palindrome_number.cpp",
        code: `#include <iostream>
using namespace std;

int main() {
    int n = 12321;
    int original = n;
    int reversed = 0;

    while (n > 0) {
        int digit = n % 10;
        reversed = reversed * 10 + digit;
        n = n / 10;
    }

    if (original == reversed) {
        cout << original << " is a Palindrome Number" << endl;
    } else {
        cout << original << " is not a Palindrome Number" << endl;
    }

    return 0;
}`,
      },
      {
        languageSlug: "java",
        fileName: "palindrome_number.java",
        code: `public class PalindromeNumber {
    public static void main(String[] args) {
        int n = 12321;
        int original = n;
        int reversed = 0;

        while (n > 0) {
            int digit = n % 10;
            reversed = reversed * 10 + digit;
            n = n / 10;
        }

        if (original == reversed) {
            System.out.println(original + " is a Palindrome Number");
        } else {
            System.out.println(original + " is not a Palindrome Number");
        }
    }
}`,
      },
      {
        languageSlug: "python",
        fileName: "palindrome_number.py",
        code: `n = 12321
original = n
reversed_num = 0

while n > 0:
    digit = n % 10
    reversed_num = reversed_num * 10 + digit
    n //= 10

if original == reversed_num:
    print(f"{original} is a Palindrome Number")
else:
    print(f"{original} is not a Palindrome Number")`,
      },
    ],
  },
  {
    title: "Prime Number",
    slug: "prime-number",
    categorySlug: "numbers",
    difficulty: Difficulty.BEGINNER,
    problemStatement:
      "Write a program to check whether a given positive integer is a prime number.",
    inputDescription:
      "A single integer n.",
    outputDescription:
      "Print whether n is a Prime Number or not.",
    examples: `Example 1:
Input: 29
Output: 29 is a Prime Number
Explanation: 29 has no divisors other than 1 and 29.

Example 2:
Input: 15
Output: 15 is not a Prime Number
Explanation: 15 is divisible by 3 and 5.`,
    explanation:
      "A prime number is an integer greater than 1 that has no positive divisors other than 1 and itself. Instead of checking all numbers up to n - 1, we only need to test divisibility from 2 up to sqrt(n) (i.e., i * i <= n), because any factor larger than sqrt(n) must pair with a smaller factor that would already have been found.",
    algorithm: `1. Read the integer n.
2. If n <= 1, mark isPrime as false.
3. Otherwise, set isPrime = true and iterate i from 2 while i * i <= n:
   a. If n % i == 0, set isPrime = false and break out of the loop.
4. If isPrime is true, print that n is a Prime Number; otherwise print that it is not.`,
    timeComplexity: "O(sqrt(n))",
    spaceComplexity: "O(1)",
    implementations: [
      {
        languageSlug: "c",
        fileName: "prime_number.c",
        code: `#include <stdio.h>
#include <stdbool.h>

int main() {
    int n = 29;
    bool isPrime = true;

    if (n <= 1) {
        isPrime = false;
    } else {
        for (int i = 2; i * i <= n; i++) {
            if (n % i == 0) {
                isPrime = false;
                break;
            }
        }
    }

    if (isPrime) {
        printf("%d is a Prime Number\\n", n);
    } else {
        printf("%d is not a Prime Number\\n", n);
    }

    return 0;
}`,
      },
      {
        languageSlug: "cpp",
        fileName: "prime_number.cpp",
        code: `#include <iostream>
using namespace std;

int main() {
    int n = 29;
    bool isPrime = true;

    if (n <= 1) {
        isPrime = false;
    } else {
        for (int i = 2; i * i <= n; i++) {
            if (n % i == 0) {
                isPrime = false;
                break;
            }
        }
    }

    if (isPrime) {
        cout << n << " is a Prime Number" << endl;
    } else {
        cout << n << " is not a Prime Number" << endl;
    }

    return 0;
}`,
      },
      {
        languageSlug: "java",
        fileName: "prime_number.java",
        code: `public class PrimeNumber {
    public static void main(String[] args) {
        int n = 29;
        boolean isPrime = true;

        if (n <= 1) {
            isPrime = false;
        } else {
            for (int i = 2; i * i <= n; i++) {
                if (n % i == 0) {
                    isPrime = false;
                    break;
                }
            }
        }

        if (isPrime) {
            System.out.println(n + " is a Prime Number");
        } else {
            System.out.println(n + " is not a Prime Number");
        }
    }
}`,
      },
      {
        languageSlug: "python",
        fileName: "prime_number.py",
        code: `n = 29
is_prime = True

if n <= 1:
    is_prime = False
else:
    i = 2
    while i * i <= n:
        if n % i == 0:
            is_prime = False
            break
        i += 1

if is_prime:
    print(f"{n} is a Prime Number")
else:
    print(f"{n} is not a Prime Number")`,
      },
    ],
  },
  {
    title: "Factorial of a Number",
    slug: "factorial",
    categorySlug: "mathematics",
    difficulty: Difficulty.BEGINNER,
    problemStatement:
      "Write a program to compute the factorial of a non-negative integer n (denoted as n!).",
    inputDescription:
      "A non-negative integer n (e.g., 5).",
    outputDescription:
      "The factorial of n (i.e., 1 * 2 * 3 * ... * n), where 0! = 1.",
    examples: `Example 1:
Input: 5
Output: Factorial of 5 = 120
Explanation: 5! = 5 * 4 * 3 * 2 * 1 = 120.

Example 2:
Input: 0
Output: Factorial of 0 = 1
Explanation: By mathematical definition, 0! equals 1.`,
    explanation:
      "The factorial of a non-negative integer n is the product of all positive integers less than or equal to n. Starting with an accumulator variable set to 1, we multiply it by each integer from 1 to n in a loop.",
    algorithm: `1. Read the non-negative integer n.
2. Initialize a 64-bit integer result variable factorial = 1.
3. Loop i from 1 to n inclusive:
   a. Multiply factorial by i (factorial = factorial * i).
4. Print the final factorial value.`,
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    implementations: [
      {
        languageSlug: "c",
        fileName: "factorial.c",
        code: `#include <stdio.h>

int main() {
    int n = 5;
    long long factorial = 1;

    for (int i = 1; i <= n; i++) {
        factorial *= i;
    }

    printf("Factorial of %d = %lld\\n", n, factorial);
    return 0;
}`,
      },
      {
        languageSlug: "cpp",
        fileName: "factorial.cpp",
        code: `#include <iostream>
using namespace std;

int main() {
    int n = 5;
    long long factorial = 1;

    for (int i = 1; i <= n; i++) {
        factorial *= i;
    }

    cout << "Factorial of " << n << " = " << factorial << endl;
    return 0;
}`,
      },
      {
        languageSlug: "java",
        fileName: "factorial.java",
        code: `public class Factorial {
    public static void main(String[] args) {
        int n = 5;
        long factorial = 1;

        for (int i = 1; i <= n; i++) {
            factorial *= i;
        }

        System.out.println("Factorial of " + n + " = " + factorial);
    }
}`,
      },
      {
        languageSlug: "python",
        fileName: "factorial.py",
        code: `n = 5
factorial = 1

for i in range(1, n + 1):
    factorial *= i

print(f"Factorial of {n} = {factorial}")`,
      },
    ],
  },
  {
    title: "Count Vowels in a String",
    slug: "count-vowels",
    categorySlug: "strings",
    difficulty: Difficulty.BEGINNER,
    problemStatement:
      "Write a program to count the total number of vowels (a, e, i, o, u, both uppercase and lowercase) in a given string.",
    inputDescription:
      "A string of characters.",
    outputDescription:
      "An integer representing the count of vowels in the string.",
    examples: `Example 1:
Input: "CodePati Programming"
Output: Number of vowels = 7
Explanation: The vowels are 'o', 'e', 'a', 'i', 'o', 'a', 'i' (total 7).

Example 2:
Input: "Rhythm"
Output: Number of vowels = 0
Explanation: None of the characters are standard English vowels (a, e, i, o, u).`,
    explanation:
      "To count vowels in a string, we traverse the string character by character from start to end. Converting each character to lowercase simplifies the check so we only need to compare it against 'a', 'e', 'i', 'o', and 'u'. Whenever a match occurs, we increment our counter.",
    algorithm: `1. Initialize vowelCount = 0 and read the input string.
2. Iterate through each character ch in the string:
   a. Convert ch to lowercase.
   b. Check if ch is equal to 'a', 'e', 'i', 'o', or 'u'.
   c. If true, increment vowelCount by 1.
3. Print the final vowelCount.`,
    timeComplexity: "O(n)",
    spaceComplexity: "O(1)",
    implementations: [
      {
        languageSlug: "c",
        fileName: "count_vowels.c",
        code: `#include <stdio.h>
#include <ctype.h>

int main() {
    const char *text = "CodePati Programming";
    int count = 0;

    for (int i = 0; text[i] != '\\0'; i++) {
        char ch = tolower((unsigned char)text[i]);
        if (ch == 'a' || ch == 'e' || ch == 'i' || ch == 'o' || ch == 'u') {
            count++;
        }
    }

    printf("Number of vowels = %d\\n", count);
    return 0;
}`,
      },
      {
        languageSlug: "cpp",
        fileName: "count_vowels.cpp",
        code: `#include <iostream>
#include <string>
#include <cctype>
using namespace std;

int main() {
    string text = "CodePati Programming";
    int count = 0;

    for (char c : text) {
        char ch = tolower(static_cast<unsigned char>(c));
        if (ch == 'a' || ch == 'e' || ch == 'i' || ch == 'o' || ch == 'u') {
            count++;
        }
    }

    cout << "Number of vowels = " << count << endl;
    return 0;
}`,
      },
      {
        languageSlug: "java",
        fileName: "count_vowels.java",
        code: `public class CountVowels {
    public static void main(String[] args) {
        String text = "CodePati Programming";
        int count = 0;

        for (int i = 0; i < text.length(); i++) {
            char ch = Character.toLowerCase(text.charAt(i));
            if (ch == 'a' || ch == 'e' || ch == 'i' || ch == 'o' || ch == 'u') {
                count++;
            }
        }

        System.out.println("Number of vowels = " + count);
    }
}`,
      },
      {
        languageSlug: "python",
        fileName: "count_vowels.py",
        code: `text = "CodePati Programming"
vowels = "aeiou"
count = 0

for ch in text.lower():
    if ch in vowels:
        count += 1

print(f"Number of vowels = {count}")`,
      },
    ],
  },
  {
    title: "Reverse a String",
    slug: "reverse-string",
    categorySlug: "strings",
    difficulty: Difficulty.BEGINNER,
    problemStatement:
      "Write a program to reverse the characters of a given string.",
    inputDescription:
      "A string s.",
    outputDescription:
      "The string s with its characters in reverse order.",
    examples: `Example 1:
Input: "CodePati"
Output: Reversed String = itaPedoC
Explanation: Reading "CodePati" from the last character to the first gives "itaPedoC".

Example 2:
Input: "algorithm"
Output: Reversed String = mhtirogla
Explanation: The characters are mirrored from right to left.`,
    explanation:
      "Reversing a string can be done by using two pointers—one at the beginning (left = 0) and one at the end (right = length - 1)—and swapping characters while moving the pointers toward the center, or by constructing a new string in reverse order.",
    algorithm: `1. Read or initialize the string s.
2. Set two indices: left = 0 and right = length(s) - 1.
3. While left < right:
   a. Swap the characters at positions left and right.
   b. Increment left by 1 and decrement right by 1.
4. Print the reversed string.`,
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
    implementations: [
      {
        languageSlug: "c",
        fileName: "reverse_string.c",
        code: `#include <stdio.h>
#include <string.h>

int main() {
    char str[] = "CodePati";
    int left = 0;
    int right = (int)strlen(str) - 1;

    while (left < right) {
        char temp = str[left];
        str[left] = str[right];
        str[right] = temp;
        left++;
        right--;
    }

    printf("Reversed String = %s\\n", str);
    return 0;
}`,
      },
      {
        languageSlug: "cpp",
        fileName: "reverse_string.cpp",
        code: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string str = "CodePati";
    int left = 0;
    int right = static_cast<int>(str.length()) - 1;

    while (left < right) {
        char temp = str[left];
        str[left] = str[right];
        str[right] = temp;
        left++;
        right--;
    }

    cout << "Reversed String = " << str << endl;
    return 0;
}`,
      },
      {
        languageSlug: "java",
        fileName: "reverse_string.java",
        code: `public class ReverseString {
    public static void main(String[] args) {
        char[] chars = "CodePati".toCharArray();
        int left = 0;
        int right = chars.length - 1;

        while (left < right) {
            char temp = chars[left];
            chars[left] = chars[right];
            chars[right] = temp;
            left++;
            right--;
        }

        String reversed = new String(chars);
        System.out.println("Reversed String = " + reversed);
    }
}`,
      },
      {
        languageSlug: "python",
        fileName: "reverse_string.py",
        code: `chars = list("CodePati")
left = 0
right = len(chars) - 1

while left < right:
    chars[left], chars[right] = chars[right], chars[left]
    left += 1
    right -= 1

reversed_str = "".join(chars)
print(f"Reversed String = {reversed_str}")`,
      },
    ],
  },
];

async function main() {
  console.log("🌱 Starting CodePati Phase 4A database seed...");

  // 1. Upsert Languages
  const languageMap = new Map<string, string>();
  for (const lang of initialLanguages) {
    const record = await prisma.language.upsert({
      where: { slug: lang.slug },
      update: {
        name: lang.name,
        fileExtension: lang.fileExtension,
      },
      create: lang,
    });
    languageMap.set(record.slug, record.id);
  }
  console.log(`✓ Verified & seeded ${initialLanguages.length} languages.`);

  // 2. Upsert Categories
  const categoryMap = new Map<string, string>();
  for (const cat of initialCategories) {
    const record = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.description,
      },
      create: cat,
    });
    categoryMap.set(record.slug, record.id);
  }
  console.log(`✓ Verified & seeded ${initialCategories.length} categories.`);

  // 3. Determine Admin Author safely without duplicating or disturbing existing Google OAuth users
  let adminUser = await prisma.user.findFirst({
    where: { role: Role.ADMIN },
  });

  if (!adminUser) {
    adminUser = await prisma.user.upsert({
      where: { email: "editorial@codepati.local" },
      update: { role: Role.ADMIN },
      create: {
        name: "CodePati Editorial",
        email: "editorial@codepati.local",
        role: Role.ADMIN,
      },
    });
  }
  console.log(`✓ Using ADMIN author record: ${adminUser.email} (${adminUser.id})`);

  // 4. Upsert Programs and ProgramLanguages
  let totalImplementations = 0;

  for (const prog of initialPrograms) {
    const categoryId = categoryMap.get(prog.categorySlug);
    if (!categoryId) {
      throw new Error(`Missing category slug: ${prog.categorySlug}`);
    }

    const savedProgram = await prisma.program.upsert({
      where: { slug: prog.slug },
      update: {
        title: prog.title,
        problemStatement: prog.problemStatement,
        inputDescription: prog.inputDescription,
        outputDescription: prog.outputDescription,
        examples: prog.examples,
        explanation: prog.explanation,
        algorithm: prog.algorithm,
        timeComplexity: prog.timeComplexity,
        spaceComplexity: prog.spaceComplexity,
        difficulty: prog.difficulty,
        status: ProgramStatus.PUBLISHED,
        categoryId,
        createdById: adminUser.id,
      },
      create: {
        title: prog.title,
        slug: prog.slug,
        problemStatement: prog.problemStatement,
        inputDescription: prog.inputDescription,
        outputDescription: prog.outputDescription,
        examples: prog.examples,
        explanation: prog.explanation,
        algorithm: prog.algorithm,
        timeComplexity: prog.timeComplexity,
        spaceComplexity: prog.spaceComplexity,
        difficulty: prog.difficulty,
        status: ProgramStatus.PUBLISHED,
        categoryId,
        createdById: adminUser.id,
      },
    });

    for (const impl of prog.implementations) {
      const languageId = languageMap.get(impl.languageSlug);
      if (!languageId) {
        throw new Error(`Missing language slug: ${impl.languageSlug}`);
      }

      await prisma.programLanguage.upsert({
        where: {
          programId_languageId: {
            programId: savedProgram.id,
            languageId,
          },
        },
        update: {
          code: impl.code,
          fileName: impl.fileName,
        },
        create: {
          programId: savedProgram.id,
          languageId,
          code: impl.code,
          fileName: impl.fileName,
        },
      });
      totalImplementations++;
    }
  }

  console.log(`✓ Seeded ${initialPrograms.length} PUBLISHED programs.`);
  console.log(`✓ Seeded ${totalImplementations} ProgramLanguage implementations.`);
  console.log("✅ CodePati Phase 4A database seed completed successfully.");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
