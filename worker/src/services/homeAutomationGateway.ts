export type HomeAutomationResult =
  | { status: 'sent' }
  | { status: 'unavailable'; reason: 'disabled' | 'timeout' | 'bad_response' | 'missing_config' };

export type HomeAutomationGateway = {
  sendHello(input: { requestId: string; timestamp: string }): Promise<HomeAutomationResult>;
};

export class MockHomeAutomationGateway implements HomeAutomationGateway {
  async sendHello(_input: { requestId: string; timestamp: string }): Promise<HomeAutomationResult> {
    return { status: 'sent' };
  }
}
