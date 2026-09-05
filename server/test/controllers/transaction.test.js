const transactionController = require("../../controllers/transaction");
const Total = require("../../models/total");
const Transaction = require("../../models/transaction");
const Status = require("../../models/status");
const { OK, SERVER_ERROR } = require("../../errors/statusCode");

jest.mock("../../models/total");
jest.mock("../../models/transaction");
jest.mock("../../models/status");

jest.mock("twilio", () => {
  return jest.fn(() => ({
    messages: {
      create: jest.fn().mockResolvedValue({ sid: "mock-sid" }),
    },
  }));
});

jest.mock("stripe", () => {
  return jest.fn(() => ({
    checkout: {
      sessions: {
        create: jest.fn().mockResolvedValue({ id: "mock-session-id" }),
      },
    },
  }));
});
function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
}

function mockReq(overrides = {}) {
  return { userData: { id: "user1" }, ...overrides };
}

describe("userLastTotal — regression test for the undefined 'item' bug", () => {
  beforeEach(() => jest.clearAllMocks());

  test("returns the user's most recent order without throwing (the original bug crashed every call)", async () => {
    // Prior to the fix, this function referenced `item.status` where
    // `item` was never defined anywhere in this function's scope -- it
    // only existed as a loop variable in OTHER functions (userTotal,
    // allTotal). This threw an uncaught ReferenceError on every single
    // call. The fix replaces it with `totalData.status`, the variable
    // actually in scope here.
    const mockTotal = {
      _id: "total1",
      total: "45.00",
      subTotal: "40.00",
      deliveryPrice: "5.00",
      discount: "0.00",
      address: "123 Test St",
      deliveryDay: "Tomorrow",
      lng: -3.19,
      lat: 55.95,
      status: "status1",
      createdAt: new Date(),
      transactionId: 12345678,
    };
    Total.findOne.mockReturnValue({
      sort: jest.fn().mockResolvedValue(mockTotal),
    });
    Transaction.find.mockResolvedValue([{ name: "Item 1", quantity: 2 }]);
    Status.findById.mockResolvedValue({ name: "Delivered" });

    const req = mockReq();
    const res = mockRes();

    // The critical assertion: this must complete without throwing.
    await expect(
      transactionController.userLastTotal(req, res)
    ).resolves.not.toThrow();

    expect(res.status).toHaveBeenCalledWith(OK);
    const payload = res.send.mock.calls[0][0];
    expect(payload.status).toEqual({ name: "Delivered" });
    expect(payload.transactions).toEqual([{ name: "Item 1", quantity: 2 }]);
  });

  test("does not crash when the user has never placed an order", async () => {
    // A user with zero orders means Total.findOne() resolves to null.
    // The original buggy code would have thrown when trying to read
    // `totalData._id` immediately afterward with no null-check.
    Total.findOne.mockReturnValue({
      sort: jest.fn().mockResolvedValue(null),
    });

    const req = mockReq();
    const res = mockRes();

    await expect(
      transactionController.userLastTotal(req, res)
    ).resolves.not.toThrow();

    expect(res.status).toHaveBeenCalledWith(OK);
    expect(Transaction.find).not.toHaveBeenCalled();
  });

  test("returns a server error instead of crashing if the database call throws", async () => {
    Total.findOne.mockReturnValue({
      sort: jest.fn().mockRejectedValue(new Error("Connection timeout")),
    });

    const req = mockReq();
    const res = mockRes();

    await transactionController.userLastTotal(req, res);

    expect(res.status).toHaveBeenCalledWith(SERVER_ERROR);
  });
});
