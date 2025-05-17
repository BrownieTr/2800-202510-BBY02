import { Link } from "react-router-dom";

export default function link({ to, component }) {
  return (
    <Link className="no-underline visited:text-inherit" to={to}>
      {component}
    </Link>
  );
}
