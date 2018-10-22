import assert from 'assert';
import Client from '../src/client';
import fetchMock from './isomorphic-fetch-mock'; // eslint-disable-line import/no-unresolved

// fixtures
import checkoutFixture from '../fixtures/checkout-fixture';
import checkoutCreateFixture from '../fixtures/checkout-create-fixture';
import checkoutCreateWithPaginatedLineItemsFixture from '../fixtures/checkout-create-with-paginated-line-items-fixture';
import {secondPageLineItemsFixture, thirdPageLineItemsFixture} from '../fixtures/paginated-line-items-fixture';
import checkoutLineItemsAddFixture from '../fixtures/checkout-line-items-add-fixture';
import checkoutLineItemsUpdateFixture from '../fixtures/checkout-line-items-update-fixture';
import checkoutLineItemsRemoveFixture from '../fixtures/checkout-line-items-remove-fixture';
import checkoutUpdateAttributesFixture from '../fixtures/checkout-update-custom-attrs-fixture';
import checkoutUpdateEmailFixture from '../fixtures/checkout-update-email-fixture';
import checkoutDiscountCodeApplyFixture from '../fixtures/checkout-discount-code-apply-fixture';
import checkoutDiscountCodeRemoveFixture from '../fixtures/checkout-discount-code-remove-fixture';

