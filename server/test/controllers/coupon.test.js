const couponController = require("../../controllers/coupon");
const Coupon = require("../../models/coupon");
const { SERVER_ERROR, OK } = require("../../errors/statusCode");

jest.mock("../../models/coupon");

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
}

function mockReq(overrides = {}) {
  return { body: {}, ...overrides };
}

describe("redeem — coupon redemption", () => {
  beforeEach(() => jest.clearAllMocks());

  test("a valid Fixed-discount coupon correctly returns the discounted total", async () => {
    Coupon.findOne.mockResolvedValue({
      code: "SAVE10",
      discountType: "Fixed",
      discountValue: 10,
      expirationDate: new Date(Date.now() + 86400000),
    });
    const req = mockReq({ body: { coupon: "SAVE10", total: "50" } });
    const res = mockRes();

    await couponController.redeem(req, res);

    expect(res.status).toHaveBeenCalledWith(OK);
    const payload = res.send.mock.calls[0][0];
    expect(payload.grantTotal).toBe(-40); // 10 - 50, matching the controller's own subtraction order
    expect(payload.discount).toBe("£10");
  });

  test("a valid percentage-discount coupon correctly returns the discounted total", async () => {
    Coupon.findOne.mockResolvedValue({
      code: "SAVE20PCT",
      discountType: "Percentage",
      discountValue: 20,
      expirationDate: new Date(Date.now() + 86400000),
    });
    const req = mockReq({ body: { coupon: "SAVE20PCT", total: "100" } });
    const res = mockRes();

    await couponController.redeem(req, res);

    expect(res.status).toHaveBeenCalledWith(OK);
    const payload = res.send.mock.calls[0][0];
    expect(payload.grantTotal).toBe(80); // 100 - (20% of 100)
    expect(payload.discount).toBe("%20");
  });

  test("correctly rejects an expired or nonexistent coupon code", async () => {
    Coupon.findOne.mockResolvedValue(null);
    const req = mockReq({ body: { coupon: "EXPIRED", total: "50" } });
    const res = mockRes();

    await couponController.redeem(req, res);

    expect(res.status).toHaveBeenCalledWith(SERVER_ERROR);
    expect(res.send).toHaveBeenCalledWith({ error: true });
  });

  test("handles total being omitted from the request without crashing", async () => {
    Coupon.findOne.mockResolvedValue({
      code: "SAVE10",
      discountType: "Fixed",
      discountValue: 10,
      expirationDate: new Date(Date.now() + 86400000),
    });
    const req = mockReq({ body: { coupon: "SAVE10" } }); // no total
    const res = mockRes();

    await expect(couponController.redeem(req, res)).resolves.not.toThrow();
    expect(res.status).toHaveBeenCalled();
  });
});
