const addressController = require("../../controllers/address");
const Address = require("../../models/address");
const { OK } = require("../../errors/statusCode");

jest.mock("../../models/address");

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
}

function mockReq(overrides = {}) {
  return { body: {}, userData: { id: "user1" }, ...overrides };
}

describe("toggleDefault", () => {
  beforeEach(() => jest.clearAllMocks());

  test("unsets isDefault on every one of the user's other addresses before setting the target one", async () => {
    const otherAddresses = [
      { id: "addr1" },
      { id: "addr2" },
      { id: "addr3" },
    ];
    Address.find.mockResolvedValue(otherAddresses);
    Address.findByIdAndUpdate.mockResolvedValue({});

    const req = mockReq({ body: { userId: "user1", id: "addr2" } });
    const res = mockRes();

    await addressController.toggleDefault(req, res);

    // Every address belonging to the user should have been unset first...
    expect(Address.findByIdAndUpdate).toHaveBeenCalledWith(
      "addr1",
      { isDefault: false },
      { new: true }
    );
    expect(Address.findByIdAndUpdate).toHaveBeenCalledWith(
      "addr2",
      { isDefault: false },
      { new: true }
    );
    expect(Address.findByIdAndUpdate).toHaveBeenCalledWith(
      "addr3",
      { isDefault: false },
      { new: true }
    );
    // ...then the target address should have been set to true, as the
    // LAST call -- confirming the order of operations is correct (unset
    // everything first, then set the one true default), not the reverse,
    // which would leave zero addresses marked default.
    const calls = Address.findByIdAndUpdate.mock.calls;
    const lastCall = calls[calls.length - 1];
    expect(lastCall[0]).toBe("addr2");
    expect(lastCall[1]).toEqual({ isDefault: true });

    expect(res.status).toHaveBeenCalledWith(OK);
  });

  test("still works correctly when the user only has one address", async () => {
    Address.find.mockResolvedValue([{ id: "addr1" }]);
    Address.findByIdAndUpdate.mockResolvedValue({});

    const req = mockReq({ body: { userId: "user1", id: "addr1" } });
    const res = mockRes();

    await addressController.toggleDefault(req, res);

    // Called twice: once to unset, once to set -- even for a single
    // address, both operations should still run.
    expect(Address.findByIdAndUpdate).toHaveBeenCalledTimes(2);
    expect(res.status).toHaveBeenCalledWith(OK);
  });
});

describe("findDefaultAddress", () => {
  beforeEach(() => jest.clearAllMocks());

  test("returns the address marked as default when one exists", async () => {
    Address.findOne
      .mockResolvedValueOnce({ id: "addr1", isDefault: true });

    const req = mockReq();
    const res = mockRes();

    await addressController.findDefaultAddress(req, res);

    expect(Address.findOne).toHaveBeenCalledWith({
      user: "user1",
      isDefault: true,
    });
    expect(res.send).toHaveBeenCalledWith({ id: "addr1", isDefault: true });
  });

  test("falls back to a non-default address if the user has no address marked default", async () => {
    // This is a real, deliberate fallback in the controller: if a user
    // somehow has addresses but none flagged isDefault: true (e.g. a
    // data inconsistency), the checkout flow shouldn't just show
    // nothing -- it falls back to any address they have.
    Address.findOne
      .mockResolvedValueOnce(null) // no default found
      .mockResolvedValueOnce({ id: "addr2", isDefault: false }); // fallback

    const req = mockReq();
    const res = mockRes();

    await addressController.findDefaultAddress(req, res);

    expect(Address.findOne).toHaveBeenCalledTimes(2);
    expect(Address.findOne).toHaveBeenNthCalledWith(2, {
      user: "user1",
      isDefault: false,
    });
    expect(res.send).toHaveBeenCalledWith({ id: "addr2", isDefault: false });
  });
});
