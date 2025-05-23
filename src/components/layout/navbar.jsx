import ClickableIcons from "../ui/clickableIcons";
import Button from "../ui/button";

export default function Navbar({
  iconLeft,
  iconRight,
  iconRight2,
  header = "header",
  iconLeftTo,
  iconRightTo,
  iconRight2To,
}) {
  return (
    <nav className="flex items-center justify-between py-4">
      <div className="flex items-center">
        <ClickableIcons icon={iconLeft} to={iconLeftTo} />
      </div>
      <div className="flex-1 text-left">
        <p className="font-bold text-2xl">{header}</p>
      </div>
        {iconRight ? (
          <Button onClick={iconRightTo}>{iconRight}</Button>
        ) : (
          <ClickableIcons icon={iconRight} to={iconRightTo} />
        )}

        {iconRight2 ? (
          <Button className="ml-2" onClick={iconRight2To}> {iconRight2} </Button>
        ) : (
          <ClickableIcons icon={iconRight2} to={iconRight2To} />
        )}
    </nav>
  );
}
