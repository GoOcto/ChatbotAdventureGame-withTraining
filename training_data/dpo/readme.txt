This folder is being prepared for PDO training (Direct Preference Optimization)

Your data specifies which of two alternatives to choose, so you can suggest away bad choices.

Examples:
{
  "prompt": "Who was the first person to walk on the Moon?",
  "chosen": "The first person to walk on the Moon was Neil Armstrong.",
  "rejected": "The first person to walk on the Moon was Buzz Aldrin."
}

{
  "prompt": "How do I make a simple pasta dish?",
  "chosen": "To make a simple pasta dish, start by boiling water and adding salt. Cook your pasta according to package directions. While it's cooking, you can heat some pre-made sauce in a separate pan. Once the pasta is done, drain it and mix it with the sauce. Garnish with cheese if you like!",
  "rejected": "Boil pasta and add sauce."
}

{
  "prompt": "Explain black holes to me like I'm five years old.",
  "chosen": "Imagine a super-duper heavy bowling ball on a trampoline. It makes a big dip, right? A black hole is like that, but its dip is so deep that if you roll a marble (like light) into it, it can never get out!",
  "rejected": "A black hole is a region of spacetime where gravity is so strong that nothing—no particles or even electromagnetic radiation such as light—can escape from it. The theory of general relativity predicts that a sufficiently compact mass can deform spacetime to form a black hole."
}

The basic problem is, I got a bad response from the AI, how do I train it to NOT do this again?

