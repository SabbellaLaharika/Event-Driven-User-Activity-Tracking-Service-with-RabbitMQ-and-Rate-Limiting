const { processActivity } = require('../../src/services/activityProcessor');
const Activity = require('../../src/models/Activity');

// Mock Mongoose model
jest.mock('../../src/models/Activity', () => {
    return jest.fn().mockImplementation(() => {
        return {
            save: jest.fn().mockResolvedValue({ _id: 'mockId' })
        };
    });
});

describe('Activity Processor Service', () => {
  it('should process valid activity data and save it to MongoDB', async () => {
    const validData = {
      userId: 'testUser',
      eventType: 'login',
      timestamp: new Date().toISOString(),
      payload: { browser: 'Chrome' }
    };

    const result = await processActivity(validData);
    expect(result).toBe(true);
    expect(Activity).toHaveBeenCalled();
  });

  it('should throw error if userId is missing', async () => {
    const invalidData = { eventType: 'login' };
    await expect(processActivity(invalidData)).rejects.toThrow('missing userId');
  });

  it('should throw error if eventType is missing', async () => {
    const invalidData = { userId: 'user1' };
    await expect(processActivity(invalidData)).rejects.toThrow('missing eventType');
  });
});
