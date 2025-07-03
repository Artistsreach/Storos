import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import OnboardingButton from '../../components/stripe/OnboardingButton'; // Assuming this component exists

const OnboardingReturnPage = () => {
  const { profile, loadingProfile } = useAuth();
  const logoUrl = "https://static.wixstatic.com/media/bd2e29_695f70787cc24db4891e63da7e7529b3~mv2.png";
  const isStripeConnected = profile?.stripe_account_id && profile?.stripe_account_details_submitted;

  const renderLoading = () => (
    <div className="text-center">
      <h2 className="text-2xl font-semibold">Checking your onboarding status...</h2>
      <p className="text-gray-500 mt-2">Please wait a moment.</p>
    </div>
  );

  const renderSuccess = () => (
    <>
      <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
        🎉 Congratulations! 🎉
      </h1>
      <p className="mt-4 text-lg text-gray-600">
        You've successfully completed your Stripe onboarding.
      </p>
      <div className="mt-8 text-left border-t pt-6">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">You're all set to:</h3>
        <ul className="space-y-3">
            <li className="flex items-start">
              <span className="text-green-500 mr-3">✔️</span>
              <span className="text-gray-600">Accept payments from customers worldwide.</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-3">✔️</span>
              <span className="text-gray-600">Manage your customers and subscriptions.</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-3">✔️</span>
              <span className="text-gray-600">Track orders and view sales analytics.</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-3">✔️</span>
              <span className="text-gray-600">Instantly access and pay out your earned funds.</span>
            </li>
        </ul>
      </div>
      <div className="mt-10">
        <Link
          to="/"
          className="inline-block w-full sm:w-auto px-8 py-3 text-lg font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform hover:-translate-y-1"
        >
          Return Home
        </Link>
      </div>
    </>
  );

  const renderIncomplete = () => (
    <>
      <h1 className="text-4xl md:text-5xl font-bold text-orange-600">
        Onboarding Incomplete
      </h1>
      <p className="mt-4 text-lg text-gray-600">
        It looks like the Stripe onboarding process wasn't completed.
      </p>
      <div className="mt-8 text-left border-t pt-6">
        <p className="text-gray-700">
          To start accepting payments, you need to finish setting up your Stripe account.
        </p>
      </div>
      <div className="mt-10">
        <OnboardingButton />
      </div>
    </>
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center transform transition-all hover:scale-105">
        <div className="mb-8">
          <img src={logoUrl} alt="Company Logo" className="mx-auto h-12" />
        </div>
        {loadingProfile ? renderLoading() : (isStripeConnected ? renderSuccess() : renderIncomplete())}
      </div>
    </div>
  );
};

export default OnboardingReturnPage;
