import { Link } from "react-router-dom";
import { User } from "../types";
import { initials } from "../utils/format";

interface NavbarProps {
  user: User;
  profilePath: string;
}

export const Navbar = ({ user, profilePath }: NavbarProps) => (
  <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
    <div>
      <p className="text-sm text-gray-400">Welcome back,</p>
      <p className="text-sm font-semibold text-gray-800">
        {user.firstName} {user.lastName}
      </p>
    </div>
    <Link to={profilePath} className="flex items-center gap-2">
      {user.avatar ? (
        <img
          src={user.avatar}
          alt="avatar"
          className="w-9 h-9 rounded-full object-cover"
        />
      ) : (
        <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-semibold">
          {initials(user.firstName, user.lastName)}
        </div>
      )}
    </Link>
  </header>
);
