const mockCommandBus = {
	execute: jest.fn(),
};
const mockEmailService = {sendEmail: jest.fn()};

export const emailMocks = {
	mockCommandBus,
	mockEmailService,
};
