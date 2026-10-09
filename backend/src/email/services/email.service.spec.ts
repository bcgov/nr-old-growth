import { describe, expect, it, jest } from '@jest/globals';
import { ChesService } from '../../ches/services/ches.service';
import { EmailService } from './email.service';

describe('EmailService', () => {
  it('delegates sending to CHES', async () => {
    const ches = new ChesService();
    const sendEmail = jest
      .spyOn(ches, 'sendEmail')
      .mockResolvedValue({ status: 201, data: 'sent' });
    const service = new EmailService(ches);
    const email = { emailTo: ['a@gov.bc.ca'], emailSubject: 'Hi' };

    await expect(service.sendEmail(email)).resolves.toEqual({
      status: 201,
      data: 'sent',
    });
    expect(sendEmail).toHaveBeenCalledWith(email);
  });
});
