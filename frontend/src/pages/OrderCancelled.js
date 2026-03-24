import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const OrderCancelled = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const orderId = searchParams.get('order_id');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Cancelled Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-300 rounded-full mb-6">
            <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Order Cancelled</h1>
          <p className="text-xl text-gray-600">Your payment was not processed</p>
        </div>

        {/* Info Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="text-center mb-6">
            <p className="text-gray-600 mb-4">
              You cancelled the checkout process. No charges were made to your account.
            </p>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-900">Still interested?</h3>
                <div className="mt-2 text-sm text-blue-800">
                  <p>You can restart the ordering process anytime by chatting with AI Richard or visiting our website.</p>
                </div>
              </div>
            </div>
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
            onClick={() => {
              navigate('/');
              // Could trigger AI Richard to reopen
            }}
            className="flex-1 bg-white text-gray-700 border-2 border-gray-300 px-6 py-4 rounded-xl hover:bg-gray-50 transition-all font-semibold"
          >
            Chat with AI Richard
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Have questions? Feel free to reach out via the chat widget or contact page.</p>
        </div>
      </div>
    </div>
  );
};

export default OrderCancelled;
