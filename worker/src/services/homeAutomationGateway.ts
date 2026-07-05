export type HomeAutomationResult =
  | { status: 'sent' }
  | {
      status: 'unavailable';
      reason: 'disabled' | 'timeout' | 'bad_response' | 'missing_config';
    };

export type HomeAutomationInput = {
  requestId: string;
  timestamp: string;
  locale?: 'sv' | 'en';
};

export type HomeAutomationGateway = {
  sendHello(input: HomeAutomationInput): Promise<HomeAutomationResult>;
};

export class MockHomeAutomationGateway implements HomeAutomationGateway {
  async sendHello(_input: HomeAutomationInput): Promise<HomeAutomationResult> {
    return { status: 'sent' };
  }
}

export class UnavailableHomeAutomationGateway implements HomeAutomationGateway {
  async sendHello(_input: HomeAutomationInput): Promise<HomeAutomationResult> {
    return { status: 'unavailable', reason: 'missing_config' };
  }
}
