import { Link } from "react-router-dom";

export default function link({ to, component }) {
  return (
    <Link className="no-underline visited:text-inherit items-center text-base" to={to}>
      {component}
    </Link>
  );
}
