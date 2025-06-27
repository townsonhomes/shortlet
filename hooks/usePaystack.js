// hooks/usePaystack.js
export const usePaystack = () => {
  const loadScript = () =>
    new Promise((resolve) => {
      if (document.getElementById("paystack-script")) {
        return resolve(true);
      }
      const script = document.createElement("script");
      script.id = "paystack-script";
      script.src = "https://js.paystack.co/v1/inline.js";
      script.onload = () => resolve(true);
      document.body.appendChild(script);
    });

  const initializePayment = async ({
    email,
    amount,
    metadata,
    onSuccess,
    onClose,
  }) => {
    await loadScript();

    const handler = window.PaystackPop.setup({
      key: process.env.NEXT_PUBLIC_PAYSTACK_KEY,
      email,
      amount: amount * 100,
      metadata,
      callback: (response) => onSuccess(response),
      onClose,
    });

    handler.openIframe();
  };

  return { initializePayment };
};
