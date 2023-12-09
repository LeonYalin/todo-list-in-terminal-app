import { Interface } from "readline/promises";

const aborter = new AbortController();

export const commonTexts = {
  ENTER_AN_OPTION: "\nEnter an option to continue..\n",
  INVALID_OPTION: "Incorrect option. Please try again..\n",
};

export async function promptUser(
  rl: Interface,
  {
    isValidWhen,
    promptText = commonTexts.ENTER_AN_OPTION,
    errorText = commonTexts.INVALID_OPTION,
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
