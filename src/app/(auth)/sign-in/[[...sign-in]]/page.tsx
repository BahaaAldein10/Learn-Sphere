import dynamic from 'next/dynamic';

// Dynamically import the SignIn component from Clerk
const SignIn = dynamic(
  () => import('@clerk/nextjs').then((mod) => mod.SignIn),
  { ssr: false }
);

const SignInPage = () => {
  return <SignIn />;
};

export default SignInPage;
