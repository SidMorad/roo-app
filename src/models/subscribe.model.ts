
export enum SubscriptionType {
  'ONE_MONTH',
  'ONE_YEAR'
}

export namespace SubscriptionType {
  export function toString(subscriptionType: SubscriptionType): string {
    return SubscriptionType[subscriptionType];
  }
}

export class SubscribeModel {

  constructor(public description?: string,
              public subscriptionType?: SubscriptionType) {
  }

}
