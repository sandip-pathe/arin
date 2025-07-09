import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="w-[90%] text-sm text-gray-600 flex justify-between items-center mx-auto mt-auto p-4">
      <div className='flex gap-2'>
        <span className="text-green-500">●</span>
        <Link href="/docs">
            <span className="hover:text-blue-500 cursor-pointer">Docs</span>
        </Link>
        <span className="text-gray-600"> — </span>
        <Link href="/features">
            <span className="hover:text-blue-500 cursor-pointer">Feature Requests</span>
        </Link>
      </div>
        <div className='gap-2 flex'>
        <Link href="/about">
            <span className="hover:text-blue-500 cursor-pointer">About</span>
        </Link>
        <span className="text-gray-600"> — </span>
        <Link href="/terms">
            <span className="hover:text-blue-500 cursor-pointer">Terms</span>
        </Link>
        <span className="text-gray-600"> — </span>
        <Link href="/privacy">
            <span className="hover:text-blue-500 cursor-pointer">Privacy</span>
        </Link>
      </div>
    </footer>
  );
};

export default Footer;
