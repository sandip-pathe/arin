import Link from "next/link";

const Footer = () => {
  return (
    <footer className="w-full text-sm text-gray-600 flex flex-col sm:flex-row justify-between items-center mx-auto pt-4 gap-2 sm:gap-0 bg-transparent">
      <div className="flex gap-2 items-center">
        <span className="text-green-500">●</span>
        <Link href="/docs">
          <span className="hover:text-blue-500 cursor-pointer">Docs</span>
        </Link>
        <span className="text-gray-600 hidden sm:inline"> — </span>
        <Link href="/features">
          <span className="hover:text-blue-500 cursor-pointer">
            Feature Requests
          </span>
        </Link>
      </div>
      <div className="gap-2 flex items-center">
        <Link href="/about">
          <span className="hover:text-blue-500 cursor-pointer">About</span>
        </Link>
        <span className="text-gray-600 hidden sm:inline"> — </span>
        <Link href="/terms">
          <span className="hover:text-blue-500 cursor-pointer">Terms</span>
        </Link>
        <span className="text-gray-600 hidden sm:inline"> — </span>
        <Link href="/privacy">
          <span className="hover:text-blue-500 cursor-pointer">Privacy</span>
        </Link>
      </div>
    </footer>
  );
};

export default Footer;
