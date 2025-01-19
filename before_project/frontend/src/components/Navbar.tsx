import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-white text-xl font-bold">
          Whisper
        </Link>
        <div className="space-x-4">
          <Link
            to="/posts/new"
            className="text-gray-300 hover:text-white transition-colors"
          >
            新規投稿
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
