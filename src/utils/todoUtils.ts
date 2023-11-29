import { Interface } from "readline/promises";

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
    answer = await rl.question(promptText);
    if (!isValidWhen(answer)) {
      rl.write(errorText);
    }
  }
  return answer;
}
