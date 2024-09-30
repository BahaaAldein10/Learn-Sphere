import dynamic from 'next/dynamic';

// Dynamically import the SignUp component from Clerk
const SignUp = dynamic(
  () => import('@clerk/nextjs').then((mod) => mod.SignUp),
  { ssr: false }
);

const SignUpPage = () => {
  return <SignUp />;
};

export default SignUpPage;
