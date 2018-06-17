
export enum SubscriptionType {
  'ONE_MONTH' = 'ONE_MONTH',
  'ONE_YEAR' = 'ONE_YEAR'
}

export namespace SubscriptionType {
  export function toString(subscriptionType: SubscriptionType): string {
    return SubscriptionType[subscriptionType];
  }
}

export class SubscribeModel {

  constructor(public description?: string,
              public subscriptionType?: SubscriptionType,
              public paymentApiReturnString?: string) {
  }

}
