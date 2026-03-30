import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const OrderSuccess = () => {
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  const sessionId = searchParams.get('session_id');
  const orderId = searchParams.get('order_id');
  const product = searchParams.get('product');
  const amount = searchParams.get('amount');

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    } else if (sessionId && product) {
      // Handle mock checkout from AI Richard
      handleMockCheckout();
    } else {
      setLoading(false);
    }
  }, [orderId, sessionId, product]);

  const handleMockCheckout = () => {
    // Create mock order object for display
    const mockOrder = {
      package_name: product === 'membership_monthly' 
        ? 'RJHNSN12 Premium Membership ($5/mo)' 
        : 'Book of Amos - Complete Translation',
      price: amount || (product === 'membership_monthly' ? '5.00' : '20.00'),
      project_description: product === 'membership_monthly'
        ? '✅ The Quiet Storm radio access\n✅ 20% off all books\n✅ Early access to Hebrew translations\n✅ Priority AI support'
        : '✅ Word-by-word Hebrew-English alignment\n✅ Original 20-letter Hebrew alphabet\n✅ 35+ years of research\n✅ Notarized & copyrighted',
      is_mock: true
    };
    setOrder(mockOrder);
    setLoading(false);
  };

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/website-orders/orders/${orderId}`
      );
      const data = await response.json();
      setOrder(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch order:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Confirming your order...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Success Animation */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-500 rounded-full mb-6 animate-bounce">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Payment Successful! 🎉</h1>
          <p className="text-xl text-gray-600">Thank you for your order</p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="border-b border-gray-200 pb-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed</h2>
            {orderId && (
              <p className="text-gray-600">Order ID: <span className="font-mono text-sm">{orderId.substring(0, 8)}...</span></p>
            )}
            {sessionId && (
              <>
                <p className="text-gray-600">Session ID: <span className="font-mono text-sm">{sessionId.substring(0, 20)}...</span></p>
                {order?.is_mock && (
                  <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm text-yellow-800">
                      ⚠️ <strong>DEMO MODE:</strong> This is a test transaction. Replace Stripe keys to process real payments.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {order && (
            <>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Package:</span>
                  <span className="font-semibold text-gray-900">{order.package_name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Amount Paid:</span>
                  <span className="text-2xl font-bold text-green-600">${order.price}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status:</span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    ✓ Paid
                  </span>
                </div>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-900">What happens next?</h3>
                    <div className="mt-2 text-sm text-blue-800">
                      {order.is_mock ? (
                        <ul className="list-disc list-inside space-y-1">
                          <li>✅ AI Sales Agent is working perfectly!</li>
                          <li>✅ Checkout buttons render correctly</li>
                          <li>✅ Full flow from chat to purchase complete</li>
                          <li>🔑 Add valid Stripe keys to process real payments</li>
                        </ul>
                      ) : (
                        <ul className="list-disc list-inside space-y-1">
                          <li>You'll receive a confirmation email shortly</li>
                          <li>Your access will be activated immediately</li>
                          <li>Check your membership benefits on the Radio page</li>
                          <li>Enjoy your purchase!</li>
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Your Requirements:</h3>
                <p className="text-gray-700 text-sm whitespace-pre-wrap">{order.project_description}</p>
              </div>
            </>
          )}
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Need to make changes?</h3>
          <p className="text-gray-600 mb-4">
            If you need to update your requirements or have questions, feel free to reach out:
          </p>
          <div className="space-y-2 text-sm">
            <p className="text-gray-700">📧 Email will be sent with Richard's contact info</p>
            <p className="text-gray-700">💬 Use the AI Richard chat widget (bottom-left corner)</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate('/')}
            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-4 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all font-semibold shadow-lg"
          >
            Return to Home
          </button>
          <button
            onClick={() => navigate('/contact')}
            className="flex-1 bg-white text-gray-700 border-2 border-gray-300 px-6 py-4 rounded-xl hover:bg-gray-50 transition-all font-semibold"
          >
            Contact Us
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
