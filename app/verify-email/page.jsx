import { FaEnvelopeOpenText } from "react-icons/fa";
import Link from "next/link";

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-[5%] bg-gradient-to-br from-yellow-50 via-white to-yellow-100">
      <div className="max-w-md w-full bg-white shadow-xl rounded-xl p-8 text-center border border-yellow-100">
        <div className="flex justify-center mb-6">
          <div className="bg-yellow-500 text-white p-4 rounded-full shadow-md">
            <FaEnvelopeOpenText className="text-4xl" />
          </div>
        </div>
        <h1 className="text-3xl font-extrabold text-gray-800 mb-2">
          Verify Your Email
        </h1>
        <p className="text-gray-600 mb-6">
          We've sent a verification link to your email. Please check your inbox
          (and spam folder).
        </p>

        <Link
          href="/login"
          className="inline-block mt-4 px-5 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-full transition duration-200"
        >
          Go to Login
        </Link>

        {/* Optional: Resend email in the future */}
        {/* <button className="mt-4 text-sm text-blue-500 hover:underline">Resend Email</button> */}
      </div>

      <p className="text-sm text-gray-500 mt-6">
        Didn't get the email? Check your spam folder.
      </p>
    </div>
  );
}
