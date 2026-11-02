import api from './api';

export const sendQuickOrder = async ({
  channel = 'web',
  items = [],
  customer = {},
  orderRef,
  note,
  couponCode,
  discount = 0,
  shippingFee = 0,
}) => {
  const { data } = await api.post('/orders/quick', {
    channel,
    items,
    customer,
    orderRef,
    note,
    couponCode,
    discount,
    shippingFee,
  });

  return data.order;
};