suite('client-checkout-integration-test', () => {
  const domain = 'client-integration-tests.myshopify.io';
  const apiUrl = `https://${domain}/api/graphql`;
  const config = {
    storefrontAccessToken: 'abc123',
    domain
  };
  let client;

  setup(() => {
    client = Client.buildClient(config);
    fetchMock.reset();
  });

  teardown(() => {
    client = null;
    fetchMock.restore();
  });

  test('it resolves with a checkout on Client.checkout#fetch', () => {
    fetchMock.postOnce(apiUrl, checkoutFixture);

    const checkoutId = checkoutFixture.data.node.id;

    return client.checkout.fetch(checkoutId).then((checkout) => {
      assert.equal(checkout.id, checkoutId);
      assert.ok(fetchMock.done());
    });
  });

  test('it resolves with a checkout on Client.checkout#create', () => {
    const input = {
      lineItems: [
        {
          variantId: 'an-id',
          quantity: 5
        }
      ],
      shippingAddress: {}
    };

    fetchMock.postOnce(apiUrl, checkoutCreateFixture);

    return client.checkout.create(input).then((checkout) => {
      assert.equal(checkout.id, checkoutCreateFixture.data.checkoutCreate.checkout.id);
      assert.ok(fetchMock.done());
    });
  });

  test('it resolves with a checkout on Client.checkout#update', () => {
    const checkoutId = 'Z2lkOi8vU2hvcGlmeS9FeGFtcGxlLzE=';
    const input = {
      lineItems: [
        {variantId: 'an-id', quantity: 5}
      ],
      customAttributes: [
        {key: 'MyKey', value: 'MyValue'}
      ]
    };

    fetchMock.postOnce(apiUrl, checkoutUpdateAttributesFixture);

    return client.checkout.updateAttributes(checkoutId, input).then((checkout) => {
      assert.equal(checkout.id, checkoutUpdateAttributesFixture.data.checkoutAttributesUpdate.checkout.id);
      assert.equal(checkout.customAttributes[0].key, checkoutUpdateAttributesFixture.data.checkoutAttributesUpdate.checkout.customAttributes[0].key);
      assert.equal(checkout.customAttributes[0].value, checkoutUpdateAttributesFixture.data.checkoutAttributesUpdate.checkout.customAttributes[0].value);
      assert.ok(fetchMock.done());
    });
  });

  test('it resolves with a checkout on Client.checkout#email_update', () => {
    const checkoutId = 'Z2lkOi8vU2hvcGlmeS9FeGFtcGxlLzE=';
    const input = {
      email: 'user@example.com'
    };

    fetchMock.postOnce(apiUrl, checkoutUpdateEmailFixture);

    return client.checkout.updateEmail(checkoutId, input).then((checkout) => {
      assert.equal(checkout.id, checkoutUpdateEmailFixture.data.checkoutEmailUpdate.checkout.id);
      assert.equal(checkout.email, checkoutUpdateEmailFixture.data.checkoutEmailUpdate.checkout.email);
      assert.ok(fetchMock.done());
    });
  });

  test('it resolves with a checkout on Client.checkout#addLineItems', () => {
    const checkoutId = checkoutLineItemsAddFixture.data.checkoutLineItemsAdd.checkout.id;
    const lineItems = [
      {variantId: 'id1', quantity: 5},
      {variantId: 'id2', quantity: 2}
    ];

    fetchMock.postOnce(apiUrl, checkoutLineItemsAddFixture);

    return client.checkout.addLineItems(checkoutId, lineItems).then((checkout) => {
      assert.equal(checkout.id, checkoutId);
      assert.ok(fetchMock.done());
    });
  });

  test('it resolves with a checkout on Client.checkout#updateLineItems', () => {
    fetchMock.postOnce(apiUrl, checkoutLineItemsUpdateFixture);

    const checkoutId = checkoutLineItemsUpdateFixture.data.checkoutLineItemsUpdate.checkout.id;
    const lineItems = [
      {
        id: 'id1',
        quantity: 2,
        variantId: 'variant-id'
      }
    ];

    return client.checkout.updateLineItems(checkoutId, lineItems).then((checkout) => {
      assert.equal(checkout.id, checkoutId);
      assert.ok(fetchMock.done());
    });
  });

  test('it resolves with a checkout on Client.checkout#removeLineItems', () => {
    fetchMock.postOnce(apiUrl, checkoutLineItemsRemoveFixture);

    const checkoutId = checkoutLineItemsRemoveFixture.data.checkoutLineItemsRemove.checkout.id;

    return client.checkout.removeLineItems(checkoutId, ['line-item-id']).then((checkout) => {
      assert.equal(checkout.id, checkoutId);
      assert.ok(fetchMock.done());
    });
  });

  test('it resolves with a checkout on Client.checkout#addDiscount', () => {
    fetchMock.postOnce(apiUrl, checkoutDiscountCodeApplyFixture);

    const checkoutId = checkoutDiscountCodeApplyFixture.data.checkoutDiscountCodeApply.checkout.id;
    const discountCode = 'TENPERCENTOFF';

    return client.checkout.addDiscount(checkoutId, discountCode).then((checkout) => {
      assert.equal(checkout.id, checkoutId);
      assert.ok(fetchMock.done());
    });
  });

  test('it resolves with a checkout on Client.checkout#removeDiscount', () => {
    fetchMock.postOnce(apiUrl, checkoutDiscountCodeRemoveFixture);

    const checkoutId = checkoutDiscountCodeRemoveFixture.data.checkoutDiscountCodeRemove.checkout.id;

    return client.checkout.removeDiscount(checkoutId).then((checkout) => {
      assert.equal(checkout.id, checkoutId);
      assert.ok(fetchMock.done());
    });
  });

  test('it fetches all paginated line items on the checkout on any checkout mutation', () => {
    const input = {
      lineItems: [
        {variantId: 'id1', quantity: 5},
        {variantId: 'id2', quantity: 10},
        {variantId: 'id3', quantity: 15}
      ]
    };

    fetchMock.postOnce(apiUrl, checkoutCreateWithPaginatedLineItemsFixture)
      .postOnce(apiUrl, secondPageLineItemsFixture)
      .postOnce(apiUrl, thirdPageLineItemsFixture);

    return client.checkout.create(input).then(() => {
      assert.ok(fetchMock.done());
    });
  });

  test('it rejects checkout mutations that return with a non-null `userErrors` field', () => {
    const checkoutCreateWithUserErrorsFixture = {
      data: {
        checkoutCreate: {
          userErrors: [
            {
              message: 'Variant is invalid',
              field: [
                'lineItems',
                '0',
                'variantId'
              ]
            }
          ],
          checkout: null
        }
      }
    };

    const input = {
      lineItems: [
        {variantId: 'invalidId', quantity: 5}
      ]
    };

    fetchMock.postOnce(apiUrl, checkoutCreateWithUserErrorsFixture);

    return client.checkout.create(input).then(() => {
      assert.ok(false, 'Promise should not resolve');
    }).catch((error) => {
      assert.equal(error.message, '[{"message":"Variant is invalid","field":["lineItems","0","variantId"]}]');
    });
  });

  test('it rejects checkout mutations that return with a non-null `errors` without data field', () => {
    const checkoutCreateWithUserErrorsFixture = {
      data: {},
      errors: [{message: 'Timeout'}]
    };

    const input = {
      lineItems: [
        {variantId: 'invalidId', quantity: 5}
      ]
    };

    fetchMock.postOnce(apiUrl, checkoutCreateWithUserErrorsFixture);

    return client.checkout.create(input).then(() => {
      assert.ok(false, 'Promise should not resolve');
    }).catch((error) => {
      assert.equal(error.message, '[{"message":"Timeout"}]');
    });
  });

  test('it resolves checkout mutations that return with a non-null `errors` with data field', () => {
    checkoutCreateWithPaginatedLineItemsFixture.errors = [{message: 'Some error'}];

    const input = {
      lineItems: [
        {variantId: 'id1', quantity: 5},
        {variantId: 'id2', quantity: 10},
        {variantId: 'id3', quantity: 15}
      ]
    };

    fetchMock.postOnce(apiUrl, checkoutCreateWithPaginatedLineItemsFixture)
      .postOnce(apiUrl, secondPageLineItemsFixture)
      .postOnce(apiUrl, thirdPageLineItemsFixture);

    return client.checkout.create(input).then((checkout) => {
      assert.ok(checkout.errors);
      assert.ok(fetchMock.done());
    }).catch(() => {
      assert.equal(false, 'Should resolve');
    });
  });
});
