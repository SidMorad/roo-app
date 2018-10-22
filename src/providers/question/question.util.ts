
export class QuestionUtil {

    public static randomLessThan(num): number {
      return Math.floor(Math.random() * (num - 1)) + 0;
    }

    public static randomBetween(min, max): number {
      return Math.floor(Math.random()*(max-min+1)+min);
    }

    public static trueOrFalse(): boolean {
      return Math.random() >= 0.5;
    }

}