
export enum ScoreType {
  'LESSON',
  'DAILY'
}

export class ScoreTypeFactory {
  public static get daily(): ScoreType {
    return ScoreType[ScoreType.DAILY.toString()];
  }

  public static get lesson(): ScoreType {
    return ScoreType[ScoreType.LESSON.toString()];
  }
}