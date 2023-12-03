import { Interface } from "readline/promises";

const aborter = new AbortController();

export async function promptUser(
  rl: Interface,
  {
    isValidWhen,
    promptText = "\nEnter an option to continue..\n",
    errorText = "Incorrect option. Please try again\n",
  }: {
    isValidWhen: (answer: string) => boolean;
    promptText?: string;
    errorText?: string;
  }
) {
  let answer = "";
  while (!isValidWhen(answer)) {
    try {
      answer = await rl.question(promptText, { signal: aborter.signal });
      if (!isValidWhen(answer)) {
        rl.write(errorText);
      }
    } catch (err) {
      return answer;
    }
  }
  return answer;
}

export function abortPrompt() {
  aborter.abort();
}
